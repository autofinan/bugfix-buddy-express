import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import { 
  Search, 
  Eye, 
  Download, 
  CreditCard, 
  Banknote, 
  Smartphone,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
  Share2
} from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { exportSalesToCSV, ExportSale } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { SaleDetailsModal } from "./SaleDetailsModal";

interface Sale {
  id: string;
  date: string;
  total: number;
  subtotal?: number;
  discount_type?: string;
  discount_value?: number;
  payment_method: "pix" | "cartao" | "dinheiro" | "pending";
  note: string | null;
  created_at: string;
  total_profit?: number;
  profit_margin_percentage?: number;
  canceled?: boolean;
  cancel_reason?: string;
  canceled_at?: string;
  owner_id?: string;
}

interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name?: string;
}

const paymentMethodLabels = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  pending: "Pendente"
};

const paymentMethodIcons = {
  pix: Smartphone,
  cartao: CreditCard,
  dinheiro: Banknote,
  pending: RotateCcw,
  default: CreditCard
} as const;

export function SalesViewEnhanced() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_sales_with_profit');

      if (error) throw error;
      
      setSales((data || []).map((sale: any) => ({
        ...sale,
        payment_method: sale.payment_method as "pix" | "cartao" | "dinheiro" | "pending"
      })));
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar vendas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleItems = async (saleId: string) => {
    try {
      setLoadingItems(true);
      const { data, error } = await supabase
        .from("sale_items")
        .select(`
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          products (
            name
          )
        `)
        .eq("sale_id", saleId);

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        product_name: item.products?.name || "Produto não encontrado"
      }));
    } catch (error) {
      console.error("Erro ao carregar itens da venda:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens da venda",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoadingItems(false);
    }
  };

  const handleToggleExpand = async (saleId: string) => {
    const newExpanded = new Set(expandedSales);
    if (newExpanded.has(saleId)) {
      newExpanded.delete(saleId);
      setSaleItems(prev => prev.filter(item => {
        const itemSaleId = item.id.split('-')[0];
        return itemSaleId !== saleId;
      }));
    } else {
      newExpanded.add(saleId);
      const items = await fetchSaleItems(saleId);
      setSaleItems(prev => [...prev, ...items.map(item => ({ ...item, id: `${saleId}-${item.id}` }))]);
    }
    setExpandedSales(newExpanded);
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = !search || 
      sale.id.toLowerCase().includes(search.toLowerCase()) ||
      sale.note?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "completed" && !sale.canceled) ||
      (statusFilter === "canceled" && sale.canceled) ||
      (statusFilter === "converted" && sale.note?.includes("Convertido do orçamento"));
    
    const matchesPayment = paymentFilter === "all" || sale.payment_method === paymentFilter;
    
    const matchesDate = !dateRange?.from || !dateRange?.to || 
      isWithinInterval(new Date(sale.created_at), { 
        start: dateRange.from, 
        end: dateRange.to 
      });
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const getStatusBadge = (sale: Sale) => {
    if (sale.canceled) {
      return <Badge variant="destructive" className="text-xs">Cancelada</Badge>;
    }
    if (sale.note?.includes("Convertido do orçamento")) {
      return <Badge variant="secondary" className="text-xs">Orçamento Convertido</Badge>;
    }
    return <Badge variant="default" className="text-xs">Concluída</Badge>;
  };

  const handleExportCSV = async () => {
    try {
      const exportData: ExportSale[] = filteredSales.map(sale => ({
        id: sale.id,
        date: sale.date,
        total: Number(sale.total),
        payment_method: sale.payment_method,
        note: sale.note,
        total_profit: sale.total_profit || 0,
        profit_margin: sale.profit_margin_percentage || 0,
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDownloadNF = async (saleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const projectRef = 'rllpfnmhelrnombjyiuz';
      const url = `https://${projectRef}.supabase.co/functions/v1/generate-nf-pdf?id=${saleId}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar dados');

      const nfData = await response.json();
      
      const { generateNFPDF } = await import('@/utils/generateNFPDF');
      const pdfBlob = await generateNFPDF(nfData);
      
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `nota-fiscal-${saleId.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast({
        title: "Nota Fiscal gerada",
        description: "O download iniciou automaticamente."
      });
    } catch (error) {
      console.error('Erro ao baixar NF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a nota fiscal.",
        variant: "destructive"
      });
    }
  };

  const handleShareWhatsApp = (saleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://gestormei.vercel.app/nf/${saleId}`;
    const message = `Olá! Segue sua Nota Fiscal da venda #${saleId.substring(0, 8).toUpperCase()}%0A%0AVisualizar: ${url}`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.total_profit || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando vendas...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        {/* Header - Responsivo */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vendas</h1>
            <p className="text-sm text-muted-foreground">Gerencie e analise suas vendas</p>
          </div>
          <Button onClick={handleExportCSV} variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Summary Cards - Grid Responsivo */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card className="p-3 sm:p-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Total de Vendas</p>
              <p className="text-xl sm:text-2xl font-bold">{filteredSales.length}</p>
            </div>
          </Card>
          
          <Card className="p-3 sm:p-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Receita Total</p>
              <p className="text-xl sm:text-2xl font-bold">{formatCurrency(totalSales)}</p>
            </div>
          </Card>
          
          <Card className="p-3 sm:p-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Lucro Total</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</p>
            </div>
          </Card>
          
          <Card className="p-3 sm:p-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-xl sm:text-2xl font-bold">
                {formatCurrency(filteredSales.length > 0 ? totalSales / filteredSales.length : 0)}
              </p>
            </div>
          </Card>
        </div>

        {/* Filters - Responsivo */}
        <div className="space-y-3 sm:space-y-4">
          <EnhancedDatePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por ID ou observações..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">Concluídas</TabsTrigger>
                <TabsTrigger value="canceled" className="text-xs">Canceladas</TabsTrigger>
                <TabsTrigger value="converted" className="text-xs">Orçamentos</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os métodos</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sales List - Responsivo */}
        <div className="space-y-3 sm:space-y-4">
          {filteredSales.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground text-sm">Nenhuma venda encontrada</p>
              </CardContent>
            </Card>
          ) : (
            filteredSales.map((sale) => {
              const PaymentIcon = paymentMethodIcons[sale.payment_method as keyof typeof paymentMethodIcons] || paymentMethodIcons.default;
              const isExpanded = expandedSales.has(sale.id);
              const saleItemsData = saleItems.filter(item => {
                const itemSaleId = item.id.split('-')[0];
                return itemSaleId === sale.id;
              });
              
              return (
                <Card key={sale.id}>
                  <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      {/* Informações da venda */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-sm sm:text-lg">
                            Venda - {format(new Date(sale.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                          </CardTitle>
                          {getStatusBadge(sale)}
                          <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            <PaymentIcon className="h-3 w-3" />
                            {paymentMethodLabels[sale.payment_method]}
                          </Badge>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">
                          ID: {sale.id}
                        </p>
                        {sale.note && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            Obs: {sale.note}
                          </p>
                        )}
                      </div>

                      {/* Valores e botões */}
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-right">
                          <div className="text-xl sm:text-2xl font-bold">{formatCurrency(Number(sale.total))}</div>
                          {sale.total_profit !== undefined && (
                            <div className="text-xs sm:text-sm">
                              <div className="text-green-600 font-medium">
                                Lucro: {formatCurrency(sale.total_profit)}
                              </div>
                              <div className="text-muted-foreground text-[10px] sm:text-xs">
                                Margem: {(sale.profit_margin_percentage || 0).toFixed(1)}%
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Botões de ação - Responsivo */}
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSaleId(sale.id);
                              setShowDetailsModal(true);
                            }}
                            title="Ver Detalhes"
                            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleDownloadNF(sale.id, e)}
                            title="Baixar Nota Fiscal"
                            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                          >
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleShareWhatsApp(sale.id, e)}
                            title="Compartilhar no WhatsApp"
                            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                          >
                            <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleExpand(sale.id);
                            }}
                            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0 p-3 sm:p-6">
                      <div className="space-y-4">
                        {/* Sale Items */}
                        <div>
                          <h4 className="font-medium mb-3 text-sm sm:text-base">Itens da Venda</h4>
                          {loadingItems ? (
                            <div className="text-center py-4">
                              <div className="text-muted-foreground text-sm">Carregando itens...</div>
                            </div>
                          ) : saleItemsData.length > 0 ? (
                            <div className="space-y-2">
                              {saleItemsData.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{item.product_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Qtd: {item.quantity} × {formatCurrency(item.unit_price)}
                                    </p>
                                  </div>
                                  <div className="text-right ml-2">
                                    <p className="font-medium text-sm">{formatCurrency(item.total_price)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-muted-foreground">Nenhum item encontrado</p>
                          )}
                        </div>

                        {/* Sale Details - Grid Responsivo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <h4 className="font-medium mb-2 text-sm">Informações da Venda</h4>
                            <div className="space-y-2 text-xs sm:text-sm">
                              <div className="flex justify-between gap-2">
                                <span className="text-muted-foreground">Data:</span>
                                <span className="text-right">{format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                              </div>
                              <div className="flex justify-between gap-2 items-center">
                                <span className="text-muted-foreground">Status:</span>
                                {getStatusBadge(sale)}
                              </div>
                              <div className="flex justify-between gap-2">
                                <span className="text-muted-foreground">Pagamento:</span>
                                <span>{paymentMethodLabels[sale.payment_method]}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2 text-sm">Valores</h4>
                            <div className="space-y-2 text-xs sm:text-sm">
                              <div className="flex justify-between gap-2">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>{formatCurrency(Number(sale.subtotal || sale.total))}</span>
                              </div>
                              {sale.discount_value && sale.discount_value > 0 && (
                                <div className="flex justify-between gap-2">
                                  <span className="text-muted-foreground">Desconto:</span>
                                  <span>
                                    {sale.discount_type === 'percentage' 
                                      ? `${sale.discount_value}%` 
                                      : formatCurrency(sale.discount_value)
                                    }
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between gap-2 font-medium">
                                <span>Total:</span>
                                <span>{formatCurrency(Number(sale.total))}</span>
                              </div>
                              {sale.total_profit !== undefined && (
                                <>
                                  <div className="flex justify-between gap-2 text-green-600">
                                    <span>Lucro:</span>
                                    <span>{formatCurrency(sale.total_profit)}</span>
                                  </div>
                                  <div className="flex justify-between gap-2 text-muted-foreground">
                                    <span>Margem:</span>
                                    <span>{(sale.profit_margin_percentage || 0).toFixed(1)}%</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Cancel Info */}
                        {sale.canceled && (
                          <div className="pt-4 border-t">
                            <h4 className="font-medium mb-2 text-destructive text-sm">Informações do Cancelamento</h4>
                            <div className="space-y-2 text-xs sm:text-sm">
                              <div className="flex justify-between gap-2">
                                <span className="text-muted-foreground">Data do Cancelamento:</span>
                                <span className="text-right">
                                  {sale.canceled_at ? format(new Date(sale.canceled_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "N/A"}
                                </span>
                              </div>
                              {sale.cancel_reason && (
                                <div>
                                  <span className="text-muted-foreground">Motivo:</span>
                                  <p className="mt-1 text-xs sm:text-sm bg-destructive/10 p-2 rounded">
                                    {sale.cancel_reason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      <SaleDetailsModal
        saleId={selectedSaleId}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        onDeleted={() => {
          fetchSales();
          setShowDetailsModal(false);
          setSelectedSaleId(null);
        }}
      />
    </>
  );
}
