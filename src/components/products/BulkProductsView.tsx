import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Eye, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductPreview {
  sku?: string;
  name: string;
  category: string;
  price: string;
  cost?: string;
  barcode?: string;
  stock?: string;
  min_stock?: string;
  image_url?: string;
  errors: string[];
}

export default function BulkProductsView() {
  const [textInput, setTextInput] = useState("");
  const [previewData, setPreviewData] = useState<ProductPreview[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const csvTemplate = `sku;nome;categoria;preço;custo;barcode;estoque;min_estoque;image_url
PROD001;Produto Exemplo;Eletrônicos;199.99;120.00;7891234567890;50;10;https://exemplo.com/imagem.jpg`;

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

  const validateProduct = (data: string[]): ProductPreview => {
    const errors: string[] = [];
    const [sku, name, category, price, cost, barcode, stock, min_stock, image_url] = data;

    if (!name?.trim()) errors.push("Nome é obrigatório");
    if (!category?.trim()) errors.push("Categoria é obrigatória");
    if (!price?.trim()) errors.push("Preço é obrigatório");
    else if (isNaN(Number(price))) errors.push("Preço deve ser numérico");
    
    if (cost && isNaN(Number(cost))) errors.push("Custo deve ser numérico");
    if (stock && isNaN(Number(stock))) errors.push("Estoque deve ser numérico");
    if (min_stock && isNaN(Number(min_stock))) errors.push("Estoque mínimo deve ser numérico");

    return {
      sku: sku?.trim(),
      name: name?.trim() || "",
      category: category?.trim() || "",
      price: price?.trim() || "",
      cost: cost?.trim(),
      barcode: barcode?.trim(),
      stock: stock?.trim(),
      min_stock: min_stock?.trim(),
      image_url: image_url?.trim(),
      errors
    };
  };

  const parseInput = () => {
    if (!textInput.trim()) {
      toast({
        title: "Erro",
        description: "Digite os dados dos produtos",
        variant: "destructive"
      });
      return;
    }

    const lines = textInput.trim().split('\n');
    const parsedData: ProductPreview[] = [];

    lines.forEach((line, index) => {
      if (line.trim()) {
        const data = line.split(';');
        const productData = validateProduct(data);
        parsedData.push(productData);
      }
    });

    setPreviewData(parsedData);
    setShowPreview(true);
  };

  const saveBulkProducts = async () => {
    setIsLoading(true);
    try {
      const validProducts = previewData.filter(p => p.errors.length === 0);
      
      if (validProducts.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum produto válido para salvar",
          variant: "destructive"
        });
        return;
      }

      // Get or create categories
      const categories = [...new Set(validProducts.map(p => p.category))];
      const categoryMap = new Map<string, string>();

      for (const categoryName of categories) {
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id, name')
          .eq('name', categoryName)
          .maybeSingle();

        if (existingCategory) {
          categoryMap.set(categoryName, existingCategory.id);
        } else {
          const { data: newCategory, error } = await supabase
            .from('categories')
            .insert({ name: categoryName })
            .select('id')
            .single();

          if (error) throw error;
          categoryMap.set(categoryName, newCategory.id);
        }
      }

      // Insert products
      const productsToInsert = validProducts.map(p => ({
        name: p.name,
        category_id: categoryMap.get(p.category),
        price: Number(p.price),
        cost: p.cost ? Number(p.cost) : null,
        stock: p.stock ? Number(p.stock) : 0,
        min_stock: p.min_stock ? Number(p.min_stock) : 0,
        sku: p.sku || null,
        barcode: p.barcode || null,
        image_url: p.image_url || null,
        is_active: true
      }));

      const { error } = await supabase
        .from('products')
        .insert(productsToInsert);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `${validProducts.length} produtos criados com sucesso`
      });

      setTextInput("");
      setPreviewData([]);
      setShowPreview(false);

    } catch (error) {
      console.error('Error saving products:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar produtos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cadastro em Lote</h1>
        <Button onClick={downloadTemplate} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Baixar Modelo CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Colar Dados dos Produtos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Cole os dados no formato: sku;nome;categoria;preço;custo;barcode;estoque;min_estoque;image_url
              <br />
              Campos obrigatórios: nome, categoria, preço
            </AlertDescription>
          </Alert>
          
          <Textarea
            placeholder={csvTemplate}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          
          <Button onClick={parseInput} className="w-full">
            <Eye className="mr-2 h-4 w-4" />
            Pré-visualizar
          </Button>
        </CardContent>
      </Card>

      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização dos Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <Badge variant="secondary">
                  Total: {previewData.length}
                </Badge>
                <Badge variant="default">
                  Válidos: {previewData.filter(p => p.errors.length === 0).length}
                </Badge>
                <Badge variant="destructive">
                  Com Erros: {previewData.filter(p => p.errors.length > 0).length}
                </Badge>
              </div>

              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((product, index) => (
                      <TableRow key={index} className={product.errors.length > 0 ? "bg-destructive/10" : ""}>
                        <TableCell>{product.sku || "-"}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>R$ {product.price}</TableCell>
                        <TableCell>{product.stock || "0"}</TableCell>
                        <TableCell>
                          {product.errors.length === 0 ? (
                            <Badge variant="default">Válido</Badge>
                          ) : (
                            <div className="space-y-1">
                              {product.errors.map((error, i) => (
                                <Badge key={i} variant="destructive" className="text-xs block">
                                  {error}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button 
                onClick={saveBulkProducts} 
                disabled={isLoading || previewData.filter(p => p.errors.length === 0).length === 0}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Salvar em Lote"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
