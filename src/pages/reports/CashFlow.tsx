import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportPeriodSelector } from "@/components/reports/ReportPeriodSelector";
import { ReportCard } from "@/components/reports/ReportCard";
import { EmptyReportState } from "@/components/reports/EmptyReportState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Download, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DailyFlow {
  date: string;
  inflows: number;
  outflows: number;
  balance: number;
}

interface CashFlowData {
  daily_flow: DailyFlow[];
}

export default function CashFlow() {
  const [loading, setLoading] = useState(false);
  const [cashFlowData, setCashFlowData] = useState<CashFlowData | null>(null);
  const [startDate, setStartDate] = useState(subDays(new Date(), 29));
  const [endDate, setEndDate] = useState(new Date());
  const { user } = useAuth();
  const { toast } = useToast();

  const loadCashFlow = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('calculate_cash_flow' as any, {
        p_owner_id: user.id,
        p_start_date: format(startDate, 'yyyy-MM-dd'),
        p_end_date: format(endDate, 'yyyy-MM-dd')
      });

      if (error) throw error;
      setCashFlowData(data as CashFlowData);
    } catch (error) {
      console.error('Erro ao carregar fluxo de caixa:', error);
      toast({
        title: "Erro ao carregar fluxo de caixa",
        description: "Não foi possível carregar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCashFlow();
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

  const calculateSummary = () => {
    if (!cashFlowData?.daily_flow) return { totalInflows: 0, totalOutflows: 0, balance: 0 };

    const totalInflows = cashFlowData.daily_flow.reduce((sum, day) => sum + day.inflows, 0);
    const totalOutflows = cashFlowData.daily_flow.reduce((sum, day) => sum + day.outflows, 0);
    const balance = totalInflows - totalOutflows;

    return { totalInflows, totalOutflows, balance };
  };

  const summary = calculateSummary();

  const chartData = cashFlowData?.daily_flow.map((day, index) => {
    const cumulativeBalance = cashFlowData.daily_flow
      .slice(0, index + 1)
      .reduce((sum, d) => sum + d.balance, 0);
    
    return {
      date: format(parseISO(day.date), 'dd/MM', { locale: ptBR }),
      Entradas: day.inflows,
      Saídas: day.outflows,
      'Saldo Acumulado': cumulativeBalance,
    };
  }) || [];

  const currentBalance = chartData.length > 0 ? chartData[chartData.length - 1]['Saldo Acumulado'] : 0;
  const hasNegativeBalance = currentBalance < 0;

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe suas entradas e saídas diárias
          </p>
        </div>
        <Button disabled={!cashFlowData || loading} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Período de Análise</CardTitle>
          <CardDescription>Selecione o período para visualizar o fluxo de caixa</CardDescription>
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
      ) : !cashFlowData?.daily_flow || cashFlowData.daily_flow.length === 0 ? (
        <EmptyReportState 
          title="Nenhum movimento encontrado"
          message="Não há entradas ou saídas registradas no período selecionado."
        />
      ) : (
        <>
          {hasNegativeBalance && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-900/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="text-red-600 dark:text-red-400 font-semibold">
                    ⚠️ Atenção: Seu caixa está negativo
                  </p>
                </div>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-2">
                  Saldo atual: {formatCurrency(currentBalance)}. Priorize recebimentos e reduza gastos.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReportCard
              title="Total de Entradas"
              value={formatCurrency(summary.totalInflows)}
              subtitle="Receitas no período"
              color="green"
              icon={TrendingUp}
            />
            <ReportCard
              title="Total de Saídas"
              value={formatCurrency(summary.totalOutflows)}
              subtitle="Despesas no período"
              color="red"
              icon={TrendingDown}
            />
            <ReportCard
              title="Saldo do Período"
              value={formatCurrency(summary.balance)}
              subtitle={summary.balance >= 0 ? "Positivo" : "Negativo"}
              color={summary.balance >= 0 ? "blue" : "red"}
              icon={DollarSign}
            />
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Evolução do Fluxo de Caixa</CardTitle>
              <CardDescription>Entradas, saídas e saldo acumulado por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="Entradas" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="Saídas" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="Saldo Acumulado" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Detalhamento Diário</CardTitle>
              <CardDescription>Movimentações detalhadas por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Entradas</TableHead>
                      <TableHead className="text-right">Saídas</TableHead>
                      <TableHead className="text-right">Saldo Diário</TableHead>
                      <TableHead className="text-right">Saldo Acumulado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashFlowData.daily_flow.map((day, index) => {
                      const cumulativeBalance = cashFlowData.daily_flow
                        .slice(0, index + 1)
                        .reduce((sum, d) => sum + d.balance, 0);
                      
                      return (
                        <TableRow key={day.date}>
                          <TableCell className="font-medium">
                            {format(parseISO(day.date), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(day.inflows)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(day.outflows)}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${day.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(day.balance)}
                          </TableCell>
                          <TableCell className={`text-right font-semibold ${cumulativeBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(cumulativeBalance)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
