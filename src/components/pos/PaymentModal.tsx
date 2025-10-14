import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CreditCard, Banknote, Smartphone, AlertTriangle, CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "./POSView";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  cartItems: CartItem[];
  onComplete: () => void;
}

interface UserDiscountLimit {
  max_discount_percentage: number;
}

type PaymentMethod = "dinheiro" | "debito" | "credito_vista" | "credito_parcelado" | "pix" | "transferencia";

export function PaymentModal({ open, onOpenChange, total, cartItems, onComplete }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [installments, setInstallments] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [userDiscountLimit, setUserDiscountLimit] = useState<UserDiscountLimit | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [paymentFees, setPaymentFees] = useState<Record<string, number>>({});
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const { toast } = useToast();

  const paymentMethods = [
    { id: "dinheiro" as PaymentMethod, label: "Dinheiro", icon: Banknote },
    { id: "pix" as PaymentMethod, label: "PIX", icon: Smartphone },
    { id: "debito" as PaymentMethod, label: "Débito", icon: CreditCard },
    { id: "credito_vista" as PaymentMethod, label: "Crédito à vista", icon: CreditCard },
    { id: "credito_parcelado" as PaymentMethod, label: "Crédito Parcelado", icon: CreditCard },
    { id: "transferencia" as PaymentMethod, label: "Transferência", icon: Banknote },
  ];

  useEffect(() => {
    if (open) {
      fetchUserDiscountLimit();
      fetchPaymentFees();
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

  const fetchPaymentFees = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_fees")
        .select("*");

      if (error) throw error;

      const feesMap: Record<string, number> = {};
      data?.forEach((fee: any) => {
        if (fee.method === "credito_parcelado") {
          feesMap[`${fee.method}_${fee.installments}`] = Number(fee.fee_percentage);
        } else {
          feesMap[fee.method] = Number(fee.fee_percentage);
        }
      });
      setPaymentFees(feesMap);
    } catch (error) {
      console.error("Erro ao buscar taxas:", error);
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

  const getPaymentFee = () => {
    if (paymentMethod === "credito_parcelado") {
      return paymentFees[`${paymentMethod}_${installments}`] || 0;
    }
    return paymentFees[paymentMethod] || 0;
  };

  const calculateGrossAmount = () => {
    return calculateFinalTotal();
  };

  const calculateNetAmount = () => {
    const gross = calculateGrossAmount();
    const feePercentage = getPaymentFee();
    return gross - (gross * feePercentage / 100);
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

      const grossAmount = calculateGrossAmount();
      const netAmount = calculateNetAmount();

      // Registrar a venda
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          subtotal,
          discount_type: discountValue > 0 ? discountType : null,
          discount_value: discountValue,
          total: finalTotal,
          gross_amount: grossAmount,
          net_amount: netAmount,
          payment_method: paymentMethod,
          installments: paymentMethod === "credito_parcelado" ? installments : 1,
          note: note || null,
          date: saleDate.toISOString(),
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Registrar os itens da venda
      for (const item of cartItems) {
        if (item.type === "produto") {
          // Para produtos: buscar custo e atualizar estoque
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
              service_id: null,
              item_type: "produto",
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
        } else {
          // Para serviços: apenas registrar a venda (sem controle de estoque)
          const { error: itemError } = await supabase
            .from("sale_items")
            .insert({
              sale_id: sale.id,
              product_id: null,
              service_id: item.id,
              item_type: "servico",
              quantity: item.quantity,
              unit_price: item.price,
              total_price: item.price * item.quantity,
              custo_unitario: 0
            });

          if (itemError) throw itemError;
        }
      }

      toast({
        title: "Venda finalizada",
        description: `Venda de R$ ${finalTotal.toFixed(2)} registrada com sucesso!`
      });

      onComplete();
      setNote("");
      setPaymentMethod("pix");
      setInstallments(1);
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalizar Venda</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center space-y-1 pb-2 border-b">
            <h3 className="text-xl font-bold">R$ {total.toFixed(2)}</h3>
            {discountValue > 0 && (
              <div className="text-red-600 text-sm">
                <p>Desconto: -R$ {calculateDiscount().toFixed(2)}</p>
                <p className="font-semibold">Total: R$ {calculateFinalTotal().toFixed(2)}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">{cartItems.length} itens</p>
          </div>

          {/* Data da Venda */}
          <div className="space-y-2">
            <Label>Data da Venda</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !saleDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {saleDate ? format(saleDate, "PPP", { locale: ptBR }) : <span>Selecionar data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={saleDate}
                  onSelect={(date) => date && setSaleDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Desconto */}
          <div className="space-y-2">
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

          <div className="space-y-2">
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
                  onClick={() => {
                    setPaymentMethod(method.id);
                    if (method.id !== "credito_parcelado") {
                      setInstallments(1);
                    }
                  }}
                >
                  <div className="text-center space-y-1">
                    <method.icon className="h-6 w-6 mx-auto" />
                    <p className="text-sm font-medium">{method.label}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {paymentMethod === "credito_parcelado" && (
            <div className="space-y-2">
              <Label>Número de Parcelas</Label>
              <Select value={installments.toString()} onValueChange={(v) => setInstallments(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}x de R$ {(calculateFinalTotal() / num).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Observações</Label>
            <Textarea
              id="note"
              placeholder="Observações..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          {getPaymentFee() > 0 && (
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p>Valor pago: R$ {calculateGrossAmount().toFixed(2)}</p>
              <p>Taxa: {getPaymentFee().toFixed(2)}%</p>
              <p className="font-semibold text-green-600">Valor líquido: R$ {calculateNetAmount().toFixed(2)}</p>
            </div>
          )}

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