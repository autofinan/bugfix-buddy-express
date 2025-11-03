import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [showDropdown, setShowDropdown] = useState(false);
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
        variant: "destructive",
        duration: 3000,
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
      duration: 2000,
    });

    // Limpa a busca e fecha o dropdown após adicionar
    setSearch("");
    setShowDropdown(false);
  };

  const handleSelectFromDropdown = (product: Product) => {
    handleAddToCart(product);
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
        {/* BUSCA CORRIGIDA - SEM SEARCHDROPDOWN */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-10 pr-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => {
              // Delay para permitir clique no item antes de fechar
              setTimeout(() => setShowDropdown(false), 200);
            }}
          />
          
          {/* Dropdown flutuante */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground text-sm">
                    {search ? "Nenhum produto encontrado" : "Nenhum produto disponível"}
                  </p>
                </div>
              ) : (
                <div className="py-1">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors border-b last:border-b-0"
                      onClick={() => handleSelectFromDropdown(product)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{product.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="font-semibold text-green-600">
                              {formatCurrency(product.price)}
                            </span>
                            <span>•</span>
                            <Badge 
                              variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "outline" : "destructive"}
                              className="text-xs px-2 py-0"
                            >
                              Estoque: {product.stock}
                            </Badge>
                            {product.categories?.name && (
                              <>
                                <span>•</span>
                                <span className="text-xs">{product.categories.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {product.stock > 0 ? (
                          <div className="text-xs text-blue-600 font-medium whitespace-nowrap">
                            Clique para adicionar
                          </div>
                        ) : (
                          <div className="text-xs text-red-600 font-medium whitespace-nowrap">
                            Sem estoque
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Filtro de categoria */}
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
