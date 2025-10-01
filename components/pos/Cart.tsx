import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { CartProduct } from "./POSView";

export interface CartItem extends CartProduct {}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  total: number;
  onCheckout: () => void;
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, total, onCheckout }: CartProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Carrinho vazio</p>
        <p className="text-sm text-muted-foreground">Adicione produtos para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <Card key={item.id} className="p-3">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    R$ {item.price.toFixed(2)} cada
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                    min="1"
                    max={item.stock}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} x R$ {item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="border-t pt-4 space-y-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total:</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
        
        <Button 
          onClick={onCheckout} 
          className="w-full" 
          size="lg"
          disabled={items.length === 0}
        >
          Finalizar Venda
        </Button>
      </div>
    </div>
  );
}