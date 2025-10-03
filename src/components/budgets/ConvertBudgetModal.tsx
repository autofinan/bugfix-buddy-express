import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Banknote, Smartphone, Building } from "lucide-react";

interface Budget {
  id: string;
  customer_name: string | null;
  total: number;
  discount_value: number;
  discount_type: string | null;
}

interface ConvertBudgetModalProps {
  budget: Budget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (paymentMethod: string, notes: string) => void;
  loading: boolean;
}

const paymentMethods = [
  { value: "cash", label: "Dinheiro", icon: Banknote },
  { value: "credit_card", label: "Cartão de Crédito", icon: CreditCard },
  { value: "debit_card", label: "Cartão de Débito", icon: CreditCard },
  { value: "pix", label: "PIX", icon: Smartphone },
  { value: "bank_transfer", label: "Transferência", icon: Building },
];

export function ConvertBudgetModal({ 
  budget, 
  open, 
  onOpenChange, 
  onConfirm, 
  loading 
}: ConvertBudgetModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    if (!paymentMethod) return;
    onConfirm(paymentMethod, notes);
  };

  const resetForm = () => {
    setPaymentMethod("");
    setNotes("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  if (!budget) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Converter em Venda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo do Orçamento */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{budget.customer_name || "Não informado"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <Badge variant="secondary" className="text-lg font-bold">
                    R$ {budget.total.toFixed(2)}
                  </Badge>
                </div>
                {budget.discount_value > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Desconto:</span>
                    <span className="text-sm text-green-600">
                      {budget.discount_type === 'percentage' 
                        ? `${budget.discount_value}%` 
                        : `R$ ${budget.discount_value.toFixed(2)}`}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Forma de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {method.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações da Venda</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais para a venda..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1"
              disabled={loading || !paymentMethod}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-gray-300 border-t-white"></div>
                  Convertendo...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Venda
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}