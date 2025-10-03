import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface BudgetItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function BudgetForm({ open, onOpenChange, onSave }: BudgetFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const addItem = (product: Product) => {
    const existingItem = items.find(item => item.product_id === product.id);
    
    if (existingItem) {
      updateItemQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: BudgetItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
        total_price: product.price
      };
      setItems([...items, newItem]);
    }
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setItems(items.filter(item => item.product_id !== productId));
      return;
    }

    setItems(items.map(item => 
      item.product_id === productId 
        ? { ...item, quantity: newQuantity, total_price: item.unit_price * newQuantity }
        : item
    ));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.product_id !== productId));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === "percentage") {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handleSave = async () => {
    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item ao orçamento",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const subtotal = calculateSubtotal();
      const discount = calculateDiscount();
      const total = calculateTotal();

      // Criar orçamento 
      const { data: budget, error: budgetError } = await supabase
        .from("budgets")
        .insert({
          customer_name: customerName || null,
          customer_email: customerEmail || null,
          customer_phone: customerPhone || null,
          subtotal,
          discount_type: discountValue > 0 ? discountType : null,
          discount_value: discountValue,
          total,
          notes: notes || null,
          valid_until: validUntil || null
        } as any)
        .select()
        .single();

      if (budgetError) throw budgetError;

      // Criar itens do orçamento
      const budgetItems = items.map(item => ({
        budget_id: budget.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from("budget_items")
        .insert(budgetItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Sucesso",
        description: "Orçamento criado com sucesso!"
      });

      // Reset form
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setNotes("");
      setValidUntil("");
      setDiscountType("percentage");
      setDiscountValue(0);
      setItems([]);
      
      onSave();
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar orçamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dados do Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nome do Cliente</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Telefone</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Seleção de Produtos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Produtos</h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => addItem(product)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-lg font-bold">R$ {product.price.toFixed(2)}</p>
                      </div>
                      <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                        {product.stock}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Itens do Orçamento */}
          {items.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Itens do Orçamento</h3>
              
              <div className="space-y-2">
                {items.map((item) => (
                  <Card key={item.product_id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            R$ {item.unit_price.toFixed(2)} cada
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center">{item.quantity}</span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <div className="w-20 text-right font-bold">
                            R$ {item.total_price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Desconto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Desconto</Label>
              <Select value={discountType} onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                  <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                Desconto {discountType === "percentage" ? "(%)" : "(R$)"}
              </Label>
              <Input
                id="discountValue"
                type="number"
                min="0"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Válido até</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o orçamento..."
              rows={3}
            />
          </div>

          {/* Totais */}
          {items.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {calculateSubtotal().toFixed(2)}</span>
                  </div>
                  {discountValue > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Desconto:</span>
                      <span>- R$ {calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>R$ {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={loading || items.length === 0}
            >
              {loading ? "Salvando..." : "Criar Orçamento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}