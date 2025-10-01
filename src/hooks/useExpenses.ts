import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  payment_method: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export const useExpenses = (searchTerm?: string, startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['expenses', searchTerm, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async (): Promise<Expense[]> => {
      let query = supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (searchTerm) {
        query = query.or(`description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }

      if (startDate) {
        query = query.gte('expense_date', startDate.toISOString().split('T')[0]);
      }

      if (endDate) {
        query = query.lte('expense_date', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching expenses:', error);
        throw new Error('Failed to fetch expenses');
      }

      return data || [];
    },
  });
};

export const useExpense = (expenseId: string | null) => {
  return useQuery({
    queryKey: ['expense', expenseId],
    queryFn: async (): Promise<Expense | null> => {
      if (!expenseId) return null;

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .single();

      if (error) {
        console.error('Error fetching expense:', error);
        throw new Error('Failed to fetch expense');
      }

      return data;
    },
    enabled: !!expenseId,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'owner_id'>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          owner_id: user.user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating expense:', error);
        throw new Error('Failed to create expense');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Despesa criada com sucesso');
    },
    onError: (error) => {
      console.error('Error creating expense:', error);
      toast.error('Erro ao criar despesa');
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Expense>;
    }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating expense:', error);
        throw new Error('Failed to update expense');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense'] });
      toast.success('Despesa atualizada com sucesso');
    },
    onError: (error) => {
      console.error('Error updating expense:', error);
      toast.error('Erro ao atualizar despesa');
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) {
        console.error('Error deleting expense:', error);
        throw new Error('Failed to delete expense');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Despesa excluída com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting expense:', error);
      toast.error('Erro ao excluir despesa');
    },
  });
};

export const useExpensesStats = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['expenses', 'stats', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select('amount, category, expense_date');

      if (startDate) {
        query = query.gte('expense_date', startDate.toISOString().split('T')[0]);
      }

      if (endDate) {
        query = query.lte('expense_date', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching expenses stats:', error);
        throw new Error('Failed to fetch expenses stats');
      }

      const expenses = data || [];
      const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

      // Group by category
      const byCategory = expenses.reduce((acc, expense) => {
        const category = expense.category;
        acc[category] = (acc[category] || 0) + Number(expense.amount);
        return acc;
      }, {} as Record<string, number>);

      return {
        totalExpenses,
        averageExpense,
        totalCount: expenses.length,
        byCategory,
      };
    },
  });
};