import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BudgetSecure {
  id: string;
  subtotal: number;
  discount_type: string | null;
  discount_value: number | null;
  total: number;
  status: 'open' | 'converted' | 'canceled';
  notes: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string;
  converted_sale_id: string | null;
  customer_name_masked: string | null;
  customer_email_masked: string | null;
  customer_phone_masked: string | null;
  has_customer_info: boolean;
}

export interface BudgetDetails {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  subtotal: number;
  discount_type: string | null;
  discount_value: number | null;
  total: number;
  status: 'open' | 'converted' | 'canceled';
  notes: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string;
  converted_sale_id: string | null;
}

export const useBudgets = (searchTerm?: string, limit = 50, offset = 0) => {
  return useQuery({
    queryKey: ['budgets', 'secure', searchTerm, limit, offset],
    queryFn: async (): Promise<BudgetSecure[]> => {
      const { data, error } = await supabase.rpc('get_budgets_secure', {
        search_term: searchTerm || null,
        limit_count: limit,
        offset_count: offset,
      });

      if (error) {
        console.error('Error fetching budgets:', error);
        throw new Error('Failed to fetch budgets');
      }

      return data || [];
    },
    enabled: true,
  });
};

export const useBudgetDetails = (budgetId: string | null) => {
  return useQuery({
    queryKey: ['budget', 'details', budgetId],
    queryFn: async (): Promise<BudgetDetails | null> => {
      if (!budgetId) return null;

      const { data, error } = await supabase.rpc('get_budget_details_secure', {
        budget_id_param: budgetId,
      });

      if (error) {
        console.error('Error fetching budget details:', error);
        throw new Error('Failed to fetch budget details');
      }

      return data?.[0] || null;
    },
    enabled: !!budgetId,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetData: {
      customer_name?: string;
      customer_email?: string;
      customer_phone?: string;
      notes?: string;
      subtotal: number;
      discount_type?: string;
      discount_value?: number;
      total: number;
      valid_until?: string;
    }) => {
      const { data, error } = await supabase
        .from('budgets')
        .insert([
          {
            ...budgetData,
            owner_id: (await supabase.auth.getUser()).data.user?.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating budget:', error);
        throw new Error('Failed to create budget');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Orçamento criado com sucesso');
    },
    onError: (error) => {
      console.error('Error creating budget:', error);
      toast.error('Erro ao criar orçamento');
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<BudgetDetails>;
    }) => {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating budget:', error);
        throw new Error('Failed to update budget');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', 'details'] });
      toast.success('Orçamento atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating budget:', error);
      toast.error('Erro ao atualizar orçamento');
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetId: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);

      if (error) {
        console.error('Error deleting budget:', error);
        throw new Error('Failed to delete budget');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Orçamento excluído com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting budget:', error);
      toast.error('Erro ao excluir orçamento');
    },
  });
};