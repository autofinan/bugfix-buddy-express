import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, DollarSign, Target, X, CalendarDays } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardStatsProps {
  className?: string;
}

interface Sale {
  id: string;
  date: string;
  total: number;
  payment_method: string;
  note: string | null;
  created_at: string;
  total_profit?: number;
  profit_margin_percentage?: number;
  canceled?: boolean;
  status?: string;
}

interface StatsData {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  lowStockProducts: number;
  canceledSales: number;
  ticketMedio: number;
  todaySales: number;
  monthSales: number;
  todayRevenue: number;
  monthRevenue: number;
}

export function DashboardStatsInteractive({ className }: DashboardStatsProps) {
  const [stats, setStats] = useState<StatsData>({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
    profitMargin: 0,
    lowStockProducts: 0,
    canceledSales: 0,
    ticketMedio: 0,
    todaySales: 0,
    monthSales: 0,
    todayRevenue: 0,
    monthRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<Sale[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get products data
      const { data: products } = await supabase
        .from('products')
        .select('id, stock, min_stock');

      const totalProducts = products?.length || 0;
      const lowStockProducts = products?.filter(p => 
        p.stock !== null && p.min_stock !== null && p.stock <= p.min_stock
      ).length || 0;

      // Get sales data
      const { data: salesData } = await supabase.rpc('get_sales_with_profit');

      let totalRevenue = 0;
      let totalProfit = 0;
      let canceledSales = 0;
      let todaySales = 0;
      let monthSales = 0;
      let todayRevenue = 0;
      let monthRevenue = 0;

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      salesData?.forEach((sale: any) => {
        const saleDate = new Date(sale.created_at);
        const saleTotal = Number(sale.total_revenue || 0);
        
        totalRevenue += saleTotal;
        totalProfit += Number(sale.total_profit || 0);
        
        if (sale.canceled) {
          canceledSales++;
        }

        if (saleDate >= startOfDay) {
          todaySales++;
          todayRevenue += saleTotal;
        }

        if (saleDate >= startOfMonth) {
          monthSales++;
          monthRevenue += saleTotal;
        }
      });

      const totalSales = salesData?.length || 0;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      const ticketMedio = totalSales > 0 ? totalRevenue / totalSales : 0;

      setStats({
        totalProducts,
        totalSales,
        totalRevenue,
        totalProfit,
        profitMargin,
        lowStockProducts,
        canceledSales,
        ticketMedio,
        todaySales,
        monthSales,
        todayRevenue,
        monthRevenue
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (cardType: string) => {
    try {
      const { data: salesData } = await supabase.rpc('get_sales_with_profit');
      
      let filteredData: Sale[] = [];
      
      switch (cardType) {
        case 'sales':
          filteredData = (salesData || []).slice(0, 10).map((sale: any) => ({
            ...sale,
            status: sale.canceled ? 'Cancelada' : 'Concluída'
          }));
          break;
        case 'revenue':
          filteredData = (salesData || [])
            .filter((sale: any) => !sale.canceled)
            .sort((a: any, b: any) => Number(b.total) - Number(a.total))
            .slice(0, 5)
            .map((sale: any) => ({ ...sale, status: 'Concluída' }));
          break;
        case 'canceled':
          filteredData = (salesData || [])
            .filter((sale: any) => sale.canceled)
            .slice(0, 10)
            .map((sale: any) => ({ ...sale, status: 'Cancelada' }));
          break;
        case 'today':
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          filteredData = (salesData || [])
            .filter((sale: any) => new Date(sale.created_at) >= startOfDay)
            .map((sale: any) => ({ ...sale, status: sale.canceled ? 'Cancelada' : 'Concluída' }));
          break;
      }
      
      setModalData(filteredData);
      setSelectedModal(cardType);
    } catch (error) {
      console.error('Erro ao buscar dados do modal:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getModalTitle = (cardType: string) => {
    switch (cardType) {
      case 'sales': return 'Últimas 10 Vendas';
      case 'revenue': return 'Top 5 Vendas por Valor';
      case 'canceled': return 'Vendas Canceladas';
      case 'today': return 'Vendas de Hoje';
      default: return 'Detalhes';
    }
  };

  const statsCards = [
    {
      id: 'today',
      title: 'Vendas Hoje',
      value: stats.todaySales.toString(),
      icon: CalendarDays,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: formatCurrency(stats.todayRevenue),
      clickable: true
    },
    {
      id: 'sales',
      title: 'Total de Vendas',
      value: stats.monthSales.toString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Vendas do mês',
      clickable: true
    },
    {
      id: 'revenue',
      title: 'Receita do Mês',
      value: formatCurrency(stats.monthRevenue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Faturamento bruto',
      clickable: true
    },
    {
      id: 'ticket',
      title: 'Ticket Médio',
      value: formatCurrency(stats.ticketMedio),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: `${stats.profitMargin.toFixed(1)}% de margem`,
      clickable: false
    },
    {
      id: 'canceled',
      title: 'Vendas Canceladas',
      value: stats.canceledSales.toString(),
      icon: X,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Total cancelado',
      clickable: true
    },
    {
      id: 'stock',
      title: 'Estoque Baixo',
      value: stats.lowStockProducts.toString(),
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: `de ${stats.totalProducts} produtos`,
      clickable: false
    }
  ];

  if (loading) {
    return (
      <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
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
    <>
      <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {statsCards.map((stat) => (
          <Card 
            key={stat.id} 
            className={`relative overflow-hidden border-0 shadow-sm transition-all duration-200 ${
              stat.clickable 
                ? 'hover:shadow-md cursor-pointer hover:scale-105' 
                : 'hover:shadow-md'
            }`}
            onClick={stat.clickable ? () => handleCardClick(stat.id) : undefined}
          >
            <div className={`absolute inset-0 ${stat.bgColor} opacity-50`}></div>
            <CardHeader className="relative pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${stat.bgColor} ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                {stat.title}
                {stat.clickable && (
                  <span className="text-xs text-muted-foreground ml-auto">Clique para detalhes</span>
                )}
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

      <Dialog open={!!selectedModal} onOpenChange={() => setSelectedModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getModalTitle(selectedModal || '')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {modalData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum dado encontrado
              </p>
            ) : (
              modalData.map((sale) => (
                <Card key={sale.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">#{sale.id.slice(-8)}</span>
                        <Badge variant={sale.status === 'Cancelada' ? 'destructive' : 'default'}>
                          {sale.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(sale.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      {sale.note && (
                        <p className="text-sm text-muted-foreground">
                          Obs: {sale.note}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(Number(sale.total))}
                      </p>
                      {sale.total_profit !== undefined && (
                        <p className="text-sm text-green-600">
                          Lucro: {formatCurrency(sale.total_profit)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}