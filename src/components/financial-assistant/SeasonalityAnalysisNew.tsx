import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, TrendingUp, TrendingDown, Package, Lightbulb } from "lucide-react";
import type { FinancialSnapshot } from "@/services/financialSnapshot";
import { TechnicalGlossary } from "@/components/plans/TechnicalGlossary";

interface SeasonalityAnalysisNewProps {
  snapshot: FinancialSnapshot | null;
}

export function SeasonalityAnalysisNew({ snapshot }: SeasonalityAnalysisNewProps) {
  const glossaryTerms = [
    { term: "Sazonalidade", definition: "Variação previsível nas vendas em diferentes períodos do ano" },
    { term: "Pico de vendas", definition: "Período do ano com maior volume de vendas" },
    { term: "Baixa temporada", definition: "Período com menor volume de vendas" },
    { term: "Ticket médio", definition: "Valor médio gasto por cliente em cada compra" }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!snapshot || !snapshot.sazonalidade_12m || snapshot.sazonalidade_12m.length === 0) {
    return (
      <div className="space-y-6">
        <TechnicalGlossary terms={glossaryTerms} />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Análise de Sazonalidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Carregando dados...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const monthlyData = snapshot.sazonalidade_12m;
  
  // Encontrar mês mais forte e mais fraco
  const bestMonth = monthlyData.reduce((prev, current) => 
    current.receita > prev.receita ? current : prev
  );
  
  const worstMonth = monthlyData.reduce((prev, current) => 
    current.receita < prev.receita ? current : prev
  );

  // Calcular média
  const avgRevenue = monthlyData.reduce((sum, m) => sum + m.receita, 0) / monthlyData.length;

  // Mês atual (último do array)
  const currentMonth = monthlyData[monthlyData.length - 1];
  
  // Detectar tendência de crescimento
  const last3Months = monthlyData.slice(-3);
  const growthTrend = last3Months.length >= 2 
    ? ((last3Months[last3Months.length - 1].receita - last3Months[0].receita) / last3Months[0].receita) * 100
    : 0;

  // Produtos mais vendidos no mês atual
  const topProducts = snapshot.produtos_mais_vendidos?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <TechnicalGlossary terms={glossaryTerms} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Análise de Sazonalidade - Entenda seus Padrões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Destaques Automáticos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">📊 Destaques do seu negócio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mês mais forte */}
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Seu mês mais forte</p>
                    <p className="text-xl font-bold text-green-600">{bestMonth.mes}</p>
                    <p className="text-lg font-semibold">{formatCurrency(bestMonth.receita)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {bestMonth.num_vendas} vendas · Ticket: {formatCurrency(bestMonth.ticket_medio)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mês mais fraco */}
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Seu mês mais fraco</p>
                    <p className="text-xl font-bold text-orange-600">{worstMonth.mes}</p>
                    <p className="text-lg font-semibold">{formatCurrency(worstMonth.receita)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {worstMonth.num_vendas} vendas · Ticket: {formatCurrency(worstMonth.ticket_medio)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tendência de crescimento */}
            {Math.abs(growthTrend) > 5 && (
              <Alert className={growthTrend > 0 ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-orange-500 bg-orange-50 dark:bg-orange-950"}>
                <AlertDescription>
                  <strong>
                    {growthTrend > 0 
                      ? `📈 Seu negócio está crescendo ${growthTrend.toFixed(0)}% nos últimos meses!`
                      : `📉 Seu negócio teve queda de ${Math.abs(growthTrend).toFixed(0)}% nos últimos meses`
                    }
                  </strong>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Média Mensal */}
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Sua média mensal (últimos 12 meses)</p>
            <p className="text-2xl font-bold">{formatCurrency(avgRevenue)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Mês atual: {formatCurrency(currentMonth.receita)} 
              {currentMonth.receita > avgRevenue 
                ? ` (${(((currentMonth.receita - avgRevenue) / avgRevenue) * 100).toFixed(0)}% acima)`
                : ` (${(((avgRevenue - currentMonth.receita) / avgRevenue) * 100).toFixed(0)}% abaixo)`
              }
            </p>
          </div>

          {/* Produtos com melhor desempenho */}
          {topProducts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Produtos com melhor desempenho
              </h3>
              <div className="space-y-2">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="p-3 rounded-lg bg-muted/30 border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{index + 1}. {product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.quantidade_vendida} vendas · {formatCurrency(product.receita_gerada)} gerados
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(product.preco_medio)}</p>
                        <p className="text-xs text-muted-foreground">preço médio</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugestões Inteligentes */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Sugestões baseadas na sua sazonalidade
            </h3>
            
            <div className="space-y-2">
              {/* Sugestão baseada em mês forte */}
              <Alert>
                <AlertDescription className="text-sm">
                  📦 <strong>Reforce o estoque em {bestMonth.mes}:</strong> Este é historicamente seu melhor mês. 
                  Planeje com antecedência para não perder vendas por falta de produtos.
                </AlertDescription>
              </Alert>

              {/* Sugestão baseada em mês fraco */}
              <Alert>
                <AlertDescription className="text-sm">
                  🎯 <strong>Promoções em {worstMonth.mes}:</strong> Este mês costuma ter queda nas vendas. 
                  Considere campanhas promocionais ou novos produtos para atrair clientes.
                </AlertDescription>
              </Alert>

              {/* Sugestão baseada em produto top */}
              {topProducts[0] && (
                <Alert>
                  <AlertDescription className="text-sm">
                    ⭐ <strong>Foque em "{topProducts[0].name}":</strong> É seu produto campeão de vendas. 
                    Garanta sempre estoque disponível e considere produtos complementares.
                  </AlertDescription>
                </Alert>
              )}

              {/* Sugestão sobre ticket médio */}
              {currentMonth.ticket_medio < avgRevenue / (monthlyData.reduce((sum, m) => sum + m.num_vendas, 0) / monthlyData.length) && (
                <Alert>
                  <AlertDescription className="text-sm">
                    💰 <strong>Aumente o ticket médio:</strong> Seus clientes estão comprando menos por venda. 
                    Experimente criar combos ou sugerir produtos complementares.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Histórico visual simplificado */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Histórico dos últimos 12 meses</h4>
            <div className="space-y-1">
              {monthlyData.slice().reverse().slice(0, 6).map((month) => (
                <div key={month.mes} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">{month.mes}</span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div 
                      className="h-full bg-primary flex items-center justify-end pr-2"
                      style={{ width: `${(month.receita / bestMonth.receita) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-primary-foreground">
                        {formatCurrency(month.receita)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
