import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateProduct } from "@/hooks/useProducts";
import { toast } from "sonner";

export default function BulkProductsView() {
  const [bulkData, setBulkData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const createProduct = useCreateProduct();

  const handleBulkImport = async () => {
    if (!bulkData.trim()) {
      toast.error("Por favor, adicione os dados dos produtos");
      return;
    }

    setIsProcessing(true);
    
    try {
      const lines = bulkData.split('\n').filter(line => line.trim());
      let successCount = 0;
      let errorCount = 0;

      for (const line of lines) {
        try {
          // Expected format: name,price,stock,description
          const [name, price, stock, description] = line.split(',').map(item => item.trim());
          
          if (!name || !price) {
            errorCount++;
            continue;
          }

          await createProduct.mutateAsync({
            name,
            price: parseFloat(price),
            stock: stock ? parseInt(stock) : 0,
            description: description || "",
          });
          
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Error creating product:', error);
        }
      }
      
      toast.success(`Importação concluída: ${successCount} produtos criados, ${errorCount} erros`);
      setBulkData("");
    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error("Erro na importação em lote");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Nome do Produto,Preço,Estoque,Descrição
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
        <h1 className="text-3xl font-bold">Importação em Lote</h1>
        <p className="text-muted-foreground">Adicione múltiplos produtos de uma vez</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Formato esperado: Nome,Preço,Estoque,Descrição (separado por vírgulas, um produto por linha)
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="bulk-data">Dados dos Produtos</Label>
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                Baixar Modelo
              </Button>
            </div>
            
            <Textarea
              id="bulk-data"
              placeholder="Cole os dados dos produtos aqui..."
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              className="min-h-96 font-mono text-sm"
            />
            
            <Button 
              onClick={handleBulkImport}
              disabled={isProcessing || !bulkData.trim()}
              className="w-full gap-2"
            >
              <Upload className="h-4 w-4" />
              {isProcessing ? "Processando..." : "Importar Produtos"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Exemplo de Formato</h3>
          <div className="bg-muted p-4 rounded-md">
            <pre className="text-sm">
{`Camiseta Básica,29.90,100,Camiseta 100% algodão
Calça Jeans,89.90,50,Calça jeans azul tamanho M
Tênis Esportivo,199.90,25,Tênis para corrida`}
            </pre>
          </div>
          
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p><strong>Nome:</strong> Nome do produto (obrigatório)</p>
            <p><strong>Preço:</strong> Preço de venda (obrigatório)</p>
            <p><strong>Estoque:</strong> Quantidade em estoque (opcional)</p>
            <p><strong>Descrição:</strong> Descrição do produto (opcional)</p>
          </div>
        </Card>
      </div>
    </div>
  );
}