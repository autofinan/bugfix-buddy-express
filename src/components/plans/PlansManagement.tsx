import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Zap, TrendingUp, Loader2 } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface UsageData {
  products: { current: number; limit: number | null };
  sales: { current: number; limit: number | null };
}

export function PlansManagement() {
  const { planData, loading, isPro, isBasic, isFree, checkLimit } = usePlan();
  const { createCheckoutSession, loading: checkoutLoading } = useStripeCheckout();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success) {
      toast({
        title: "Assinatura realizada!",
        description: "Seu plano foi ativado com sucesso. Aproveite todos os recursos!",
      });
      setSearchParams({});
    }

    if (canceled) {
      toast({
        title: "Checkout cancelado",
        description: "Você cancelou o processo de pagamento.",
        variant: "destructive",
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, toast]);

  // Carregar uso real de produtos e vendas
  useEffect(() => {
    const loadUsage = async () => {
      try {
        setLoadingUsage(true);
        const [productsCheck, salesCheck] = await Promise.all([
          checkLimit('products'),
          checkLimit('sales')
        ]);
        
        setUsage({
          products: { current: productsCheck.current, limit: productsCheck.limit },
          sales: { current: salesCheck.current, limit: salesCheck.limit }
        });
      } catch (error) {
        console.error('Erro ao carregar uso:', error);
      } finally {
        setLoadingUsage(false);
      }
    };

    if (!loading) {
      loadUsage();
    }
  }, [loading, checkLimit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      icon: Zap,
      color: 'text-gray-500',
      features: [
        'Até 50 produtos',
        'Até 50 vendas/mês',
        '1 pergunta IA por semana',
        'Visão geral básica',
        'Distribuição de lucro padrão',
        'NF com marca d\'água'
      ],
      current: isFree
    },
    {
      id: 'basic',
      name: 'Básico',
      price: 'R$ 19,90',
      period: '/mês',
      icon: TrendingUp,
      color: 'text-blue-500',
      features: [
        'Até 100 produtos',
        'Até 300 vendas/mês',
        '5 perguntas IA por semana',
        'Distribuição inteligente',
        'Precificação inteligente',
        'Análises básicas',
        'Sazonalidade (3 meses)',
        'DRE parcial'
      ],
      current: isBasic,
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R$ 29,90',
      period: '/mês',
      icon: Crown,
      color: 'text-purple-500',
      features: [
        'Produtos ilimitados',
        'Vendas ilimitadas',
        'IA ilimitada',
        'Todas análises avançadas',
        'Ponto de equilíbrio completo',
        'Sazonalidade (12 meses)',
        'DRE completo',
        'Fluxo de caixa completo',
        'Curva ABC avançada',
        'Alertas financeiros',
        'PDF sem marca d\'água'
      ],
      current: isPro
    }
  ];

  const productsUsed = usage?.products.current || 0;
  const productsLimit = usage?.products.limit || planData?.limits.products || 50;
  const salesUsed = usage?.sales.current || 0;
  const salesLimit = usage?.sales.limit || planData?.limits.sales || 50;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seu Plano Atual</CardTitle>
          <CardDescription>
            Gerencie sua assinatura e veja os limites disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                Plano {planData?.plan === 'free' ? 'Free' : planData?.plan === 'basic' ? 'Básico' : 'Pro'}
              </p>
              <p className="text-sm text-muted-foreground">
                {planData?.billingUntil ? `Válido até ${new Date(planData.billingUntil).toLocaleDateString('pt-BR')}` : 'Plano gratuito'}
              </p>
            </div>
            {planData?.plan && (
              <Badge variant="secondary" className="text-lg py-1 px-3">
                <Crown className="h-4 w-4 mr-1" />
                {planData.plan === 'free' ? 'Free' : planData.plan === 'basic' ? 'Básico' : 'Pro'}
              </Badge>
            )}
          </div>

          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            {/* Perguntas IA */}
            {!isPro && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Perguntas IA usadas (semana)</span>
                  <span className="font-medium">
                    {planData?.aiQuestionsUsed || 0} / {planData?.limits.aiQuestions}
                  </span>
                </div>
                <Progress 
                  value={((planData?.aiQuestionsUsed || 0) / (planData?.limits.aiQuestions || 1)) * 100}
                  className="h-2"
                />
              </div>
            )}
            
            {/* Produtos */}
            {planData?.limits.products && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Produtos cadastrados</span>
                  <span className="font-medium">
                    {loadingUsage ? '...' : productsUsed} / {productsLimit}
                  </span>
                </div>
                <Progress 
                  value={loadingUsage ? 0 : (productsUsed / productsLimit) * 100}
                  className="h-2"
                />
              </div>
            )}
            
            {/* Vendas */}
            {planData?.limits.sales && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Vendas este mês</span>
                  <span className="font-medium">
                    {loadingUsage ? '...' : salesUsed} / {salesLimit}
                  </span>
                </div>
                <Progress 
                  value={loadingUsage ? 0 : (salesUsed / salesLimit) * 100}
                  className="h-2"
                />
              </div>
            )}
            
            <p className="text-xs text-muted-foreground pt-2 border-t">
              {isFree && 'Faça upgrade para ter mais produtos, vendas e recursos avançados'}
              {isBasic && 'Atualize para o Pro e tenha produtos e vendas ilimitadas'}
              {isPro && 'Você tem acesso ilimitado a todos os recursos!'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card 
              key={plan.id}
              className={`relative ${plan.current ? 'border-primary shadow-lg' : ''} ${plan.popular ? 'border-blue-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500">Mais Popular</Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className={`h-6 w-6 ${plan.color}`} />
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.current ? (
                  <Button disabled className="w-full">
                    Plano Atual
                  </Button>
                ) : plan.id === 'free' ? (
                  // Não mostrar botão de downgrade para o plano Free
                  <Button disabled variant="outline" className="w-full">
                    Plano Gratuito
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    disabled={checkoutLoading}
                    onClick={() => createCheckoutSession(plan.id as 'basic' | 'pro')}
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Fazer Upgrade'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}