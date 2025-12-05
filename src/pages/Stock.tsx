import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  stock: number;
  min_stock: number;
  cost_unitario: number;
  price: number;
  category_id: string | null;
}

interface Movement {
  id: string;
  product_id: string;
  quantity: number;
  type: string;
  reason: string | null;
  created_at: string;
  products: {
    name: string;
    cost_unitario: number;
  };
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [stockValue, setStockValue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (productsError) throw productsError;

      // Fetch recent movements
      const { data: movementsData, error: movementsError } = await supabase
        .from("inventory_movements")
        .select(`
          *,
          products (
            name,
            cost_unitario
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (movementsError) throw movementsError;

      setProducts(productsData || []);
      setMovements(movementsData || []);

      // Calculate stock value and low stock count
      const totalValue = (productsData || []).reduce(
        (sum, product) => sum + (product.stock * (product.cost_unitario || 0)),
        0
      );
      setStockValue(totalValue);

      const lowStock = (productsData || []).filter(
        (product) => product.stock <= product.min_stock
      ).length;
      setLowStockCount(lowStock);

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do estoque",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = !searchTerm || 
      movement.products?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || movement.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const lowStockProducts = products.filter(product => product.stock <= product.min_stock);

  const getMovementTypeLabel = (type: string) => {
    const types: Record<string, { label: string; variant: "default" | "destructive" | "outline" }> = {
      in: { label: "Entrada", variant: "default" },
      out: { label: "Saída", variant: "destructive" },
      adjustment: { label: "Ajuste", variant: "outline" }
    };
    return types[type] || { label: type, variant: "outline" };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStockBadge = (stock: number, minStock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Sem estoque</Badge>;
    } else if (stock <= minStock) {
      return <Badge variant="outline" className="border-warning text-warning">Estoque baixo</Badge>;
    }
    return <Badge variant="default">Normal</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando estoque...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Estoque</h1>
          <p className="text-muted-foreground">Gerencie movimentações e acompanhe o valor do estoque</p>
        </div>
        <Button onClick={() => navigate('/stock-adjustment')}>
          <Plus className="h-4 w-4 mr-2" />
          Ajustar Estoque
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stockValue)}</div>
            <p className="text-xs text-muted-foreground">
              {products.length} produtos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações Recentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movements.length}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 50 movimentações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos em Baixo Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Abaixo do estoque mínimo
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Todos os Produtos</TabsTrigger>
          <TabsTrigger value="movements">Histórico de Movimentações</TabsTrigger>
          <TabsTrigger value="low-stock" className="relative">
            Estoque Baixo
            {lowStockCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                {lowStockCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Todos os Produtos */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Estoque de Produtos</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum produto encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-center">Estoque Mínimo</TableHead>
                      <TableHead className="text-right">Custo Unit.</TableHead>
                      <TableHead className="text-right">Valor em Estoque</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-center font-mono">{product.stock}</TableCell>
                        <TableCell className="text-center font-mono">{product.min_stock}</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.cost_unitario || 0)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(product.stock * (product.cost_unitario || 0))}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStockBadge(product.stock, product.min_stock)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Histórico de Movimentações */}
        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle>Histórico de Movimentações</CardTitle>
                <div className="flex gap-4 items-center">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por produto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="in">Entradas</SelectItem>
                      <SelectItem value="out">Saídas</SelectItem>
                      <SelectItem value="adjustment">Ajustes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredMovements.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma movimentação encontrada</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((movement) => {
                      const typeInfo = getMovementTypeLabel(movement.type);
                      const totalValue = movement.quantity * (movement.products?.cost_unitario || 0);
                      
                      return (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {movement.products?.name || 'Produto não encontrado'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={typeInfo.variant}>
                              {typeInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(totalValue)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {movement.reason || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estoque Baixo */}
        <TabsContent value="low-stock">
          <Card className={lowStockCount > 0 ? "border-destructive" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${lowStockCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                Produtos com Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-success mx-auto mb-3" />
                  <p className="text-muted-foreground">Todos os produtos estão com estoque adequado!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-center">Estoque Atual</TableHead>
                      <TableHead className="text-center">Estoque Mínimo</TableHead>
                      <TableHead className="text-center">Diferença</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-center font-mono">{product.stock}</TableCell>
                        <TableCell className="text-center font-mono">{product.min_stock}</TableCell>
                        <TableCell className="text-center font-mono text-destructive">
                          {product.stock - product.min_stock}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="destructive">
                            {product.stock === 0 ? 'Sem estoque' : 'Estoque baixo'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
