import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { SearchDropdown } from "@/components/ui/search-dropdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { useCreateBudget, useUpdateBudget } from "@/hooks/useBudgets";
import type { BudgetDetails } from "@/hooks/useBudgets";
import { Trash2, Plus, Minus } from "lucide-react";

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: BudgetDetails | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface BudgetItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name?: string;
}

export function BudgetForm({ open, onOpenChange, budget, onClose, onSuccess }: BudgetFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState<Date | undefined>();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  
  const { toast } = useToast();
  const { data: products = [] } = useProducts();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();

  const productOptions = products.map(product => ({
    value: product.id,
    label: `${product.name} - R$ ${product.price.toFixed(2)}`,
    price: product.price
  }));

  useEffect(() => {
    if (budget) {
      setCustomerName(budget.customer_name || "");
      setCustomerEmail(budget.customer_email || "");
      setCustomerPhone(budget.customer_phone || "");
      setNotes(budget.notes || "");
      setValidUntil(budget.valid_until ? new Date(budget.valid_until) : undefined);
      setDiscountType(budget.discount_type as "percentage" | "fixed" || "percentage");
      setDiscountValue(budget.discount_value || 0);
    } else {
      // Reset form for new budget
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setNotes("");
      setValidUntil(undefined);
      setItems([]);
      setDiscountType("percentage");
      setDiscountValue(0);
    }
  }, [budget]);

  const addItem = () => {
    setItems([...items, {
      product_id: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof BudgetItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === "product_id") {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unit_price = product.price;
        newItems[index].product_name = product.name;
      }
    }
    
    if (field === "quantity" || field === "unit_price") {
      newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const discountAmount = discountType === "percentage" 
    ? subtotal * (discountValue / 100)
    : discountValue;
  const total = Math.max(0, subtotal - discountAmount);

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item ao orçamento",
        variant: "destructive",
      });
      return;
    }

    try {
      const budgetData = {
        customer_name: customerName || undefined,
        customer_email: customerEmail || undefined,
        customer_phone: customerPhone || undefined,
        notes: notes || undefined,
        subtotal,
        discount_type: discountValue > 0 ? discountType : undefined,
        discount_value: discountValue > 0 ? discountValue : undefined,
        total,
        valid_until: validUntil?.toISOString().split('T')[0] || undefined,
      };

      if (budget) {
        await updateBudget.mutateAsync({ id: budget.id, updates: budgetData });
      } else {
        await createBudget.mutateAsync(budgetData);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{budget ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">Dados do Cliente (Opcional)</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="customer-name">Nome</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <Label htmlFor="customer-email">Email</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="customer-phone">Telefone</Label>
                <Input
                  id="customer-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </Card>

          {/* Budget Details */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">Detalhes do Orçamento</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="valid-until">Válido até</Label>
                <Input
                  id="valid-until"
                  type="date"
                  value={validUntil ? validUntil.toISOString().split('T')[0] : ''}
                  onChange={(e) => setValidUntil(e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações sobre o orçamento..."
                  rows={3}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Itens do Orçamento</h3>
            <Button onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Label className="text-xs">Produto</Label>
                    <SearchDropdown
                      options={productOptions}
                      value={item.product_id}
                      onValueChange={(value) => updateItem(index, "product_id", value)}
                      placeholder="Selecionar produto..."
                      emptyMessage="Nenhum produto encontrado"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Qtd</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Preço Un.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Total</Label>
                    <Input
                      value={`R$ ${item.total_price.toFixed(2)}`}
                      disabled
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Discount Section */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Desconto</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={discountType} onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentual (%)</SelectItem>
                  <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto:</span>
                <span>-R$ {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={createBudget.isPending || updateBudget.isPending}
          >
            {createBudget.isPending || updateBudget.isPending 
              ? "Salvando..." 
              : budget ? "Atualizar Orçamento" : "Criar Orçamento"
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}