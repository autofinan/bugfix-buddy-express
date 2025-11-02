import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

interface Insight {
  type: "success" | "warning" | "info" | "tip";
  icon: any;
  title: string;
  message: string;
}

export function SmartInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const generatedInsights: Insight[] = [];
      
      // Dados do mês atual
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());

      // Dados do mês anterior
      const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
      const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

      // Buscar vendas mês atual
      const { data: currentSales } = await supabase
        .from("sales")
        .select("total")
        .eq("owner_id", user.id)
        .eq("canceled", false)
        .gte("date", currentMonthStart.toISOString())
        .lte("date", currentMonthEnd.toISOString());

      const currentRevenue = currentSales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;

      // Buscar vendas mês anterior
      const { data: lastSales } = await supabase
        .from("sales")
        .select("total")
        .eq("owner_id", user.id)
        .eq("canceled", false)
        .gte("date", lastMonthStart.toISOString())
        .lte("date", lastMonthEnd.toISOString());

      const lastRevenue = lastSales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;

      // Buscar custos e despesas
      const { data: saleItems } = await supabase
        .from("sale_items")
        .select("quantity, custo_unitario")
        .eq("owner_id", user.id)
        .gte("created_at", currentMonthStart.toISOString())
        .lte("created_at", currentMonthEnd.toISOString());

      const costs = saleItems?.reduce((sum, item) => {
        return sum + (Number(item.quantity) * Number(item.custo_unitario || 0));
      }, 0) || 0;

      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount, category")
        .eq("owner_id", user.id)
        .gte("expense_date", format(currentMonthStart, "yyyy-MM-dd"))
        .lte("expense_date", format(currentMonthEnd, "yyyy-MM-dd"));

      const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const netProfit = currentRevenue - costs - totalExpenses;

      // Análise 1: Resumo financeiro
      const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value);
      };

      generatedInsights.push({
        type: "info",
        icon: Info,
        title: "Resumo Financeiro do Mês",
        message: `Você vendeu ${formatCurrency(currentRevenue)} este mês, mas seu lucro líquido foi ${formatCurrency(netProfit)}.`,
      });

      // Análise 2: Comparação com mês anterior
      if (lastRevenue > 0) {
        const percentChange = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
        if (percentChange > 0) {
          generatedInsights.push({
            type: "success",
            icon: CheckCircle,
            title: "Crescimento de Vendas",
            message: `Suas vendas cresceram ${percentChange.toFixed(1)}% em relação ao mês anterior. Continue assim!`,
          });
        } else if (percentChange < -10) {
          generatedInsights.push({
            type: "warning",
            icon: AlertTriangle,
            title: "Queda nas Vendas",
            message: `Suas vendas caíram ${Math.abs(percentChange).toFixed(1)}% em relação ao mês anterior. Revise suas estratégias.`,
          });
        }
      }

      // Análise 3: Controle de despesas
      const expenseRatio = currentRevenue > 0 ? (totalExpenses / currentRevenue) * 100 : 0;
      if (expenseRatio < 35) {
        generatedInsights.push({
          type: "success",
          icon: CheckCircle,
          title: "Excelente Controle de Despesas",
          message: `Suas despesas fixas representam ${expenseRatio.toFixed(0)}% da sua receita — ótimo controle!`,
        });
      } else if (expenseRatio > 50) {
        generatedInsights.push({
          type: "warning",
          icon: AlertTriangle,
          title: "Despesas Elevadas",
          message: `Suas despesas representam ${expenseRatio.toFixed(0)}% da receita. Considere reduzir custos fixos.`,
        });
      }

      // Análise 4: Despesas pessoais vs empresariais
      const personalExpenses = expenses?.filter(e => 
        e.category === "Pessoal" || 
        e.category === "Alimentação" || 
        e.category === "Transporte pessoal"
      ) || [];
      
      const personalTotal = personalExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const personalRatio = totalExpenses > 0 ? (personalTotal / totalExpenses) * 100 : 0;

      if (personalRatio > 15) {
        generatedInsights.push({
          type: "warning",
          icon: AlertTriangle,
          title: "Despesas Pessoais Detectadas",
          message: `Atenção: ${personalRatio.toFixed(0)}% das suas despesas parecem pessoais. Isso reduz seu lucro real.`,
        });
      }

      // Análise 5: Margem de lucro
      const profitMargin = currentRevenue > 0 ? (netProfit / currentRevenue) * 100 : 0;
      if (profitMargin < 10) {
        generatedInsights.push({
          type: "warning",
          icon: AlertTriangle,
          title: "Margem de Lucro Baixa",
          message: `Sua margem de lucro está em ${profitMargin.toFixed(1)}%. Revise seus preços ou reduza custos.`,
        });
      } else if (profitMargin > 30) {
        generatedInsights.push({
          type: "success",
          icon: TrendingUp,
          title: "Margem de Lucro Saudável",
          message: `Parabéns! Sua margem de lucro está em ${profitMargin.toFixed(1)}% — muito boa!`,
        });
      }

      // Dica sempre presente
      generatedInsights.push({
        type: "tip",
        icon: Lightbulb,
        title: "Dica do Assistente",
        message: "Separe sempre uma parte do seu lucro para impostos (DAS) e emergências. Evite misturar finanças pessoais com as da empresa.",
      });

      setInsights(generatedInsights);

    } catch (error) {
      console.error("Erro ao gerar insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "success":
        return "default";
      case "warning":
        return "destructive";
      case "info":
        return "default";
      case "tip":
        return "default";
      default:
        return "default";
    }
  };

  const getAlertClassName = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-500 bg-green-50 dark:bg-green-950";
      case "warning":
        return "border-orange-500 bg-orange-50 dark:bg-orange-950";
      case "info":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950";
      case "tip":
        return "border-purple-500 bg-purple-50 dark:bg-purple-950";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Análises Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <Alert key={index} variant={getAlertVariant(insight.type)} className={getAlertClassName(insight.type)}>
                <Icon className="h-4 w-4" />
                <AlertDescription>
                  <strong>{insight.title}:</strong> {insight.message}
                </AlertDescription>
              </Alert>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
