import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGrid } from "./ProductGrid";
import { ServiceGrid } from "./ServiceGrid";
import { PaymentModal } from "./PaymentModal";
import { useToast } from "@/hooks/use-toast";
import { CartDrawer } from "./CartDrawer";
import { Package, Wrench, Maximize, Zap } from "lucide-react";
import FastSaleView from "./FastSaleView";
import { MobilePOSView } from "./MobilePOSView";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const [kioskMode, setKioskMode] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Atalho Ctrl+P para abrir pagamento
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        if (cart.length > 0) {
          setCartDrawerOpen(false);
          setShowPayment(true);
        }
      }
      // ESC para sair do modo quiosque
      if (e.key === 'Escape' && kioskMode) {
        exitKioskMode();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart, kioskMode]);

  const enterKioskMode = () => {
    document.documentElement.requestFullscreen?.();
    setKioskMode(true);
    toast({
      title: "Modo Quiosque Ativado",
      description: "Pressione ESC para sair",
      duration: 2000,
    });
  };

  const exitKioskMode = () => {
    document.exitFullscreen?.();
    setKioskMode(false);
    toast({
      title: "Modo Quiosque Desativado",
      duration: 2000,
    });
  };

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

  // Se estiver no modo rápido, renderizar versão apropriada
  if (fastMode) {
    // Mobile usa MobilePOSView, Desktop usa FastSaleView
    if (isMobile) {
      return (
        <div className="min-h-screen">
          <div className="p-4">
            <Button
              variant="outline"
              onClick={() => setFastMode(false)}
              className="mb-4"
            >
              Voltar ao PDV Normal
            </Button>
          </div>
          <MobilePOSView />
        </div>
      );
    }
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={() => setFastMode(false)}
          >
            Voltar ao PDV Normal
          </Button>
        </div>
        <FastSaleView />
      </div>
    );
  }

  return (
    <div className={`space-y-4 md:space-y-6 min-h-screen ${kioskMode ? 'p-4' : ''}`}>
      {/* Header responsivo */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold truncate">Ponto de Venda</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden sm:block">
              {!kioskMode && "Pressione Ctrl+P para finalizar venda"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFastMode(true)}
              className="flex-1 sm:flex-none"
            >
              <Zap className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden xs:inline">PDV </span>Rápido
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={kioskMode ? exitKioskMode : enterKioskMode}
              className="flex-1 sm:flex-none"
            >
              <Maximize className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">{kioskMode ? "Sair do Quiosque" : "Modo Quiosque"}</span>
              <span className="md:hidden">{kioskMode ? "Sair" : "Quiosque"}</span>
            </Button>
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
        </div>
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
