import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

export interface DashboardStats {
  dailySales: {
    total: number;
    count: number;
    change: number;
  };
  productsSold: {
    total: number;
    change: number;
  };
  transactions: {
    count: number;
    change: number;
  };
  lowStockProducts: number;
}

export interface RecentActivity {
  id: string;
  type: 'sale' | 'product' | 'stock';
  description: string;
  value: string;
  time: string;
  status: 'success' | 'info' | 'warning';
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date();
      const startToday = startOfDay(today);
      const endToday = endOfDay(today);
      const startThisMonth = startOfMonth(today);
      const endThisMonth = endOfMonth(today);

      // Vendas do dia
      const { data: dailySales, error: salesError } = await supabase
        .from('sales')
        .select('total, created_at')
        .gte('date', startToday.toISOString())
        .lte('date', endToday.toISOString())
        .eq('canceled', false);

      if (salesError) {
        console.error('Error fetching daily sales:', salesError);
      }

      // Vendas do mês passado para comparação
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      const { data: lastMonthSales } = await supabase
        .from('sales')
        .select('total')
        .gte('date', startOfDay(lastMonth).toISOString())
        .lte('date', endOfDay(lastMonth).toISOString())
        .eq('canceled', false);

      // Produtos vendidos hoje
      const { data: productsSold, error: productsError } = await supabase
        .from('sale_items')
        .select('quantity, sale_id!inner(date, canceled)')
        .gte('sale_id.date', startToday.toISOString())
        .lte('sale_id.date', endToday.toISOString())
        .eq('sale_id.canceled', false);

      if (productsError) {
        console.error('Error fetching products sold:', productsError);
      }

      // Produtos com estoque baixo
      const { data: lowStockProducts, error: stockError } = await supabase
        .from('products')
        .select('id, stock, min_stock')
        .eq('is_active', true);

      if (stockError) {
        console.error('Error fetching low stock products:', stockError);
      }

      const dailySalesTotal = dailySales?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
      const dailySalesCount = dailySales?.length || 0;
      const lastMonthSalesTotal = lastMonthSales?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
      
      const productsSoldTotal = productsSold?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
      
      const salesChange = lastMonthSalesTotal > 0 
        ? ((dailySalesTotal - lastMonthSalesTotal) / lastMonthSalesTotal) * 100 
        : 0;

      return {
        dailySales: {
          total: dailySalesTotal,
          count: dailySalesCount,
          change: Number(salesChange.toFixed(1)),
        },
        productsSold: {
          total: productsSoldTotal,
          change: 8.2, // Placeholder - you can calculate this properly
        },
        transactions: {
          count: dailySalesCount,
          change: 15.3, // Placeholder - you can calculate this properly  
        },
        lowStockProducts: lowStockProducts?.filter(product => 
          product.stock <= (product.min_stock || 0)
        ).length || 0,
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: async (): Promise<RecentActivity[]> => {
      // Get recent sales
      const { data: recentSales } = await supabase
        .from('sales')
        .select('id, total, created_at, payment_method')
        .order('created_at', { ascending: false })
        .limit(5)
        .eq('canceled', false);

      // Get recent products added
      const { data: recentProducts } = await supabase
        .from('products')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // Get recent inventory movements
      const { data: recentMovements } = await supabase
        .from('inventory_movements')
        .select('id, type, quantity, created_at, product_id, products(name)')
        .order('created_at', { ascending: false })
        .limit(3);

      const activities: RecentActivity[] = [];

      // Add sales to activities
      recentSales?.forEach(sale => {
        activities.push({
          id: sale.id,
          type: 'sale',
          description: 'Venda realizada',
          value: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(Number(sale.total)),
          time: new Date(sale.created_at).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: 'success',
        });
      });

      // Add products to activities
      recentProducts?.forEach(product => {
        activities.push({
          id: product.id,
          type: 'product',
          description: 'Produto adicionado',
          value: product.name,
          time: new Date(product.created_at).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: 'info',
        });
      });

      // Add inventory movements to activities
      recentMovements?.forEach(movement => {
        activities.push({
          id: movement.id,
          type: 'stock',
          description: `Estoque ${movement.type === 'in' ? 'entrada' : 'saída'}`,
          value: `${movement.quantity} ${movement.products?.name || 'itens'}`,
          time: new Date(movement.created_at).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: 'warning',
        });
      });

      // Sort all activities by time and return top 10
      return activities
        .sort((a, b) => b.time.localeCompare(a.time))
        .slice(0, 10);
    },
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};