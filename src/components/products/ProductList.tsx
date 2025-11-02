import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Package } from "lucide-react";
import { Product } from "./ProductsView";

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
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Preço:</span>
              <span className="font-medium">R$ {Number(product.price).toFixed(2)}</span>
            </div>
            
            {product.cost && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Custo:</span>
                <span className="text-sm">R$ {Number(product.cost).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estoque:</span>
              <Badge 
                variant={
                  product.stock === null ? "secondary" :
                  product.stock <= (product.min_stock || 0) ? "destructive" : 
                  "default"
                }
              >
                {product.stock ?? "N/A"}
              </Badge>
            </div>

            {product.categories && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Categoria:</span>
                <Badge variant="outline">{product.categories.name}</Badge>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={product.is_active ? "default" : "secondary"}>
                {product.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            {(product.sku || product.barcode) && (
              <div className="text-xs text-muted-foreground space-y-1">
                {product.sku && <div>SKU: {product.sku}</div>}
                {product.barcode && <div>Código: {product.barcode}</div>}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}