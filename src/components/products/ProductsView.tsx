import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Filter, X } from "lucide-react";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";
import { SearchDropdown } from "@/components/ui/search-dropdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

interface Category {
  id: string;
  name: string;
}

export default function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filtros avançados
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<"all" | "low" | "medium" | "high">("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "low-stock" | "out-of-stock">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
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

  const filteredProducts = products.filter(product => {
    // Filtro de busca por texto
    const matchesSearch = !search || 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku?.toLowerCase().includes(search.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(search.toLowerCase()) ||
      product.description?.toLowerCase().includes(search.toLowerCase());
    
    // Filtro por categoria
    const matchesCategory = selectedCategory === "all" || 
      product.category_id === selectedCategory;
    
    // Filtro por faixa de preço
    let matchesPrice = true;
    if (priceRange === "low") matchesPrice = product.price < 50;
    else if (priceRange === "medium") matchesPrice = product.price >= 50 && product.price <= 200;
    else if (priceRange === "high") matchesPrice = product.price > 200;
    
    // Filtro por estoque
    let matchesStock = true;
    if (stockFilter === "in-stock") matchesStock = (product.stock ?? 0) > (product.min_stock ?? 0);
    else if (stockFilter === "low-stock") matchesStock = (product.stock ?? 0) <= (product.min_stock ?? 0) && (product.stock ?? 0) > 0;
    else if (stockFilter === "out-of-stock") matchesStock = (product.stock ?? 0) <= 0;
    
    // Filtro por status
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && product.is_active) ||
      (statusFilter === "inactive" && !product.is_active);
    
    return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesStatus;
  });

  const hasActiveFilters = selectedCategory !== "all" || priceRange !== "all" || 
    stockFilter !== "all" || statusFilter !== "all";

  const clearFilters = () => {
    setSelectedCategory("all");
    setPriceRange("all");
    setStockFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        </div>
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

      {/* Busca e Filtros */}
      <div className="space-y-4">
        {/* Barra de busca */}
        <div className="max-w-2xl">
          <SearchDropdown
            value={search}
            onValueChange={setSearch}
            options={products.map(product => ({
              value: product.name,
              label: `${product.name} - R$ ${product.price.toFixed(2)}`,
              category: product.categories?.name || "Sem categoria"
            }))}
            placeholder="Buscar por nome, SKU, código ou descrição..."
            emptyMessage="Nenhum produto encontrado"
          />
        </div>

        {/* Filtros Avançados */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>

          {/* Filtro de Categoria */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro de Preço */}
          <Select value={priceRange} onValueChange={(value: any) => setPriceRange(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Faixa de preço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os preços</SelectItem>
              <SelectItem value="low">Até R$ 50</SelectItem>
              <SelectItem value="medium">R$ 50 - R$ 200</SelectItem>
              <SelectItem value="high">Acima de R$ 200</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro de Estoque */}
          <Select value={stockFilter} onValueChange={(value: any) => setStockFilter(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estoque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="in-stock">Em estoque</SelectItem>
              <SelectItem value="low-stock">Estoque baixo</SelectItem>
              <SelectItem value="out-of-stock">Sem estoque</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro de Status */}
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>

          {/* Botão Limpar Filtros */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Tags de filtros ativos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {selectedCategory !== "all" && (
              <Badge variant="secondary">
                Categoria: {categories.find(c => c.id === selectedCategory)?.name}
              </Badge>
            )}
            {priceRange !== "all" && (
              <Badge variant="secondary">
                Preço: {priceRange === "low" ? "Até R$ 50" : priceRange === "medium" ? "R$ 50-200" : "Acima de R$ 200"}
              </Badge>
            )}
            {stockFilter !== "all" && (
              <Badge variant="secondary">
                {stockFilter === "in-stock" ? "Em estoque" : stockFilter === "low-stock" ? "Estoque baixo" : "Sem estoque"}
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary">
                {statusFilter === "active" ? "Ativos" : "Inativos"}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Lista de Produtos */}
      <ProductList
        products={filteredProducts}
        loading={loading}
        onEdit={handleEdit}
        onRefresh={fetchProducts}
      />

      {/* Formulário de Produto */}
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
