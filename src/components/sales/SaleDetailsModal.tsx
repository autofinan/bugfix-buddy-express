import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSaleItems } from "@/hooks/useSales";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

interface Sale {
  id: string;
  date: string;
  total: number;
  subtotal: number | null;
  discount_type: string | null;
  discount_value: number;
  payment_method: string;
  note: string | null;
  canceled: boolean;
  cancel_reason: string | null;
  cliente_nome: string | null;
  cliente_id: string | null;
}

interface SaleDetailsModalProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaleDetailsModal({ sale, open, onOpenChange }: SaleDetailsModalProps) {
  const { data: items, isLoading } = useSaleItems(sale?.id || "");
  
  // Buscar movimentações de estoque relacionadas à venda
  const { data: inventoryMovements } = useQuery({
    queryKey: ["inventory-movements", sale?.id],
    queryFn: async () => {
      if (!sale?.id) return [];
      
      const { data, error } = await supabase
        .from("inventory_movements")
        .select(`
          *,
          products (
            name,
            sku
          )
        `)
        .eq("type", "out")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Filtrar movimentos que correspondem aos itens desta venda
      const saleItemIds = items?.map(item => item.product_id) || [];
      return data?.filter(movement => 
        saleItemIds.includes(movement.product_id) &&
        new Date(movement.created_at).toDateString() === new Date(sale.date).toDateString()
      ) || [];
    },
    enabled: !!sale?.id && !!items,
  });

  if (!sale) return null;

  const totalProfit = items?.reduce((sum, item) => {
    const cost = item.custo_unitario || 0;
    const profit = (item.unit_price - cost) * item.quantity;
    return sum + profit;
  }, 0) || 0;

  const profitMargin = sale.total > 0 ? (totalProfit / sale.total) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes da Venda</span>
            {sale.canceled && (
              <Badge variant="destructive">Cancelada</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre esta transação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">ID da Venda</p>
              <p className="font-mono text-xs">{sale.id.substring(0, 8)}...</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-medium">
                {format(new Date(sale.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Forma de Pagamento</p>
              <p className="font-medium">{sale.payment_method}</p>
            </div>
            {sale.cliente_nome && (
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{sale.cliente_nome}</p>
              </div>
            )}
          </div>

          {/* Produtos */}
          <div>
            <h3 className="font-semibold mb-3">Produtos</h3>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando produtos...</p>
            ) : items && items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Custo Unit.</TableHead>
                    <TableHead className="text-right">Lucro Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const cost = item.custo_unitario || 0;
                    const profit = item.unit_price - cost;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.products?.name}</p>
                            {item.products?.sku && (
                              <p className="text-xs text-muted-foreground">SKU: {item.products.sku}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">R$ {item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {cost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <span className={profit >= 0 ? "text-green-600" : "text-red-600"}>
                            R$ {profit.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {item.total_price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">Nenhum produto encontrado</p>
            )}
          </div>

          {/* Totais e Lucro */}
          <div className="border-t pt-4 space-y-2">
            {sale.subtotal && sale.subtotal !== sale.total && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>R$ {sale.subtotal.toFixed(2)}</span>
              </div>
            )}
            {sale.discount_value > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Desconto:</span>
                <span>
                  {sale.discount_type === "percentage" 
                    ? `${sale.discount_value}%` 
                    : `R$ ${sale.discount_value.toFixed(2)}`}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>R$ {sale.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Lucro Estimado:</span>
              <span className={totalProfit >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                R$ {totalProfit.toFixed(2)} ({profitMargin.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Observações */}
          {sale.note && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Observações</p>
              <p className="text-sm bg-muted p-3 rounded-md">{sale.note}</p>
            </div>
          )}

          {/* Movimentações de Estoque */}
          {inventoryMovements && inventoryMovements.length > 0 && (
            <div>
              <Separator className="my-4" />
              <h3 className="font-semibold mb-3">Movimentações de Estoque</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryMovements.map((movement: any) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium">
                        {movement.products?.name || "Produto não encontrado"}
                      </TableCell>
                      <TableCell>
                        {movement.products?.sku || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-destructive font-mono">
                          -{movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Saída</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(movement.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movement.reason || "Venda"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Informações de Cancelamento */}
          {sale.canceled && sale.cancel_reason && (
            <>
              <Separator className="my-4" />
              <div className="bg-destructive/10 p-4 rounded-md">
                <p className="text-sm font-semibold text-destructive mb-1">Motivo do Cancelamento</p>
                <p className="text-sm">{sale.cancel_reason}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
