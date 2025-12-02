import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

export default function PublicNF() {
  const { id } = useParams();
  const [nfData, setNfData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchNFData(id);
    }
  }, [id]);

  const fetchNFData = async (saleId: string) => {
    try {
      setLoading(true);
      
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .select("*")
        .eq("id", saleId)
        .single();

      if (saleError) throw saleError;

      const { data: items, error: itemsError } = await supabase
        .from("sale_items")
        .select(`
          *,
          products (name)
        `)
        .eq("sale_id", saleId);

      if (itemsError) throw itemsError;

      let storeSettings = null;
      
      if (sale.owner_id) {
        const { data: settings } = await supabase
          .from("store_settings")
          .select("*")
          .eq("owner_id", sale.owner_id)
          .single();
        
        storeSettings = settings;
      }

      setNfData({
        sale,
        items: items.map(item => ({
          name: item.products?.name || "Produto",
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price
        })),
        store: storeSettings
      });
    } catch (error) {
      console.error("Erro ao carregar NF:", error);
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
        saleId: nfData.sale.id,
        saleDate: nfData.sale.date,
        total: nfData.sale.total,
        subtotal: nfData.sale.subtotal,
        discountType: nfData.sale.discount_type,
        discountValue: nfData.sale.discount_value,
        paymentMethod: nfData.sale.payment_method,
        note: nfData.sale.note,
        items: nfData.items,
        owner: {
          name: nfData.store?.store_name,
          cnpj: nfData.store?.cnpj,
          address: nfData.store?.address,
          phone: nfData.store?.phone
        },
        plan: 'free'
      };

      const pdfBlob = await generateNFPDF(pdfData);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nota-fiscal-${nfData.sale.id.substring(0, 8)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando nota fiscal...</div>
      </div>
    );
  }

  if (!nfData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nota fiscal não encontrada
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
                <p className="text-lg font-semibold">NOTA FISCAL</p>
                <p className="text-sm text-muted-foreground">
                  NF Nº {nfData.sale.id.substring(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Data: {new Date(nfData.sale.date).toLocaleDateString('pt-BR')} {new Date(nfData.sale.date).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {nfData.store && (
              <div>
                <h3 className="font-semibold text-lg mb-2">EMITENTE</h3>
                <div className="text-sm space-y-1">
                  {nfData.store.store_name && <p>{nfData.store.store_name}</p>}
                  {nfData.store.cnpj && <p>CNPJ: {nfData.store.cnpj}</p>}
                  {nfData.store.address && <p>Endereço: {nfData.store.address}</p>}
                  {nfData.store.phone && <p>Telefone: {nfData.store.phone}</p>}
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
                    {nfData.items.map((item: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 text-sm">{item.name}</td>
                        <td className="p-3 text-sm text-center">{item.quantity}</td>
                        <td className="p-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="p-3 text-sm text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="space-y-2 min-w-64">
                  {nfData.sale.subtotal && nfData.sale.subtotal !== nfData.sale.total && (
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(nfData.sale.subtotal)}</span>
                    </div>
                  )}
                  
                  {nfData.sale.discount_value > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto:</span>
                      <span>
                        {nfData.sale.discount_type === 'percentage' 
                          ? `${nfData.sale.discount_value}%` 
                          : formatCurrency(nfData.sale.discount_value)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(nfData.sale.total)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Forma de pagamento:</span>
                    <span className="capitalize">{nfData.sale.payment_method}</span>
                  </div>
                </div>
              </div>

              {nfData.sale.note && (
                <div className="mt-4 text-sm">
                  <span className="font-medium">Observações:</span>
                  <p className="text-muted-foreground mt-1">{nfData.sale.note}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4 text-center text-xs text-muted-foreground">
              <p>Documento gerado automaticamente pelo GestorMEI</p>
              <p className="mt-1">https://gestormei.vercel.app</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
