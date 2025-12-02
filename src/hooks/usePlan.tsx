import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type PlanType = 'free' | 'basic' | 'pro';

interface PlanLimits {
  products: number | null;
  sales: number | null;
  aiQuestions: number | null;
}

interface PlanData {
  plan: PlanType;
  billingUntil: Date | null;
  aiQuestionsUsed: number;
  aiQuestionsResetAt: Date;
  limits: PlanLimits;
}

interface PlanCheck {
  allowed: boolean;
  current: number;
  limit: number | null;
  plan: PlanType;
}

export function usePlan() {
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_plans' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar plano:', error);
      }

      if (data) {
        const planRecord = data as any;
        setPlanData({
          plan: planRecord.plan as PlanType,
          billingUntil: planRecord.billing_until ? new Date(planRecord.billing_until) : null,
          aiQuestionsUsed: planRecord.ai_questions_used || 0,
          aiQuestionsResetAt: new Date(planRecord.ai_questions_reset_at),
          limits: {
            products: planRecord.plan === 'free' ? 50 : planRecord.plan === 'basic' ? 100 : null,
            sales: planRecord.plan === 'free' ? 50 : planRecord.plan === 'basic' ? 300 : null,
            aiQuestions: planRecord.plan === 'free' ? 1 : planRecord.plan === 'basic' ? 5 : null,
          }
        });
      } else {
        // Plano padrão se não existir
        setPlanData({
          plan: 'free',
          billingUntil: null,
          aiQuestionsUsed: 0,
          aiQuestionsResetAt: new Date(),
          limits: {
            products: 50,
            sales: 50,
            aiQuestions: 1,
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar plano:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLimit = async (limitType: 'products' | 'sales' | 'ai_questions'): Promise<PlanCheck> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await (supabase.rpc as any)('check_plan_limit', {
        p_user_id: user.id,
        p_limit_type: limitType
      });

      if (error) throw error;

      if (data && typeof data === 'object' && 'allowed' in data) {
        return data as unknown as PlanCheck;
      }

      return {
        allowed: true,
        current: 0,
        limit: null,
        plan: 'free'
      };
    } catch (error) {
      console.error('Erro ao verificar limite:', error);
      return {
        allowed: true,
        current: 0,
        limit: null,
        plan: 'free'
      };
    }
  };

  const incrementAiQuestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_plans' as any)
        .update({ 
          ai_questions_used: (planData?.aiQuestionsUsed || 0) + 1 
        } as any)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadPlan();
    } catch (error) {
      console.error('Erro ao incrementar perguntas IA:', error);
    }
  };

  const canUseFeature = (feature: 'reports' | 'sazonalidade' | 'abc' | 'dre' | 'cash_flow' | 'break_even' | 'pricing' | 'distribution' | 'chat_unlimited' | 'watermark_free' | 'whatsapp_nf' | 'overview_full' | 'abc_full' | 'dre_full' | 'cash_flow_full' | 'analyses_full' | 'alerts_full' | 'csv_import'): boolean => {
    if (!planData) return false;

    const { plan } = planData;

    switch (feature) {
      // Visão Geral sempre livre (mas distribuição inteligente só Básico+)
      case 'overview_full':
        return true; // Todos têm acesso
      // Relatórios com níveis
      case 'abc':
        return true; // Todos têm alguma versão
      case 'abc_full':
        return plan === 'pro'; // Versão completa só PRO
      case 'dre':
        return true; // Todos têm alguma versão
      case 'dre_full':
        return plan === 'pro'; // Completa só PRO
      case 'cash_flow':
        return true; // Todos têm alguma versão
      case 'cash_flow_full':
        return plan === 'pro'; // Completa só PRO
      // Sazonalidade
      case 'sazonalidade':
        return plan !== 'free'; // Básico (3m) e Pro (12m)
      // Ponto de Equilíbrio
      case 'break_even':
        return plan !== 'free'; // Básico parcial, Pro completo
      // Precificação e Análises
      case 'pricing':
      case 'analyses_full':
        return plan !== 'free'; // Básico básica, Pro avançada
      // Alertas
      case 'alerts_full':
        return plan !== 'free'; // Básico simples, Pro inteligentes
      // Distribuição Inteligente
      case 'distribution':
        return plan !== 'free'; // Básico e Pro
      // Chat IA
      case 'chat_unlimited':
        return plan === 'pro';
      // Sem marca d'água
      case 'watermark_free':
        return plan !== 'free';
      // WhatsApp (todos têm, mas com marca d'água no Free)
      case 'whatsapp_nf':
        return true; // Todos podem usar
      // Importar CSV
      case 'csv_import':
        return plan !== 'free';
      // Relatórios gerais (mantido para compatibilidade)
      case 'reports':
        return true; // Todos têm alguma versão
      default:
        return false;
    }
  };

  const showUpgradeToast = (feature: string) => {
    toast({
      title: "Recurso Premium",
      description: `${feature} está disponível nos planos Básico ou Pro. Faça upgrade para desbloquear!`,
      variant: "default",
    });
  };

  return {
    planData,
    loading,
    checkLimit,
    incrementAiQuestions,
    canUseFeature,
    showUpgradeToast,
    isPro: planData?.plan === 'pro',
    isBasic: planData?.plan === 'basic',
    isFree: planData?.plan === 'free',
  };
}
