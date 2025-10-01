import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload, RefreshCw, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CSVProduct {
  name: string;
  category: string;
  price: number;
  cost?: number;
  stock?: number;
  min_stock?: number;
  sku?: string;
  barcode?: string;
  image_url?: string;
}

export default function ImportCSVView() {
  const [csvData, setCsvData] = useState<CSVProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();

  const csvTemplate = `name,category,price,cost,stock,min_stock,sku,barcode,image_url
Produto Exemplo,Eletrônicos,199.99,120.00,50,10,PROD001,7891234567890,https://exemplo.com/imagem.jpg`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "modelo-produtos.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const expectedHeaders = ['name', 'category', 'price'];
      const hasRequiredHeaders = expectedHeaders.every(header => 
        headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
      );

      if (!hasRequiredHeaders) {
        toast({
          title: "Erro",
          description: "CSV deve conter pelo menos as colunas: name, category, price",
          variant: "destructive"
        });
        return;
      }

      const data: CSVProduct[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 3) {
          const product: CSVProduct = {
            name: values[0]?.trim() || '',
            category: values[1]?.trim() || '',
            price: parseFloat(values[2]?.trim() || '0'),
            cost: values[3] ? parseFloat(values[3].trim()) : undefined,
            stock: values[4] ? parseInt(values[4].trim()) : undefined,
            min_stock: values[5] ? parseInt(values[5].trim()) : undefined,
            sku: values[6]?.trim() || undefined,
            barcode: values[7]?.trim() || undefined,
            image_url: values[8]?.trim() || undefined,
          };
          data.push(product);
        }
      }

      setCsvData(data);
      toast({
        title: "Sucesso",
        description: `${data.length} produtos carregados do CSV`
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo CSV",
        variant: "destructive"
      });
    }
  };

  const syncNow = async () => {
    setIsLoading(true);
    try {
      // Simula uma sincronização com refresh dos dados
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLastSync(new Date());
      toast({
        title: "Sincronização completa",
        description: `${products?.length || 0} produtos sincronizados`
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao sincronizar dados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openSupabaseTableEditor = () => {
    const projectId = "rllpfnmhelrnombjyiuz";
    window.open(`https://supabase.com/dashboard/project/${projectId}/editor`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Importar CSV</h1>
        <div className="flex gap-2">
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Baixar Modelo
          </Button>
          <Button onClick={syncNow} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sincronizar Agora
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Instruções de Importação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <strong>Baixar modelo CSV</strong>
                  <p className="text-sm text-muted-foreground">Clique no botão "Baixar Modelo" para obter o template correto</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <strong>Abrir Supabase Table Editor</strong>
                  <p className="text-sm text-muted-foreground">Use o Import Data do Supabase para carregar seu CSV</p>
                  <Button 
                    onClick={openSupabaseTableEditor}
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir Table Editor
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <strong>Sincronizar dados</strong>
                  <p className="text-sm text-muted-foreground">Volte aqui e clique em "Sincronizar Agora" para atualizar os dados</p>
                </div>
              </div>
            </div>

            {lastSync && (
              <Alert>
                <AlertDescription>
                  Última sincronização: {lastSync.toLocaleString()}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV Local (Preview)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Esta função permite pré-visualizar um arquivo CSV localmente para verificar as colunas e formato.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-center w-full">
            <label htmlFor="csv-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                </p>
                <p className="text-xs text-muted-foreground">Apenas arquivos CSV</p>
              </div>
              <input 
                id="csv-upload" 
                type="file" 
                className="hidden" 
                accept=".csv"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {csvData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {csvData.length} produtos carregados
                </Badge>
              </div>

              <div className="max-h-64 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Estoque</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 10).map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.sku || "-"}</TableCell>
                        <TableCell>{product.stock || "0"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {csvData.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  Mostrando apenas os primeiros 10 produtos...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
