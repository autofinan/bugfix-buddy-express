import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Calendar, DollarSign, PieChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ExpensesSummary {
  total_month: number;
  total_year: number;
  categories_count: number;
  highest_category: string;
  highest_amount: number;
}

interface CategoryExpense {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export default function ExpensesDashboard() {
  const [summary, setSummary] = useState<ExpensesSummary | null>(null);
  const [categories, setCategories] = useState<CategoryExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpensesSummary();
  }, []);

  const fetchExpensesSummary = async () => {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);

      // Buscar total do mês
      const { data: monthData } = await supabase
        .from("expenses")
        .select("amount")
        .gte('expense_date', firstDayOfMonth.toISOString().split('T')[0]);

      // Buscar total do ano
      const { data: yearData } = await supabase
        .from("expenses")
        .select("amount")
        .gte('expense_date', firstDayOfYear.toISOString().split('T')[0]);

      // Buscar por categorias (mês atual)
      const { data: categoryData } = await supabase
        .from("expenses")
        .select("category, amount")
        .gte('expense_date', firstDayOfMonth.toISOString().split('T')[0]);

      const totalMonth = monthData?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      const totalYear = yearData?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

      // Processar dados por categoria
      const categoryMap = new Map<string, { total: number; count: number }>();
      
      categoryData?.forEach(expense => {
        const current = categoryMap.get(expense.category) || { total: 0, count: 0 };
        categoryMap.set(expense.category, {
          total: current.total + expense.amount,
          count: current.count + 1
        });
      });

      const categoriesArray: CategoryExpense[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalMonth > 0 ? (data.total / totalMonth) * 100 : 0
      })).sort((a, b) => b.total - a.total);

      const highestCategory = categoriesArray[0];

      setSummary({
        total_month: totalMonth,
        total_year: totalYear,
        categories_count: categoryMap.size,
        highest_category: highestCategory?.category || 'Nenhuma',
        highest_amount: highestCategory?.total || 0
      });

      setCategories(categoriesArray);
    } catch (error) {
      console.error("Erro ao buscar resumo de despesas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Aluguel': 'bg-blue-500',
      'Compras': 'bg-green-500',
      'Contas': 'bg-yellow-500',
      'Marketing': 'bg-purple-500',
      'Outros': 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total do Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              R$ {summary?.total_month.toFixed(2) || '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Despesas deste mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total do Ano</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {summary?.total_year.toFixed(2) || '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Acumulado no ano
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias Ativas</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.categories_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Categorias com gastos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Categoria</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {summary?.highest_category || 'Nenhuma'}
            </div>
            <p className="text-xs text-muted-foreground">
              R$ {summary?.highest_amount.toFixed(2) || '0,00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown por Categorias */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria (Mês Atual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((cat, index) => (
                <div key={cat.category} className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(cat.category)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{cat.category}</span>
                      <Badge variant="outline">
                        {cat.count} despesa{cat.count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex-1 bg-secondary rounded-full h-2 mr-3">
                        <div 
                          className={`${getCategoryColor(cat.category)} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${cat.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-destructive">
                        R$ {cat.total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cat.percentage.toFixed(1)}% do total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
