import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialSnapshotService, type FinancialSnapshot } from "@/services/financialSnapshot";
import { SmartInsights } from "./SmartInsights";
import { FinancialAlerts } from "./FinancialAlerts";
import { FinancialChat } from "./FinancialChat";
import { CategoryAnalysis } from "./CategoryAnalysis";
import { BreakEvenAnalysis } from "./BreakEvenAnalysisRefactored";
import { SeasonalityAnalysisNew } from "./SeasonalityAnalysisNew";
import { IntelligentPricing } from "./IntelligentPricing";
import { MEIChecklist } from "./MEIChecklist";
import { EnhancedFinancialOverview } from "./EnhancedFinancialOverview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, TrendingUp, Bell, MessageSquare, Calendar, ClipboardCheck, Crown } from "lucide-react";
import { PlanGate } from "@/components/plans/PlanGate";
import { usePlan } from "@/hooks/usePlan";
import { Button } from "@/components/ui/button";

export default function FinancialAssistantView() {
  const [snapshot, setSnapshot] = useState<FinancialSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const { isFree, isBasic } = usePlan();

  useEffect(() => {
    loadSnapshot();
  }, []);

  const loadSnapshot = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const data = await FinancialSnapshotService.getSnapshot(user.id);
      setSnapshot(data);
    } catch (error) {
      console.error("Erro ao carregar snapshot:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Assistente Financeiro Inteligente</h1>
          <p className="text-muted-foreground">Entenda seus lucros e tome decisões inteligentes</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="overview"><TrendingUp className="h-4 w-4 mr-2" />Visão Geral</TabsTrigger>
          <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-2" />Chat IA</TabsTrigger>
          <TabsTrigger value="insights"><Brain className="h-4 w-4 mr-2" />Análises</TabsTrigger>
          <TabsTrigger value="breakeven"><TrendingUp className="h-4 w-4 mr-2" />P. Equilíbrio</TabsTrigger>
          <TabsTrigger value="seasonality"><Calendar className="h-4 w-4 mr-2" />Sazonalidade</TabsTrigger>
          <TabsTrigger value="checklist"><ClipboardCheck className="h-4 w-4 mr-2" />Checklist</TabsTrigger>
          <TabsTrigger value="alerts"><Bell className="h-4 w-4 mr-2" />Alertas</TabsTrigger>
        </TabsList>

        {/* Visão Geral - SEMPRE LIVRE */}
        <TabsContent value="overview" className="space-y-6">
          <EnhancedFinancialOverview />
        </TabsContent>

        {/* Chat IA - Todos acessam, mas com limites */}
        <TabsContent value="chat">
          <FinancialChat />
        </TabsContent>

        {/* Análises - Versão reduzida Free */}
        <TabsContent value="insights" className="space-y-6">
          <PlanGate
            feature="analyses_full"
            featureName="Análises Avançadas"
            featureDescription="Aqui você encontra análises financeiras feitas automaticamente pelo sistema. Elas mostram oportunidades de melhoria, pontos fracos e pontos fortes do seu negócio."
            requiredPlan="basic"
            previewContent={
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Glossário - Entenda os Termos</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="font-semibold text-sm">Margem de Lucro</p>
                      <p className="text-xs text-muted-foreground">Quanto sobra de cada venda depois de pagar os custos</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="font-semibold text-sm">Benchmark</p>
                      <p className="text-xs text-muted-foreground">Comparação com outros negócios do mesmo tipo</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="font-semibold text-sm">Custo Direto</p>
                      <p className="text-xs text-muted-foreground">Quanto você paga para comprar ou produzir cada produto</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="font-semibold text-sm">Receita</p>
                      <p className="text-xs text-muted-foreground">Todo o dinheiro que entra com as vendas</p>
                    </div>
                  </CardContent>
                </Card>
                <div className="relative">
                  <div className="opacity-30 blur-lg">
                    <Skeleton className="h-64 w-full mb-4" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Card className="max-w-md border-2 border-primary shadow-lg">
                      <CardContent className="pt-6 text-center space-y-4">
                        <div className="flex justify-center">
                          <div className="bg-primary p-3 rounded-full">
                            <Crown className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-lg mb-2">
                            Análises Completas no Plano Básico
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Precificação inteligente, análise de categorias e insights automáticos sobre seu negócio.
                          </p>
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => window.open('/settings?tab=plans', '_self')}
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          Desbloquear Análises
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            }
          >
            <SmartInsights />
            <IntelligentPricing snapshot={snapshot} />
            <CategoryAnalysis />
          </PlanGate>
        </TabsContent>

        {/* Ponto de Equilíbrio */}
        <TabsContent value="breakeven">
          <PlanGate
            feature="break_even"
            featureName="Ponto de Equilíbrio"
            featureDescription="O ponto de equilíbrio mostra quanto você precisa vender para pagar todos os custos do mês. É essencial para saber se o negócio está saudável."
            requiredPlan="basic"
            previewContent={
              <div className="relative">
                <div className="opacity-20 blur-lg">
                  <BreakEvenAnalysis snapshot={snapshot} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Card className="max-w-md border-2 border-primary shadow-lg">
                    <CardContent className="pt-6 text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="bg-primary p-3 rounded-full">
                          <Crown className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-lg mb-2">
                          Ponto de Equilíbrio no Plano Básico
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Descubra quanto você precisa vender para cobrir todos os custos e evitar prejuízo.
                        </p>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => window.open('/settings?tab=plans', '_self')}
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Desbloquear Ponto de Equilíbrio
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            }
          >
            <BreakEvenAnalysis snapshot={snapshot} />
          </PlanGate>
        </TabsContent>

        {/* Sazonalidade */}
        <TabsContent value="seasonality">
          <PlanGate
            feature="sazonalidade"
            featureName="Análise de Sazonalidade"
            featureDescription="Mostra como suas vendas se comportam ao longo dos meses e revela épocas de alta e baixa."
            requiredPlan="basic"
            previewContent={
              <div className="relative">
                <div className="opacity-20 blur-lg">
                  <SeasonalityAnalysisNew snapshot={snapshot} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Card className="max-w-md border-2 border-primary shadow-lg">
                    <CardContent className="pt-6 text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="bg-primary p-3 rounded-full">
                          <Crown className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-lg mb-2">
                          Sazonalidade no Plano Básico
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Identifique seus melhores e piores meses, planeje estoque e promoções no momento certo.
                        </p>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => window.open('/settings?tab=plans', '_self')}
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Desbloquear Sazonalidade
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            }
          >
            <SeasonalityAnalysisNew snapshot={snapshot} />
          </PlanGate>
        </TabsContent>

        {/* Checklist - SEMPRE LIVRE */}
        <TabsContent value="checklist"><MEIChecklist /></TabsContent>

        {/* Alertas */}
        <TabsContent value="alerts">
          <PlanGate
            feature="alerts_full"
            featureName="Alertas Financeiros"
            featureDescription="O sistema avisa sobre estoque baixo, lucro caindo, despesas aumentando e outros sinais importantes."
            requiredPlan="basic"
            previewContent={
              <div className="relative">
                <div className="opacity-20 blur-lg">
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Card className="max-w-md border-2 border-primary shadow-lg">
                    <CardContent className="pt-6 text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="bg-primary p-3 rounded-full">
                          <Crown className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-lg mb-2">
                          Alertas Financeiros no Básico
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Receba avisos automáticos sobre estoque baixo, despesas altas, margem caindo e outros sinais importantes.
                        </p>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => window.open('/settings?tab=plans', '_self')}
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Ativar Alertas
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            }
          >
            <FinancialAlerts />
          </PlanGate>
        </TabsContent>
      </Tabs>
    </div>
  );
}
