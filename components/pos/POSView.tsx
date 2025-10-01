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

  const removeFromCart = (id: string) => {
    setCart(current => current.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSaleComplete = () => {
    setShowPayment(false);
    clearCart();
    toast({
      title: "Venda finalizada",
      description: "Venda registrada com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com título e botão de limpar carrinho */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ponto de Venda</h1>
        <div className="flex gap-2">
          <CartDrawer
            items={cart}
            total={total}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={() => setShowPayment(true)}
          />
        </div>
      </div>

      {/* Grade de produtos */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Produtos</h2>
        <ProductGrid onAddToCart={addToCart} />
      </Card>

      {/* Modal de pagamento */}
      <PaymentModal
        open={showPayment}
        onOpenChange={setShowPayment}
        total={total}
        cartItems={cart}
        onComplete={handleSaleComplete}
      />
    </div>
  );
}
