import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, AlertTriangle, PiggyBank, Receipt, Wallet } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { FinancialSnapshot } from "@/services/financialSnapshot";

interface ProfitDistributionNewProps {
  snapshot: FinancialSnapshot | null;
}

export function ProfitDistributionNew({ snapshot }: ProfitDistributionNewProps) {
  if (!snapshot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Distribuição Inteligente de Lucro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando dados financeiros...</p>
        </CardContent>
      </Card>
    );
  }

  const { lucro_liquido, margem_liquida, receita_total } = snapshot.periodo_atual;
  const dasEstimado = snapshot.das_estimado;

  // Calcular distribuição inteligente baseada na saúde financeira
  const calcularDistribuicao = () => {
    if (lucro_liquido <= 0) {
      return {
        retirada: 0,
        reinvestimento: 0,
        reserva: 0,
        impostos: dasEstimado,
        status: "critico",
        mensagem: "⚠️ Prejuízo detectado. Não é recomendado fazer retiradas no momento.",
      };
    }

    // Baseado na margem líquida
    let percentualRetirada = 0;
    let percentualReinvestimento = 0;
    let percentualReserva = 0;

    if (margem_liquida >= 30) {
      // Margem excelente
      percentualRetirada = 60;
      percentualReinvestimento = 25;
      percentualReserva = 15;
      return {
        retirada: (lucro_liquido * 0.6),
        reinvestimento: (lucro_liquido * 0.25),
        reserva: (lucro_liquido * 0.15),
        impostos: dasEstimado,
        status: "excelente",
        mensagem: "✅ Excelente! Sua margem permite retiradas maiores.",
      };
    } else if (margem_liquida >= 15) {
      // Margem saudável
      percentualRetirada = 50;
      percentualReinvestimento = 30;
      percentualReserva = 20;
      return {
        retirada: (lucro_liquido * 0.5),
        reinvestimento: (lucro_liquido * 0.3),
        reserva: (lucro_liquido * 0.2),
        impostos: dasEstimado,
        status: "bom",
        mensagem: "👍 Margem saudável. Distribuição equilibrada recomendada.",
      };
    } else if (margem_liquida >= 5) {
      // Margem baixa
      percentualRetirada = 30;
      percentualReinvestimento = 40;
      percentualReserva = 30;
      return {
        retirada: (lucro_liquido * 0.3),
        reinvestimento: (lucro_liquido * 0.4),
        reserva: (lucro_liquido * 0.3),
        impostos: dasEstimado,
        status: "atencao",
        mensagem: "⚠️ Margem baixa. Priorize reserva e reinvestimento.",
      };
    } else {
      // Margem crítica
      percentualRetirada = 10;
      percentualReinvestimento = 50;
      percentualReserva = 40;
      return {
        retirada: (lucro_liquido * 0.1),
        reinvestimento: (lucro_liquido * 0.5),
        reserva: (lucro_liquido * 0.4),
        impostos: dasEstimado,
        status: "critico",
        mensagem: "🚨 Margem crítica! Minimize retiradas e foque em melhorar resultados.",
      };
    }
  };

  const distribuicao = calcularDistribuicao();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getAlertVariant = () => {
    switch (distribuicao.status) {
      case "excelente":
      case "bom":
        return "default";
      case "atencao":
      case "critico":
        return "destructive";
      default:
        return "default";
    }
  };

  const getAlertClass = () => {
    switch (distribuicao.status) {
      case "excelente":
        return "border-green-500 bg-green-50 dark:bg-green-950";
      case "bom":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950";
      case "atencao":
        return "border-orange-500 bg-orange-50 dark:bg-orange-950";
      case "critico":
        return "border-red-500 bg-red-50 dark:bg-red-950";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Distribuição Inteligente de Lucro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={getAlertVariant()} className={getAlertClass()}>
          <AlertDescription>{distribuicao.mensagem}</AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Retirada Segura (Pró-labore)</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{formatCurrency(distribuicao.retirada)}</div>
                <div className="text-xs text-muted-foreground">{((distribuicao.retirada / lucro_liquido) * 100).toFixed(0)}%</div>
              </div>
            </div>
            <Progress
              value={(distribuicao.retirada / lucro_liquido) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              Valor recomendado para sua retirada mensal
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Reinvestimento no Negócio</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{formatCurrency(distribuicao.reinvestimento)}</div>
                <div className="text-xs text-muted-foreground">{((distribuicao.reinvestimento / lucro_liquido) * 100).toFixed(0)}%</div>
              </div>
            </div>
            <Progress
              value={(distribuicao.reinvestimento / lucro_liquido) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              Investir em estoque, marketing e melhorias
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Reserva de Emergência</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{formatCurrency(distribuicao.reserva)}</div>
                <div className="text-xs text-muted-foreground">{((distribuicao.reserva / lucro_liquido) * 100).toFixed(0)}%</div>
              </div>
            </div>
            <Progress
              value={(distribuicao.reserva / lucro_liquido) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              Guardar para imprevistos e sazonalidade
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Impostos (DAS)</span>
              </div>
              <span className="text-sm font-bold">{formatCurrency(distribuicao.impostos)}</span>
            </div>
            <Progress
              value={(distribuicao.impostos / receita_total) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              Estimativa de 6% sobre o faturamento (MEI)
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Lucro Líquido Total:</span>
            <span className="font-bold text-lg">{formatCurrency(lucro_liquido)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Margem líquida: {margem_liquida.toFixed(1)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
