import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Brain, 
  Receipt,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Info
} from 'lucide-react';

const Demo: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set demo mode
    localStorage.setItem('gestormei_demo_mode', 'true');
  }, []);

  const handleStartDemo = () => {
    // Redirect to demo dashboard with fictional data
    navigate('/demo/dashboard');
  };

  const demoFeatures = [
    {
      icon: ShoppingCart,
      title: 'PDV Rápido',
      description: 'Teste o ponto de venda completo com produtos fictícios',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Package,
      title: 'Gestão de Estoque',
      description: 'Veja como funciona o controle de produtos e alertas',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: BarChart3,
      title: 'Relatórios',
      description: 'Explore DRE, Curva ABC e Fluxo de Caixa com dados de exemplo',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Brain,
      title: 'Assistente IA',
      description: 'Converse com a IA sobre os dados fictícios',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Receipt,
      title: 'Orçamentos',
      description: 'Crie orçamentos e veja como enviar via WhatsApp',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo/gestormei-icon.png" alt="GestorMEI" className="w-10 h-10" />
            <div>
              <span className="text-xl font-bold">GestorMEI</span>
              <Badge className="ml-2 bg-amber-500/20 text-amber-400 border-0">
                DEMO
              </Badge>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => navigate('/auth')}
          >
            Criar Conta Real
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300">Modo Demonstração</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Explore o GestorMEI com dados fictícios
            </span>
          </h1>
          
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            Esta é uma demonstração completa do sistema. Você terá acesso a todas as funcionalidades 
            do plano <span className="text-purple-400 font-medium">Pro</span> com dados de exemplo 
            para testar à vontade.
          </p>

          <Button 
            size="lg" 
            className="h-14 px-10 text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0 shadow-xl shadow-emerald-500/30"
            onClick={handleStartDemo}
          >
            <Play className="w-5 h-5 mr-2" />
            Iniciar Demonstração
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Info Box */}
        <Card className="bg-blue-500/10 border-blue-500/20 mb-10">
          <CardContent className="p-5 flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-1">O que esperar da demo</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Sistema completo com <span className="text-emerald-400">acesso Pro</span></li>
                <li>• Dados fictícios de produtos, vendas, clientes e despesas</li>
                <li>• Todas as funcionalidades disponíveis para teste</li>
                <li>• Nada será salvo permanentemente - é apenas demonstração</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {demoFeatures.map((feature, index) => (
            <Card key={index} className="bg-slate-800/30 border-white/5 hover:border-white/10 transition-all">
              <CardContent className="p-5">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-3">
            Gostou? Crie sua conta grátis!
          </h2>
          <p className="text-slate-400 mb-6">
            Comece a usar o GestorMEI de verdade, sem compromisso.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
              onClick={() => navigate('/auth')}
            >
              Criar Conta Grátis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              size="lg"
              className="w-full sm:w-auto h-12 px-8 bg-slate-700 hover:bg-slate-600 border border-white/20 text-white"
              onClick={handleStartDemo}
            >
              Continuar na Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
