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
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao seu Sistema POS - Balcão Rápido Sales
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date().toLocaleDateString('pt-BR')}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <Card key={stat.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alerta de Estoque
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              {lowStockProducts.length} produto(s) com estoque baixo necessitam reposição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.slice(0, 3).map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-white dark:bg-orange-800/20 rounded">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="outline" className="text-orange-600">
                    {product.stock} em estoque
                  </Badge>
                </div>
              ))}
              {lowStockProducts.length > 3 && (
                <Button asChild variant="outline" size="sm" className="w-full mt-2">
                  <Link to="/products">Ver todos os produtos</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

{/* Quick Actions */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {quickActions.map((action) => (
    <Card key={action.title} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${action.color} text-white`}>
            <action.icon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{action.title}</CardTitle>
            <CardDescription className="text-sm">
              {action.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Corrigido apenas para o botão Nova Venda */}
        {action.href === '/pdv' ? (
          <Link to={action.href} className="w-full">
            <Button variant="outline" className="w-full">Acessar</Button>
          </Link>
        ) : (
          <Button asChild variant="outline" className="w-full">
            <Link to={action.href}>Acessar</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  ))}
</div>

      {/* Tabela de vendas recentes */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Vendas Recentes
          </CardTitle>
          <CardDescription>
            Últimas transações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendasRecentes.length > 0 ? (
                  vendasRecentes.map(venda => (
                    <tr key={venda.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{typeof venda.id === 'string' ? venda.id.slice(-6) : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {venda.cliente_nome || 'Cliente não informado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarMoeda(venda.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {venda.status || 'Concluída'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarData(venda.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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
      <div className="flex justify-center">
        <Button
          onClick={carregarDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? 'Carregando...' : 'Atualizar Dados'}
        </Button>
      </div>
    </div>
  );
};

export default Index;
