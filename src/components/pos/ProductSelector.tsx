import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
  barcode: string | null;
  category_id: string | null;
  categories?: { name: string } | null;
}

interface ProductSelectorProps {
  onAddToCart: (product: { id: string; name: string; price: number; stock: number }) => void;
}

export function ProductSelector({ onAddToCart }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          stock,
          sku,
          barcode,
          category_id,
          categories (name)
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.sku?.toLowerCase().includes(search.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProduct = (product: Product) => {
    onAddToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      stock: product.stock || 0
    });
    setSearch(""); // Limpa o campo após adicionar
    setShowDropdown(false); // Fecha o dropdown
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar produtos..." className="pl-10" disabled />
        </div>
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Campo de busca com dropdown */}
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
        
        {/* Dropdown de produtos */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  {search ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                </p>
              </div>
            ) : (
              <div className="py-1">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="px-3 py-3 hover:bg-gray-100 cursor-pointer transition-colors border-b last:border-b-0"
                    onClick={() => handleAddProduct(product)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate text-sm">{product.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="font-semibold text-green-600">R$ {product.price.toFixed(2)}</span>
                          <span>•</span>
                          <Badge 
                            variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "outline" : "destructive"}
                            className="text-xs"
                          >
                            Estoque: {product.stock}
                          </Badge>
                          {product.categories && (
                            <>
                              <span>•</span>
                              <span>{product.categories.name}</span>
                            </>
                          )}
                        </div>
                        {(product.sku || product.barcode) && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {product.sku && <span>SKU: {product.sku}</span>}
                            {product.sku && product.barcode && <span> • </span>}
                            {product.barcode && <span>Código: {product.barcode}</span>}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-blue-600 font-medium whitespace-nowrap">
                        {product.stock > 0 ? 'Clique para adicionar' : 'Sem estoque'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Indicador visual quando há produtos filtrados */}
      {search && (
        <div className="text-sm text-muted-foreground">
          {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
