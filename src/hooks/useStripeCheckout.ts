import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlanType } from './usePlan';

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createCheckoutSession = async (plan: 'basic' | 'pro') => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // [MODIFICAÇÃO SUGERIDA]: Usar o toast para avisar o usuário que precisa logar
        toast({
            title: 'Erro de autenticação',
            description: 'Você precisa estar logado para iniciar o checkout.',
            variant: 'destructive',
        });
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { plan },
      });

      if (error) throw error;

      if (data?.url) {
        // 🚀 CÓDIGO MODIFICADO: Abre em nova aba para contornar o iFrame do Lovable
        window.open(data.url, '_blank');
        
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      toast({
        title: 'Erro ao processar',
        description: error.message || 'Não foi possível iniciar o checkout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    loading,
  };
}
