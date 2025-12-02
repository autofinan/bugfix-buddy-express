import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, DollarSign, Percent } from "lucide-react";
import { FinancialSnapshotService, type FinancialSnapshot } from "@/services/financialSnapshot";

interface Insight {
  type: "success" | "warning" | "info" | "tip";
  icon: any;
  title: string;
  message: string;
}

export function SmartInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<FinancialSnapshot | null>(null);

  useEffect(() => {
    loadSnapshot();
  }, []);

  const loadSnapshot = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const data = await FinancialSnapshotService.getSnapshot(user.id);
      setSnapshot(data);
      
      if (data) {
        generateInsights(data);
      }
    } catch (error) {
      console.error("Erro ao carregar snapshot:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (snapshot: FinancialSnapshot) => {
    const generatedInsights: Insight[] = [];
    const { periodo_atual, sazonalidade_12m, ponto_equilibrio, produtos_parados, estoque_critico } = snapshot;

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    };

    // Insight 1: Resumo Financeiro
    generatedInsights.push({
      type: "info",
      icon: DollarSign,
      title: "Visão Financeira do Mês",
      message: `Receita: ${formatCurrency(periodo_atual.receita_total)} | Lucro Líquido: ${formatCurrency(periodo_atual.lucro_liquido)} | Margem: ${periodo_atual.margem_liquida.toFixed(1)}%`,
    });

    // Insight 2: Ponto de Equilíbrio
    if (!ponto_equilibrio.atingido && periodo_atual.receita_total > 0) {
      const faltaReceita = ponto_equilibrio.pe_receita - ponto_equilibrio.receita_atual;
      generatedInsights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Ponto de Equilíbrio Não Atingido",
        message: `Falta ${formatCurrency(faltaReceita)} para cobrir os custos fixos do mês. Continue vendendo!`,
      });
    } else if (ponto_equilibrio.atingido) {
      generatedInsights.push({
        type: "success",
        icon: CheckCircle,
        title: "Ponto de Equilíbrio Atingido!",
        message: `Parabéns! Você já cobriu todos os custos fixos deste mês. Agora é só lucro!`,
      });
    }

    // Insight 3: Margem de Lucro
    if (periodo_atual.margem_liquida < 10) {
      generatedInsights.push({
        type: "warning",
        icon: Percent,
        title: "Margem de Lucro Baixa",
        message: `Sua margem líquida está em ${periodo_atual.margem_liquida.toFixed(1)}%. Considere revisar preços ou reduzir custos.`,
      });
    } else if (periodo_atual.margem_liquida > 30) {
      generatedInsights.push({
        type: "success",
        icon: TrendingUp,
        title: "Margem de Lucro Saudável",
        message: `Excelente! Sua margem líquida está em ${periodo_atual.margem_liquida.toFixed(1)}% — muito boa!`,
      });
    }

    // Insight 4: Sazonalidade
    if (sazonalidade_12m && sazonalidade_12m.length >= 3) {
      const ultimos3Meses = sazonalidade_12m.slice(-3);
      const mediaUltimos3 = ultimos3Meses.reduce((sum, m) => sum + m.receita, 0) / 3;
      const mesAtual = sazonalidade_12m[sazonalidade_12m.length - 1];
      
      if (mesAtual.receita < mediaUltimos3 * 0.8) {
        generatedInsights.push({
          type: "warning",
          icon: TrendingDown,
          title: "Receita Abaixo da Média",
          message: `Sua receita está 20% abaixo da média dos últimos 3 meses. Analise as causas.`,
        });
      } else if (mesAtual.receita > mediaUltimos3 * 1.2) {
        generatedInsights.push({
          type: "success",
          icon: TrendingUp,
          title: "Receita Acima da Média",
          message: `Sua receita está 20% acima da média dos últimos 3 meses. Ótimo trabalho!`,
        });
      }
    }

    // Insight 5: Produtos Parados
    if (produtos_parados && produtos_parados.length > 0) {
      generatedInsights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Produtos Sem Movimento",
        message: `Você tem ${produtos_parados.length} produto(s) parado(s) há mais de 30 dias. Considere fazer promoções.`,
      });
    }

    // Insight 6: Estoque Crítico
    if (estoque_critico && estoque_critico.length > 0) {
      generatedInsights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Alerta de Estoque",
        message: `${estoque_critico.length} produto(s) estão com estoque abaixo do mínimo. Reabasteça em breve!`,
      });
    }

    // Insight 7: Dica Sempre Presente
    generatedInsights.push({
      type: "tip",
      icon: Lightbulb,
      title: "Dica Financeira",
      message: "Separe sempre uma parte do lucro para impostos (DAS), reserva de emergência e reinvestimento. Nunca misture finanças pessoais com empresariais!",
    });

    setInsights(generatedInsights);
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "success":
      case "info":
      case "tip":
        return "default";
      case "warning":
        return "destructive";
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

  if (!snapshot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Análises Financeiras
          </CardTitle>
          <CardDescription>
            Nenhum dado disponível ainda. Comece registrando vendas e despesas para ver análises inteligentes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Análises Inteligentes
        </CardTitle>
        <CardDescription>
          Insights automáticos baseados nos seus dados financeiros
        </CardDescription>
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
  );
}
