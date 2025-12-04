import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  Calendar, 
  Activity, 
  AlertTriangle,
  ArrowRight,
  Home,
  Receipt,
  Settings,
  TrendingUp,
  Brain,
  Boxes,
  FileText,
  PieChart,
  Menu,
  X,
  LogIn
} from 'lucide-react';

// Dados fictícios para demonstração
const DEMO_STATS = {
  vendasHoje: 2450.90,
  totalProdutos: 234,
  totalClientes: 156,
  receitaMensal: 18320.50
};

const DEMO_VENDAS_RECENTES = [
  { id: 'demo-001', cliente_nome: 'Maria Silva', total: 145.90, status: 'Concluída', created_at: new Date().toISOString() },
  { id: 'demo-002', cliente_nome: 'João Santos', total: 289.50, status: 'Concluída', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'demo-003', cliente_nome: 'Ana Costa', total: 534.20, status: 'Concluída', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'demo-004', cliente_nome: 'Pedro Oliveira', total: 89.90, status: 'Concluída', created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: 'demo-005', cliente_nome: 'Carla Mendes', total: 178.00, status: 'Concluída', created_at: new Date(Date.now() - 14400000).toISOString() },
];

const DEMO_LOW_STOCK = [
  { id: '1', name: 'Arroz Integral 1kg', stock: 3 },
  { id: '2', name: 'Feijão Preto 500g', stock: 2 },
  { id: '3', name: 'Óleo de Soja 900ml', stock: 5 },
];

const DemoDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const statsCards = [
    { title: 'Vendas do Dia', value: formatarMoeda(DEMO_STATS.vendasHoje), icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'Produtos', value: DEMO_STATS.totalProdutos.toString(), icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Clientes', value: DEMO_STATS.totalClientes.toString(), icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { title: 'Receita Mensal', value: formatarMoeda(DEMO_STATS.receitaMensal), icon: BarChart3, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  ];

  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: ShoppingCart, label: 'PDV Rápido' },
    { icon: Package, label: 'Produtos' },
    { icon: Boxes, label: 'Estoque' },
    { icon: Receipt, label: 'Vendas' },
    { icon: FileText, label: 'Orçamentos' },
    { icon: DollarSign, label: 'Despesas' },
    { icon: PieChart, label: 'Relatórios' },
    { icon: Brain, label: 'Assistente IA' },
    { icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header com banner de demo */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2 px-4 text-sm">
        <span className="font-medium">🎯 Modo Demonstração</span>
        <span className="mx-2">—</span>
        <span>Dados fictícios para você conhecer o sistema</span>
        <Button 
          size="sm" 
          variant="secondary" 
          className="ml-4 h-7 bg-white/20 hover:bg-white/30 text-white border-0"
          onClick={() => navigate('/auth')}
        >
          <LogIn className="w-3 h-3 mr-1" />
          Criar Conta Real
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-40px)]">
          {/* Logo */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img src="/logo/gestormei-icon.png" alt="GestorMEI" className="w-10 h-10" />
              <div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">GestorMEI</span>
                <Badge className="ml-2 bg-amber-500/20 text-amber-600 border-0 text-xs">DEMO</Badge>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  item.active 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <h4 className="font-semibold mb-1">Gostou do que viu?</h4>
              <p className="text-xs opacity-90 mb-3">Crie sua conta e comece a usar de verdade!</p>
              <Button 
                size="sm" 
                className="w-full bg-white text-blue-600 hover:bg-slate-100"
                onClick={() => navigate('/auth')}
              >
                Criar Conta Grátis
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <button
          className="lg:hidden fixed bottom-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
            <aside className="w-64 bg-white dark:bg-slate-900 min-h-full" onClick={e => e.stopPropagation()}>
              {/* Same content as desktop sidebar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img src="/logo/gestormei-icon.png" alt="GestorMEI" className="w-10 h-10" />
                  <span className="text-lg font-bold">GestorMEI</span>
                </div>
              </div>
              <nav className="p-4 space-y-1">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left ${
                      item.active ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Bem-vindo ao seu Sistema de Gestão MEI
                </p>
              </div>
              <Badge variant="outline" className="px-3 py-1 self-start sm:self-auto">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date().toLocaleDateString('pt-BR')}
              </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsCards.map((stat) => (
                <Card key={stat.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
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
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base text-orange-800 dark:text-orange-200">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Alerta de Estoque
                </CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  {DEMO_LOW_STOCK.length} produto(s) com estoque baixo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {DEMO_LOW_STOCK.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-white dark:bg-orange-800/20 rounded">
                      <span className="font-medium text-sm">{product.name}</span>
                      <Badge variant="outline" className="text-orange-600">
                        {product.stock} un.
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'Nova Venda', description: 'Iniciar uma nova transação no PDV', icon: ShoppingCart, color: 'bg-blue-600' },
                { title: 'Cadastrar Produto', description: 'Adicionar novos produtos ao estoque', icon: Package, color: 'bg-emerald-600' },
                { title: 'Ver Relatórios', description: 'Visualizar relatórios de vendas', icon: PieChart, color: 'bg-purple-600' },
              ].map((action) => (
                <Card key={action.title} className="border-0 shadow-md hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                        <CardDescription className="text-sm">{action.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="outline" className="w-full">Acessar</Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Sales Table */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Vendas Recentes
                </CardTitle>
                <CardDescription>Últimas transações realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cliente</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Valor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase hidden sm:table-cell">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase hidden md:table-cell">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {DEMO_VENDAS_RECENTES.map((venda) => (
                        <tr key={venda.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="px-4 py-3 text-sm font-medium">#{venda.id.slice(-3)}</td>
                          <td className="px-4 py-3 text-sm">{venda.cliente_nome}</td>
                          <td className="px-4 py-3 text-sm font-semibold">{formatarMoeda(venda.total)}</td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <Badge variant="outline" className="text-green-600">{venda.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">
                            {formatarData(venda.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Bottom CTA */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Pronto para começar de verdade?</h3>
                <p className="text-white/80 mb-4">Crie sua conta grátis e organize suas vendas hoje mesmo!</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button 
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-slate-100"
                    onClick={() => navigate('/auth')}
                  >
                    Criar Conta Grátis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => navigate('/landing')}
                  >
                    Voltar para Landing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemoDashboard;
