import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";
import type { FinancialSnapshot } from "@/services/financialSnapshot";

interface BreakEvenAnalysisProps {
  snapshot: FinancialSnapshot | null;
}

export function BreakEvenAnalysis({ snapshot }: BreakEvenAnalysisProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!snapshot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Ponto de Equilíbrio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando dados...</p>
        </CardContent>
      </Card>
    );
  }

  const { ponto_equilibrio, periodo_atual } = snapshot;
  const {
    custos_fixos,
    margem_contribuicao,
    ticket_medio,
    pe_receita,
    pe_unidades,
    receita_atual,
    atingido,
  } = ponto_equilibrio;

  const revenuePercentage = pe_receita > 0 ? Math.min((receita_atual / pe_receita) * 100, 100) : 0;
  const faltaReceita = Math.max(pe_receita - receita_atual, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Ponto de Equilíbrio - Entenda seu Negócio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Alert */}
        <Alert
          variant={atingido ? "default" : "destructive"}
          className={atingido ? "border-green-500 bg-green-50 dark:bg-green-950" : ""}
        >
          {atingido ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <AlertDescription>
            <strong>
              {atingido
                ? "✅ Parabéns! Você já cobriu todos os custos fixos deste mês!"
                : "⚠️ Você ainda não atingiu o ponto de equilíbrio"}
            </strong>
          </AlertDescription>
        </Alert>

        {/* 1. Quanto precisa vender */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <span className="text-2xl">💰</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Quanto você precisa vender este mês?</h3>
              <p className="text-3xl font-bold text-primary mb-2">{formatCurrency(pe_receita)}</p>
              <p className="text-sm text-muted-foreground">
                Este é o valor mínimo para cobrir todos os seus custos fixos do mês.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Quanto já vendeu */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Quanto você já vendeu até agora?</h3>
            <span className="text-lg font-bold">{formatCurrency(receita_atual)}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{revenuePercentage.toFixed(1)}%</span>
            </div>
            <Progress value={revenuePercentage} className="h-4" />
          </div>
          <p className="text-sm text-muted-foreground">
            {periodo_atual.total_vendas} vendas realizadas
          </p>
        </div>

        {/* 3. Quanto falta */}
        {!atingido && (
          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Quanto falta para não ter prejuízo?</h3>
                <p className="text-2xl font-bold text-orange-600 mb-1">
                  {formatCurrency(faltaReceita)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Com seu ticket médio de {formatCurrency(ticket_medio)}, você precisa de aproximadamente{" "}
                  <strong>{Math.ceil(faltaReceita / ticket_medio)} vendas</strong> para atingir o equilíbrio.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Detalhes Técnicos */}
        <div className="pt-4 border-t space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Entenda os números do seu negócio
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Custos Fixos Mensais</p>
              <p className="text-lg font-bold">{formatCurrency(custos_fixos)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Margem de Contribuição</p>
              <p className="text-lg font-bold">{(margem_contribuicao * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">O quanto sobra de cada venda</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Ticket Médio</p>
              <p className="text-lg font-bold">{formatCurrency(ticket_medio)}</p>
            </div>
          </div>
        </div>

        {/* 4. Sugestões Inteligentes */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Sugestões para melhorar seus resultados
          </h4>
          <div className="space-y-2">
            {margem_contribuicao < 0.3 && (
              <Alert>
                <AlertDescription className="text-sm">
                  💡 Sua margem de contribuição está baixa ({(margem_contribuicao * 100).toFixed(1)}%). 
                  Se aumentar em 5%, seu ponto de equilíbrio cairá para {formatCurrency(pe_receita * 0.95)}.
                </AlertDescription>
              </Alert>
            )}
            {custos_fixos / receita_atual > 0.4 && (
              <Alert>
                <AlertDescription className="text-sm">
                  ⚠️ Seus custos fixos estão muito altos para o tamanho do seu faturamento. 
                  Considere renegociar contratos ou reduzir despesas fixas.
                </AlertDescription>
              </Alert>
            )}
            {!atingido && (
              <Alert>
                <AlertDescription className="text-sm">
                  🎯 Foque em aumentar o ticket médio oferecendo produtos complementares ou combos. 
                  Cada R$ 10 a mais por venda reduz significativamente o número de vendas necessárias.
                </AlertDescription>
              </Alert>
            )}
            {snapshot.produtos_mais_vendidos && snapshot.produtos_mais_vendidos.length > 0 && (
              <Alert>
                <AlertDescription className="text-sm">
                  📊 Seu produto mais vendido é "{snapshot.produtos_mais_vendidos[0].name}". 
                  Certifique-se de que ele tem uma boa margem de contribuição.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
