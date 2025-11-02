import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText, TrendingUp, DollarSign, Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { exportSalesToCSV, ExportSale } from "@/utils/exportUtils";

interface DetailedSaleReport {
  sale_id: string;
  sale_date: string;
  product_name: string;
  category_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_cost: number | null;
  profit: number;
  payment_method: string;
  sale_status: "completed" | "canceled" | "converted";
  created_at: string;
}

interface SummaryData {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  totalCost: number;
  totalItems: number;
}

const paymentMethodLabels = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  pending: "Pendente"
};

const statusLabels = {
  completed: "Concluída",
  canceled: "Cancelada",
  converted: "Orçamento Convertido"
};

export function ReportsViewEnhanced() {
  const [dateRange, setDateRange] = useState<DateRange>();
  const [salesReport, setSalesReport] = useState<DetailedSaleReport[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalCost: 0,
    totalItems: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      generateReport();
    }
  }, [dateRange]);

  const generateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    try {
      setLoading(true);

      // Buscar vendas com itens e produtos
      const { data: salesData, error: salesError } = await supabase
        .from("sale_items")
        .select(`
          id,
          sale_id,
          quantity,
          unit_price,
          total_price,
          custo_unitario,
          sales (
            id,
            date,
            payment_method,
            canceled,
            note,
            created_at
          ),
          products (
            name,
            categories (
              name
            )
          )
        `)
        .gte("sales.created_at", dateRange.from.toISOString())
        .lte("sales.created_at", dateRange.to.toISOString());

      if (salesError) throw salesError;

      // Processar dados do relatório
      const reportData: DetailedSaleReport[] = (salesData || []).map((item: any) => {
        const sale = item.sales;
        const product = item.products;
        const unitCost = item.custo_unitario || 0;
        const profit = item.total_price - (unitCost * item.quantity);

        let status: "completed" | "canceled" | "converted" = "completed";
        if (sale?.canceled) {
          status = "canceled";
        } else if (sale?.note?.includes("Convertido do orçamento")) {
          status = "converted";
        }

        return {
          sale_id: item.sale_id,
          sale_date: sale?.date || sale?.created_at,
          product_name: product?.name || "Produto não encontrado",
          category_name: product?.categories?.name || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          unit_cost: unitCost,
          profit: profit,
          payment_method: sale?.payment_method || "unknown",
          sale_status: status,
          created_at: sale?.created_at
        };
      });

      setSalesReport(reportData);

      // Calcular dados de resumo
      const summary = reportData.reduce((acc, item) => {
        if (item.sale_status !== "canceled") {
          acc.totalRevenue += item.total_price;
          acc.totalProfit += item.profit;
          acc.totalCost += (item.unit_cost || 0) * item.quantity;
          acc.totalItems += item.quantity;
        }
        return acc;
      }, {
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
        totalCost: 0,
        totalItems: 0
      });

      // Contar vendas únicas (não canceladas)
      const uniqueSales = new Set(
        reportData
          .filter(item => item.sale_status !== "canceled")
          .map(item => item.sale_id)
      );
      summary.totalSales = uniqueSales.size;

      setSummaryData(summary);

    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (!salesReport.length) {
      toast({
        title: "Aviso",
        description: "Não há dados para exportar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Agrupar por venda para exportar dados consolidados
      const salesMap = new Map();
      
      salesReport.forEach(item => {
        if (!salesMap.has(item.sale_id)) {
          salesMap.set(item.sale_id, {
            id: item.sale_id,
            date: item.sale_date,
            total: 0,
            payment_method: item.payment_method,
            note: item.sale_status === "converted" ? "Convertido do orçamento" : "",
            total_profit: 0,
            profit_margin: 0,
            created_at: item.created_at
          });
        }
        
        const sale = salesMap.get(item.sale_id);
        sale.total += item.total_price;
        sale.total_profit += item.profit;
      });

      // Calcular margem de lucro para cada venda
      const exportData: ExportSale[] = Array.from(salesMap.values()).map(sale => ({
        ...sale,
        profit_margin: sale.total > 0 ? (sale.total_profit / sale.total) * 100 : 0
      }));

      exportSalesToCSV(exportData);
      
      toast({
        title: "Exportação concluída",
        description: "Relatório exportado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Concluída</Badge>;
      case "canceled":
        return <Badge variant="destructive">Cancelada</Badge>;
      case "converted":
        return <Badge variant="secondary">Orçamento Convertido</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada das vendas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" disabled={!salesReport.length}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Período do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedDatePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {salesReport.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Total de Vendas</p>
                  <p className="text-lg font-bold">{summaryData.totalSales}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Receita Total</p>
                  <p className="text-lg font-bold">{formatCurrency(summaryData.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Lucro Total</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(summaryData.totalProfit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Itens Vendidos</p>
                  <p className="text-lg font-bold">{summaryData.totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Margem Média</p>
                  <p className="text-lg font-bold">
                    {summaryData.totalRevenue > 0 
                      ? `${((summaryData.totalProfit / summaryData.totalRevenue) * 100).toFixed(1)}%`
                      : "0%"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Report Table */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando relatório...</div>
          </CardContent>
        </Card>
      ) : salesReport.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {dateRange?.from && dateRange?.to 
                  ? "Nenhuma venda encontrada no período selecionado"
                  : "Selecione um período para gerar o relatório"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Relatório Detalhado de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesReport.map((item, index) => (
                    <TableRow key={`${item.sale_id}-${index}`}>
                      <TableCell>
                        {format(new Date(item.sale_date), "dd/MM/yy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>
                        {item.category_name ? (
                          <Badge variant="outline">{item.category_name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Sem categoria</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total_price)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency((item.unit_cost || 0) * item.quantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.profit >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(item.profit)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {paymentMethodLabels[item.payment_method as keyof typeof paymentMethodLabels] || item.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.sale_status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}