import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Minus, Save, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  stock: number;
  sku?: string;
  barcode?: string;
  category?: {
    name: string;
  };
}

interface MovementHistory {
  id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  created_at: string;
  product: {
    name: string;
    sku?: string;
  };
}

export default function StockAdjustmentView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out' | 'adjustment'>('adjustment');
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [movementHistory, setMovementHistory] = useState<MovementHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchMovementHistory();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          stock,
          sku,
          barcode,
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive"
      });
    }
  };

  const fetchMovementHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          id,
          type,
          quantity,
          reason,
          created_at,
          products (
            name,
            sku
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const formattedHistory: MovementHistory[] = data?.map(movement => ({
        id: movement.id,
        type: movement.type as 'in' | 'out' | 'adjustment',
        quantity: movement.quantity,
        reason: movement.reason || '',
        created_at: movement.created_at,
        product: {
          name: movement.products?.name || 'Produto removido',
          sku: movement.products?.sku
        }
      })) || [];

      setMovementHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching movement history:', error);
    }
  };

  const filterProducts = () => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm)
    );

    setFilteredProducts(filtered.slice(0, 10));
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm("");
    setFilteredProducts([]);
  };

  const calculateNewStock = () => {
    if (!selectedProduct || !quantity) return selectedProduct?.stock || 0;

    const qty = parseInt(quantity);
    
    switch (adjustmentType) {
      case 'in':
        return selectedProduct.stock + qty;
      case 'out':
        return Math.max(0, selectedProduct.stock - qty);
      case 'adjustment':
        return Math.max(0, qty);
      default:
        return selectedProduct.stock;
    }
  };

  const handleSubmit = async () => {
    if (!selectedProduct || !quantity || !reason.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast({
        title: "Erro",
        description: "Quantidade deve ser um número positivo",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const newStock = calculateNewStock();
      
      // Update product stock
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', selectedProduct.id);

      if (stockError) throw stockError;

      // Create inventory movement
      let movementQuantity = qty;
      if (adjustmentType === 'adjustment') {
        // For adjustments, calculate the difference
        movementQuantity = newStock - selectedProduct.stock;
      } else if (adjustmentType === 'out') {
        movementQuantity = -qty;
      }

      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert({
          product_id: selectedProduct.id,
          type: adjustmentType,
          quantity: Math.abs(movementQuantity),
          reason: reason
        });

      if (movementError) throw movementError;

      toast({
        title: "Sucesso",
        description: `Estoque de ${selectedProduct.name} atualizado para ${newStock} unidades`
      });

      // Reset form
      setSelectedProduct(null);
      setQuantity("");
      setReason("");
      
      // Refresh data
      await fetchProducts();
      await fetchMovementHistory();

    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar estoque",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'in': return 'Entrada';
      case 'out': return 'Saída';
      case 'adjustment': return 'Ajuste';
      default: return type;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case 'in': return 'default';
      case 'out': return 'destructive';
      case 'adjustment': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ajuste de Estoque</h1>
        <Button 
          onClick={() => setShowHistory(!showHistory)} 
          variant="outline"
        >
          <History className="mr-2 h-4 w-4" />
          {showHistory ? 'Ocultar' : 'Ver'} Histórico
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adjustment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Novo Ajuste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Search */}
            <div>
              <label className="text-sm font-medium">Produto</label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto por nome, SKU ou código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {filteredProducts.length > 0 && (
                <div className="mt-2 space-y-1 max-h-40 overflow-auto border rounded-md">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => selectProduct(product)}
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {product.sku && <Badge variant="outline">SKU: {product.sku}</Badge>}
                        <Badge variant="secondary">Estoque: {product.stock}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Product */}
              {selectedProduct && (
                <div className="mt-2 p-3 bg-primary/10 rounded-lg">
                  <div className="font-medium">{selectedProduct.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {selectedProduct.sku && <Badge variant="outline">SKU: {selectedProduct.sku}</Badge>}
                    <Badge variant="secondary">Estoque atual: {selectedProduct.stock}</Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Adjustment Type */}
            <div>
              <label className="text-sm font-medium">Tipo de Movimentação</label>
              <Select value={adjustmentType} onValueChange={(value: 'in' | 'out' | 'adjustment') => setAdjustmentType(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-green-600" />
                      Entrada
                    </div>
                  </SelectItem>
                  <SelectItem value="out">
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-red-600" />
                      Saída
                    </div>
                  </SelectItem>
                  <SelectItem value="adjustment">
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4 text-blue-600" />
                      Ajuste (definir quantidade exata)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium">
                {adjustmentType === 'adjustment' ? 'Nova Quantidade' : 'Quantidade'}
              </label>
              <Input
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                className="mt-2"
              />
              {selectedProduct && quantity && (
                <p className="text-sm text-muted-foreground mt-1">
                  Estoque ficará: {calculateNewStock()} unidades
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="text-sm font-medium">Motivo</label>
              <Textarea
                placeholder="Descreva o motivo do ajuste..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2"
              />
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={!selectedProduct || !quantity || !reason.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? "Salvando..." : "Salvar Ajuste"}
            </Button>
          </CardContent>
        </Card>

        {/* Movement History */}
        {showHistory && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movementHistory.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{movement.product.name}</div>
                            {movement.product.sku && (
                              <div className="text-xs text-muted-foreground">
                                SKU: {movement.product.sku}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getMovementTypeBadge(movement.type) as any}>
                            {getMovementTypeLabel(movement.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={movement.type === 'out' ? 'text-red-600' : 'text-green-600'}>
                            {movement.type === 'out' ? '-' : '+'}{movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(movement.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
