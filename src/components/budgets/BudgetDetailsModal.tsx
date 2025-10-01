import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Budget {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  subtotal: number;
  discount_type: string | null;
  discount_value: number;
  total: number;
  status: string;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
}

interface BudgetDetailsModalProps {
  budget: Budget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BudgetItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products?: {
    name: string;
    sku: string | null;
  };
}

export function BudgetDetailsModal({ budget, open, onOpenChange }: BudgetDetailsModalProps) {
  const { data: items, isLoading } = useQuery({
    queryKey: ["budget-items", budget?.id],
    queryFn: async () => {
      if (!budget?.id) return [];
      
      const { data, error } = await supabase
        .from("budget_items")
        .select("*")
        .eq("budget_id", budget.id);

      if (error) throw error;
      
      // Buscar informações dos produtos separadamente
      const itemsWithProducts = await Promise.all(
        (data || []).map(async (item) => {
          const { data: product } = await supabase
            .from("products")
            .select("name, sku")
            .eq("id", item.product_id)
            .single();
          
          return {
            ...item,
            products: product || undefined
          };
        })
      );
      
      return itemsWithProducts as BudgetItem[];
    },
    enabled: !!budget?.id,
  });

  if (!budget) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="default">Aberto</Badge>;
      case "converted":
        return <Badge variant="secondary">Convertido</Badge>;
      case "canceled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Orçamento</span>
            {getStatusBadge(budget.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Cliente */}
          {(budget.customer_name || budget.customer_email || budget.customer_phone) && (
            <div>
              <h3 className="font-semibold mb-3">Informações do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {budget.customer_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{budget.customer_name}</p>
                  </div>
                )}
                {budget.customer_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{budget.customer_email}</p>
                  </div>
                )}
                {budget.customer_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{budget.customer_phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informações Gerais */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Data de Criação</p>
              <p className="font-medium">
                {format(new Date(budget.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
            {budget.valid_until && (
              <div>
                <p className="text-sm text-muted-foreground">Válido até</p>
                <p className="font-medium">
                  {format(new Date(budget.valid_until), "dd/MM/yyyy", { locale: ptBR })}
                </p>
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
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
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
                      <TableCell className="text-right font-medium">
                        R$ {item.total_price.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">Nenhum produto encontrado</p>
            )}
          </div>

          {/* Totais */}
          <div className="border-t pt-4 space-y-2">
            {budget.subtotal !== budget.total && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>R$ {budget.subtotal.toFixed(2)}</span>
              </div>
            )}
            {budget.discount_value > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Desconto:</span>
                <span>
                  {budget.discount_type === "percentage" 
                    ? `${budget.discount_value}%` 
                    : `R$ ${budget.discount_value.toFixed(2)}`}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>R$ {budget.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Observações */}
          {budget.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Observações</p>
              <p className="text-sm bg-muted p-3 rounded-md">{budget.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
