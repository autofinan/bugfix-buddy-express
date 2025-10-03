import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  expense?: any;
}

const categories = [
  "Aluguel",
  "Salário",
  "Luz",
  "Água",
  "Impostos",
  "Outros"
];

const paymentMethods = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao", label: "Cartão" }
];

// Função para normalizar métodos de pagamento
const normalizePaymentMethod = (value: string): string => {
  const normalized = value.toLowerCase().trim();
  
  if (["dinheiro", "cash", "espécie", "especie"].includes(normalized)) {
    return "dinheiro";
  }
  if (["pix"].includes(normalized)) {
    return "pix";
  }
  if (["cartao", "cartão", "credito", "crédito", "debito", "débito", "card"].includes(normalized)) {
    return "cartao";
  }
  
  return "dinheiro"; // fallback
};

export function ExpenseForm({ open, onOpenChange, onSave, expense }: ExpenseFormProps) {
  const [description, setDescription] = useState(expense?.description || "");
  const [category, setCategory] = useState(expense?.category || "");
  const [amount, setAmount] = useState(expense?.amount?.toString() || "");
  const [expenseDate, setExpenseDate] = useState<Date>(expense?.expense_date ? new Date(expense.expense_date) : new Date());
  const [paymentMethod, setPaymentMethod] = useState(expense?.payment_method ? normalizePaymentMethod(expense.payment_method) : "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!category) {
      newErrors.category = "Categoria é obrigatória";
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Valor deve ser maior que zero";
    }

    if (!expenseDate) {
      newErrors.expenseDate = "Data é obrigatória";
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = "Método de pagamento é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios corretamente.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Normalizar o valor (aceita vírgula e converte para ponto)
      const normalizedAmount = parseFloat(amount.replace(',', '.'));

      if (isNaN(normalizedAmount) || normalizedAmount <= 0) {
        throw new Error("Valor inválido");
      }

      const expenseData = {
        description: description.trim(),
        category,
        amount: normalizedAmount,
        expense_date: format(expenseDate, 'yyyy-MM-dd'),
        payment_method: normalizePaymentMethod(paymentMethod),
        owner_id: (await supabase.auth.getUser()).data.user?.id,
      };

      if (expense) {
        const { error } = await supabase
          .from("expenses")
          .update(expenseData)
          .eq("id", expense.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Despesa atualizada com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from("expenses")
          .insert([expenseData] as any);

        if (error) throw error;

        toast({
          title: "Sucesso", 
          description: "Despesa cadastrada com sucesso!"
        });
      }

      onSave();
      onOpenChange(false);
      
      // Reset form
      setDescription("");
      setCategory("");
      setAmount("");
      setExpenseDate(new Date());
      setPaymentMethod("");
      setErrors({});
    } catch (error: any) {
      console.error("Erro ao salvar despesa:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar despesa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {expense ? "Editar Despesa" : "Nova Despesa"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a despesa..."
              required
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$) *</Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100,50 ou 100.50"
              required
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use vírgula ou ponto para decimais
            </p>
          </div>

          <div className="space-y-2">
            <Label>Data da Despesa *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expenseDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expenseDate ? format(expenseDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expenseDate}
                  onSelect={(date) => date && setExpenseDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {errors.expenseDate && (
              <p className="text-sm text-destructive">{errors.expenseDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-sm text-destructive">{errors.paymentMethod}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Salvando..." : expense ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}