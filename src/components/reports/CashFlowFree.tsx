import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Crown, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function CashFlowFree() {
  return (
    <div className="space-y-6">
      <Card className="shadow-md bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            O que é Fluxo de Caixa?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            O Fluxo de Caixa mostra quanto dinheiro entra e sai do seu negócio todos os dias. 
            É essencial para não ficar sem dinheiro no meio do mês.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold text-sm">Entradas</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Dinheiro que entra: vendas, recebimentos
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <h4 className="font-semibold text-sm">Saídas</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Dinheiro que sai: despesas, pagamentos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visão Introdutória</CardTitle>
            <Badge variant="secondary">
              <Crown className="h-3 w-3 mr-1" />
              Plano Free
            </Badge>
          </div>
          <CardDescription>Entradas e saídas ajudam você a prever dinheiro em caixa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exemplo visual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total de Entradas</p>
              <p className="text-2xl font-bold text-green-600">R$ --</p>
              <p className="text-xs text-muted-foreground mt-1">Dados no plano Básico</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total de Saídas</p>
              <p className="text-2xl font-bold text-red-600">R$ --</p>
              <p className="text-xs text-muted-foreground mt-1">Dados no plano Básico</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Saldo</p>
              <p className="text-2xl font-bold text-blue-600">R$ --</p>
              <p className="text-xs text-muted-foreground mt-1">Dados no plano Básico</p>
            </div>
          </div>

          {/* Gráfico borrado */}
          <div className="relative mt-6">
            <div className="opacity-20 blur-md pointer-events-none">
              <div className="w-full h-64 bg-gradient-to-br from-green-500/30 via-blue-500/30 to-red-500/30 rounded-lg flex items-center justify-center">
                <DollarSign className="h-24 w-24 text-muted-foreground" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Card className="max-w-sm border-2 border-primary shadow-lg">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-primary p-3 rounded-full">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-2">
                      Fluxo de Caixa completo no Básico
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Acompanhe diariamente suas entradas e saídas, veja saldo acumulado e evite surpresas no final do mês.
                    </p>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => window.open('/settings?tab=plans', '_self')}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Ver Fluxo de Caixa Completo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-semibold mb-2">💡 Por que o Fluxo de Caixa é importante?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Evita ficar sem dinheiro para pagar contas</li>
                <li>✓ Ajuda a planejar compras de estoque</li>
                <li>✓ Mostra se você pode fazer aquele investimento</li>
                <li>✓ Identifica meses com mais gastos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
