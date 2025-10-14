import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, format, addDays } from "date-fns";

interface FinancialAlert {
  id: string;
  severity: "critical" | "warning" | "info" | "success";
  icon: any;
  title: string;
  description: string;
  action?: string;
}

export function FinancialAlerts() {
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAlerts();
  }, []);

  const generateAlerts = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const generatedAlerts: FinancialAlert[] = [];

      // Dados do mês atual
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());

      // Dados do mês anterior
      const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
      const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));

      // Buscar dados mês atual
      const { data: currentSales } = await supabase
        .from("sales")
        .select("total")
        .eq("owner_id", user.id)
        .eq("canceled", false)
        .gte("date", currentMonthStart.toISOString())
        .lte("date", currentMonthEnd.toISOString());

      const currentRevenue = currentSales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;

      // Buscar dados mês anterior
      const { data: lastSales } = await supabase
        .from("sales")
        .select("total")
        .eq("owner_id", user.id)
        .eq("canceled", false)
        .gte("date", lastMonthStart.toISOString())
        .lte("date", lastMonthEnd.toISOString());

      const lastRevenue = lastSales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;

      // Custos e despesas
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
        .select("amount, is_fixed")
        .eq("owner_id", user.id)
        .gte("expense_date", format(currentMonthStart, "yyyy-MM-dd"))
        .lte("expense_date", format(currentMonthEnd, "yyyy-MM-dd"));

      const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const fixedExpenses = expenses?.filter(e => e.is_fixed).reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      const netProfit = currentRevenue - costs - totalExpenses;
      const lastNetProfit = lastRevenue - costs - totalExpenses;

      // ALERTA 1: Gastando mais que fatura
      if (totalExpenses > currentRevenue && currentRevenue > 0) {
        generatedAlerts.push({
          id: "spending-more",
          severity: "critical",
          icon: AlertTriangle,
          title: "Você está gastando mais do que faturando!",
          description: `Suas despesas (${formatCurrency(totalExpenses)}) estão maiores que seu faturamento (${formatCurrency(currentRevenue)}). Reduza custos urgentemente.`,
          action: "Revise suas despesas e corte gastos desnecessários"
        });
      }

      // ALERTA 2: Queda no lucro
      if (lastNetProfit > 0 && netProfit < lastNetProfit) {
        const profitDrop = ((lastNetProfit - netProfit) / lastNetProfit) * 100;
        if (profitDrop > 15) {
          generatedAlerts.push({
            id: "profit-drop",
            severity: "warning",
            icon: TrendingDown,
            title: "Seu lucro caiu em relação ao mês anterior",
            description: `Seu lucro caiu ${profitDrop.toFixed(0)}% em relação ao mês anterior. De ${formatCurrency(lastNetProfit)} para ${formatCurrency(netProfit)}.`,
            action: "Verifique seus custos e preços de venda"
          });
        }
      }

      // ALERTA 3: DAS próximo
      const today = new Date();
      const dayOfMonth = today.getDate();
      if (dayOfMonth >= 15 && dayOfMonth <= 20) {
        generatedAlerts.push({
          id: "das-reminder",
          severity: "warning",
          icon: Calendar,
          title: "DAS vencendo em breve",
          description: "Reserve parte do caixa para o DAS — vencimento próximo (dia 20).",
          action: "Acesse o portal do Simples Nacional e gere sua guia"
        });
      }

      // ALERTA 4: Vendas subindo mas lucro estável
      if (currentRevenue > lastRevenue && Math.abs(netProfit - lastNetProfit) < 100) {
        generatedAlerts.push({
          id: "revenue-up-profit-stable",
          severity: "info",
          icon: DollarSign,
          title: "Vendas subindo, mas lucro estável",
          description: "Suas vendas estão crescendo, mas o lucro líquido está estável. Verifique se seus custos não estão subindo proporcionalmente.",
          action: "Analise a margem de lucro de cada produto"
        });
      }

      // ALERTA 5: Caixa baixo
      const cashReserve = netProfit;
      const monthsOfCoverage = fixedExpenses > 0 ? cashReserve / fixedExpenses : 0;
      
      if (monthsOfCoverage < 2 && monthsOfCoverage > 0) {
        generatedAlerts.push({
          id: "low-cash",
          severity: "warning",
          icon: AlertCircle,
          title: "Reserva de caixa baixa",
          description: `Seu caixa cobre apenas ${monthsOfCoverage.toFixed(1)} mês(es) de custos fixos — evite novas retiradas.`,
          action: "Construa uma reserva de emergência"
        });
      }

      // ALERTA 6: Tudo bem!
      if (netProfit > 0 && currentRevenue > lastRevenue && generatedAlerts.length === 0) {
        generatedAlerts.push({
          id: "all-good",
          severity: "success",
          icon: CheckCircle2,
          title: "Tudo está indo bem!",
          description: "Suas finanças estão saudáveis. Continue assim e não esqueça de separar o lucro conforme recomendado.",
          action: "Mantenha o bom trabalho e planeje o crescimento"
        });
      }

      setAlerts(generatedAlerts);

    } catch (error) {
      console.error("Erro ao gerar alertas:", error);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      case "info":
        return "default";
      case "success":
        return "default";
      default:
        return "default";
    }
  };

  const getSeverityClassName = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-500 bg-red-50 dark:bg-red-950";
      case "warning":
        return "border-orange-500 bg-orange-50 dark:bg-orange-950";
      case "info":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950";
      case "success":
        return "border-green-500 bg-green-50 dark:bg-green-950";
      default:
        return "";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Crítico</Badge>;
      case "warning":
        return <Badge variant="outline" className="border-orange-500">Atenção</Badge>;
      case "info":
        return <Badge variant="outline" className="border-blue-500">Info</Badge>;
      case "success":
        return <Badge variant="outline" className="border-green-500">Sucesso</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-24 w-full" />
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
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertas e Recomendações
            </span>
            <Badge variant="outline">{alerts.length} alertas</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.length === 0 ? (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Nenhum alerta no momento</AlertTitle>
              <AlertDescription>
                Suas finanças estão sob controle. Continue monitorando regularmente.
              </AlertDescription>
            </Alert>
          ) : (
            alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <Alert 
                  key={alert.id} 
                  variant={getSeverityColor(alert.severity)}
                  className={getSeverityClassName(alert.severity)}
                >
                  <Icon className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    {alert.title}
                    {getSeverityBadge(alert.severity)}
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    <p className="mb-2">{alert.description}</p>
                    {alert.action && (
                      <p className="text-xs font-medium mt-3 pt-3 border-t border-current/20">
                        💡 <strong>Ação recomendada:</strong> {alert.action}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
