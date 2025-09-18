import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  cost_unitario: number | null;
  stock: number;
  min_stock: number;
  sku: string | null;
  barcode: string | null;
  image_url: string | null;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
  owner_id: string;
  categories?: {
    id: string;
    name: string;
  } | null;
}

export const useProducts = (searchTerm?: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['products', searchTerm, categoryId],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(id, name)
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw new Error('Failed to fetch products');
      }

      return data || [];
    },
  });
};

export const useProduct = (productId: string | null) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async (): Promise<Product | null> => {
      if (!productId) return null;

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(id, name)
        `)
        .eq('id', productId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        throw new Error('Failed to fetch product');
      }

      return data;
    },
    enabled: !!productId,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: {
      name: string;
      description?: string;
      price: number;
      cost?: number;
      cost_unitario?: number;
      stock?: number;
      min_stock?: number;
      sku?: string;
      barcode?: string;
      image_url?: string;
      category_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            ...productData,
            owner_id: (await supabase.auth.getUser()).data.user?.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw new Error('Failed to create product');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado com sucesso');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast.error('Erro ao criar produto');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Product>;
    }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw new Error('Failed to update product');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      toast.success('Produto atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Erro ao atualizar produto');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        throw new Error('Failed to delete product');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto desativado com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error('Erro ao desativar produto');
    },
  });
};

export const useLowStockProducts = () => {
  return useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(id, name)
        `)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching low stock products:', error);
        throw new Error('Failed to fetch low stock products');
      }

      // Filter products where stock is less than or equal to min_stock
      return (data || []).filter(product => 
        product.stock <= (product.min_stock || 0)
      );
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};