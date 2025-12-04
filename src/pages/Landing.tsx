import React from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

const Landing: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const features = [
    {
      icon: ShoppingCart,
      title: 'PDV Rápido e Intuitivo',
      description: 'Registre vendas em segundos com interface otimizada para agilidade no atendimento.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Brain,
      title: 'Assistente IA Financeiro',
      description: 'Converse com uma IA que analisa seus dados e sugere como aumentar seu lucro.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: BarChart3,
      title: 'Relatórios Inteligentes',
      description: 'DRE, Curva ABC e Fluxo de Caixa automatizados para decisões estratégicas.',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: Package,
      title: 'Controle de Estoque',
      description: 'Gerencie produtos, alertas de estoque baixo e movimentações em tempo real.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: Receipt,
      title: 'Orçamentos e Comprovantes',
      description: 'Crie orçamentos profissionais e envie comprovantes via WhatsApp ou PDF.',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Calculator,
      title: 'Precificação Inteligente',
      description: 'Calcule o preço ideal dos seus produtos considerando custos e margem desejada.',
      color: 'from-cyan-500 to-cyan-600',
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
      cta: 'Quero o Pro',
      popular: false,
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Loja de Roupas',
      content: 'Antes eu perdia horas calculando meu lucro. Agora em segundos sei exatamente quanto ganhei e a IA me ajuda a precificar melhor!',
      avatar: 'MS',
      rating: 5,
    },
    {
      name: 'João Santos',
      role: 'Food Truck',
      content: 'O PDV é muito rápido! Na correria do almoço consigo registrar tudo sem erro. O estoque se atualiza sozinho.',
      avatar: 'JS',
      rating: 5,
    },
    {
      name: 'Ana Costa',
      role: 'Salão de Beleza',
      content: 'A funcionalidade de serviços é perfeita. Controlo tudo: agendamentos, produtos usados e o lucro de cada atendimento.',
      avatar: 'AC',
      rating: 5,
    },
  ];

  const stats = [
    { value: '5.000+', label: 'MEIs usando' },
    { value: 'R$ 2M+', label: 'Gerenciados/mês' },
    { value: '98%', label: 'Satisfação' },
    { value: '24/7', label: 'Suporte IA' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                GestorMEI
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
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
          <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 py-4 space-y-3">
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
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 px-4">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/5 to-transparent rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Inteligência Artificial para MEI</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Seu negócio no
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                piloto automático
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              O sistema de gestão mais completo para MEI. PDV rápido, controle financeiro inteligente e uma 
              <span className="text-blue-400 font-medium"> IA que analisa seus dados</span> e te mostra como lucrar mais.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-105">
                  Começar Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                <Play className="w-5 h-5 mr-2" />
                Ver Demonstração
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 md:mt-24 relative">
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
              <div className="p-6 md:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Dashboard</h3>
                    <p className="text-sm text-slate-400">Bem-vindo ao seu Sistema POS</p>
                  </div>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                    Dezembro 2025
                  </Badge>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Vendas do Dia', value: 'R$ 2.450', color: 'emerald', icon: TrendingUp },
                    { label: 'Produtos', value: '234', color: 'blue', icon: Package },
                    { label: 'Clientes', value: '89', color: 'purple', icon: Users },
                    { label: 'Receita Mensal', value: 'R$ 45.780', color: 'amber', icon: BarChart3 },
                  ].map((card, index) => (
                    <div key={index} className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">{card.label}</span>
                        <card.icon className={`w-4 h-4 text-${card.color}-400`} />
                      </div>
                      <div className="text-xl font-bold text-white">{card.value}</div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Nova Venda', icon: ShoppingCart, color: 'blue' },
                    { label: 'Cadastrar', icon: Package, color: 'emerald' },
                    { label: 'Relatórios', icon: PieChart, color: 'purple' },
                  ].map((action, index) => (
                    <div key={index} className="p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-white/5 text-center hover:border-white/10 transition-colors cursor-pointer">
                      <div className={`w-10 h-10 rounded-lg bg-${action.color}-500/20 flex items-center justify-center mx-auto mb-2`}>
                        <action.icon className={`w-5 h-5 text-${action.color}-400`} />
                      </div>
                      <span className="text-sm text-slate-300">{action.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 border-blue-500/30 text-blue-400">
              Funcionalidades
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Tudo que você precisa em um só lugar
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              Do registro de vendas à análise financeira avançada. Simplifique sua gestão e foque no que importa: crescer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group bg-slate-800/30 border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 overflow-hidden">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Highlight */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
            <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 backdrop-blur-xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Destaque
                  </Badge>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Assistente IA que entende seu negócio
                  </h3>
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    Pergunte qualquer coisa sobre suas finanças. A IA analisa seus dados reais e te dá respostas precisas 
                    com sugestões práticas para aumentar seu lucro.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Análise de lucro por produto',
                      'Sugestões de precificação',
                      'Identificação de tendências',
                      'Alertas de estoque e vendas',
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-emerald-400" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="p-6 rounded-2xl bg-slate-800/80 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Assistente IA</div>
                        <div className="text-xs text-slate-400">Online agora</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-slate-300">
                        "Quanto lucrei com camisetas este mês?"
                      </div>
                      <div className="p-3 rounded-xl bg-slate-700/50 border border-white/5 text-sm text-slate-300">
                        <p className="mb-2">📊 Você vendeu <span className="text-emerald-400 font-medium">47 camisetas</span> este mês, com lucro de <span className="text-emerald-400 font-medium">R$ 1.645,00</span>.</p>
                        <p className="text-slate-400">💡 Dica: A margem está em 35%. Aumentar R$ 5 no preço pode gerar mais R$ 235/mês.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-400">
              Planos
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Escolha o plano ideal para você
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              Comece grátis e escale conforme seu negócio cresce. Sem surpresas, sem taxas escondidas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-6 md:p-8 rounded-3xl border transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-blue-500/10 to-purple-500/10 border-blue-500/30 scale-105 shadow-xl shadow-blue-500/20'
                    : 'bg-slate-800/30 border-white/5 hover:border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl md:text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3 text-slate-300 text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to="/auth">
                  <Button
                    className={`w-full h-12 text-base ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/25'
                        : 'bg-slate-700 hover:bg-slate-600 border-0'
                    }`}
                  >
                    {plan.cta}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 border-purple-500/30 text-purple-400">
              Depoimentos
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                MEIs que transformaram seu negócio
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/30 border-white/5 hover:border-white/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-white">{testimonial.name}</div>
                      <div className="text-sm text-slate-400">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 px-4 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Pronto para crescer?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Junte-se a milhares de MEIs que já simplificaram sua gestão financeira e aumentaram seu lucro com o GestorMEI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-105">
                Começar Agora - É Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Não precisa de cartão de crédito • Teste grátis por 14 dias
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">GestorMEI</span>
              </div>
              <p className="text-sm text-slate-400">
                Simplificando a gestão financeira do MEI brasileiro.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Planos</a></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Criar Conta</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">WhatsApp</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
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
