import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Percent, Save } from "lucide-react";

interface PaymentFee {
  id: string;
  method: string;
  installments: number;
  fee_percentage: number;
}

const paymentMethodLabels: Record<string, string> = {
  debito: "Cartão de Débito",
  credito_vista: "Cartão de Crédito (à vista)",
  credito_parcelado_2x: "Cartão de Crédito (2x)",
  credito_parcelado_3x: "Cartão de Crédito (3x)",
  credito_parcelado_4x: "Cartão de Crédito (4x)",
  credito_parcelado_5x: "Cartão de Crédito (5x)",
  credito_parcelado_6x: "Cartão de Crédito (6x)",
  credito_parcelado_7x: "Cartão de Crédito (7x)",
  credito_parcelado_8x: "Cartão de Crédito (8x)",
  credito_parcelado_9x: "Cartão de Crédito (9x)",
  credito_parcelado_10x: "Cartão de Crédito (10x)",
  credito_parcelado_11x: "Cartão de Crédito (11x)",
  credito_parcelado_12x: "Cartão de Crédito (12x)",
};

export function PaymentFeesSettings() {
  const [fees, setFees] = useState<Record<string, number>>({
    debito: 2.5,
    credito_vista: 3.5,
    credito_parcelado_2x: 4.0,
    credito_parcelado_3x: 4.0,
    credito_parcelado_4x: 4.5,
    credito_parcelado_5x: 5.0,
    credito_parcelado_6x: 5.5,
    credito_parcelado_7x: 6.0,
    credito_parcelado_8x: 6.5,
    credito_parcelado_9x: 7.0,
    credito_parcelado_10x: 7.5,
    credito_parcelado_11x: 8.0,
    credito_parcelado_12x: 8.5,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentFees();
  }, []);

  const fetchPaymentFees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("payment_fees")
        .select("*");

      if (error) throw error;

      if (data && data.length > 0) {
        const feesMap: Record<string, number> = {};
        data.forEach((fee: PaymentFee) => {
          if (fee.method === "credito_parcelado") {
            feesMap[`credito_parcelado_${fee.installments}x`] = Number(fee.fee_percentage);
          } else {
            feesMap[fee.method] = Number(fee.fee_percentage);
          }
        });
        setFees(prev => ({ ...prev, ...feesMap }));
      }
    } catch (error) {
      console.error("Erro ao carregar taxas:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar taxas de pagamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Delete all existing fees first
      await supabase.from("payment_fees").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Insert new fees
      const feesToInsert = Object.entries(fees).map(([key, value]) => {
        if (key.startsWith("credito_parcelado_")) {
          const installments = parseInt(key.replace("credito_parcelado_", "").replace("x", ""));
          return {
            owner_id: user.id,
            method: "credito_parcelado",
            installments,
            fee_percentage: value
          };
        }
        return {
          owner_id: user.id,
          method: key,
          installments: 1,
          fee_percentage: value
        };
      });

      const { error } = await supabase
        .from("payment_fees")
        .insert(feesToInsert);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Taxas de pagamento atualizadas com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao salvar taxas:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar taxas de pagamento",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5" />
          Taxas de Pagamento
        </CardTitle>
        <CardDescription>
          Configure as taxas cobradas por cada método de pagamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(paymentMethodLabels).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <div className="relative">
                <Input
                  id={key}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={fees[key]}
                  onChange={(e) => setFees(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">💡 Como funciona:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• As taxas são aplicadas automaticamente no PDV e na conversão de orçamentos</li>
            <li>• O valor bruto (pago pelo cliente) e o valor líquido (após taxas) são salvos</li>
            <li>• Para crédito parcelado, a taxa varia de 1x até 12x conforme configurado</li>
            <li>• Configure as taxas que sua máquina de cartão cobra em cada modalidade</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}