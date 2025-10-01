import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Search, BarChart3, CreditCard, Banknote, Smartphone, Download, Calendar } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { exportSalesToCSV, ExportSale } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { DateRangePicker } from "@/components/ui/date-range-picker";

interface Sale {
  id: string;
  date: string;
  total: number;
  payment_method: "pix" | "cartao" | "dinheiro";
  note: string | null;
  created_at: string;
  total_profit?: number;
  profit_margin?: number;
  total_revenue?: number;
  profit_margin_percentage?: number;
  owner_id?: string;
}

const paymentMethodLabels = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  debito: "Débito",
  credito_vista: "Crédito à Vista",
  credito_parcelado: "Crédito Parcelado",
  transferencia: "Transferência"
};

const paymentMethodIcons = {
  pix: Smartphone,
  cartao: CreditCard,
  dinheiro: Banknote,
  debito: CreditCard,
  credito_vista: CreditCard,
  credito_parcelado: CreditCard,
  transferencia: CreditCard
};

export default function SalesView() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [quickFilter, setQuickFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
  }, [dateRange]);

  useEffect(() => {
    applyQuickFilter();
  }, [quickFilter]);

  const applyQuickFilter = () => {
    const today = new Date();
    
    switch (quickFilter) {
      case "today":
        setDateRange({
          from: startOfDay(today),
          to: endOfDay(today)
        });
        break;
      case "last7days":
        setDateRange({
          from: startOfDay(subDays(today, 6)),
          to: endOfDay(today)
        });
        break;
      case "thisMonth":
        setDateRange({
          from: startOfMonth(today),
          to: endOfMonth(today)
        });
        break;
      case "all":
        setDateRange(undefined);
        break;
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      let query = supabase.rpc('get_sales_with_profit');

      // Apply date filter if dateRange is set
      if (dateRange?.from) {
        query = query.gte('date', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('date', dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setSales((data || []).map((sale: any) => ({
        ...sale,
        payment_method: sale.payment_method as "pix" | "cartao" | "dinheiro"
      })));
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.id.includes(search) || 
                         sale.note?.toLowerCase().includes(search.toLowerCase());
    const matchesPayment = paymentFilter === "all" || sale.payment_method === paymentFilter;
    
    return matchesSearch && matchesPayment;
  });

  const totalSales = filteredSales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.total_profit || 0), 0);

  const handleExportCSV = async () => {
    try {
      const exportData: ExportSale[] = filteredSales.map(sale => ({
        id: sale.id,
        date: sale.date,
        total: Number(sale.total),
        payment_method: sale.payment_method,
        note: sale.note,
        total_profit: sale.total_profit || 0,
        profit_margin: sale.profit_margin || 0,
        created_at: sale.created_at
      }));

      exportSalesToCSV(exportData);
      
      toast({
        title: "Exportação concluída",
        description: "Dados de vendas exportados com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Carregando vendas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <Button onClick={handleExportCSV} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total de Vendas</p>
            <p className="text-2xl font-bold">{filteredSales.length}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-2xl font-bold">R$ {totalSales.toFixed(2)}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Lucro Total</p>
            <p className="text-2xl font-bold text-green-600">R$ {totalProfit.toFixed(2)}</p>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Ticket Médio</p>
            <p className="text-2xl font-bold">
              R$ {filteredSales.length > 0 ? (totalSales / filteredSales.length).toFixed(2) : "0.00"}
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
        <Button
          variant={quickFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setQuickFilter("all")}
        >
          Todas
        </Button>
        <Button
          variant={quickFilter === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => setQuickFilter("today")}
        >
          Hoje
        </Button>
        <Button
          variant={quickFilter === "last7days" ? "default" : "outline"}
          size="sm"
          onClick={() => setQuickFilter("last7days")}
        >
          Últimos 7 dias
        </Button>
        <Button
          variant={quickFilter === "thisMonth" ? "default" : "outline"}
          size="sm"
          onClick={() => setQuickFilter("thisMonth")}
        >
          Este mês
        </Button>
        <Button
          variant={quickFilter === "custom" ? "default" : "outline"}
          size="sm"
          onClick={() => setQuickFilter("custom")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Personalizado
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID ou observações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {quickFilter === "custom" && (
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            className="w-full lg:w-auto"
          />
        )}
        
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Filtrar por pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os métodos</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="cartao">Cartão</SelectItem>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredSales.length === 0 ? (
        <div className="text-center py-8">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">
            {search || paymentFilter !== "all" ? "Nenhuma venda encontrada" : "Nenhuma venda registrada"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 overflow-x-auto">
          {filteredSales.map((sale) => {
            const PaymentIcon = paymentMethodIcons[sale.payment_method];
            
          return (
            <Card key={sale.id} className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">
                      #{sale.id.slice(-8)}
                    </span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {PaymentIcon && <PaymentIcon className="h-3 w-3" />}
                      {paymentMethodLabels[sale.payment_method as keyof typeof paymentMethodLabels] || sale.payment_method}
                    </Badge>
                  </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sale.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    
                    {sale.note && (
                      <p className="text-sm text-muted-foreground">
                        Obs: {sale.note}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right space-y-1">
                    <p className="text-xl font-bold">R$ {Number(sale.total).toFixed(2)}</p>
                    {sale.total_profit !== undefined && (
                      <div className="space-y-1">
                        <p className="text-sm text-green-600 font-medium">
                          Lucro: R$ {sale.total_profit.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Margem: {(sale.profit_margin_percentage || sale.profit_margin || 0).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
