import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { FinanceAnalyzer, type CategoryAnalysis as CategoryData } from "@/services/financeAnalyzer";
import { supabase } from "@/integrations/supabase/client";

const COLORS = {
  receita: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'],
  despesa: ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e']
};

export function CategoryAnalysis() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const analyzer = new FinanceAnalyzer(user.id);
      const financialData = await analyzer.analyze();
      setCategories(financialData.categorias_top);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const receitas = categories.filter(c => c.type === "receita");
  const despesas = categories.filter(c => c.type === "despesa");

  const receitaData = receitas.map(r => ({
    name: r.name,
    value: r.value,
    percentage: r.percentage
  }));

  const despesaData = despesas.map(d => ({
    name: d.name,
    value: d.value,
    percentage: d.percentage
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Top 5 Receitas */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-green-600">🏆 Top 5 Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          {receitaData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={receitaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage.toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {receitaData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.receita[index % COLORS.receita.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2 mt-4">
                {receitas.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS.receita[idx] }}
                      />
                      <span className="font-medium text-sm">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(cat.value)}</p>
                      <p className="text-xs text-muted-foreground">{cat.percentage.toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">Sem dados de receita</p>
          )}
        </CardContent>
      </Card>

      {/* Top 5 Despesas */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-red-600">📊 Top 5 Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {despesaData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={despesaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage.toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {despesaData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.despesa[index % COLORS.despesa.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2 mt-4">
                {despesas.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS.despesa[idx] }}
                      />
                      <span className="font-medium text-sm">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatCurrency(cat.value)}</p>
                      <p className="text-xs text-muted-foreground">{cat.percentage.toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">Sem dados de despesa</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
