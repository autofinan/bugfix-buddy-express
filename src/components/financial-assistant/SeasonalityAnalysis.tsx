import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
}

interface SeasonalityAnalysisProps {
  monthlyData: MonthlyData[];
}

export function SeasonalityAnalysis({ monthlyData }: SeasonalityAnalysisProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const averageRevenue = monthlyData.length > 0
    ? monthlyData.reduce((sum, m) => sum + m.revenue, 0) / monthlyData.length
    : 0;

  const bestMonth = monthlyData.reduce(
    (best, current) => (current.revenue > best.revenue ? current : best),
    monthlyData[0] || { month: "-", revenue: 0, expenses: 0 }
  );

  const worstMonth = monthlyData.reduce(
    (worst, current) => (current.revenue < worst.revenue ? current : worst),
    monthlyData[0] || { month: "-", revenue: 0, expenses: 0 }
  );

  const variation = bestMonth.revenue > 0
    ? ((bestMonth.revenue - worstMonth.revenue) / worstMonth.revenue) * 100
    : 0;

  const chartData = monthlyData.map(m => ({
    name: m.month,
    Receita: m.revenue,
    Despesas: m.expenses,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Análise de Sazonalidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Melhor Mês</p>
            <p className="text-lg font-bold text-green-600 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {bestMonth.month}
            </p>
            <p className="text-sm">{formatCurrency(bestMonth.revenue)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pior Mês</p>
            <p className="text-lg font-bold text-red-600 flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              {worstMonth.month}
            </p>
            <p className="text-sm">{formatCurrency(worstMonth.revenue)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Variação</p>
            <p className="text-lg font-bold">{variation.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Diferença entre melhor e pior</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Bar dataKey="Receita" fill="hsl(var(--primary))" />
            <Bar dataKey="Despesas" fill="hsl(var(--destructive))" />
          </BarChart>
        </ResponsiveContainer>

        <Alert>
          <AlertDescription className="space-y-2">
            <p className="font-semibold">📊 Insights de Sazonalidade:</p>
            {variation > 30 && (
              <p>⚠️ Seu negócio tem <strong>alta sazonalidade</strong> ({variation.toFixed(0)}% de variação). Considere:</p>
            )}
            {variation <= 30 && variation > 15 && (
              <p>📈 Seu negócio tem <strong>sazonalidade moderada</strong> ({variation.toFixed(0)}% de variação). Ações recomendadas:</p>
            )}
            {variation <= 15 && (
              <p>✅ Seu negócio tem <strong>baixa sazonalidade</strong> ({variation.toFixed(0)}% de variação). Continue assim!</p>
            )}
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>Reserve lucros dos meses bons para os meses fracos</li>
              <li>Crie promoções nos meses de baixa</li>
              <li>Ajuste estoque e equipe conforme a demanda sazonal</li>
              <li>Planeje campanhas de marketing para os picos</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="pt-4 space-y-2 text-sm">
          <p className="font-semibold">💰 Receita Média Mensal:</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(averageRevenue)}</p>
          <p className="text-muted-foreground">
            Use este valor como base para planejamento financeiro
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
