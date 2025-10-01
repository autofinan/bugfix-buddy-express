import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, TrendingUp, Package, AlertTriangle, DollarSign, FileText, Calendar as CalendarPlusIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { exportSalesToCSV, ExportSale } from "@/utils/exportUtils";

interface DayReport {
  totalSales: number;
  numberOfSales: number;
  topProducts: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  lowStockProducts: {
    name: string;
    stock: number;
    min_stock: number;
  }[];
}

export default function ReportsView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [periodType, setPeriodType] = useState<"day" | "range" | "month">("day");
  const [report, setReport] = useState<DayReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateReport();
  }, [selectedDate, dateRange, periodType]);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      let startDate: Date, endDate: Date;

      if (periodType === "day") {
        startDate = startOfDay(selectedDate);
        endDate = endOfDay(selectedDate);
      } else if (periodType === "month") {
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
      } else if (periodType === "range" && dateRange?.from && dateRange?.to) {
        startDate = startOfDay(dateRange.from);
        endDate = endOfDay(dateRange.to);
      } else {
        return;
      }

      // Get sales for the selected date
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());

      if (salesError) throw salesError;

      // Get sale items with product details for the selected date
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          *,
          products (
            name
          ),
          sales!inner (
            date
          )
        `)
        .gte('sales.date', startDate.toISOString())
        .lte('sales.date', endDate.toISOString());

      if (itemsError) throw itemsError;

      // Get products with low stock
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('name, stock, min_stock')
        .eq('is_active', true)
        .gte('min_stock', 1); // Only products with min_stock set

      if (productsError) throw productsError;

      // Calculate report data
      const totalSales = sales?.reduce((sum, sale) => sum + sale.total, 0) || 0;
      const numberOfSales = sales?.length || 0;

      // Calculate top products
      const productSales = new Map<string, { quantity: number; revenue: number }>();
      
      saleItems?.forEach(item => {
        const productName = item.products?.name || 'Produto removido';
        const existing = productSales.get(productName) || { quantity: 0, revenue: 0 };
        productSales.set(productName, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.total_price
        });
      });

      const topProducts = Array.from(productSales.entries())
        .map(([name, data]) => ({
          name,
          quantity: data.quantity,
          revenue: data.revenue
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Calculate low stock products
      const lowStockProducts = products
        ?.filter(product => product.stock <= product.min_stock)
        .map(product => ({
          name: product.name,
          stock: product.stock,
          min_stock: product.min_stock
        }))
        .sort((a, b) => a.stock - b.stock) || [];

      setReport({
        totalSales,
        numberOfSales,
        topProducts,
        lowStockProducts
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = async () => {
    if (!report) return;

    try {
      let startDate: Date, endDate: Date;

      if (periodType === "day") {
        startDate = startOfDay(selectedDate);
        endDate = endOfDay(selectedDate);
      } else if (periodType === "month") {
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
      } else if (periodType === "range" && dateRange?.from && dateRange?.to) {
        startDate = startOfDay(dateRange.from);
        endDate = endOfDay(dateRange.to);
      } else {
        return;
      }

      // Get detailed sales data for the period
      const { data: sales, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (name, category_id, categories (name))
          )
        `)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: false });

      if (error) throw error;

      // Transform sales data for export
      const exportData: ExportSale[] = (sales || []).map(sale => ({
        id: sale.id,
        date: sale.date,
        total: Number(sale.total),
        payment_method: sale.payment_method,
        note: sale.note,
        total_profit: 0, // Calculate if needed
        profit_margin: 0, // Calculate if needed
        created_at: sale.created_at
      }));

      exportSalesToCSV(exportData);
      
      toast({
        title: "Relatório exportado",
        description: "Relatório de vendas exportado com sucesso!"
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <Button onClick={exportToCSV} disabled={!report || isLoading} className="bg-gradient-primary hover:opacity-90">
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Period Selection */}
      <Card className="border-primary/20 bg-gradient-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlusIcon className="h-5 w-5" />
            Selecionar Período
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={periodType} onValueChange={(value: "day" | "range" | "month") => setPeriodType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar tipo de período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Um dia específico</SelectItem>
              <SelectItem value="range">Intervalo de datas</SelectItem>
              <SelectItem value="month">Mês inteiro</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex flex-col sm:flex-row gap-4">
            {periodType === "day" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            )}

            {periodType === "month" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            )}

            {periodType === "range" && (
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Gerando relatório...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {report?.totalSales.toFixed(2) || '0,00'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Número de Vendas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report?.numberOfSales || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {report && report.numberOfSales > 0 
                    ? (report.totalSales / report.numberOfSales).toFixed(2) 
                    : '0,00'
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas de Estoque</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {report?.lowStockProducts.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                {report?.topProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma venda registrada para esta data
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Receita</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report?.topProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{product.quantity}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            R$ {product.revenue.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Low Stock Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Produtos Abaixo do Mínimo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report?.lowStockProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    ✅ Todos os produtos estão com estoque adequado
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Atual</TableHead>
                        <TableHead>Mínimo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report?.lowStockProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={product.stock === 0 ? "destructive" : "secondary"}
                            >
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.min_stock}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
