import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DREFree() {
  return (
    <div className="space-y-6">
      <Card className="shadow-md bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            O que é DRE?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            DRE (Demonstração de Resultado do Exercício) mostra se seu negócio está tendo lucro ou prejuízo. 
            É como um raio-X financeiro do seu MEI.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Estrutura do DRE</CardTitle>
            <Badge variant="secondary">
              <Crown className="h-3 w-3 mr-1" />
              Plano Free
            </Badge>
          </div>
          <CardDescription>Entenda como funciona - Dados reais no Básico e Pro</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estrutura explicativa sem dados reais */}
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <h3 className="font-semibold text-lg mb-2">1. RECEITAS</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>(+) Receita Bruta:</strong> Todo o dinheiro que entrou com vendas
              </p>
              <div className="bg-white dark:bg-gray-900 p-3 rounded">
                <p className="text-muted-foreground">Seus dados aparecerão aqui</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
              <h3 className="font-semibold text-lg mb-2">2. CUSTOS</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>(-) Custos Diretos:</strong> Quanto você gastou para produzir/comprar o que vendeu
              </p>
              <div className="bg-white dark:bg-gray-900 p-3 rounded">
                <p className="text-muted-foreground">Seus dados aparecerão aqui</p>
              </div>
              <p className="text-sm font-semibold mt-2 text-blue-600">
                = Lucro Bruto (Receita - Custos)
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <h3 className="font-semibold text-lg mb-2">3. DESPESAS</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>(-) Despesas Operacionais:</strong> Gastos fixos (aluguel, luz, internet, etc)
              </p>
              <div className="bg-white dark:bg-gray-900 p-3 rounded">
                <p className="text-muted-foreground">Seus dados aparecerão aqui</p>
              </div>
              <p className="text-sm font-semibold mt-2 text-yellow-600">
                = Lucro Operacional (Lucro Bruto - Despesas)
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
              <h3 className="font-semibold text-lg mb-2">4. IMPOSTOS E TAXAS</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>(-) Impostos:</strong> DAS do MEI e taxas de cartão
              </p>
              <div className="bg-white dark:bg-gray-900 p-3 rounded">
                <p className="text-muted-foreground">Seus dados aparecerão aqui</p>
              </div>
              <p className="text-sm font-semibold mt-2 text-green-600">
                = Lucro Líquido Final (O que sobra de verdade)
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Com o <strong>DRE completo</strong> nos planos Básico e Pro, você vê todos os seus números reais 
              e entende exatamente para onde seu dinheiro está indo.
            </p>
            <Button 
              className="w-full"
              onClick={() => window.open('/settings?tab=plans', '_self')}
            >
              <Crown className="mr-2 h-4 w-4" />
              Ver meu DRE completo no Plano Básico
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
