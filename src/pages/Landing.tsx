import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  BarChart3,
  Brain,
  Package,
  Receipt,
  Calculator,
  TrendingUp,
  Shield,
  Smartphone,
  Zap,
  Check,
  ArrowRight,
  Star,
  Menu,
  X,
  Play,
  ChevronRight,
  Sparkles,
  Target,
  Clock,
  Users,
  FileText,
  PieChart,
  AlertTriangle,
  DollarSign,
  Boxes,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const Landing: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleStartDemo = () => {
    // Navigate to demo page
    navigate('/demo');
  };

  const features = [
    {
      icon: ShoppingCart,
      title: 'PDV Rápido e Intuitivo',
      description: 'Registre vendas em segundos. Funciona no computador e no celular com leitor de código de barras.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Brain,
      title: 'Assistente IA Financeiro',
      description: 'Converse com uma IA que analisa seus dados reais e sugere como aumentar seu lucro.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: BarChart3,
      title: 'Relatórios Inteligentes',
      description: 'DRE, Curva ABC e Fluxo de Caixa automatizados. Saiba exatamente quanto você lucra.',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: Package,
      title: 'Controle de Estoque',
      description: 'Alertas de estoque baixo, entrada/saída automática e histórico completo de movimentações.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Integrado',
      description: 'Envie comprovantes, orçamentos e nota fiscal direto pro WhatsApp do cliente.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Calculator,
      title: 'Precificação Inteligente',
      description: 'Calcule o preço ideal considerando custos, impostos e margem desejada.',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  const problems = [
    {
      problem: 'Não sei quanto lucrei esse mês',
      solution: 'Dashboard em tempo real com lucro líquido calculado automaticamente',
      icon: DollarSign,
    },
    {
      problem: 'Perco vendas porque o estoque acabou',
      solution: 'Alertas automáticos de estoque baixo antes de acabar',
      icon: Boxes,
    },
    {
      problem: 'Anoto vendas no caderno e me perco',
      solution: 'PDV digital que registra tudo automaticamente na nuvem',
      icon: Receipt,
    },
    {
      problem: 'Não sei precificar meus produtos',
      solution: 'Calculadora inteligente que sugere o preço ideal com margem',
      icon: Calculator,
    },
    {
      problem: 'Clientes pedem comprovante e demoro',
      solution: 'Gere e envie via WhatsApp em 2 cliques',
      icon: MessageSquare,
    },
    {
      problem: 'Não tenho controle das despesas',
      solution: 'Registro de gastos categorizado com relatórios mensais',
      icon: FileText,
    },
  ];

  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para começar',
      features: [
        'Até 50 produtos',
        'Até 50 vendas/mês',
        'PDV básico',
        'Controle de estoque',
        '1 pergunta IA/semana',
        'Relatórios básicos',
      ],
      notIncluded: [
        'Múltiplos funcionários',
        'DRE e Curva ABC',
        'Suporte prioritário',
      ],
      cta: 'Começar Grátis',
      popular: false,
      gradient: 'from-slate-600 to-slate-700',
    },
    {
      name: 'Básico',
      price: 'R$ 29',
      period: '/mês',
      description: 'Para MEIs em crescimento',
      features: [
        'Até 100 produtos',
        'Até 300 vendas/mês',
        'PDV completo',
        'Gestão de despesas',
        '5 perguntas IA/semana',
        'Precificação inteligente',
        'Comprovantes sem marca d\'água',
      ],
      notIncluded: [
        'Múltiplos funcionários',
        'Relatórios avançados',
      ],
      cta: 'Assinar Agora',
      popular: true,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Pro',
      price: 'R$ 59',
      period: '/mês',
      description: 'Máximo poder para seu negócio',
      features: [
        'Produtos ilimitados',
        'Vendas ilimitadas',
        'IA ilimitada',
        'DRE e Curva ABC',
        'Fluxo de caixa avançado',
        'Múltiplos funcionários',
        'Relatórios personalizados',
        'Suporte prioritário',
      ],
      notIncluded: [],
      cta: 'Quero o Pro',
      popular: false,
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Loja de Roupas • São Paulo',
      content: 'Antes eu perdia horas calculando meu lucro. Agora em segundos sei exatamente quanto ganhei e a IA me ajuda a precificar melhor!',
      avatar: 'MS',
      rating: 5,
      highlight: 'Economizo 5h por semana',
    },
    {
      name: 'João Santos',
      role: 'Food Truck • Rio de Janeiro',
      content: 'O PDV é muito rápido! Na correria do almoço consigo registrar tudo sem erro. O estoque se atualiza sozinho e nunca mais perdi venda.',
      avatar: 'JS',
      rating: 5,
      highlight: 'Vendas +30%',
    },
    {
      name: 'Ana Costa',
      role: 'Salão de Beleza • Belo Horizonte',
      content: 'A funcionalidade de serviços é perfeita. Controlo tudo: atendimentos, produtos usados e o lucro de cada cliente. Mudou meu negócio!',
      avatar: 'AC',
      rating: 5,
      highlight: 'Lucro +40%',
    },
  ];

  const stats = [
    { value: '5.000+', label: 'MEIs usando' },
    { value: 'R$ 2M+', label: 'Gerenciados/mês' },
    { value: '98%', label: 'Satisfação' },
    { value: '24/7', label: 'Acesso na nuvem' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/logo/gestormei-icon.png" 
                alt="GestorMEI" 
                className="w-10 h-10 md:w-12 md:h-12"
              />
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                GestorMEI
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#problemas" className="text-slate-300 hover:text-white transition-colors">
                Problemas que resolve
              </a>
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">
                Funcionalidades
              </a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">
                Planos
              </a>
              <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">
                Depoimentos
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
                  Entrar
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25">
                  Teste Grátis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/98 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 py-4 space-y-3">
              <a href="#problemas" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Problemas que resolve
              </a>
              <a href="#features" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Funcionalidades
              </a>
              <a href="#pricing" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Planos
              </a>
              <a href="#testimonials" className="block py-2 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Depoimentos
              </a>
              <div className="pt-3 flex flex-col gap-2">
                <Link to="/auth">
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    Entrar
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                    Teste Grátis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 px-4">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">Sistema completo de gestão para MEI</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                GestorMEI — Seu sistema completo de
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                vendas e gestão para MEI
              </span>
            </h1>

            {/* Subheadline - Value Proposition */}
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-4">
              PDV rápido no celular ou computador • Controle de estoque automático • Vendas pelo WhatsApp • Relatórios financeiros • Tudo na nuvem
            </p>
            
            <p className="text-base text-slate-400 max-w-2xl mx-auto mb-8">
              Pare de perder dinheiro com controles em cadernos e planilhas. O GestorMEI organiza tudo automaticamente e ainda te mostra como lucrar mais.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0 shadow-xl shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:scale-105">
                  Começar Grátis Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                className="w-full sm:w-auto h-14 px-8 text-lg bg-slate-800 hover:bg-slate-700 border border-white/20 text-white backdrop-blur-sm"
                onClick={handleStartDemo}
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Demonstração
              </Button>
            </div>

            {/* Trust Badge */}
            <p className="text-sm text-slate-500 mb-8">
              ✓ Não precisa de cartão de crédito • ✓ Funciona no celular • ✓ Suporte via WhatsApp
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-xl bg-slate-800/30 border border-white/5">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview - Mobile Optimized */}
          <div className="mt-12 md:mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-blue-500/10">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-slate-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-md mx-auto px-4 py-1.5 rounded-md bg-slate-700/50 text-xs text-slate-400 text-center">
                    gestormei.app/dashboard
                  </div>
                </div>
              </div>
              
              {/* Dashboard Content */}
              <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {[
                    { label: 'Vendas Hoje', value: 'R$ 2.450', color: 'emerald', trend: '+18%' },
                    { label: 'Produtos', value: '234', color: 'blue', trend: '' },
                    { label: 'Lucro Mês', value: 'R$ 8.320', color: 'purple', trend: '+12%' },
                    { label: 'Pedidos', value: '47', color: 'amber', trend: '+5' },
                  ].map((card, index) => (
                    <div key={index} className="p-3 md:p-4 rounded-xl bg-slate-800/50 border border-white/5">
                      <span className="text-xs text-slate-400">{card.label}</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <div className="text-lg md:text-xl font-bold text-white">{card.value}</div>
                        {card.trend && (
                          <span className="text-xs text-emerald-400">{card.trend}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  {[
                    { label: 'Nova Venda', icon: ShoppingCart, color: 'blue' },
                    { label: 'Adicionar Produto', icon: Package, color: 'emerald' },
                    { label: 'Ver Relatórios', icon: PieChart, color: 'purple' },
                  ].map((action, index) => (
                    <div key={index} className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-white/5 text-center cursor-pointer hover:border-white/20 transition-all">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-${action.color}-500/20 flex items-center justify-center mx-auto mb-2`}>
                        <action.icon className={`w-4 h-4 md:w-5 md:h-5 text-${action.color}-400`} />
                      </div>
                      <span className="text-xs md:text-sm text-slate-300">{action.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-6 px-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-white font-medium">
            🚀 Mais de <span className="text-emerald-400">5.000 MEIs</span> já organizam seu negócio com o GestorMEI
          </p>
        </div>
      </section>

      {/* Problems Section */}
      <section id="problemas" className="py-16 md:py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="mb-4 border-red-500/30 text-red-400">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Problemas Comuns
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Você também enfrenta esses problemas?
              </span>
            </h2>
            <p className="text-slate-400">
              O GestorMEI resolve cada um deles de forma simples e automática
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {problems.map((item, index) => (
              <Card key={index} className="bg-slate-800/30 border-white/5 hover:border-white/10 transition-all overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-300 font-medium mb-3">"{item.problem}"</p>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-emerald-300">{item.solution}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA After Problems */}
          <div className="text-center mt-10">
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0 shadow-lg shadow-emerald-500/25">
                Resolver Meus Problemas Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 px-4 relative bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="mb-4 border-blue-500/30 text-blue-400">
              Funcionalidades
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Tudo que você precisa em um só lugar
              </span>
            </h2>
            <p className="text-slate-400">
              Do registro de vendas à análise financeira. Tudo integrado e fácil de usar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <Card key={index} className="group bg-slate-800/30 border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Highlight */}
          <div className="mt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
            <div className="relative p-6 md:p-10 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 backdrop-blur-xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Inteligência Artificial
                  </Badge>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                    Assistente IA que entende seu negócio
                  </h3>
                  <p className="text-slate-400 mb-5 text-sm md:text-base leading-relaxed">
                    Pergunte qualquer coisa sobre suas finanças. A IA analisa seus dados reais e te dá respostas precisas 
                    com sugestões práticas para aumentar seu lucro.
                  </p>
                  <ul className="space-y-2">
                    {[
                      'Análise de lucro por produto',
                      'Sugestões de precificação',
                      'Identificação de tendências',
                      'Alertas inteligentes',
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-slate-300 text-sm">
                        <Check className="w-4 h-4 text-emerald-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="p-5 rounded-xl bg-slate-800/80 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Assistente IA</div>
                        <div className="text-xs text-slate-400">Online</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-slate-300">
                        "Quanto lucrei com camisetas este mês?"
                      </div>
                      <div className="p-3 rounded-lg bg-slate-700/50 border border-white/5 text-sm text-slate-300">
                        <p className="mb-2">📊 Você vendeu <span className="text-emerald-400 font-medium">47 camisetas</span> com lucro de <span className="text-emerald-400 font-medium">R$ 1.645</span>.</p>
                        <p className="text-slate-400 text-xs">💡 Dica: Aumentar R$ 5 no preço pode gerar +R$ 235/mês.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA After Features */}
          <div className="text-center mt-10">
            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 px-8 border-white/20 text-white hover:bg-white/10"
              onClick={handleStartDemo}
            >
              <Play className="w-5 h-5 mr-2" />
              Ver Sistema Funcionando
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-400">
              Planos
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Preços claros e sem surpresas
              </span>
            </h2>
            <p className="text-slate-400">
              Comece grátis e escale conforme seu negócio cresce. Cancele quando quiser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-5 md:p-6 rounded-2xl border transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-blue-500/10 to-purple-500/10 border-blue-500/30 scale-[1.02] shadow-xl shadow-blue-500/20'
                    : 'bg-slate-800/30 border-white/5 hover:border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 px-3 py-1 text-xs">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-5">
                  <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mb-3">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl md:text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-slate-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.notIncluded.length > 0 && (
                  <ul className="space-y-2 mb-5 opacity-50">
                    {plan.notIncluded.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-slate-400 text-sm">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <Link to="/auth">
                  <Button
                    className={`w-full h-11 text-sm ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/25'
                        : 'bg-slate-700 hover:bg-slate-600 border-0'
                    }`}
                  >
                    {plan.cta}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 px-4 relative bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="mb-4 border-purple-500/30 text-purple-400">
              Depoimentos
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                MEIs que transformaram seu negócio
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/30 border-white/5 hover:border-white/10 transition-all">
                <CardContent className="p-5">
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Badge className="mb-3 bg-emerald-500/20 text-emerald-400 border-0 text-xs">
                    {testimonial.highlight}
                  </Badge>
                  <p className="text-slate-300 mb-5 text-sm leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{testimonial.name}</div>
                      <div className="text-xs text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 px-4 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-5">
            <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Pronto para organizar seu negócio?
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-8">
            Junte-se a milhares de MEIs que já simplificaram sua gestão e aumentaram seu lucro com o GestorMEI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0 shadow-xl shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:scale-105">
                Começar Agora - É Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10"
              onClick={handleStartDemo}
            >
              <Play className="w-5 h-5 mr-2" />
              Ver Demo
            </Button>
          </div>
          <p className="text-sm text-slate-500">
            ✓ Não precisa de cartão de crédito • ✓ Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo/ICONE - FB.svg" alt="GestorMEI" className="w-8 h-8" />
                <span className="text-lg font-bold text-white">GestorMEI</span>
              </div>
              <p className="text-sm text-slate-400">
                Simplificando a gestão financeira do MEI brasileiro.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Produto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Planos</a></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Criar Conta</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Suporte</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">WhatsApp</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2025 GestorMEI. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">Feito com ❤️ para o MEI brasileiro</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
