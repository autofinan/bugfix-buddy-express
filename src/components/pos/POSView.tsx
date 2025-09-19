import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ProductGrid } from "./ProductGrid";
import { PaymentModal } from "./PaymentModal";
import { useToast } from "@/hooks/use-toast";
import { CartDrawer } from "./CartDrawer";

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

export default function POSView() {
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const addToCart = (product: Omit<CartProduct, "quantity">) => {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({
            title: "Estoque insuficiente",
            description: `Apenas ${product.stock} unidades disponíveis`,
            variant: "destructive",
          });
          return current;
        }
        return current.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(current => current.filter(item => item.id !== id));
      return;
    }

    setCart(current =>
      current.map(item => {
        if (item.id === id) {
          if (quantity > item.stock) {
            toast({
              title: "Estoque insuficiente",
              description: `Apenas ${item.stock} unidades disponíveis`,
              variant: "destructive",
            });
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setCart(current => current.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setShowPayment(false);
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos antes de finalizar a venda",
        variant: "destructive",
      });
      return;
    }
    setShowPayment(true);
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ponto de Venda</h1>
          <p className="text-muted-foreground">Selecione os produtos e finalize a venda</p>
        </div>
        
        <CartDrawer 
          items={cart}
          total={total}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onCheckout={handleCheckout}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card className="p-6">
            <ProductGrid onAddToCart={addToCart} />
          </Card>
        </div>
      </div>

      <PaymentModal
        open={showPayment}
        onOpenChange={setShowPayment}
        total={total}
        cartItems={cart}
        onComplete={clearCart}
      />
    </div>
  );
}