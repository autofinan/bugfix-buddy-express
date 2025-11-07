import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BreakEvenAnalysisProps {
  fixedCosts: number;
  variableCostPerUnit: number;
  pricePerUnit: number;
  currentSales: number;
}

export function BreakEvenAnalysis({
  fixedCosts,
  variableCostPerUnit,
  pricePerUnit,
  currentSales,
}: BreakEvenAnalysisProps) {
  const contributionMargin = pricePerUnit - variableCostPerUnit;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;
  const currentRevenue = currentSales * pricePerUnit;
  const isAboveBreakEven = currentSales >= breakEvenUnits;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Análise de Ponto de Equilíbrio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Custos Fixos Mensais</p>
            <p className="text-2xl font-bold">{formatCurrency(fixedCosts)}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Margem de Contribuição</p>
            <p className="text-2xl font-bold">{formatCurrency(contributionMargin)}</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ponto de Equilíbrio (Unidades)</p>
              <p className="text-3xl font-bold text-primary">{breakEvenUnits.toLocaleString()} unidades</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ponto de Equilíbrio (Faturamento)</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(breakEvenRevenue)}</p>
            </div>
          </div>
        </div>

        <Alert variant={isAboveBreakEven ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isAboveBreakEven ? (
              <>
                ✅ Você está <strong>acima</strong> do ponto de equilíbrio!
                <br />
                Vendas atuais: {currentSales} unidades ({formatCurrency(currentRevenue)})
                <br />
                Margem de segurança: {((currentSales - breakEvenUnits) / breakEvenUnits * 100).toFixed(1)}%
              </>
            ) : (
              <>
                ⚠️ Você está <strong>abaixo</strong> do ponto de equilíbrio.
                <br />
                Faltam {breakEvenUnits - currentSales} unidades para atingir o equilíbrio.
                <br />
                Meta de faturamento: {formatCurrency(breakEvenRevenue - currentRevenue)}
              </>
            )}
          </AlertDescription>
        </Alert>

        <div className="pt-4 space-y-2 text-sm">
          <p className="font-semibold">💡 Como usar esta análise:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>O ponto de equilíbrio é quando suas receitas cobrem todos os custos</li>
            <li>Abaixo dele, você tem prejuízo. Acima, você tem lucro</li>
            <li>Use como meta mínima de vendas mensal</li>
            <li>Reduza custos fixos para baixar o ponto de equilíbrio</li>
            <li>Aumente a margem de contribuição melhorando preços ou reduzindo custos variáveis</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
