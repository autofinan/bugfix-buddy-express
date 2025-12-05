import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

export default function PublicComprovante() {
  const { id } = useParams();
  const [comprovante, setComprovante] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchComprovanteData(id);
    }
  }, [id]);

  const fetchComprovanteData = async (saleId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar a função RPC que permite acesso público
      const { data, error: rpcError } = await supabase
        .rpc('get_public_sale', { sale_id_param: saleId });

      if (rpcError) throw rpcError;
      
      const result = data as { sale: any; items: any[]; store: any } | null;
      
      if (!result || !result.sale) {
        setError("Comprovante não encontrado");
        return;
      }

      setComprovante({
        sale: result.sale,
        items: result.items || [],
        store: result.store
      });
    } catch (err) {
      console.error("Erro ao carregar comprovante:", err);
      setError("Erro ao carregar comprovante de venda");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDownloadPDF = async () => {
    try {
      const { generateNFPDF } = await import('@/utils/generateNFPDF');
      
      const pdfData = {
        saleId: comprovante.sale.id,
        saleDate: comprovante.sale.date,
        total: comprovante.sale.total,
        subtotal: comprovante.sale.subtotal,
        discountType: comprovante.sale.discount_type,
        discountValue: comprovante.sale.discount_value,
        paymentMethod: comprovante.sale.payment_method,
        note: comprovante.sale.note,
        items: comprovante.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price
        })),
        owner: {
          name: comprovante.store?.store_name,
          cnpj: comprovante.store?.cnpj,
          address: comprovante.store?.address,
          phone: comprovante.store?.phone
        },
        plan: 'free' as const
      };

      const pdfBlob = await generateNFPDF(pdfData);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprovante-${comprovante.sale.id.substring(0, 8)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao baixar PDF:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando comprovante...</div>
      </div>
    );
  }

  if (error || !comprovante) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {error || "Comprovante não encontrado"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-2 mb-4 print:hidden">
          <Button onClick={handleDownloadPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>

        <Card className="print:shadow-none print:border-none">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">GestorMEI</CardTitle>
                <p className="text-lg font-semibold">COMPROVANTE DE VENDA</p>
                <p className="text-sm text-muted-foreground">
                  Nº {comprovante.sale.id.substring(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Data: {new Date(comprovante.sale.date).toLocaleDateString('pt-BR')} {new Date(comprovante.sale.date).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {comprovante.store && (
              <div>
                <h3 className="font-semibold text-lg mb-2">EMITENTE</h3>
                <div className="text-sm space-y-1">
                  {comprovante.store.store_name && <p>{comprovante.store.store_name}</p>}
                  {comprovante.store.cnpj && <p>CNPJ: {comprovante.store.cnpj}</p>}
                  {comprovante.store.address && <p>Endereço: {comprovante.store.address}</p>}
                  {comprovante.store.phone && <p>Telefone: {comprovante.store.phone}</p>}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg mb-3">ITENS</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-semibold">Produto</th>
                      <th className="text-center p-3 text-sm font-semibold">Qtd</th>
                      <th className="text-right p-3 text-sm font-semibold">Unit.</th>
                      <th className="text-right p-3 text-sm font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprovante.items.map((item: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 text-sm">{item.name}</td>
                        <td className="p-3 text-sm text-center">{item.quantity}</td>
                        <td className="p-3 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="p-3 text-sm text-right font-medium">{formatCurrency(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="space-y-2 min-w-64">
                  {comprovante.sale.subtotal && comprovante.sale.subtotal !== comprovante.sale.total && (
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(comprovante.sale.subtotal)}</span>
                    </div>
                  )}
                  
                  {comprovante.sale.discount_value > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto:</span>
                      <span>
                        {comprovante.sale.discount_type === 'percentage' 
                          ? `${comprovante.sale.discount_value}%` 
                          : formatCurrency(comprovante.sale.discount_value)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(comprovante.sale.total)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Forma de pagamento:</span>
                    <span className="capitalize">{comprovante.sale.payment_method}</span>
                  </div>
                </div>
              </div>

              {comprovante.sale.note && (
                <div className="mt-4 text-sm">
                  <span className="font-medium">Observações:</span>
                  <p className="text-muted-foreground mt-1">{comprovante.sale.note}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4 text-center text-xs text-muted-foreground">
              <p>Documento gerado automaticamente pelo GestorMEI</p>
              <p>Este documento não possui valor fiscal</p>
              <p className="mt-1">https://gestormei.vercel.app</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
