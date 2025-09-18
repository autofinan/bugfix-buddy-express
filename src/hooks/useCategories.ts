import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  created_at: string;
  owner_id: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories');
      }

      return data || [];
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: { name: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            ...categoryData,
            owner_id: (await supabase.auth.getUser()).data.user?.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        throw new Error('Failed to create category');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria criada com sucesso');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error('Erro ao criar categoria');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Category>;
    }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        throw new Error('Failed to update category');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria atualizada com sucesso');
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast.error('Erro ao atualizar categoria');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Error deleting category:', error);
        throw new Error('Failed to delete category');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria excluída com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
    },
  });
};