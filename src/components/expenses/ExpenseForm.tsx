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
  "Compras", 
  "Contas",
  "Marketing",
  "Outros"
];

const paymentMethods = [
  "Dinheiro",
  "PIX",
  "Cartão de Débito",
  "Cartão de Crédito",
  "Transferência",
  "Boleto"
];

export function ExpenseForm({ open, onOpenChange, onSave, expense }: ExpenseFormProps) {
  const [description, setDescription] = useState(expense?.description || "");
  const [category, setCategory] = useState(expense?.category || "");
  const [amount, setAmount] = useState(expense?.amount || "");
  const [expenseDate, setExpenseDate] = useState<Date>(expense?.expense_date ? new Date(expense.expense_date) : new Date());
  const [paymentMethod, setPaymentMethod] = useState(expense?.payment_method || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const expenseData = {
        description,
        category,
        amount: parseFloat(amount),
        expense_date: format(expenseDate, 'yyyy-MM-dd'),
        payment_method: paymentMethod || null,
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
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar despesa",
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
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a despesa..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Data da Despesa</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento (Opcional)</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma forma de pagamento" />
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