import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Budget {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  subtotal: number;
  discount_type: string | null;
  discount_value: number;
  total: number;
  status: 'open' | 'converted' | 'canceled';
  notes: string | null;
  valid_until: string | null;
  created_at: string;
  converted_sale_id: string | null;
}

interface BudgetItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    name: string;
  };
}

interface BudgetDetailsProps {
  budget: Budget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BudgetDetails({ budget, open, onOpenChange }: BudgetDetailsProps) {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && budget.id) {
      fetchBudgetItems();
    }
  }, [open, budget.id]);

  const fetchBudgetItems = async () => {
    try {
      const { data, error } = await supabase
        .from("budget_items")
        .select(`
          id,
          product_id,
          quantity,
          unit_price,
          total_price
        `)
        .eq("budget_id", budget.id);

      if (error) throw error;

      // Buscar nomes dos produtos separadamente
      const itemsWithProducts = await Promise.all(
        (data || []).map(async (item) => {
          const { data: productData } = await supabase
            .from("products")
            .select("name")
            .eq("id", item.product_id)
            .single();

          return {
            ...item,
            products: { name: productData?.name || "Produto não encontrado" }
          };
        })
      );

      setItems(itemsWithProducts);
    } catch (error) {
      console.error("Erro ao buscar itens do orçamento:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Orçamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{budget.customer_name || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{budget.customer_email || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{budget.customer_phone || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(budget.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data de Criação</p>
                  <p className="font-medium">{new Date(budget.created_at).toLocaleDateString()}</p>
                </div>
                {budget.valid_until && (
                  <div>
                    <p className="text-sm text-muted-foreground">Válido até</p>
                    <p className="font-medium">{new Date(budget.valid_until).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {budget.notes && (
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="font-medium">{budget.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Itens do Orçamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Itens do Orçamento</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Carregando itens...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.products.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity}x R$ {item.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">R$ {item.total_price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {budget.subtotal.toFixed(2)}</span>
                </div>
                
                {budget.discount_value > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>
                      Desconto ({budget.discount_type === 'percentage' ? `${budget.discount_value}%` : 'Fixo'}):
                    </span>
                    <span>
                      - R$ {budget.discount_type === 'percentage' 
                        ? ((budget.subtotal * budget.discount_value) / 100).toFixed(2)
                        : budget.discount_value.toFixed(2)
                      }
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>R$ {budget.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}