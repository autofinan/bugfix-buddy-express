import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSale } from "@/hooks/useSales";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Package, Calendar, CreditCard, FileText, AlertTriangle } from "lucide-react";

interface SaleDetailsModalProps {
  saleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaleDetailsModal({ saleId, open, onOpenChange }: SaleDetailsModalProps) {
  const { data: sale, isLoading } = useSale(saleId);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!sale) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>Venda não encontrada</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodMap: { [key: string]: { label: string; variant: "default" | "secondary" | "outline" } } = {
      pix: { label: "PIX", variant: "default" },
      cartao: { label: "Cartão", variant: "secondary" },
      dinheiro: { label: "Dinheiro", variant: "outline" },
    };

    const methodInfo = methodMap[method] || { label: method, variant: "outline" as const };
    
    return <Badge variant={methodInfo.variant}>{methodInfo.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Venda #{sale.id.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sale Info Header */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Data da Venda</p>
                  <p className="font-semibold">
                    {format(new Date(sale.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(sale.date), "HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pagamento</p>
                  {getPaymentMethodBadge(sale.payment_method)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={sale.canceled ? "destructive" : "default"}>
                    {sale.canceled ? "Cancelada" : "Concluída"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Info */}
          {sale.cliente_nome && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Informações do Cliente</h3>
              <p className="text-sm"><strong>Nome:</strong> {sale.cliente_nome}</p>
            </Card>
          )}

          {/* Items List */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Itens da Venda
            </h3>
            <div className="space-y-3">
              {sale.sale_items?.map((item) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.products?.name || "Produto não encontrado"}</h4>
                      {item.products?.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.products.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Qtd: {item.quantity}</span>
                        <span>Preço unitário: {formatCurrency(item.unit_price)}</span>
                        {item.custo_unitario && item.custo_unitario > 0 && (
                          <span>Custo: {formatCurrency(item.custo_unitario)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                      {item.custo_unitario && item.custo_unitario > 0 && (
                        <p className="text-xs text-green-600">
                          Lucro: {formatCurrency(item.total_price - (item.custo_unitario * item.quantity))}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Financial Summary */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Resumo Financeiro</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal || sale.total)}</span>
              </div>
              
              {sale.discount_value && sale.discount_value > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto ({sale.discount_type === 'percentage' ? '%' : 'fixo'}):</span>
                  <span>-{formatCurrency(sale.discount_value)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(sale.total)}</span>
              </div>

              {/* Profit Calculation */}
              {sale.sale_items?.some(item => item.custo_unitario && item.custo_unitario > 0) && (
                <>
                  <Separator />
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="flex justify-between text-green-700 dark:text-green-300">
                      <span>Lucro Total:</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          sale.sale_items?.reduce((profit, item) => {
                            if (item.custo_unitario) {
                              return profit + (item.total_price - (item.custo_unitario * item.quantity));
                            }
                            return profit;
                          }, 0) || 0
                        )}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Notes */}
          {sale.note && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Observações</h3>
              <p className="text-sm">{sale.note}</p>
            </Card>
          )}

          {/* Cancellation Info */}
          {sale.canceled && sale.canceled_at && (
            <Card className="p-4 border-destructive bg-destructive/5">
              <h3 className="font-semibold mb-2 text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Venda Cancelada
              </h3>
              <p className="text-sm">
                <strong>Cancelada em:</strong> {format(new Date(sale.canceled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
              {sale.cancel_reason && (
                <p className="text-sm mt-1">
                  <strong>Motivo:</strong> {sale.cancel_reason}
                </p>
              )}
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}