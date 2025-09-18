import React from 'react';
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
import { Link } from 'react-router-dom';
import { useDashboardStats, useRecentActivity } from '@/hooks/useDashboard';
import { useLowStockProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();
  const { data: lowStockProducts } = useLowStockProducts();

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">
            Você precisa estar logado para acessar o dashboard.
          </p>
          <Button asChild>
            <Link to="/auth">Fazer Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const statsCards = [
    {
      title: 'Vendas do Dia',
      value: stats ? formatCurrency(stats.dailySales.total) : 'R$ 0,00',
      change: stats ? `${stats.dailySales.change >= 0 ? '+' : ''}${stats.dailySales.change}%` : '+0%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      changeColor: stats?.dailySales.change >= 0 ? 'text-green-600' : 'text-red-600',
      trendIcon: stats?.dailySales.change >= 0 ? TrendingUp : TrendingDown,
    },
    {
      title: 'Produtos Vendidos',
      value: stats ? stats.productsSold.total.toString() : '0',
      change: `+${stats?.productsSold.change || 0}%`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      changeColor: 'text-blue-600',
      trendIcon: TrendingUp,
    },
    {
      title: 'Transações',
      value: stats ? stats.transactions.count.toString() : '0',
      change: `+${stats?.transactions.change || 0}%`,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      changeColor: 'text-purple-600',
      trendIcon: TrendingUp,
    },
    {
      title: 'Estoque Baixo',
      value: stats ? stats.lowStockProducts.toString() : '0',
      change: 'produtos',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      changeColor: 'text-orange-600',
      trendIcon: AlertTriangle,
    },
  ];

  const quickActions = [
    {
      title: 'Nova Venda',
      description: 'Iniciar uma nova transação no PDV',
      icon: ShoppingCart,
      href: '/pdv',
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

  return (
    <div className="p-6 space-y-6">
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
        {statsCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                  )}
                  <div className="flex items-center mt-2">
                    <stat.trendIcon className={`w-4 h-4 ${stat.changeColor} mr-1`} />
                    <span className={`text-sm ${stat.changeColor} font-medium`}>
                      {stat.change}
                    </span>
                  </div>
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
              {lowStockProducts.slice(0, 3).map((product) => (
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
              <Button asChild variant="outline" className="w-full">
                <Link to={action.href}>Acessar</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Últimas transações e movimentações do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))
            ) : recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'info' ? 'bg-blue-500' : 'bg-orange-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.value}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
