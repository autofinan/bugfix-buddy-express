import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, Plus, Minus } from "lucide-react";
import { useProducts, useUpdateProduct } from "@/hooks/useProducts";
import { SearchDropdown } from "@/components/ui/search-dropdown";
import { toast } from "sonner";

export default function StockAdjustmentView() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  
  const { data: products = [] } = useProducts();
  const updateProduct = useUpdateProduct();

  const handleAdjustment = async () => {
    if (!selectedProduct || !quantity || !reason) {
      toast.error("Preencha todos os campos");
      return;
    }

    const adjustmentQuantity = parseInt(quantity);
    if (isNaN(adjustmentQuantity) || adjustmentQuantity <= 0) {
      toast.error("Quantidade deve ser um número positivo");
      return;
    }

    try {
      const newStock = adjustmentType === "add" 
        ? selectedProduct.stock + adjustmentQuantity
        : selectedProduct.stock - adjustmentQuantity;

      if (newStock < 0) {
        toast.error("O estoque não pode ficar negativo");
        return;
      }

      await updateProduct.mutateAsync({
        id: selectedProduct.id,
        updates: { stock: newStock }
      });

      // Reset form
      setSelectedProduct(null);
      setQuantity("");
      setReason("");
      
      toast.success(`Estoque ${adjustmentType === "add" ? "aumentado" : "reduzido"} com sucesso`);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error("Erro ao ajustar estoque");
    }
  };

  const productOptions = products.map(product => ({
    value: product.id,
    label: `${product.name} (Estoque: ${product.stock})`,
    data: product
  }));

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ajuste de Estoque</h1>
        <p className="text-muted-foreground">Faça ajustes manuais no estoque dos produtos</p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-search">Produto</Label>
              <SearchDropdown
                options={productOptions}
                value={selectedProduct?.id || ""}
                onSelect={(value) => {
                  const product = products.find(p => p.id === value);
                  setSelectedProduct(product);
                }}
                placeholder="Buscar produto..."
                emptyText="Nenhum produto encontrado"
              />
            </div>

            <div>
              <Label>Tipo de Ajuste</Label>
              <Select 
                value={adjustmentType} 
                onValueChange={(value: "add" | "remove") => setAdjustmentType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Adicionar ao Estoque</SelectItem>
                  <SelectItem value="remove">Remover do Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Digite a quantidade"
              />
            </div>

            <div>
              <Label htmlFor="reason">Motivo do Ajuste</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descreva o motivo do ajuste..."
                rows={3}
              />
            </div>

            <Button
              onClick={handleAdjustment}
              disabled={!selectedProduct || !quantity || !reason || updateProduct.isPending}
              className="w-full gap-2"
            >
              {adjustmentType === "add" ? (
                <Plus className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
              {adjustmentType === "add" ? "Adicionar" : "Remover"} Estoque
            </Button>
          </div>

          {selectedProduct && (
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    SKU: {selectedProduct.sku || "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Estoque Atual:</span>
                  <span className="font-medium">{selectedProduct.stock}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Estoque Mínimo:</span>
                  <span className="font-medium">{selectedProduct.min_stock || 0}</span>
                </div>
                
                {quantity && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Novo Estoque:</span>
                    <span className="font-bold">
                      {adjustmentType === "add" 
                        ? selectedProduct.stock + parseInt(quantity || "0")
                        : selectedProduct.stock - parseInt(quantity || "0")
                      }
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
}