import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, Percent, ShoppingCart, Receipt } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthlyData {
  month: string;
  receita: number;
  custos: number;
  despesas: number;
  lucro: number;
}

interface FinancialMetrics {
  receitaTotal: number;
  custosTotal: number;
  despesasTotal: number;
  lucroLiquido: number;
  margemLucro: number;
  monthlyData: MonthlyData[];
}

export function FinancialOverview() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar dados dos últimos 6 meses
      const monthlyData: MonthlyData[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const startDate = startOfMonth(date);
        const endDate = endOfMonth(date);

        // Receitas (vendas)
        const { data: sales } = await supabase
          .from("sales")
          .select("total")
          .eq("owner_id", user.id)
          .eq("canceled", false)
          .gte("date", startDate.toISOString())
          .lte("date", endDate.toISOString());

        const receita = sales?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;

        // Custos (custo_unitario dos produtos vendidos)
        const { data: saleItems } = await supabase
          .from("sale_items")
          .select("quantity, custo_unitario")
          .eq("owner_id", user.id)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        const custos = saleItems?.reduce((sum, item) => {
          return sum + (Number(item.quantity) * Number(item.custo_unitario || 0));
        }, 0) || 0;

        // Despesas
        const { data: expenses } = await supabase
          .from("expenses")
          .select("amount")
          .eq("owner_id", user.id)
          .gte("expense_date", format(startDate, "yyyy-MM-dd"))
          .lte("expense_date", format(endDate, "yyyy-MM-dd"));

        const despesas = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

        monthlyData.push({
          month: format(date, "MMM", { locale: ptBR }),
          receita,
          custos,
          despesas,
          lucro: receita - custos - despesas,
        });
      }

      // Calcular totais do mês atual
      const currentMonth = monthlyData[monthlyData.length - 1];
      
      setMetrics({
        receitaTotal: currentMonth.receita,
        custosTotal: currentMonth.custos,
        despesasTotal: currentMonth.despesas,
        lucroLiquido: currentMonth.lucro,
        margemLucro: currentMonth.receita > 0 
          ? ((currentMonth.lucro / currentMonth.receita) * 100) 
          : 0,
        monthlyData,
      });

    } catch (error) {
      console.error("Erro ao buscar dados financeiros:", error);
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
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

  if (!metrics) return null;

  const isProfit = metrics.lucroLiquido > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.receitaTotal)}</div>
            <p className="text-xs text-muted-foreground">Mês atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Custos Diretos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.custosTotal)}</div>
            <p className="text-xs text-muted-foreground">Custo dos produtos vendidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.despesasTotal)}</div>
            <p className="text-xs text-muted-foreground">Fixas e variáveis</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido Real</CardTitle>
            {isProfit ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(metrics.lucroLiquido)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita - Custos - Despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.margemLucro.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Do faturamento</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução Financeira (6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receita" 
                stroke="hsl(142, 76%, 36%)" 
                name="Receita"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="custos" 
                stroke="hsl(25, 95%, 53%)" 
                name="Custos"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="despesas" 
                stroke="hsl(0, 84%, 60%)" 
                name="Despesas"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="lucro" 
                stroke="hsl(221, 83%, 53%)" 
                name="Lucro"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
