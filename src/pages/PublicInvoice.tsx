import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateNFPDF, type NFData } from '@/utils/generateNFPDF';

export default function PublicInvoice() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [nfData, setNfData] = useState<NFData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchAndGeneratePDF();
    }
  }, [id]);

  const fetchAndGeneratePDF = async () => {
    try {
      setLoading(true);
      setError('');

      const projectRef = 'rllpfnmhelrnombjyiuz';
      const url = `https://${projectRef}.supabase.co/functions/v1/generate-nf-pdf?id=${id}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao buscar dados da venda');
      }

      const data = await response.json();
      setNfData(data);

      // Gerar PDF usando o utility
      const pdfBlob = await generateNFPDF(data);
      const blobUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(blobUrl);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setError('Não foi possível gerar a nota fiscal. Verifique se a venda existe.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl && id) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `nota-fiscal-${id.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Download iniciado',
        description: 'O PDF da nota fiscal está sendo baixado.'
      });
    }
  };

  const handleShare = () => {
    const shareUrl = `https://gestormei.vercel.app/nf/${id}`;
    const message = `Olá! Segue sua Nota Fiscal da venda #${id?.substring(0, 8).toUpperCase()}%0A%0AVisualizar: ${shareUrl}`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Gerando nota fiscal...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Nota Fiscal</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  NF Nº {id?.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownload} variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
                <Button onClick={handleShare} variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="w-full" style={{ height: 'calc(100vh - 200px)' }}>
              {pdfUrl && (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="Nota Fiscal"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
