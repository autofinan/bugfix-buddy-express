import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Wallet, TrendingUp, Shield, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DistributionItem {
  icon: any;
  label: string;
  percentage: number;
  description: string;
  color: string;
}

export function FinancialOverviewFree() {
  // Distribuição padrão 50/30/20
  const distributions: DistributionItem[] = [
    {
      icon: Wallet,
      label: "Retirada (Pró-labore)",
      percentage: 50,
      description: "Para seu salário mensal",
      color: "bg-blue-500"
    },
    {
      icon: Shield,
      label: "Reserva de Emergência",
      percentage: 30,
      description: "Para imprevistos",
      color: "bg-green-500"
    },
    {
      icon: TrendingUp,
      label: "Reinvestimento",
      percentage: 20,
      description: "Para crescer o negócio",
      color: "bg-purple-500"
    }
  ];

  // Exemplo de valores (apenas demonstração visual)
  const lucroLiquidoExemplo = 1000;

  return (
    <div className="space-y-6">
      <Alert className="border-primary/20 bg-primary/5">
        <Crown className="h-4 w-4 text-primary" />
        <AlertDescription>
          Distribuição Inteligente de Lucro disponível nos planos Básico e Pro. 
          Upgrade para receber sugestões personalizadas baseadas na sua realidade.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Distribuição Padrão de Lucro
          </CardTitle>
          <CardDescription>Sugestão básica para organizar seu lucro líquido</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visualização com barras de progresso e valores */}
          <div className="space-y-4">
            {distributions.map((item, index) => {
              const Icon = item.icon;
              const valor = lucroLiquidoExemplo * (item.percentage / 100);
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">R$ {valor.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                    </div>
                  </div>
                  
                  <Progress value={item.percentage} className="h-3" />
                  
                  <p className="text-xs text-muted-foreground pl-6">{item.description}</p>
                </div>
              );
            })}
          </div>

          {/* Total visual */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="font-semibold">Lucro Líquido Total:</span>
              <span className="text-xl font-bold">R$ {lucroLiquidoExemplo.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              *Valores demonstrativos para ilustração da distribuição
            </p>
          </div>

          {/* Gráfico visual de pizza simplificado */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3 text-center">Visualização da Distribuição</p>
            <div className="flex gap-1 h-12 rounded-lg overflow-hidden">
              {distributions.map((item, index) => (
                <div 
                  key={index}
                  className={`${item.color} flex items-center justify-center text-xs font-bold text-white`}
                  style={{ width: `${item.percentage}%` }}
                >
                  {item.percentage}%
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1">
              {distributions.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className={`w-3 h-3 rounded ${item.color}`}></div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Esta é uma sugestão genérica. Com a <strong>Distribuição Inteligente</strong>, 
              você recebe sugestões personalizadas baseadas na sua margem, histórico e objetivos.
            </p>
            <Button 
              className="w-full"
              onClick={() => window.open('/settings?tab=plans', '_self')}
            >
              <Crown className="mr-2 h-4 w-4" />
              Desbloquear Distribuição Inteligente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
