import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Download, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateProduct } from "@/hooks/useProducts";
import { toast } from "sonner";
import Papa from "papaparse";

export default function ImportCSVView() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const createProduct = useCreateProduct();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error("Erro ao ler o arquivo CSV");
          return;
        }
        
        setCsvData(results.data as any[]);
        toast.success(`${results.data.length} linhas carregadas`);
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  const handleImport = async () => {
    if (csvData.length === 0) {
      toast.error("Nenhum dado para importar");
      return;
    }

    setIsProcessing(true);
    
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const row of csvData) {
        try {
          const { nome, name, preco, price, estoque, stock, descricao, description } = row;
          
          const productName = nome || name;
          const productPrice = preco || price;
          const productStock = estoque || stock;
          const productDescription = descricao || description;
          
          if (!productName || !productPrice) {
            errorCount++;
            continue;
          }

          await createProduct.mutateAsync({
            name: productName,
            price: parseFloat(productPrice.toString().replace(',', '.')),
            stock: productStock ? parseInt(productStock) : 0,
            description: productDescription || "",
          });
          
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Error creating product:', error);
        }
      }
      
      toast.success(`Importação concluída: ${successCount} produtos criados, ${errorCount} erros`);
      setCsvData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('CSV import error:', error);
      toast.error("Erro na importação do CSV");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = `nome,preco,estoque,descricao
Produto Exemplo 1,10.50,100,Descrição do produto 1
Produto Exemplo 2,25.00,50,Descrição do produto 2`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo-produtos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importar CSV</h1>
        <p className="text-muted-foreground">Importe produtos a partir de um arquivo CSV</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          O arquivo deve conter as colunas: nome, preco, estoque, descricao
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="csv-file">Arquivo CSV</Label>
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                Baixar Modelo
              </Button>
            </div>
            
            <Input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
            />
            
            {csvData.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="h-4 w-4" />
                {csvData.length} produtos prontos para importar
              </div>
            )}
            
            <Button 
              onClick={handleImport}
              disabled={isProcessing || csvData.length === 0}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {isProcessing ? "Importando..." : "Importar Produtos"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Formato do CSV</h3>
          <div className="bg-muted p-4 rounded-md">
            <pre className="text-sm">
{`nome,preco,estoque,descricao
Camiseta Básica,29.90,100,Camiseta 100% algodão
Calça Jeans,89.90,50,Calça jeans azul tamanho M`}
            </pre>
          </div>
          
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p><strong>nome:</strong> Nome do produto (obrigatório)</p>
            <p><strong>preco:</strong> Preço de venda (obrigatório)</p>
            <p><strong>estoque:</strong> Quantidade em estoque (opcional)</p>
            <p><strong>descricao:</strong> Descrição do produto (opcional)</p>
          </div>
          
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Certifique-se de que o arquivo esteja em formato UTF-8 para evitar problemas com acentos.
            </AlertDescription>
          </Alert>
        </Card>
      </div>
    </div>
  );
}