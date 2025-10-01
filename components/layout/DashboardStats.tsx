import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, DollarSign, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStatsProps {
  className?: string;
}

export function DashboardStats({ className }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
    profitMargin: 0,
    lowStockProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get total products and low stock count
      const { data: products } = await supabase
        .from('products')
        .select('id, stock, min_stock');

      const totalProducts = products?.length || 0;
      const lowStockProducts = products?.filter(p => 
        p.stock !== null && p.min_stock !== null && p.stock <= p.min_stock
      ).length || 0;

      // Get sales data with profit calculations using secure function
      const { data: salesData } = await supabase.rpc('get_sales_with_profit');

      let totalRevenue = 0;
      let totalProfit = 0;
      const totalSales = salesData?.length || 0;

      salesData?.forEach((sale: any) => {
        totalRevenue += Number(sale.total_revenue || 0);
        totalProfit += Number(sale.total_profit || 0);
      });

      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      setStats({
        totalProducts,
        totalSales,
        totalRevenue,
        totalProfit,
        profitMargin,
        lowStockProducts
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const statsData = [
    {
      title: 'Total de Produtos',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `${stats.lowStockProducts} com estoque baixo`
    },
    {
      title: 'Total de Vendas',
      value: stats.totalSales.toString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Vendas realizadas'
    },
    {
      title: 'Receita Total',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Faturamento bruto'
    },
    {
      title: 'Lucro Obtido',
      value: formatCurrency(stats.totalProfit),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: `${stats.profitMargin.toFixed(1)}% de margem`
    }
  ];

  if (loading) {
    return (
      <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {statsData.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <div className={`absolute inset-0 ${stat.bgColor} opacity-50`}></div>
          <CardHeader className="relative pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${stat.bgColor} ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}