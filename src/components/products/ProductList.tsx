import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Package } from "lucide-react";
import type { Product } from "./ProductsView";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                R$ {product.price.toFixed(2)}
              </span>
              {product.cost && (
                <span className="text-sm text-muted-foreground">
                  Custo: R$ {product.cost.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Badge variant={product.stock && product.stock > (product.min_stock || 0) ? "default" : "destructive"}>
                {product.stock || 0} em estoque
              </Badge>
              <Badge variant={product.is_active ? "default" : "secondary"}>
                {product.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            {product.categories && (
              <Badge variant="outline" className="text-xs">
                {product.categories.name}
              </Badge>
            )}

            {(product.sku || product.barcode) && (
              <div className="text-xs text-muted-foreground space-y-1">
                {product.sku && <div>SKU: {product.sku}</div>}
                {product.barcode && <div>Código: {product.barcode}</div>}
              </div>
            )}
          </div>

          {product.image_url && (
            <div className="aspect-video bg-muted rounded-md overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}