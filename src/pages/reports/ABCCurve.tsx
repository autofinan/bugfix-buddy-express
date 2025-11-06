import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportPeriodSelector } from "@/components/reports/ReportPeriodSelector";
import { ReportCard } from "@/components/reports/ReportCard";
import { EmptyReportState } from "@/components/reports/EmptyReportState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Download, Package, AlertCircle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, subDays } from "date-fns";

interface ProductRevenue {
  id: string;
  name: string;
  revenue: number;
  quantity_sold: number;
  revenue_percentage: number;
  cumulative_percentage: number;
  class: 'A' | 'B' | 'C';
}

interface ABCData {
  class_a: ProductRevenue[];
  class_b: ProductRevenue[];
  class_c: ProductRevenue[];
  total_revenue: number;
}

const COLORS = {
  A: '#ef4444',
  B: '#eab308',
  C: '#22c55e',
};

export default function ABCCurve() {
  const [loading, setLoading] = useState(false);
  const [abcData, setAbcData] = useState<ABCData | null>(null);
  const [startDate, setStartDate] = useState(subDays(new Date(), 29));
  const [endDate, setEndDate] = useState(new Date());
  const { user } = useAuth();
  const { toast } = useToast();

  const loadABCCurve = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('calculate_abc_curve' as any, {
        p_owner_id: user.id,
        p_start_date: format(startDate, 'yyyy-MM-dd'),
        p_end_date: format(endDate, 'yyyy-MM-dd')
      });

      if (error) throw error;
      setAbcData(data as ABCData);
    } catch (error) {
      console.error('Erro ao carregar Curva ABC:', error);
      toast({
        title: "Erro ao carregar Curva ABC",
        description: "Não foi possível carregar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadABCCurve();
  }, [startDate, endDate, user]);

  const handlePeriodChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getSuggestion = (classType: 'A' | 'B' | 'C') => {
    switch (classType) {
      case 'A':
        return { icon: '🔥', text: 'Produto Essencial', color: 'red' as const };
      case 'B':
        return { icon: '⚠️', text: 'Monitore Estoque', color: 'yellow' as const };
      case 'C':
        return { icon: '💡', text: 'Avaliar Eliminação', color: 'green' as const };
    }
  };

  const chartData = abcData ? [
    { name: 'Classe A (80%)', value: abcData.class_a?.reduce((sum, p) => sum + p.revenue, 0) || 0, fill: COLORS.A },
    { name: 'Classe B (15%)', value: abcData.class_b?.reduce((sum, p) => sum + p.revenue, 0) || 0, fill: COLORS.B },
    { name: 'Classe C (5%)', value: abcData.class_c?.reduce((sum, p) => sum + p.revenue, 0) || 0, fill: COLORS.C },
  ] : [];

  const calculateClassRevenue = (products: ProductRevenue[]) => {
    return products?.reduce((sum, p) => sum + p.revenue, 0) || 0;
  };

  const renderProductTable = (products: ProductRevenue[], classType: 'A' | 'B' | 'C', title: string, description: string) => {
    if (!products || products.length === 0) return null;

    const suggestion = getSuggestion(classType);

    return (
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className={`bg-${suggestion.color}-100 text-${suggestion.color}-700 dark:bg-${suggestion.color}-900/20`}>
                  Classe {classType}
                </Badge>
                {title}
              </CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {products.length} produto(s)
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Qtd Vendida</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">% Receita</TableHead>
                  <TableHead>Ações Sugeridas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">{product.quantity_sold}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(product.revenue)}</TableCell>
                    <TableCell className="text-right">{product.revenue_percentage.toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`bg-${suggestion.color}-100 text-${suggestion.color}-700 dark:bg-${suggestion.color}-900/20`}>
                        {suggestion.icon} {suggestion.text}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Curva ABC de Produtos</h1>
          <p className="text-muted-foreground mt-1">
            Identifique quais produtos são mais importantes para seu negócio
          </p>
        </div>
        <Button disabled={!abcData || loading} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

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
              <ul className="text-xs space-y-1">
                <li>→ Nunca deixe faltar</li>
                <li>→ Negocie melhor com fornecedor</li>
                <li>→ Priorize estoque</li>
              </ul>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <h4 className="font-semibold">CLASSE B (15%)</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">ATENÇÃO</p>
              <ul className="text-xs space-y-1">
                <li>→ Mantenha estoque moderado</li>
                <li>→ Observe tendências</li>
              </ul>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <h4 className="font-semibold">CLASSE C (5%)</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">AVALIAR</p>
              <ul className="text-xs space-y-1">
                <li>→ Considere eliminar</li>
                <li>→ Faça promoções</li>
                <li>→ Libere capital parado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Período de Análise</CardTitle>
          <CardDescription>Selecione o período para visualizar a Curva ABC</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportPeriodSelector onChange={handlePeriodChange} defaultPeriod="30days" />
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      ) : !abcData || abcData.total_revenue === 0 ? (
        <EmptyReportState 
          title="Nenhum dado encontrado"
          message="Não há vendas de produtos no período selecionado."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReportCard
              title="Produtos Classe A"
              value={`${abcData.class_a?.length || 0} produtos`}
              subtitle={`${formatCurrency(calculateClassRevenue(abcData.class_a))} (80%)`}
              color="red"
              icon={AlertCircle}
            />
            <ReportCard
              title="Produtos Classe B"
              value={`${abcData.class_b?.length || 0} produtos`}
              subtitle={`${formatCurrency(calculateClassRevenue(abcData.class_b))} (15%)`}
              color="yellow"
              icon={Package}
            />
            <ReportCard
              title="Produtos Classe C"
              value={`${abcData.class_c?.length || 0} produtos`}
              subtitle={`${formatCurrency(calculateClassRevenue(abcData.class_c))} (5%)`}
              color="green"
              icon={TrendingUp}
            />
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Distribuição por Classe</CardTitle>
              <CardDescription>Participação de cada classe na receita total</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {renderProductTable(
              abcData.class_a,
              'A',
              'Produtos Essenciais',
              'Estes produtos representam 80% da sua receita. São a prioridade absoluta do seu negócio.'
            )}
            {renderProductTable(
              abcData.class_b,
              'B',
              'Produtos Complementares',
              'Representam 15% da receita. Mantenha atenção moderada nestes produtos.'
            )}
            {renderProductTable(
              abcData.class_c,
              'C',
              'Produtos de Baixo Impacto',
              'Apenas 5% da receita. Avalie se vale a pena manter em estoque.'
            )}
          </div>
        </>
      )}
    </div>
  );
}
