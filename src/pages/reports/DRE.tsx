import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportPeriodSelector } from "@/components/reports/ReportPeriodSelector";
import { ReportCard } from "@/components/reports/ReportCard";
import { EmptyReportState } from "@/components/reports/EmptyReportState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import jsPDF from "jspdf";

interface DREData {
  revenue: number;
  direct_costs: number;
  gross_profit: number;
  gross_margin: number;
  operational_expenses: number;
  operational_profit: number;
  operational_margin: number;
  taxes_fees: number;
  net_profit: number;
  net_margin: number;
}

export default function DRE() {
  const [loading, setLoading] = useState(false);
  const [dreData, setDreData] = useState<DREData | null>(null);
  const [startDate, setStartDate] = useState(subDays(new Date(), 29));
  const [endDate, setEndDate] = useState(new Date());
  const { user } = useAuth();
  const { toast } = useToast();

  const loadDRE = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('calculate_dre' as any, {
        p_owner_id: user.id,
        p_start_date: format(startDate, 'yyyy-MM-dd'),
        p_end_date: format(endDate, 'yyyy-MM-dd')
      });

      if (error) throw error;
      setDreData(data as DREData);
    } catch (error) {
      console.error('Erro ao carregar DRE:', error);
      toast({
        title: "Erro ao carregar DRE",
        description: "Não foi possível carregar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDRE();
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

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const exportPDF = () => {
    if (!dreData) return;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('DRE - Demonstração de Resultado do Exercício', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Período: ${format(startDate, 'dd/MM/yyyy')} a ${format(endDate, 'dd/MM/yyyy')}`, 20, 30);
    
    let y = 50;
    const lineHeight = 10;
    
    doc.setFontSize(14);
    doc.text('RECEITAS', 20, y);
    y += lineHeight;
    
    doc.setFontSize(11);
    doc.text(`(+) Receita Bruta: ${formatCurrency(dreData.revenue)}`, 30, y);
    y += lineHeight * 1.5;
    
    doc.setFontSize(14);
    doc.text('CUSTOS', 20, y);
    y += lineHeight;
    
    doc.setFontSize(11);
    doc.text(`(-) Custos Diretos: ${formatCurrency(dreData.direct_costs)}`, 30, y);
    y += lineHeight;
    doc.setFontSize(12);
    doc.text(`= Lucro Bruto: ${formatCurrency(dreData.gross_profit)} (${formatPercent(dreData.gross_margin)})`, 30, y);
    y += lineHeight * 1.5;
    
    doc.setFontSize(14);
    doc.text('DESPESAS', 20, y);
    y += lineHeight;
    
    doc.setFontSize(11);
    doc.text(`(-) Despesas Operacionais: ${formatCurrency(dreData.operational_expenses)}`, 30, y);
    y += lineHeight;
    doc.setFontSize(12);
    doc.text(`= Lucro Operacional: ${formatCurrency(dreData.operational_profit)} (${formatPercent(dreData.operational_margin)})`, 30, y);
    y += lineHeight * 1.5;
    
    doc.setFontSize(14);
    doc.text('IMPOSTOS E TAXAS', 20, y);
    y += lineHeight;
    
    doc.setFontSize(11);
    doc.text(`(-) Impostos e Taxas: ${formatCurrency(dreData.taxes_fees)}`, 30, y);
    y += lineHeight;
    doc.setFontSize(12);
    doc.text(`= Lucro Líquido: ${formatCurrency(dreData.net_profit)} (${formatPercent(dreData.net_margin)})`, 30, y);
    
    doc.save(`DRE_${format(startDate, 'ddMMyyyy')}_${format(endDate, 'ddMMyyyy')}.pdf`);
    
    toast({
      title: "PDF gerado!",
      description: "O relatório DRE foi exportado com sucesso.",
    });
  };

  const chartData = dreData ? [
    { name: 'Margem Bruta', value: dreData.gross_margin, fill: '#3b82f6' },
    { name: 'Margem Operacional', value: dreData.operational_margin, fill: '#f59e0b' },
    { name: 'Margem Líquida', value: dreData.net_margin, fill: dreData.net_profit >= 0 ? '#22c55e' : '#ef4444' },
  ] : [];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">DRE - Demonstração de Resultado</h1>
          <p className="text-muted-foreground mt-1">
            Análise completa do resultado financeiro do seu negócio
          </p>
        </div>
        <Button onClick={exportPDF} disabled={!dreData || loading} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Período de Análise</CardTitle>
          <CardDescription>Selecione o período para visualizar o DRE</CardDescription>
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
          <Skeleton className="h-64" />
        </div>
      ) : !dreData || dreData.revenue === 0 ? (
        <EmptyReportState 
          title="Nenhum dado encontrado"
          message="Não há vendas ou despesas registradas no período selecionado."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReportCard
              title="Lucro Bruto"
              value={formatCurrency(dreData.gross_profit)}
              subtitle={`Margem: ${formatPercent(dreData.gross_margin)}`}
              color="blue"
              icon={DollarSign}
            />
            <ReportCard
              title="Lucro Operacional"
              value={formatCurrency(dreData.operational_profit)}
              subtitle={`Margem: ${formatPercent(dreData.operational_margin)}`}
              color="yellow"
              icon={TrendingUp}
            />
            <ReportCard
              title="Lucro Líquido"
              value={formatCurrency(dreData.net_profit)}
              subtitle={`Margem: ${formatPercent(dreData.net_margin)}`}
              color={dreData.net_profit >= 0 ? "green" : "red"}
              icon={dreData.net_profit >= 0 ? TrendingUp : TrendingDown}
            />
          </div>

          {dreData.net_profit < 0 && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-900/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <p className="text-red-600 dark:text-red-400 font-semibold">
                    Atenção: Seu negócio teve prejuízo neste período
                  </p>
                </div>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-2">
                  Revise suas despesas e considere aumentar as vendas ou ajustar preços.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Margens de Lucro (%)</CardTitle>
              <CardDescription>Comparativo das margens por tipo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  <Legend />
                  <Bar dataKey="value" name="Margem %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Demonstração Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">RECEITAS</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">(+) Receita Bruta</span>
                    <span className="font-semibold text-green-600">{formatCurrency(dreData.revenue)}</span>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">CUSTOS</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">(-) Custos Diretos</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(dreData.direct_costs)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    <span className="font-semibold">(=) Lucro Bruto</span>
                    <span className="font-bold text-blue-600">{formatCurrency(dreData.gross_profit)} ({formatPercent(dreData.gross_margin)})</span>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-2">DESPESAS</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">(-) Despesas Operacionais</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(dreData.operational_expenses)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                    <span className="font-semibold">(=) Lucro Operacional</span>
                    <span className="font-bold text-yellow-600">{formatCurrency(dreData.operational_profit)} ({formatPercent(dreData.operational_margin)})</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">IMPOSTOS E TAXAS</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">(-) Impostos e Taxas</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(dreData.taxes_fees)}</span>
                  </div>
                  <div className={`flex justify-between items-center p-2 rounded ${dreData.net_profit >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                    <span className="font-semibold">(=) Lucro Líquido</span>
                    <span className={`font-bold text-lg ${dreData.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(dreData.net_profit)} ({formatPercent(dreData.net_margin)})
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
