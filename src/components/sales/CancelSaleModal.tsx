import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CancelSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleId: string;
  saleTotal: number;
  onCancel: () => void;
}

export function CancelSaleModal({ open, onOpenChange, saleId, saleTotal, onCancel }: CancelSaleModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCancelSale = async () => {
    if (!reason.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o motivo do cancelamento",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc("cancel_sale", {
        sale_id_param: saleId,
        reason: reason.trim()
      });

      if (error) throw error;

      toast({
        title: "Venda cancelada",
        description: "Venda cancelada com sucesso e estoque revertido"
      });

      onCancel();
      setReason("");
    } catch (error) {
      console.error("Erro ao cancelar venda:", error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar venda. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancelar Venda
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 rounded-lg">
            <p className="text-sm">
              <strong>Atenção:</strong> Esta ação cancelará a venda de R$ {saleTotal.toFixed(2)} e 
              reverterá automaticamente os itens para o estoque.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do cancelamento *</Label>
            <Textarea
              id="reason"
              placeholder="Descreva o motivo do cancelamento da venda..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSale}
              className="flex-1"
              disabled={loading || !reason.trim()}
            >
              {loading ? "Cancelando..." : "Confirmar Cancelamento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}