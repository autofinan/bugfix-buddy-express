import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CartProduct } from "./POSView";

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
  onAddToCart: (product: Omit<CartProduct, "quantity">) => void;
}

export function ProductSelector({ onAddToCart }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, SKU ou código de barras..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              {search ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>R$ {product.price.toFixed(2)}</span>
                    <span>•</span>
                    <Badge variant="secondary">
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
                    <div className="text-xs text-muted-foreground">
                      {product.sku && <span>SKU: {product.sku}</span>}
                      {product.sku && product.barcode && <span> • </span>}
                      {product.barcode && <span>Código: {product.barcode}</span>}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => onAddToCart({
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    stock: product.stock || 0
                  })}
                  disabled={!product.stock || product.stock <= 0}
                >
                  Adicionar
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}