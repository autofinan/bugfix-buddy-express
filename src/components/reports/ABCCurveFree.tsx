import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ABCCurveFree() {
  return (
    <div className="space-y-6">
      <Card className="shadow-md bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            O que é Curva ABC?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A Curva ABC classifica seus produtos por importância nas vendas:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <h4 className="font-semibold">CLASSE A (80%)</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">FOCO MÁXIMO</p>
              <p className="text-xs">Produtos que geram a maior parte da receita</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <h4 className="font-semibold">CLASSE B (15%)</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">ATENÇÃO</p>
              <p className="text-xs">Produtos com importância moderada</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <h4 className="font-semibold">CLASSE C (5%)</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">AVALIAR</p>
              <p className="text-xs">Produtos com menor impacto</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top 3 Produtos Mais Vendidos</CardTitle>
            <Badge variant="secondary">
              <Crown className="h-3 w-3 mr-1" />
              Plano Free
            </Badge>
          </div>
          <CardDescription>Versão básica - Upgrade para análise completa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[1, 2, 3].map((index) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/30">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-muted-foreground">Produto #{index}</p>
                    <p className="text-sm text-muted-foreground">Dados disponíveis no plano Básico</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-muted-foreground">--</p>
                    <p className="text-xs text-muted-foreground">unidades vendidas</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico borrado */}
          <div className="relative mt-6">
            <div className="opacity-20 blur-md pointer-events-none">
              <div className="w-full h-64 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-lg flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground" />
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
                      Análise completa no Plano Básico
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Veja todos os seus produtos classificados por importância e receba sugestões inteligentes.
                    </p>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => window.open('/settings?tab=plans', '_self')}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Desbloquear Curva ABC Completa
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
