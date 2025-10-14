import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  BarChart3,
  CreditCard,
  Bell,
  Smartphone,
  Cloud,
  Shield,
  Zap
} from "lucide-react";

interface Improvement {
  title: string;
  description: string;
  impact: 'Alto' | 'Médio' | 'Baixo';
  priority: 'Urgente' | 'Alta' | 'Média' | 'Baixa';
  icon: React.ComponentType<any>;
  category: 'Funcionalidade' | 'UX/UI' | 'Automação' | 'Relatórios' | 'Integração';
}

const improvements: Improvement[] = [
  {
    title: "Dashboard Financeiro Avançado",
    description: "Visão consolidada com gráficos de receitas vs despesas, fluxo de caixa e previsões",
    impact: "Alto",
    priority: "Alta",
    icon: BarChart3,
    category: "Relatórios"
  },
  {
    title: "Gestão de Clientes (CRM)",
    description: "Cadastro completo de clientes, histórico de compras e segmentação",
    impact: "Alto",
    priority: "Alta",
    icon: Users,
    category: "Funcionalidade"
  },
  {
    title: "Controle de Estoque Mínimo",
    description: "Alertas automáticos quando produtos atingem estoque mínimo",
    impact: "Médio",
    priority: "Média",
    icon: Bell,
    category: "Automação"
  },
  {
    title: "Integração PIX",
    description: "Geração automática de QR codes PIX para pagamentos",
    impact: "Alto",
    priority: "Alta",
    icon: CreditCard,
    category: "Integração"
  },
  {
    title: "Backup Automático",
    description: "Backup automático dos dados na nuvem com versionamento",
    impact: "Alto",
    priority: "Urgente",
    icon: Cloud,
    category: "Funcionalidade"
  },
  {
    title: "App Mobile",
    description: "Aplicativo móvel para vendas, consultas e gestão básica",
    impact: "Alto",
    priority: "Média",
    icon: Smartphone,
    category: "UX/UI"
  },
  {
    title: "Relatórios Fiscais",
    description: "Relatórios para DASN-SIMEI e controle fiscal do MEI",
    impact: "Alto",
    priority: "Alta",
    icon: FileText,
    category: "Relatórios"
  },
  {
    title: "Agendamento de Serviços",
    description: "Agenda para prestadores de serviços com horários e clientes",
    impact: "Médio",
    priority: "Média",
    icon: Calendar,
    category: "Funcionalidade"
  },
  {
    title: "Metas e KPIs",
    description: "Definição de metas mensais e acompanhamento de indicadores",
    impact: "Médio",
    priority: "Baixa",
    icon: TrendingUp,
    category: "Relatórios"
  },
  {
    title: "Autenticação 2FA",
    description: "Autenticação de dois fatores para maior segurança",
    impact: "Médio",
    priority: "Média",
    icon: Shield,
    category: "Funcionalidade"
  },
  {
    title: "Automação de Emails",
    description: "Envio automático de orçamentos e lembretes por email",
    impact: "Médio",
    priority: "Baixa",
    icon: Zap,
    category: "Automação"
  },
  {
    title: "Modo Offline",
    description: "Funcionalidade básica offline com sincronização posterior",
    impact: "Médio",
    priority: "Baixa",
    icon: Lightbulb,
    category: "UX/UI"
  }
];

export function SystemImprovements() {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Alto': return 'bg-red-100 text-red-800 border-red-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixo': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgente': return 'bg-red-500 text-white';
      case 'Alta': return 'bg-orange-500 text-white';
      case 'Média': return 'bg-blue-500 text-white';
      case 'Baixa': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Funcionalidade': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'UX/UI': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Automação': return 'bg-green-100 text-green-800 border-green-200';
      case 'Relatórios': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Integração': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const urgentImprovements = improvements.filter(imp => imp.priority === 'Urgente');
  const highPriorityImprovements = improvements.filter(imp => imp.priority === 'Alta');
  const otherImprovements = improvements.filter(imp => !['Urgente', 'Alta'].includes(imp.priority));

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Roadmap de Melhorias</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Estas são as principais melhorias identificadas para transformar seu sistema em uma solução completa para MEIs.
          As melhorias estão organizadas por prioridade e impacto no negócio.
        </p>
      </div>

      {/* Melhorias Urgentes */}
      {urgentImprovements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-red-600">🚨 Urgentes</h3>
            <Badge variant="destructive">Implementar ASAP</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {urgentImprovements.map((improvement, index) => {
              const Icon = improvement.icon;
              return (
                <Card key={index} className="border-red-200 bg-red-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-lg">{improvement.title}</CardTitle>
                      </div>
                      <Badge className={getPriorityColor(improvement.priority)}>
                        {improvement.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{improvement.description}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getImpactColor(improvement.impact)}>
                        Impacto: {improvement.impact}
                      </Badge>
                      <Badge variant="outline" className={getCategoryColor(improvement.category)}>
                        {improvement.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Melhorias de Alta Prioridade */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-orange-600">⚡ Alta Prioridade</h3>
          <Badge variant="secondary">Próximas a implementar</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {highPriorityImprovements.map((improvement, index) => {
            const Icon = improvement.icon;
            return (
              <Card key={index} className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-orange-600" />
                      <CardTitle className="text-base">{improvement.title}</CardTitle>
                    </div>
                    <Badge className={getPriorityColor(improvement.priority)}>
                      {improvement.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{improvement.description}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getImpactColor(improvement.impact)}>
                      {improvement.impact}
                    </Badge>
                    <Badge variant="outline" className={getCategoryColor(improvement.category)}>
                      {improvement.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Outras Melhorias */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">💡 Futuras Melhorias</h3>
          <Badge variant="outline">Backlog</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherImprovements.map((improvement, index) => {
            const Icon = improvement.icon;
            return (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">{improvement.title}</CardTitle>
                    </div>
                    <Badge className={getPriorityColor(improvement.priority)}>
                      {improvement.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{improvement.description}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getImpactColor(improvement.impact)}>
                      {improvement.impact}
                    </Badge>
                    <Badge variant="outline" className={getCategoryColor(improvement.category)}>
                      {improvement.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h4 className="text-lg font-semibold text-blue-800">🎯 Próximos Passos</h4>
            <p className="text-blue-700">
              Recomendo focar nas melhorias <strong>Urgentes</strong> primeiro para garantir a estabilidade e segurança do sistema.
              Em seguida, implementar as de <strong>Alta Prioridade</strong> para maximizar o valor para os usuários MEI.
            </p>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">Semana 1-2</h5>
                <p className="text-blue-600">Backup automático e correções críticas</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">Semana 3-4</h5>
                <p className="text-blue-600">Dashboard financeiro e CRM básico</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">Mês 2</h5>
                <p className="text-blue-600">Integração PIX e relatórios fiscais</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}