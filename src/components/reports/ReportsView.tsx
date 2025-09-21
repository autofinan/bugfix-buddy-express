import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Download, TrendingUp, DollarSign, Package, ShoppingCart } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { useProducts } from "@/hooks/useProducts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

import { DateRange } from "react-day-picker";

export default function ReportsView() {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const { data: sales = [] } = useSales();
  const { data: products = [] } = useProducts();

  // Filter sales by date range
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return dateRange?.from && dateRange?.to && saleDate >= dateRange.from && saleDate <= dateRange.to;
  });

  // Sales by day chart data
  const salesByDay = dateRange?.from && dateRange?.to ? eachDayOfInterval({
    start: dateRange.from,
    end: dateRange.to
  }).map(day => {
    const dayStart = new Date(day.setHours(0, 0, 0, 0));
    const dayEnd = new Date(day.setHours(23, 59, 59, 999));
    
    const daySales = filteredSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= dayStart && saleDate <= dayEnd;
    });
    
    const total = daySales.reduce((sum, sale) => sum + sale.total, 0);
    
    return {
      date: format(day, "dd/MM"),
      vendas: total,
      quantidade: daySales.length
    };
  }) : [];

  // Payment methods distribution
  const paymentMethods = filteredSales.reduce((acc, sale) => {
    const method = sale.payment_method || 'Outros';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentData = Object.entries(paymentMethods).map(([method, count]) => ({
    name: method === 'cash' ? 'Dinheiro' : method === 'card' ? 'Cartão' : method === 'pix' ? 'PIX' : method,
    value: count
  }));

  // Top products
  const topProducts = products
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)
    .map(product => ({
      name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
      estoque: product.stock,
      valor: product.price
    }));

  const exportReport = () => {
    // Simple CSV export
    const csvData = filteredSales.map(sale => ({
      Data: format(new Date(sale.date), "dd/MM/yyyy HH:mm"),
      Total: sale.total.toFixed(2),
      Pagamento: sale.payment_method,
      Observacoes: sale.note || ""
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-vendas-${format(new Date(), "dd-MM-yyyy")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada do seu negócio</p>
        </div>
        <Button onClick={exportReport} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Relatório de Vendas</SelectItem>
            <SelectItem value="products">Relatório de Produtos</SelectItem>
            <SelectItem value="financial">Relatório Financeiro</SelectItem>
          </SelectContent>
        </Select>
        
        <DateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Faturamento</p>
              <p className="text-2xl font-bold">R$ {totalSales.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Vendas</p>
              <p className="text-2xl font-bold">{totalTransactions}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold">R$ {averageTicket.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Produtos</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Vendas por Dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Vendas']}
              />
              <Line type="monotone" dataKey="vendas" stroke="hsl(var(--primary))" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Métodos de Pagamento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Top Produtos por Estoque</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="estoque" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}