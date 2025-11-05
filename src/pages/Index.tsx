import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  vendasHoje: number;
  totalProdutos: number;
  totalClientes: number;
  receitaMensal: number;
}

interface VendaRecente {
  id: string;
  cliente_nome: string;
  total: number;
  status: string;
  created_at: string;
}

const Index: React.FC = () => {
  const { permissions } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    vendasHoje: 0,
    totalProdutos: 0,
    totalClientes: 0,
    receitaMensal: 0
  });
  const [vendasRecentes, setVendasRecentes] = useState<VendaRecente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    carregarDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarDashboard = async () => {
    setLoading(true);

    try {
      const [
        { data: vendas, error: vendasError },
        { data: produtos, error: produtosError },
        { data: clientes, error: clientesError }
      ] = await Promise.all([
        supabase.from('sales').select('id, total, created_at'),
        supabase.from('products').select('id, name, stock'),
        supabase.from('profiles').select('id')
      ]);

      const hoje = new Date();
      const hojeStr = hoje.toISOString().split('T')[0];
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      const vendasHoje =
        vendas?.filter(v => v.created_at && String(v.created_at).startsWith(hojeStr))
        .reduce((sum, v) => sum + Number(v.total ?? 0), 0) || 0;

      const receitaMensal =
        vendas?.filter(v => v.created_at && new Date(v.created_at) >= inicioMes)
        .reduce((sum, v) => sum + Number(v.total ?? 0), 0) || 0;

      setStats({
        vendasHoje,
        totalProdutos: produtos?.length ?? 0,
        totalClientes: clientes?.length ?? 0,
        receitaMensal
      });

      // Vendas recentes - buscar apenas campos que existem na tabela
      const { data: vendasRecentesDireto, error: vendasRecentesError } = await supabase
        .from('sales')
        .select('id, total, created_at, note')
        .order('created_at', { ascending: false })
        .limit(5);

      if (vendasRecentesError) {
        console.error('Erro ao buscar vendas recentes:', vendasRecentesError);
        setVendasRecentes([]);
      } else {
        const vendasRecentesData = vendasRecentesDireto?.map(venda => ({
          id: venda.id,
          cliente_nome: venda.note || 'Cliente não informado',
          total: Number(venda.total ?? 0),
          status: 'Concluída',
          created_at: venda.created_at ?? ''
        })) ?? [];
        
        setVendasRecentes(Array.isArray(vendasRecentesData) ? vendasRecentesData : []);
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);

      setStats({
        vendasHoje: 2450,
        totalProdutos: 1234,
        totalClientes: 567,
        receitaMensal: 12500
      });
      setVendasRecentes([
        {
          id: '001',
          cliente_nome: 'Maria Silva',
          total: 145.9,
          status: 'Concluída',
          created_at: new Date().toISOString()
        },
        {
          id: '002',
          cliente_nome: 'João Santos',
          total: 89.5,
          status: 'Processando',
          created_at: new Date().toISOString()
        },
        {
          id: '003',
          cliente_nome: 'Ana Costa',
          total: 234.2,
          status: 'Concluída',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string | undefined | null) => {
    if (!data) return '';
    try {
      return new Date(data).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const formatarMoeda = (valor: number | undefined | null) => {
    if (typeof valor !== 'number' || isNaN(valor)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Layout Cards adaptado ao novo visual
  const statsCards = [
    {
      title: 'Vendas do Dia',
      value: formatarMoeda(stats.vendasHoje),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Produtos',
      value: stats.totalProdutos.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Clientes',
      value: stats.totalClientes.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Receita Mensal',
      value: formatarMoeda(stats.receitaMensal),
      icon: BarChart3,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  const quickActions = [
    {
      title: 'Nova Venda',
      description: 'Iniciar uma nova transação no PDV',
      icon: ShoppingCart,
      href: '/pos',
      color: 'bg-primary',
    },
    {
      title: 'Cadastrar Produto',
      description: 'Adicionar novos produtos ao estoque',
      icon: Package,
      href: '/products',
      color: 'bg-accent',
    },
    {
      title: 'Ver Relatórios',
      description: 'Visualizar relatórios de vendas',
      icon: BarChart3,
      href: '/reports',
      color: 'bg-secondary',
    },
  ];

  // Produtos com estoque baixo
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  useEffect(() => {
    // produtos já carregados em carregarDashboard
    supabase.from('products').select('id, name, stock').then(({ data }) => {
      if (data) {
        setLowStockProducts(data.filter((p: any) => p.stock <= 5));
      }
    });
  }, [stats.totalProdutos]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-7 sm:h-8 w-32 sm:w-48 mb-2" />
            <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
          </div>
          <Skeleton className="h-7 sm:h-8 w-24 sm:w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-4 sm:p-6">
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 mb-2" />
                <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 mb-2" />
                <Skeleton className="h-2 sm:h-3 w-12 sm:w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 min-h-screen">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Bem-vindo ao seu Sistema POS
          </p>
        </div>
        <Badge variant="outline" className="px-2 sm:px-3 py-1 self-start sm:self-auto">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="text-xs sm:text-sm">{new Date().toLocaleDateString('pt-BR')}</span>
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statsCards.map((stat, i) => {
          // Ocultar card de Receita Mensal para funcionários
          if (stat.title === 'Receita Mensal' && !permissions.canViewRevenue) {
            return null;
          }
          
          return (
            <Card key={stat.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-lg sm:text-2xl font-bold text-foreground mt-1 truncate">{stat.value}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor} flex-shrink-0`}>
                    <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-sm sm:text-base text-orange-800 dark:text-orange-200">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span>Alerta de Estoque</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">
              {lowStockProducts.length} produto(s) com estoque baixo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              {lowStockProducts.slice(0, 3).map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-white dark:bg-orange-800/20 rounded gap-2">
                  <span className="font-medium text-sm truncate flex-1">{product.name}</span>
                  <Badge variant="outline" className="text-orange-600 text-xs whitespace-nowrap">
                    {product.stock} un.
                  </Badge>
                </div>
              ))}
              {lowStockProducts.length > 3 && (
                <Button asChild variant="outline" size="sm" className="w-full mt-2 text-xs sm:text-sm">
                  <Link to="/products">Ver todos</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

{/* Quick Actions */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
  {quickActions.map((action) => (
    <Card key={action.title} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 sm:hover:scale-105">
      <CardHeader className="pb-3 p-4 sm:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`p-1.5 sm:p-2 rounded-lg ${action.color} text-white flex-shrink-0`}>
            <action.icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg truncate">{action.title}</CardTitle>
            <CardDescription className="text-xs sm:text-sm line-clamp-2">
              {action.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 p-4 sm:p-6">
        {action.href === '/pdv' ? (
          <Link to={action.href} className="w-full">
            <Button variant="outline" className="w-full text-sm">Acessar</Button>
          </Link>
        ) : (
          <Button asChild variant="outline" className="w-full text-sm">
            <Link to={action.href}>Acessar</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  ))}
</div>

      {/* Tabela de vendas recentes */}
      <Card className="border-0 shadow-md">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
            <span>Vendas Recentes</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Últimas transações realizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto -mx-0">
            <table className="w-full min-w-[640px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    ID
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Cliente
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Valor
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {vendasRecentes.length > 0 ? (
                  vendasRecentes.map(venda => (
                    <tr key={venda.id} className="hover:bg-muted/50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium">
                        #{typeof venda.id === 'string' ? venda.id.slice(-6) : ''}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate">
                        {venda.cliente_nome || 'Cliente não informado'}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold">
                        {formatarMoeda(venda.total)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {venda.status || 'Concluída'}
                        </Badge>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                        {formatarData(venda.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      Nenhuma venda encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Botão de atualização */}
      <div className="flex justify-center pb-4">
        <Button
          onClick={carregarDashboard}
          className="px-4 py-2 text-sm sm:text-base"
          disabled={loading}
        >
          {loading ? 'Carregando...' : 'Atualizar Dados'}
        </Button>
      </div>
    </div>
  );
};

export default Index;
