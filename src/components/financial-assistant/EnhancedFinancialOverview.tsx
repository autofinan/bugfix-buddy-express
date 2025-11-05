import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Percent, ShoppingCart, Receipt, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FinanceAnalyzer, type FinancialData } from "@/services/financeAnalyzer";
import { supabase } from "@/integrations/supabase/client";

export function EnhancedFinancialOverview() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const analyzer = new FinanceAnalyzer(user.id);
      const financialData = await analyzer.analyze();
      setData(financialData);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
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

  const calculateForecast = () => {
    if (!data || data.historico_6_meses.length < 3) return null;

    // Média móvel dos últimos 3 meses
    const ultimos3 = data.historico_6_meses.slice(-3);
    const mediaLucro = ultimos3.reduce((sum, m) => sum + m.lucro, 0) / 3;
    const mediaReceita = ultimos3.reduce((sum, m) => sum + m.receita, 0) / 3;

    // Calcular tendência
    const crescimento = data.crescimento_receita / 100;
    const projecaoReceita = mediaReceita * (1 + crescimento);
    const projecaoLucro = mediaLucro * (1 + crescimento);

    return {
      receita: projecaoReceita,
      lucro: projecaoLucro,
      crescimento: data.crescimento_receita
    };
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="shadow-md">
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const isProfit = data.lucro_liquido > 0;
  const forecast = calculateForecast();

  // Adicionar projeção aos dados do gráfico
  const chartData = [...data.historico_6_meses];
  if (forecast) {
    chartData.push({
      month: "Próx",
      receita: forecast.receita,
      custos: 0,
      despesas: 0,
      lucro: forecast.lucro,
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Cards de métricas em grid responsivo */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold truncate">{formatCurrency(data.receita)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 flex-wrap">
              Mês atual
              {data.crescimento_receita > 0 && (
                <Badge variant="outline" className="ml-2 border-green-500 text-green-600 text-[10px] sm:text-xs">
                  <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                  {data.crescimento_receita.toFixed(1)}%
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Custos Diretos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.custos)}</div>
            <p className="text-xs text-muted-foreground">Custo dos produtos vendidos</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.despesas)}</div>
            <p className="text-xs text-muted-foreground">Fixas e variáveis</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido Real</CardTitle>
            {isProfit ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(data.lucro_liquido)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receita - Custos - Despesas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.margem.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              {data.benchmark.status === "acima" ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  Acima da média ({data.benchmark.margem_media_6_meses.toFixed(1)}%)
                </>
              ) : data.benchmark.status === "abaixo" ? (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  Abaixo da média ({data.benchmark.margem_media_6_meses.toFixed(1)}%)
                </>
              ) : (
                `Na média histórica`
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Benchmark Interno
          </CardTitle>
          <CardDescription>Comparação com sua média dos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Margem Atual</p>
              <p className="text-2xl font-bold">{data.benchmark.margem_atual.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média Histórica</p>
              <p className="text-2xl font-bold">{data.benchmark.margem_media_6_meses.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Diferença</p>
              <p className={`text-2xl font-bold ${data.benchmark.diferenca > 0 ? "text-green-600" : "text-red-600"}`}>
                {data.benchmark.diferenca > 0 ? "+" : ""}{data.benchmark.diferenca.toFixed(1)}%
              </p>
            </div>
          </div>
          {data.benchmark.status === "acima" && (
            <Badge variant="outline" className="mt-4 border-green-500 text-green-600">
              ✅ Sua margem atual está acima da média histórica
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Gráfico com Projeção */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Evolução Financeira (6 meses) + Projeção</CardTitle>
          {forecast && (
            <CardDescription>
              📈 Projeção para próximo mês: Lucro estimado {formatCurrency(forecast.lucro)} 
              ({forecast.crescimento > 0 ? `+${forecast.crescimento.toFixed(1)}` : forecast.crescimento.toFixed(1)}%)
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receita" 
                stroke="hsl(142, 76%, 36%)" 
                name="Receita"
                strokeWidth={2}
                dot={{ r: 4 }}
                strokeDasharray={chartData.length > 0 && chartData[chartData.length - 1].month === "Próx" ? "5 5" : undefined}
              />
              <Line 
                type="monotone" 
                dataKey="lucro" 
                stroke="hsl(221, 83%, 53%)" 
                name="Lucro"
                strokeWidth={2}
                dot={{ r: 4 }}
                strokeDasharray={chartData.length > 0 && chartData[chartData.length - 1].month === "Próx" ? "5 5" : undefined}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
