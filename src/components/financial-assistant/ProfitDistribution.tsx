import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, FileText, PiggyBank, RefreshCw } from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Distribution {
  retiradaPessoal: number;
  reinvestimento: number;
  impostos: number;
  reserva: number;
}

export function ProfitDistribution() {
  const [lucroLiquido, setLucroLiquido] = useState(0);
  const [distribution, setDistribution] = useState<Distribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    calculateDistribution();
  }, []);

  const calculateDistribution = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());

      // Receitas
      const { data: sales } = await supabase
        .from("sales")
        .select("total")
        .eq("owner_id", user.id)
        .eq("canceled", false)
        .gte("date", currentMonthStart.toISOString())
        .lte("date", currentMonthEnd.toISOString());

      const receita = sales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;

      // Custos
      const { data: saleItems } = await supabase
        .from("sale_items")
        .select("quantity, custo_unitario")
        .eq("owner_id", user.id)
        .gte("created_at", currentMonthStart.toISOString())
        .lte("created_at", currentMonthEnd.toISOString());

      const custos = saleItems?.reduce((sum, item) => {
        return sum + (Number(item.quantity) * Number(item.custo_unitario || 0));
      }, 0) || 0;

      // Despesas
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("owner_id", user.id)
        .gte("expense_date", format(currentMonthStart, "yyyy-MM-dd"))
        .lte("expense_date", format(currentMonthEnd, "yyyy-MM-dd"));

      const despesas = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      const lucro = receita - custos - despesas;
      setLucroLiquido(lucro);

      // Calcular distribuição (50% / 30% / 10% / 10%)
      const dist: Distribution = {
        retiradaPessoal: lucro * 0.5,
        reinvestimento: lucro * 0.3,
        impostos: lucro * 0.1,
        reserva: lucro * 0.1,
      };

      setDistribution(dist);

    } catch (error) {
      console.error("Erro ao calcular distribuição:", error);
      toast.error("Erro ao calcular distribuição do lucro");
    } finally {
      setLoading(false);
    }
  };

  const savePlan = async () => {
    if (!distribution) return;

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const mesReferencia = format(new Date(), "yyyy-MM");

      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());

      // Recalcular totais
      const { data: sales } = await supabase
        .from("sales")
        .select("total")
        .eq("owner_id", user.id)
        .eq("canceled", false)
        .gte("date", currentMonthStart.toISOString())
        .lte("date", currentMonthEnd.toISOString());

      const receita = sales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;

      const { data: saleItems } = await supabase
        .from("sale_items")
        .select("quantity, custo_unitario")
        .eq("owner_id", user.id)
        .gte("created_at", currentMonthStart.toISOString())
        .lte("created_at", currentMonthEnd.toISOString());

      const custos = saleItems?.reduce((sum, item) => {
        return sum + (Number(item.quantity) * Number(item.custo_unitario || 0));
      }, 0) || 0;

      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("owner_id", user.id)
        .gte("expense_date", format(currentMonthStart, "yyyy-MM-dd"))
        .lte("expense_date", format(currentMonthEnd, "yyyy-MM-dd"));

      const despesas = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      // Salvar no banco
      const { error } = await supabase
        .from("planejamento_financeiro")
        .upsert({
          owner_id: user.id,
          mes_referencia: mesReferencia,
          receita_total: receita,
          custos: custos,
          despesas: despesas,
          lucro_liquido: lucroLiquido,
          retirada_sugerida: distribution.retiradaPessoal,
          reinvestimento_sugerido: distribution.reinvestimento,
          impostos_sugerido: distribution.impostos,
          reserva_sugerida: distribution.reserva,
        }, {
          onConflict: "owner_id,mes_referencia"
        });

      if (error) throw error;

      toast.success("Planejamento salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar planejamento:", error);
      toast.error("Erro ao salvar planejamento");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!distribution) return null;

  const hasProfit = lucroLiquido > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Lucro Líquido do Mês
          </CardTitle>
          <CardDescription>
            Como você pode distribuir seu lucro de forma inteligente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Lucro disponível</p>
            <p className={`text-4xl font-bold ${hasProfit ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(lucroLiquido)}
            </p>
            {!hasProfit && (
              <Badge variant="destructive" className="mt-2">
                Sem lucro para distribuir este mês
              </Badge>
            )}
          </div>

          {hasProfit && (
            <>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Retirada Pessoal (50%)</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(distribution.retiradaPessoal)}
                    </span>
                  </div>
                  <Progress value={50} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Quanto você pode usar sem afetar o negócio
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Reinvestimento (30%)</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {formatCurrency(distribution.reinvestimento)}
                    </span>
                  </div>
                  <Progress value={30} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Para estoque, marketing, expansão
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">Impostos (10%)</span>
                    </div>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(distribution.impostos)}
                    </span>
                  </div>
                  <Progress value={10} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Reserva para DAS e tributos
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Reserva de Emergência (10%)</span>
                    </div>
                    <span className="font-bold text-purple-600">
                      {formatCurrency(distribution.reserva)}
                    </span>
                  </div>
                  <Progress value={10} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Segurança financeira do negócio
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={savePlan} disabled={saving} className="flex-1">
                  {saving ? "Salvando..." : "Salvar Planejamento"}
                </Button>
                <Button onClick={calculateDistribution} variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💡 Dicas de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Retirada Pessoal:</strong> Use para suas necessidades pessoais sem culpa</p>
          <p>• <strong>Reinvestimento:</strong> Compre mais estoque, invista em marketing ou melhore seu negócio</p>
          <p>• <strong>Impostos:</strong> Guarde para o DAS e evite surpresas</p>
          <p>• <strong>Reserva:</strong> Crie um colchão financeiro para emergências</p>
        </CardContent>
      </Card>
    </div>
  );
}
