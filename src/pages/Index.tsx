import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Calendar,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const stats = [
    {
      title: 'Vendas do Dia',
      value: 'R$ 2.450,00',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Produtos Vendidos',
      value: '127',
      change: '+8.2%',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Transações',
      value: '43',
      change: '+15.3%',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Novos Clientes',
      value: '12',
      change: '+5.1%',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
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
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">
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
            {[
              { time: '14:30', action: 'Venda realizada', value: 'R$ 89,90', type: 'success' },
              { time: '14:15', action: 'Produto adicionado', value: 'Produto X', type: 'info' },
              { time: '13:45', action: 'Estoque atualizado', value: '15 itens', type: 'warning' },
              { time: '13:20', action: 'Venda realizada', value: 'R$ 125,50', type: 'success' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'info' ? 'bg-blue-500' : 'bg-orange-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
