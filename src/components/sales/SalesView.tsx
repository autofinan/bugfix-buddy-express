import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, DollarSign, FileText } from "lucide-react";
import { useSales } from "@/hooks/useSales";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { DateRange } from "react-day-picker";

export default function SalesView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [viewingSaleId, setViewingSaleId] = useState<string | null>(null);
  
  const { data: sales = [], isLoading, refetch } = useSales(dateRange?.from, dateRange?.to, searchTerm);
  const cancelSale = useCancelSale();

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + (sale.total_profit || 0), 0);

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendas</h1>
          <p className="text-muted-foreground">Acompanhe suas vendas e relatórios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total em Vendas</p>
              <p className="text-2xl font-bold">R$ {totalSales.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Lucro Total</p>
              <p className="text-2xl font-bold text-green-600">R$ {totalProfit.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total de Vendas</p>
              <p className="text-2xl font-bold">{sales.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando vendas...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <Card key={sale.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Venda #{sale.id.slice(0, 8)}</p>
                      {sale.canceled && (
                        <Badge variant="destructive">Cancelada</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sale.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pagamento: {sale.payment_method === 'cash' ? 'Dinheiro' : 
                                 sale.payment_method === 'card' ? 'Cartão' :
                                 sale.payment_method === 'pix' ? 'PIX' : sale.payment_method}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold">R$ {sale.total.toFixed(2)}</p>
                    {sale.total_profit && (
                      <p className="text-sm text-green-600">
                        Lucro: R$ {sale.total_profit.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            {sales.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma venda encontrada</p>
              </div>
            )}
          </div>
        )}
      </Card>

      <SaleDetailsModal
        saleId={viewingSaleId}
        open={!!viewingSaleId}
        onOpenChange={(open) => !open && setViewingSaleId(null)}
      />
    </div>
  );
}