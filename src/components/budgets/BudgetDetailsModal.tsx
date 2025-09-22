import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useBudgetDetails } from "@/hooks/useBudgets";
import { supabase } from "@/integrations/supabase/client";
import type { BudgetDetails } from "@/hooks/useBudgets";
import { FileText, ShoppingCart, X, CreditCard, Banknote, Smartphone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BudgetDetailsModalProps {
  budgetId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onRefresh?: () => void;
}

type PaymentMethod = "pix" | "cartao" | "dinheiro";

export function BudgetDetailsModal({ 
  budgetId, 
  open, 
  onOpenChange, 
  onEdit, 
  onRefresh 
}: BudgetDetailsModalProps) {
  const [converting, setConverting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [saleNote, setSaleNote] = useState("");
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  const { toast } = useToast();
  const { data: budget, isLoading } = useBudgetDetails(budgetId);

  const paymentMethods = [
    { id: "pix" as PaymentMethod, label: "PIX", icon: Smartphone },
    { id: "cartao" as PaymentMethod, label: "Cartão", icon: CreditCard },
    { id: "dinheiro" as PaymentMethod, label: "Dinheiro", icon: Banknote },
  ];

  const handleConvertToSale = async () => {
    if (!budget) return;
    
    try {
      setConverting(true);

      // Call the convert budget function
      const { data, error } = await supabase.rpc('convert_budget_to_sale', {
        budget_id_param: budget.id
      });

      if (error) throw error;

      // Update the sale with the selected payment method and note
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          payment_method: paymentMethod,
          note: saleNote || null
        })
        .eq('id', data);

      if (updateError) throw updateError;

      toast({
        title: "Orçamento convertido!",
        description: "O orçamento foi convertido em venda com sucesso.",
      });

      onRefresh?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error converting budget:', error);
      toast({
        title: "Erro ao converter orçamento",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
      setShowConvertForm(false);
    }
  };

  const handleCancelBudget = async () => {
    if (!budget) return;
    
    try {
      const { error } = await supabase
        .from('budgets')
        .update({ 
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('id', budget.id);

      if (error) throw error;

      toast({
        title: "Orçamento cancelado",
        description: "O orçamento foi cancelado com sucesso.",
      });

      onRefresh?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error canceling budget:', error);
      toast({
        title: "Erro ao cancelar orçamento",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  const generatePDF = async () => {
    if (!budget) return;
    
    try {
      setGeneratingPDF(true);

      const element = document.getElementById('budget-content');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        allowTaint: true,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`orcamento-${budget.id.slice(-8)}.pdf`);

      toast({
        title: "PDF gerado!",
        description: "O orçamento foi exportado em PDF com sucesso.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default">Aberto</Badge>;
      case 'converted':
        return <Badge variant="secondary">Convertido</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="p-8 text-center">
            <p>Carregando detalhes do orçamento...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!budget) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="p-8 text-center">
            <p>Orçamento não encontrado</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const subtotal = budget.subtotal || 0;
  const discountAmount = budget.discount_value || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Orçamento #{budget.id.slice(-8)}</span>
            {getStatusBadge(budget.status)}
          </DialogTitle>
        </DialogHeader>

        {/* Convert to Sale Form */}
        {showConvertForm && (
          <Card className="p-4 border-primary">
            <h3 className="font-semibold mb-4">Converter para Venda</h3>
            <div className="space-y-4">
              <div>
                <Label>Método de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          <method.icon className="h-4 w-4" />
                          {method.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Observações da Venda</Label>
                <Textarea
                  value={saleNote}
                  onChange={(e) => setSaleNote(e.target.value)}
                  placeholder="Observações sobre a venda..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConvertForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConvertToSale}
                  disabled={converting}
                  className="flex-1"
                >
                  {converting ? "Convertendo..." : "Confirmar Conversão"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div id="budget-content" className="space-y-6 p-4 bg-white">
          {/* Company Header */}
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold">Sistema POS - Balcão Rápido</h2>
            <p className="text-muted-foreground">Orçamento #{budget.id.slice(-8)}</p>
          </div>

          {/* Budget Info */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Informações do Cliente</h3>
              <div className="space-y-2">
                <p><strong>Nome:</strong> {budget.customer_name || "Não informado"}</p>
                <p><strong>Email:</strong> {budget.customer_email || "Não informado"}</p>
                <p><strong>Telefone:</strong> {budget.customer_phone || "Não informado"}</p>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Detalhes do Orçamento</h3>
              <div className="space-y-2">
                <p><strong>Data:</strong> {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                <p><strong>Status:</strong> {getStatusBadge(budget.status)}</p>
                {budget.valid_until && (
                  <p><strong>Válido até:</strong> {format(new Date(budget.valid_until), 'dd/MM/yyyy', { locale: ptBR })}</p>
                )}
              </div>
            </Card>
          </div>

          {/* Notes */}
          {budget.notes && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Observações</h3>
              <p>{budget.notes}</p>
            </Card>
          )}

          {/* Financial Summary */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Resumo Financeiro</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto ({budget.discount_type === 'percentage' ? '%' : 'R$'}):</span>
                  <span>-R$ {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>R$ {budget.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={generatePDF}
            disabled={generatingPDF}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            {generatingPDF ? "Gerando PDF..." : "Gerar PDF"}
          </Button>

          {budget.status === 'open' && (
            <>
              <Button
                variant="outline"
                onClick={onEdit}
                className="flex-1"
              >
                Editar
              </Button>
              <Button
                onClick={() => setShowConvertForm(true)}
                className="flex-1"
                disabled={showConvertForm}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Converter para Venda
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelBudget}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar Orçamento
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}