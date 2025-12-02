import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2, CreditCard, DollarSign, TrendingUp, Package, Download, FileText, Share2, Receipt } from "lucide-react";
import { generateSaleReceipt } from "@/utils/receiptUtils";

interface SaleItem {
  id: string;
  product_id: string | null;
  service_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  custo_unitario: number | null;
  products?: { name: string } | null;
  services?: { name: string } | null;
}

interface SalePayment {
  payment_method: string;
  amount: number;
  installments?: number;
}

interface SaleDetailsModalProps {
  saleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function SaleDetailsModal({
  saleId,
  open,
  onOpenChange,
  onDeleted,
}: SaleDetailsModalProps) {
  const [sale, setSale] = useState<any>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [payments, setPayments] = useState<SalePayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && saleId) {
      fetchSaleDetails();
      fetchStoreSettings();
    }
  }, [open, saleId]);

  const fetchStoreSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Erro ao buscar configurações:", error);
      }
      
      setStoreSettings(data);
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
    }
  };

  const fetchSaleDetails = async () => {
    if (!saleId) return;

    setLoading(true);
    try {
      // Buscar venda
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .select("*")
        .eq("id", saleId)
        .single();

      if (saleError) throw saleError;
      setSale(saleData);

      // Buscar itens
      const { data: itemsData, error: itemsError } = await supabase
        .from("sale_items")
        .select(`
          *,
          products (name),
          services (name)
        `)
        .eq("sale_id", saleId);

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      // Buscar formas de pagamento
      setPayments([{
        payment_method: saleData.payment_method,
        amount: saleData.total,
        installments: saleData.installments || 1
      }]);
    } catch (error: any) {
      console.error("Erro ao carregar detalhes da venda:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar detalhes da venda",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!saleId) return;

    setDeleting(true);
    try {
      const { error } = await supabase.rpc("cancel_sale", {
        sale_id_param: saleId,
      });

      if (error) throw error;

      toast({
        title: "✅ Venda excluída",
        description: "Venda excluída e estoque restaurado com sucesso!",
        duration: 3000,
      });

      setShowDeleteDialog(false);
      onOpenChange(false);
      onDeleted();
    } catch (error: any) {
      console.error("Erro ao excluir venda:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir venda",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "Dinheiro",
      debit: "Débito",
      credit: "Crédito",
      pix: "PIX",
    };
    return labels[method] || method;
  };

  // CUPOM FISCAL (já existia)
  const handleDownloadReceipt = async () => {
    if (!sale || !items) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado.",
          variant: "destructive"
        });
        return;
      }

      const storeSettings = await supabase
        .from('store_settings')
        .select('*')
        .eq('owner_id', session.session.user.id)
        .single();

      const storeInfo = storeSettings.data ? {
        name: storeSettings.data.store_name || '',
        cnpj: storeSettings.data.cnpj || '',
        phone: storeSettings.data.phone || '',
        address: storeSettings.data.address || ''
      } : undefined;

      const saleItems = items.map((item, index) => ({
        id: `${sale.id}-${index}`,
        name: item.products?.name || item.services?.name || "Item",
        price: item.unit_price,
        quantity: item.quantity,
        type: 'produto' as 'produto' | 'servico'
      }));

      await generateSaleReceipt(
        saleItems,
        sale.total,
        sale.payment_method,
        storeInfo
      );

      toast({
        title: "Cupom Fiscal gerado",
        description: "O download do cupom iniciou automaticamente.",
        duration: 2000,
      });
    } catch (error) {
      console.error("Erro ao gerar cupom:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar cupom fiscal",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // NOTA FISCAL PDF (novo)
  const handleDownloadNF = async () => {
    if (!sale) return;

    try {
      const projectRef = 'rllpfnmhelrnombjyiuz';
      const url = `https://${projectRef}.supabase.co/functions/v1/generate-nf-pdf?id=${sale.id}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar dados');

      const nfData = await response.json();
      
      const { generateNFPDF } = await import('@/utils/generateNFPDF');
      const pdfBlob = await generateNFPDF(nfData);
      
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `nota-fiscal-${sale.id.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast({
        title: "Nota Fiscal gerada",
        description: "O download iniciou automaticamente.",
        duration: 2000,
      });
    } catch (error) {
      console.error("Erro ao gerar NF:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar nota fiscal",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // COMPARTILHAR WHATSAPP (novo)
  const handleShareWhatsApp = () => {
    if (!sale) return;
    
    const url = `https://gestormei.vercel.app/nf/${sale.id}`;
    const message = `Olá! Segue sua Nota Fiscal da venda #${sale.id.substring(0, 8).toUpperCase()}%0A%0AVisualizar: ${url}`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const totalCost = items.reduce(
      (sum, item) => sum + (item.custo_unitario || 0) * item.quantity,
      0
    );
    const profit = subtotal - totalCost;
    const margin = subtotal > 0 ? (profit / subtotal) * 100 : 0;

    return { subtotal, totalCost, profit, margin };
  };

  const totals = calculateTotals();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!sale && !loading) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalhes da Venda
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground animate-pulse" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cabeçalho */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>ID: ...{sale?.id.slice(-8)}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDateTime(sale?.date)}
                      </p>
                    </div>
                    <Badge variant="default" className="text-base px-4 py-2">
                      {getPaymentMethodLabel(sale?.payment_method)}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Itens Vendidos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Itens Vendidos ({itemCount} {itemCount === 1 ? "item" : "itens"})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Preço Un.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="text-right">Custo Total</TableHead>
                        <TableHead className="text-right">Lucro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const itemCost = (item.custo_unitario || 0) * item.quantity;
                        const itemProfit = item.total_price - itemCost;
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.products?.name || item.services?.name || "Item"}
                            </TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.unit_price)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.total_price)}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatCurrency(itemCost)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={itemProfit >= 0 ? "text-green-600" : "text-red-600"}>
                                {formatCurrency(itemProfit)}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Resumo Financeiro */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      Subtotal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(totals.subtotal)}</p>
                  </CardContent>
                </Card>

                {sale?.discount_value > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-red-600">
                        Desconto
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-red-600">
                        {sale?.discount_type === "percentage"
                          ? `${sale?.discount_value}%`
                          : formatCurrency(sale?.discount_value)}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      Total Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(sale?.total)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Lucro Líquido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totals.profit)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Margem: {totals.margin.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Formas de Pagamento */}
              {payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Formas de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {payments.map((payment, index) => (
                        <div
                          key={`payment-${index}`}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Badge>{getPaymentMethodLabel(payment.payment_method)}</Badge>
                            {payment.installments && payment.installments > 1 && (
                              <span className="text-sm text-muted-foreground">
                                {payment.installments}x
                              </span>
                            )}
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informações Adicionais */}
              {(sale?.cliente_nome || sale?.note) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Adicionais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {sale?.cliente_nome && (
                      <div>
                        <span className="text-sm font-medium">Cliente:</span>
                        <p className="text-muted-foreground">{sale.cliente_nome}</p>
                      </div>
                    )}
                    {sale?.note && (
                      <div>
                        <span className="text-sm font-medium">Observações:</span>
                        <p className="text-muted-foreground">{sale.note}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={handleDownloadReceipt}
              disabled={loading}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Cupom Fiscal
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadNF}
              disabled={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Nota Fiscal PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleShareWhatsApp}
              disabled={loading}
            >
              <Share2 className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={loading || deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Venda
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              ⚠️ ATENÇÃO: Excluir Venda
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Esta ação irá:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Devolver {itemCount} {itemCount === 1 ? "item" : "itens"} ao estoque</li>
                <li>Remover {formatCurrency(sale?.total)} da receita</li>
                <li>Remover {formatCurrency(totals.profit)} do lucro</li>
              </ul>
              <p className="font-semibold text-destructive">
                Esta ação NÃO pode ser desfeita!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Excluindo..." : "Confirmar Exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
