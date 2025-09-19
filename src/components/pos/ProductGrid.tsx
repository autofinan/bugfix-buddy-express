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
        description: "Não foi possível carregar os produtos",
        variant: "destructive",
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
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const searchOptions = products.map(product => ({
    value: product.name,
    label: product.name,
    category: product.categories?.name || "Sem categoria"
  }));

  if (loading) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchDropdown
            value={search}
            onValueChange={setSearch}
            options={searchOptions}
            placeholder="Buscar produtos..."
            className="w-full"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Nenhum produto encontrado</p>
          <p className="text-sm text-muted-foreground">
            Tente ajustar os filtros de pesquisa
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-2">
                <div className="aspect-square bg-muted rounded-md overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium text-sm truncate">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-primary">
                      R$ {product.price.toFixed(2)}
                    </p>
                    <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-xs">
                      {product.stock} un.
                    </Badge>
                  </div>
                  
                  {product.categories && (
                    <p className="text-xs text-muted-foreground truncate">
                      {product.categories.name}
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => onAddToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    stock: product.stock,
                  })}
                  disabled={product.stock <= 0}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}