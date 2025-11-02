import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Package,
  ShoppingCart,
  Percent
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface FinancialData {
  revenue: number;
  costOfGoodsSold: number;
  expenses: number;
  netProfit: number;
  profitMargin: number;
  grossProfit: number;
}

export default function FinancialDashboard() {
  const [financialData, setFinancialData] = useState<FinancialData>({
    revenue: 0,
    costOfGoodsSold: 0,
    expenses: 0,
    netProfit: 0,
    profitMargin: 0,
    grossProfit: 0
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      // Get sales data with profit
      const { data: salesData } = await supabase.rpc('get_sales_with_profit');
      
      const monthlySales = salesData?.filter((sale: any) => 
        new Date(sale.created_at) >= firstDayOfMonth && !sale.canceled
      ) || [];

      // Calculate revenue and COGS
      const revenue = monthlySales.reduce((sum: number, sale: any) => 
        sum + Number(sale.total_revenue || 0), 0
      );
      
      const costOfGoodsSold = monthlySales.reduce((sum: number, sale: any) => 
        sum + (Number(sale.total_revenue || 0) - Number(sale.total_profit || 0)), 0
      );

      // Get expenses
      const { data: expensesData } = await supabase
        .from("expenses")
        .select("amount")
        .gte('expense_date', firstDayOfMonth.toISOString().split('T')[0]);

      const expenses = expensesData?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

      // Calculate metrics
      const grossProfit = revenue - costOfGoodsSold;
      const netProfit = grossProfit - expenses;
      const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      setFinancialData({
        revenue,
        costOfGoodsSold,
        expenses,
        netProfit,
        profitMargin,
        grossProfit
      });

      // Generate alerts
      const newAlerts: string[] = [];
      if (netProfit < 0) {
        newAlerts.push("⚠️ Prejuízo! Suas despesas estão maiores que o lucro bruto.");
      }
      if (profitMargin < 10 && profitMargin >= 0) {
        newAlerts.push("⚠️ Margem de lucro baixa! Considere reduzir despesas ou aumentar preços.");
      }
      if (expenses > revenue * 0.5) {
        newAlerts.push("⚠️ Despesas representam mais de 50% da receita!");
      }
      setAlerts(newAlerts);

      // Prepare chart data
      setMonthlyData([
        {
          name: "Financeiro",
          "Receita Bruta": revenue,
          "Custo Produtos": costOfGoodsSold,
          "Despesas": expenses,
          "Lucro Líquido": Math.max(0, netProfit)
        }
      ]);

    } catch (error) {
      console.error("Erro ao buscar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Bruta</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financialData.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de vendas no mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo de Produtos</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(financialData.costOfGoodsSold)}
            </div>
            <p className="text-xs text-muted-foreground">
              CPV dos produtos vendidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Operacionais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(financialData.expenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gastos do negócio
            </p>
          </CardContent>
        </Card>

        <Card className={financialData.netProfit >= 0 ? "border-green-200" : "border-red-200"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            {financialData.netProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(financialData.netProfit)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={financialData.profitMargin >= 10 ? "default" : "destructive"}>
                <Percent className="h-3 w-3 mr-1" />
                {financialData.profitMargin.toFixed(1)}%
              </Badge>
              <p className="text-xs text-muted-foreground">
                margem de lucro
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Composição Financeira (Mês Atual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">Receita Bruta</span>
              </div>
              <span className="font-bold text-green-600">{formatCurrency(financialData.revenue)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-orange-600 font-medium">(-)</span>
                <span className="font-medium">Custo dos Produtos Vendidos</span>
              </div>
              <span className="font-bold text-orange-600">{formatCurrency(financialData.costOfGoodsSold)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">(=)</span>
                <span className="font-bold">Lucro Bruto</span>
              </div>
              <span className="font-bold text-blue-600">{formatCurrency(financialData.grossProfit)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-medium">(-)</span>
                <span className="font-medium">Despesas Operacionais</span>
              </div>
              <span className="font-bold text-red-600">{formatCurrency(financialData.expenses)}</span>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
              financialData.netProfit >= 0 ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${financialData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  (=)
                </span>
                <span className="font-bold text-lg">LUCRO LÍQUIDO</span>
              </div>
              <span className={`font-bold text-xl ${
                financialData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {formatCurrency(financialData.netProfit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Visualização Gráfica</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Legend />
              <Bar dataKey="Receita Bruta" fill="#10b981" />
              <Bar dataKey="Custo Produtos" fill="#f97316" />
              <Bar dataKey="Despesas" fill="#ef4444" />
              <Bar dataKey="Lucro Líquido" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
