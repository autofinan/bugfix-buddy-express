import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGrid } from "./ProductGrid";
import { ServiceGrid } from "./ServiceGrid";
import { PaymentModal } from "./PaymentModal";
import { useToast } from "@/hooks/use-toast";
import { CartDrawer } from "./CartDrawer";
import { Package, Wrench } from "lucide-react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock?: number;
  type: "produto" | "servico";
}

export default function POSView() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const { toast } = useToast();

  const addProductToCart = (product: { id: string; name: string; price: number; stock: number }) => {
    setCart(current => {
      const existing = current.find(item => item.id === product.id && item.type === "produto");
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({
            title: "Estoque insuficiente",
            description: `Apenas ${product.stock} unidades disponíveis`,
            variant: "destructive",
            duration: 3000,
          });
          return current;
        }
        return current.map(item =>
          item.id === product.id && item.type === "produto"
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Abrir drawer automaticamente ao adicionar primeiro item
      if (current.length === 0) {
        setCartDrawerOpen(true);
      }
      return [...current, { ...product, quantity: 1, type: "produto" as const }];
    });
  };

  const addServiceToCart = (service: { id: string; name: string; price: number }) => {
    setCart(current => {
      const existing = current.find(item => item.id === service.id && item.type === "servico");
      if (existing) {
        return current.map(item =>
          item.id === service.id && item.type === "servico"
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Abrir drawer automaticamente ao adicionar primeiro item
      if (current.length === 0) {
        setCartDrawerOpen(true);
      }
      return [...current, { ...service, quantity: 1, type: "servico" as const }];
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
          // Apenas produtos têm controle de estoque
          if (item.type === "produto" && item.stock && quantity > item.stock) {
            toast({
              title: "Estoque insuficiente",
              description: `Apenas ${item.stock} unidades disponíveis`,
              variant: "destructive",
              duration: 3000,
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
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen space-y-6">
      {/* Header com título e botão de limpar carrinho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ponto de Venda</h1>
        </div>
        <CartDrawer
          items={cart}
          total={total}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={() => {
            setCartDrawerOpen(false);
            setShowPayment(true);
          }}
          open={cartDrawerOpen}
          onOpenChange={setCartDrawerOpen}
        />
      </div>

      {/* Tabs para Produtos e Serviços */}
      <Card className="p-6">
        <Tabs defaultValue="produtos" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="produtos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="servicos" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Serviços
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="produtos">
            <ProductGrid onAddToCart={addProductToCart} />
          </TabsContent>
          
          <TabsContent value="servicos">
            <ServiceGrid onAddToCart={addServiceToCart} />
          </TabsContent>
        </Tabs>
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