import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download } from "lucide-react";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";
import { SearchDropdown } from "@/components/ui/search-dropdown";
import { supabase } from "@/integrations/supabase/client";
import { exportProductsToCSV, ExportProduct } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  stock: number | null;
  min_stock: number | null;
  sku: string | null;
  barcode: string | null;
  category_id: string | null;
  image_url: string | null;
  is_active: boolean;
  categories?: { name: string } | null;
}

export default function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (name)
        `)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSave = () => {
    fetchProducts();
    handleCloseForm();
  };

  const handleExportCSV = async () => {
    try {
      const exportData: ExportProduct[] = filteredProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        cost: product.cost ? Number(product.cost) : null,
        stock: product.stock,
        min_stock: product.min_stock,
        sku: product.sku,
        barcode: product.barcode,
        category: product.categories?.name || null,
        is_active: product.is_active,
        created_at: new Date().toISOString()
      }));

      exportProductsToCSV(exportData);
      
      toast({
        title: "Exportação concluída",
        description: "Dados de produtos exportados com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive"
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.sku?.toLowerCase().includes(search.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      <div className="max-w-md">
        <SearchDropdown
          value={search}
          onValueChange={setSearch}
          options={products.map(product => ({
            value: product.name,
            label: `${product.name} - R$ ${product.price.toFixed(2)}`,
            category: product.categories?.name || "Sem categoria"
          }))}
          placeholder="Buscar produtos por nome, SKU ou código..."
          emptyMessage="Nenhum produto encontrado"
        />
      </div>

      <ProductList
        products={filteredProducts}
        loading={loading}
        onEdit={handleEdit}
        onRefresh={fetchProducts}
      />

      <ProductForm
        open={showForm}
        onOpenChange={setShowForm}
        product={editingProduct}
        onSave={handleSave}
        onClose={handleCloseForm}
      />
    </div>
  );
}
