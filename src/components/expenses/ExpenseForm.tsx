import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: any | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const expenseCategories = [
  "Aluguel",
  "Energia Elétrica",
  "Água",
  "Internet/Telefone",
  "Produtos",
  "Marketing",
  "Manutenção",
  "Impostos",
  "Salários",
  "Transporte",
  "Material de Escritório",
  "Alimentação",
  "Outros"
];

const paymentMethods = [
  "Dinheiro",
  "PIX", 
  "Cartão de Débito",
  "Cartão de Crédito",
  "Transferência Bancária",
  "Boleto",
  "Cheque"
];

export function ExpenseForm({ open, onOpenChange, expense, onClose, onSuccess }: ExpenseFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [expenseDate, setExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (expense) {
      setDescription(expense.description || "");
      setAmount(expense.amount?.toString() || "");
      setCategory(expense.category || "");
      setPaymentMethod(expense.payment_method || "");
      setExpenseDate(expense.expense_date || format(new Date(), 'yyyy-MM-dd'));
    } else {
      // Reset form for new expense
      setDescription("");
      setAmount("");
      setCategory("");
      setPaymentMethod("");
      setExpenseDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [expense]);

  const handleSubmit = async () => {
    if (!description.trim() || !amount || !category || !paymentMethod) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser um número maior que zero",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const expenseData = {
        description: description.trim(),
        amount: amountValue,
        category,
        payment_method: paymentMethod,
        expense_date: expenseDate,
      };

      if (expense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', expense.id);

        if (error) throw error;

        toast({
          title: "Despesa atualizada!",
          description: "A despesa foi atualizada com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert(expenseData);

        if (error) throw error;

        toast({
          title: "Despesa cadastrada!",
          description: "A despesa foi cadastrada com sucesso.",
        });
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      toast({
        title: "Erro ao salvar despesa",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a despesa..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="expense-date">Data *</Label>
              <Input
                id="expense-date"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="payment-method">Forma de Pagamento *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Salvando..." : expense ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}