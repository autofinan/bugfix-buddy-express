import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Sale {
  id: string;
  total: number;
  subtotal: number | null;
  discount_type: string | null;
  discount_value: number | null;
  payment_method: string;
  note: string | null;
  date: string;
  created_at: string;
  owner_id: string;
  canceled: boolean;
  canceled_at: string | null;
  cancel_reason: string | null;
  cliente_nome: string | null;
  cliente_id: string | null;
  status: string | null;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  custo_unitario: number | null;
  created_at: string;
  owner_id: string;
  products?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
  };
}

export interface SaleWithItems extends Sale {
  sale_items: SaleItem[];
}

export interface SaleWithProfit {
  id: string;
  date: string;
  total: number;
  payment_method: string;
  note: string;
  created_at: string;
  total_revenue: number;
  total_profit: number;
  profit_margin_percentage: number;
  owner_id: string;
  canceled: boolean;
  subtotal: number;
  discount_type: string;
  discount_value: number;
  canceled_at: string;
  cancel_reason: string;
}

export const useSales = (startDate?: Date, endDate?: Date, searchTerm?: string) => {
  return useQuery({
    queryKey: ['sales', startDate?.toISOString(), endDate?.toISOString(), searchTerm],
    queryFn: async (): Promise<SaleWithProfit[]> => {
      const { data, error } = await supabase.rpc('get_sales_with_profit');

      if (error) {
        console.error('Error fetching sales:', error);
        throw new Error('Failed to fetch sales');
      }

      let filteredData = data || [];

      // Filter by date range
      if (startDate && endDate) {
        filteredData = filteredData.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= startDate && saleDate <= endDate;
        });
      }

      // Filter by search term
      if (searchTerm) {
        filteredData = filteredData.filter(sale =>
          sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sale.note && sale.note.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      return filteredData;
    },
  });
};

export const useSale = (saleId: string | null) => {
  return useQuery({
    queryKey: ['sale', saleId],
    queryFn: async (): Promise<SaleWithItems | null> => {
      if (!saleId) return null;

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', saleId)
        .single();

      if (saleError) {
        console.error('Error fetching sale:', saleError);
        throw new Error('Failed to fetch sale');
      }

      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          *,
          products(id, name, description, price, stock)
        `)
        .eq('sale_id', saleId);

      if (itemsError) {
        console.error('Error fetching sale items:', itemsError);
        throw new Error('Failed to fetch sale items');
      }

      return {
        ...sale,
        sale_items: saleItems || [],
      };
    },
    enabled: !!saleId,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleData: {
      items: Array<{
        product_id: string;
        quantity: number;
        unit_price: number;
        total_price: number;
      }>;
      subtotal: number;
      discount_type?: string;
      discount_value?: number;
      total: number;
      payment_method: string;
      note?: string;
      cliente_nome?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Create the sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([
          {
            subtotal: saleData.subtotal,
            discount_type: saleData.discount_type,
            discount_value: saleData.discount_value || 0,
            total: saleData.total,
            payment_method: saleData.payment_method,
            note: saleData.note,
            cliente_nome: saleData.cliente_nome,
            owner_id: user.user.id,
          },
        ])
        .select()
        .single();

      if (saleError) {
        console.error('Error creating sale:', saleError);
        throw new Error('Failed to create sale');
      }

      // Create sale items and update stock
      for (const item of saleData.items) {
        // Get product cost for profit calculation
        const { data: product } = await supabase
          .from('products')
          .select('cost_unitario, stock')
          .eq('id', item.product_id)
          .single();

        // Create sale item
        const { error: itemError } = await supabase
          .from('sale_items')
          .insert([
            {
              sale_id: sale.id,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              custo_unitario: product?.cost_unitario || 0,
              owner_id: user.user.id,
            },
          ]);

        if (itemError) {
          console.error('Error creating sale item:', itemError);
          throw new Error('Failed to create sale item');
        }

        // Update product stock
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            stock: (product?.stock || 0) - item.quantity 
          })
          .eq('id', item.product_id);

        if (stockError) {
          console.error('Error updating stock:', stockError);
          throw new Error('Failed to update stock');
        }
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Venda realizada com sucesso');
    },
    onError: (error) => {
      console.error('Error creating sale:', error);
      toast.error('Erro ao realizar venda');
    },
  });
};

export const useCancelSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ saleId, reason }: { saleId: string; reason?: string }) => {
      const { data, error } = await supabase.rpc('cancel_sale', {
        sale_id_param: saleId,
        reason: reason || null,
      });

      if (error) {
        console.error('Error canceling sale:', error);
        throw new Error('Failed to cancel sale');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Venda cancelada com sucesso');
    },
    onError: (error) => {
      console.error('Error canceling sale:', error);
      toast.error('Erro ao cancelar venda');
    },
  });
};

export const useSalesStats = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['sales', 'stats', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_sales_with_profit');

      if (error) {
        console.error('Error fetching sales stats:', error);
        throw new Error('Failed to fetch sales stats');
      }

      let filteredData = data || [];

      // Filter by date range
      if (startDate && endDate) {
        filteredData = filteredData.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= startDate && saleDate <= endDate;
        });
      }

      const totalRevenue = filteredData.reduce((sum, sale) => sum + Number(sale.total_revenue), 0);
      const totalProfit = filteredData.reduce((sum, sale) => sum + Number(sale.total_profit), 0);
      const averageTicket = filteredData.length > 0 ? totalRevenue / filteredData.length : 0;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      return {
        totalSales: filteredData.length,
        totalRevenue,
        totalProfit,
        averageTicket,
        profitMargin: Number(profitMargin.toFixed(2)),
        canceledSales: filteredData.filter(sale => sale.canceled).length,
      };
    },
  });
};