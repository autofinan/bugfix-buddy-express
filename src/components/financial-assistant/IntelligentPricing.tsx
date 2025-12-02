import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, TrendingUp, AlertCircle } from "lucide-react";
import type { FinancialSnapshot } from "@/services/financialSnapshot";

interface IntelligentPricingProps {
  snapshot: FinancialSnapshot | null;
}

export function IntelligentPricing({ snapshot }: IntelligentPricingProps) {
  const [productName, setProductName] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [desiredMargin, setDesiredMargin] = useState("30");
  const [result, setResult] = useState<{
    preco_sugerido: number;
    preco_minimo: number;
    preco_maximo: number;
    explicacao: string;
  } | null>(null);

  const calcularPreco = () => {
    if (!snapshot || !acquisitionCost) {
      return;
    }

    const custo = parseFloat(acquisitionCost);
    const margemDesejada = parseFloat(desiredMargin) / 100;
    const margemMedia = snapshot.periodo_atual.margem_bruta / 100;

    // Preço sugerido com margem desejada
    const precoSugerido = custo / (1 - margemDesejada);

    // Preço mínimo (margem de 15%)
    const precoMinimo = custo / (1 - 0.15);

    // Preço máximo considerando margem média + 50%
    const precoMaximo = custo / (1 - (margemMedia * 1.5));

    let explicacao = `Com base no seu custo de ${formatCurrency(custo)}, `;

    if (margemDesejada > margemMedia) {
      explicacao += `a margem desejada de ${desiredMargin}% está acima da sua margem média atual (${snapshot.periodo_atual.margem_bruta.toFixed(1)}%). `;
      explicacao += `Isso é ótimo! Mantenha esse preço se o mercado aceitar. `;
    } else if (margemDesejada < margemMedia) {
      explicacao += `a margem desejada de ${desiredMargin}% está abaixo da sua margem média (${snapshot.periodo_atual.margem_bruta.toFixed(1)}%). `;
      explicacao += `Considere aumentar o preço para melhorar sua rentabilidade. `;
    } else {
      explicacao += `a margem desejada está alinhada com sua margem média atual. Bom equilíbrio! `;
    }

    explicacao += `O preço mínimo garante uma margem de segurança de 15%.`;

    setResult({
      preco_sugerido: precoSugerido,
      preco_minimo: precoMinimo,
      preco_maximo: precoMaximo,
      explicacao,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Precificação Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="product-name">Nome do Produto</Label>
            <Input
              id="product-name"
              placeholder="Ex: Camiseta Básica"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Custo de Aquisição (R$)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              placeholder="Ex: 25.00"
              value={acquisitionCost}
              onChange={(e) => setAcquisitionCost(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="margin">Margem Desejada (%)</Label>
            <Input
              id="margin"
              type="number"
              step="1"
              placeholder="Ex: 30"
              value={desiredMargin}
              onChange={(e) => setDesiredMargin(e.target.value)}
            />
            {snapshot && (
              <p className="text-xs text-muted-foreground">
                Sua margem bruta média: {snapshot.periodo_atual.margem_bruta.toFixed(1)}%
              </p>
            )}
          </div>

          <Button onClick={calcularPreco} className="w-full" disabled={!acquisitionCost}>
            <Calculator className="h-4 w-4 mr-2" />
            Calcular Preço Ideal
          </Button>
        </div>

        {result && (
          <div className="space-y-4 pt-4 border-t">
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div>
                    <strong>Preço Sugerido:</strong>{" "}
                    <span className="text-lg font-bold text-green-700 dark:text-green-400">
                      {formatCurrency(result.preco_sugerido)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <strong>Preço Mínimo:</strong> {formatCurrency(result.preco_minimo)}
                  </div>
                  <div className="text-sm">
                    <strong>Preço Máximo:</strong> {formatCurrency(result.preco_maximo)}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="text-sm">{result.explicacao}</p>
              </AlertDescription>
            </Alert>

            {snapshot && snapshot.produtos_mais_vendidos && (
              <div className="space-y-2">
                <p className="text-sm font-medium">💡 Dica: Produtos similares mais vendidos</p>
                {snapshot.produtos_mais_vendidos.slice(0, 3).map((produto) => (
                  <div
                    key={produto.id}
                    className="text-xs bg-muted p-2 rounded flex justify-between"
                  >
                    <span>{produto.name}</span>
                    <span className="font-medium">{formatCurrency(produto.preco_medio)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
