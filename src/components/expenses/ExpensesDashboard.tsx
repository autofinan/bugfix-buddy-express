import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, TrendingDown } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

// Mock data - replace with actual hook when expenses table is available
const mockExpenses = [
  {
    id: "1",
    description: "Compra de produtos",
    amount: 500.00,
    category: "Produtos",
    expense_date: "2024-01-15",
    payment_method: "PIX"
  },
  {
    id: "2", 
    description: "Aluguel do estabelecimento",
    amount: 1200.00,
    category: "Aluguel",
    expense_date: "2024-01-01",
    payment_method: "Transferência"
  }
];

export default function ExpensesDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // TODO: Replace with actual useExpenses hook
  const expenses = mockExpenses;
  const isLoading = false;

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const filteredExpenses = expenses.filter((expense) =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Despesas</h1>
          <p className="text-muted-foreground">Controle suas despesas e gastos</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Despesa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total em Despesas</p>
              <p className="text-2xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total de Despesas</p>
              <p className="text-2xl font-bold">{expenses.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Média por Despesa</p>
              <p className="text-2xl font-bold">
                R$ {expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : "0.00"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar despesas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        <DateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
        />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando despesas...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <Card key={expense.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{expense.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{expense.category}</Badge>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(expense.expense_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pagamento: {expense.payment_method}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">- R$ {expense.amount.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            ))}
            
            {filteredExpenses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}