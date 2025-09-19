import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Banknote, Smartphone, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { CartProduct } from "./POSView";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  cartItems: CartProduct[];
  onComplete: () => void;
}

interface UserDiscountLimit {
  max_discount_percentage: number;
}

type PaymentMethod = "pix" | "cartao" | "dinheiro";

export function PaymentModal({ open, onOpenChange, total, cartItems, onComplete }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [userDiscountLimit, setUserDiscountLimit] = useState<UserDiscountLimit | null>(null);
  const [discountError, setDiscountError] = useState("");
  const { toast } = useToast();

  const paymentMethods = [
    { id: "pix" as PaymentMethod, label: "PIX", icon: Smartphone },
    { id: "cartao" as PaymentMethod, label: "Cartão", icon: CreditCard },
    { id: "dinheiro" as PaymentMethod, label: "Dinheiro", icon: Banknote },
  ];

  useEffect(() => {
    if (open) {
      fetchUserDiscountLimit();
    }
  }, [open]);

  const fetchUserDiscountLimit = async () => {
    try {
      const { data, error } = await supabase
        .from('user_discount_limits')
        .select('max_discount_percentage')
        .maybeSingle();

      if (error) {
        console.error('Error fetching discount limit:', error);
        return;
      }

      setUserDiscountLimit(data);
    } catch (error) {
      console.error('Error fetching discount limit:', error);
    }
  };

  const validateDiscount = (type: "percentage" | "fixed", value: number): string => {
    if (value < 0) {
      return "O desconto não pode ser negativo";
    }

    if (type === "percentage") {
      const maxPercentage = userDiscountLimit?.max_discount_percentage || 10;
      if (value > maxPercentage) {
        return `Desconto máximo permitido: ${maxPercentage}%`;
      }
      if (value > 100) {
        return "O desconto não pode ser maior que 100%";
      }
    } else {
      if (value > total) {
        return "O desconto não pode ser maior que o total da venda";
      }
    }

    return "";
  };

  const handleDiscountChange = (type: "percentage" | "fixed", value: number) => {
    const error = validateDiscount(type, value);
    setDiscountError(error);
    setDiscountType(type);
    setDiscountValue(value);
  };

  const calculateFinalTotal = () => {
    if (discountValue <= 0) return total;

    if (discountType === "percentage") {
      return total * (1 - discountValue / 100);
    } else {
      return total - discountValue;
    }
  };

  const handleSubmit = async () => {
    if (discountError) {
      toast({
        title: "Erro no desconto",
        description: discountError,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const finalTotal = calculateFinalTotal();

      // Create sale
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          total: finalTotal,
          subtotal: total,
          discount_type: discountValue > 0 ? discountType : null,
          discount_value: discountValue > 0 ? discountValue : 0,
          payment_method: paymentMethod,
          note: note || null,
          date: new Date().toISOString(),
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items and update stock
      for (const item of cartItems) {
        // Get product cost for profit calculation
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('cost_unitario')
          .eq('id', item.id)
          .single();

        if (productError) {
          console.warn('Could not fetch product cost:', productError);
        }

        // Create sale item
        const { error: itemError } = await supabase
          .from('sale_items')
          .insert({
            sale_id: saleData.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
            custo_unitario: productData?.cost_unitario || 0,
          });

        if (itemError) throw itemError;

        // Update product stock
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: item.stock - item.quantity })
          .eq('id', item.id);

        if (stockError) throw stockError;
      }

      toast({
        title: "Venda realizada!",
        description: `Venda de R$ ${finalTotal.toFixed(2)} foi registrada com sucesso.`,
      });

      onComplete();
    } catch (error: any) {
      console.error('Error creating sale:', error);
      toast({
        title: "Erro ao processar venda",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = calculateFinalTotal();
  const discountAmount = total - finalTotal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Venda</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cart Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Resumo do pedido</h4>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>Subtotal:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto:</span>
                <span>-R$ {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>R$ {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Discount Section */}
          <div className="space-y-3">
            <Label>Desconto</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
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
                <Input
                  type="number"
                  min="0"
                  max={discountType === "percentage" ? 100 : total}
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => handleDiscountChange(discountType, parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
            {discountError && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{discountError}</span>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Método de pagamento</Label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card
                    key={method.id}
                    className={`cursor-pointer p-3 text-center transition-colors ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <Icon className="h-6 w-6 mx-auto mb-1" />
                    <p className="text-sm font-medium">{method.label}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="note">Observações (opcional)</Label>
            <Textarea
              id="note"
              placeholder="Digite observações sobre a venda..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={loading || !!discountError}
            >
              {loading ? "Processando..." : `Confirmar R$ ${finalTotal.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}