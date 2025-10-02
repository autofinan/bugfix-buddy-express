import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Package, ImageOff } from "lucide-react";
import { Product } from "./ProductsView";
import { useState } from "react";

interface ProductListProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onRefresh: () => void;
}

export function ProductList({ products, loading, onEdit }: ProductListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Nenhum produto encontrado</p>
      </div>
    );
  }

  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (productId: string) => {
    setImageErrors(prev => new Set(prev).add(productId));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => {
        const hasImageError = imageErrors.has(product.id);
        const showImage = product.image_url && !hasImageError;

        return (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Imagem do Produto */}
            <div className="relative aspect-square bg-muted">
              {showImage ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(product.id)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              {/* Badge de Status sobreposto à imagem */}
              <div className="absolute top-2 right-2">
                <Badge variant={product.is_active ? "default" : "secondary"}>
                  {product.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>

            {/* Informações do Produto */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base line-clamp-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(product)}
                  className="shrink-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {/* Preço em destaque */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Preço:</span>
                  <span className="text-lg font-bold text-primary">
                    R$ {Number(product.price).toFixed(2)}
                  </span>
                </div>
                
                {product.cost && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Custo:</span>
                    <span className="text-sm font-medium">R$ {Number(product.cost).toFixed(2)}</span>
                  </div>
                )}

                {/* Estoque com badge colorido */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estoque:</span>
                  <Badge 
                    variant={
                      product.stock === null ? "secondary" :
                      product.stock <= (product.min_stock || 0) ? "destructive" : 
                      product.stock <= (product.min_stock || 0) * 2 ? "outline" :
                      "default"
                    }
                  >
                    {product.stock ?? "N/A"}
                  </Badge>
                </div>

                {product.categories && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Categoria:</span>
                    <Badge variant="outline" className="font-normal">
                      {product.categories.name}
                    </Badge>
                  </div>
                )}

                {/* SKU e Barcode em formato compacto */}
                {(product.sku || product.barcode) && (
                  <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                    {product.sku && (
                      <div className="flex justify-between">
                        <span>SKU:</span>
                        <span className="font-mono">{product.sku}</span>
                      </div>
                    )}
                    {product.barcode && (
                      <div className="flex justify-between">
                        <span>Código:</span>
                        <span className="font-mono">{product.barcode}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}