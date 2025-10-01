import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchDropdown } from "@/components/ui/search-dropdown";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string;
  category_id?: string;
  categories?: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

interface ProductGridProps {
  onAddToCart: (product: { id: string; name: string; price: number; stock: number }) => void;
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
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
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive"
      });
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = !search || 
      product.name.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
      product.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({
        title: "Produto sem estoque",
        description: "Este produto não possui estoque disponível",
        variant: "destructive"
      });
      return;
    }

    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock
    });

    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <SearchDropdown
          value={search}
          onValueChange={setSearch}
          options={products.map(product => ({
            value: product.name,
            label: `${product.name} - ${formatCurrency(product.price)}`,
            category: product.categories?.name || "Sem categoria"
          }))}
          placeholder="Buscar produtos..."
          emptyMessage="Nenhum produto encontrado"
        />
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <Package className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Product Image Placeholder */}
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(product.price)}
                      </span>
                      <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                        Estoque: {product.stock}
                      </Badge>
                    </div>
                    
                    {product.categories?.name && (
                      <Badge variant="outline" className="text-xs">
                        {product.categories.name}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Add Button */}
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {product.stock > 0 ? "Adicionar" : "Sem Estoque"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}