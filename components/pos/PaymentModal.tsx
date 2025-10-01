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
import { CartProduct } from "./POSView";
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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("user_discount_limits")
        .select("max_discount_percentage")
        .eq("user_id", userData.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Erro ao buscar limite de desconto:", error);
        return;
      }

      setUserDiscountLimit(data || { max_discount_percentage: 10 });
    } catch (error) {
      console.error("Erro ao buscar limite de desconto:", error);
    }
  };

  const validateDiscount = () => {
    setDiscountError("");
    
    if (discountValue <= 0) return true;

    if (discountType === "percentage") {
      if (!userDiscountLimit) return true;
      
      if (discountValue > userDiscountLimit.max_discount_percentage) {
        setDiscountError(`Desconto máximo permitido: ${userDiscountLimit.max_discount_percentage}%`);
        return false;
      }
    } else {
      if (discountValue >= total) {
        setDiscountError("Desconto não pode ser maior ou igual ao total");
        return false;
      }
    }

    return true;
  };

  const calculateDiscount = () => {
    if (discountValue <= 0) return 0;
    
    if (discountType === "percentage") {
      return (total * discountValue) / 100;
    }
    return discountValue;
  };

  const calculateFinalTotal = () => {
    return Math.max(0, total - calculateDiscount());
  };

  const handleConfirmSale = async () => {
    if (!validateDiscount()) {
      return;
    }

    try {
      setLoading(true);

      const subtotal = total;
      const discount = calculateDiscount();
      const finalTotal = calculateFinalTotal();

      // Registrar a venda
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          subtotal,
          discount_type: discountValue > 0 ? discountType : null,
          discount_value: discountValue,
          total: finalTotal,
          payment_method: paymentMethod,
          note: note || null,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Registrar os itens da venda
      for (const item of cartItems) {
        // Primeiro, buscar o custo do produto
        const { data: productData, error: fetchError } = await supabase
          .from("products")
          .select("stock, cost")
          .eq("id", item.id)
          .single();

        if (fetchError) throw fetchError;

        // Inserir o item da venda com o custo
        const { error: itemError } = await supabase
          .from("sale_items")
          .insert({
            sale_id: sale.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
            custo_unitario: productData.cost || 0
          });

        if (itemError) throw itemError;

        // Atualizar estoque
        const { error: updateError } = await supabase
          .from("products")
          .update({
            stock: Math.max(0, (productData.stock || 0) - item.quantity)
          })
          .eq("id", item.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Venda finalizada",
        description: `Venda de R$ ${finalTotal.toFixed(2)} registrada com sucesso!`
      });

      onComplete();
      setNote("");
      setPaymentMethod("pix");
      setDiscountValue(0);
      setDiscountType("percentage");
      setDiscountError("");
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      toast({
        title: "Erro",
        description: "Erro ao processar a venda. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Venda</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">R$ {total.toFixed(2)}</h3>
              {discountValue > 0 && (
                <div className="text-red-600">
                  <p className="text-sm">Desconto: -R$ {calculateDiscount().toFixed(2)}</p>
                  <p className="text-lg font-semibold">Total: R$ {calculateFinalTotal().toFixed(2)}</p>
                </div>
              )}
            </div>
            <p className="text-muted-foreground">{cartItems.length} itens</p>
          </div>

          {/* Desconto */}
          <div className="space-y-4">
            <Label>Desconto</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
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
                <Input
                  type="number"
                  min="0"
                  max={discountType === "percentage" ? (userDiscountLimit?.max_discount_percentage || 100) : total}
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(Number(e.target.value));
                    setDiscountError("");
                  }}
                  placeholder={discountType === "percentage" ? "%" : "R$"}
                />
              </div>
            </div>
            
            {discountError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{discountError}</span>
              </div>
            )}
            
            {userDiscountLimit && (
              <p className="text-xs text-muted-foreground">
                Limite máximo: {userDiscountLimit.max_discount_percentage}%
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Forma de Pagamento</Label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div className="text-center space-y-1">
                    <method.icon className="h-6 w-6 mx-auto" />
                    <p className="text-sm font-medium">{method.label}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Observações (opcional)</Label>
            <Textarea
              id="note"
              placeholder="Adicione observações sobre a venda..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

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
              onClick={handleConfirmSale}
              className="flex-1"
              disabled={loading || !!discountError}
            >
              {loading ? "Processando..." : "Confirmar Venda"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}