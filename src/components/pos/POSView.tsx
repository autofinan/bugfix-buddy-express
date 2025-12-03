import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Search, ShoppingCart, Plus, Minus, Package, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PaymentModal } from './PaymentModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobilePOSView } from './MobilePOSView';

interface Product {
  id: string;
  name: string;
  price: number;
  barcode?: string;
  stock?: number;
  cost?: number;
}

interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'produto' | 'servico';
  cost?: number;
  stock?: number;
}

export default function POSView() {
  const isMobile = useIsMobile();
  
  // Se for mobile, renderiza a versão mobile
  if (isMobile) {
    return <MobilePOSView />;
  }

  return <DesktopPOSView />;
}

function DesktopPOSView() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [activeTab, setActiveTab] = useState('produtos');
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchServices();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, barcode, stock, cost')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, price, description')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const addProductToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.type === 'produto');
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.type === 'produto'
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1, 
        type: 'produto',
        cost: product.cost 
      }];
    });
  };

  const addServiceToCart = (service: Service) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === service.id && item.type === 'servico');
      if (existing) {
        return prev.map(item =>
          item.id === service.id && item.type === 'servico'
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { 
        id: service.id, 
        name: service.name, 
        price: service.price, 
        quantity: 1, 
        type: 'servico' 
      }];
    });
  };

  const removeFromCart = (itemId: string, type: string) => {
    setCart(prev => prev.filter(item => !(item.id === itemId && item.type === type)));
  };

  const updateQuantity = (itemId: string, type: string, change: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId && item.type === type) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return item;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSaleComplete = () => {
    setCart([]);
    setShowPayment(false);
    toast({
      title: "Venda concluída!",
      description: "Venda registrada com sucesso.",
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.includes(searchTerm)
  );

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = getTotal();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Lado Esquerdo - Produtos e Serviços */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="produtos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="servicos" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Serviços
            </TabsTrigger>
          </TabsList>

          <TabsContent value="produtos" className="flex-1 overflow-y-auto mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => addProductToCart(product)}
                >
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-primary font-bold mt-1">{formatCurrency(product.price)}</p>
                  {product.stock !== undefined && product.stock !== null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Estoque: {product.stock}
                    </p>
                  )}
                </Card>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Nenhum produto encontrado
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="servicos" className="flex-1 overflow-y-auto mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => addServiceToCart(service)}
                >
                  <h3 className="font-medium text-sm truncate">{service.name}</h3>
                  <p className="text-primary font-bold mt-1">{formatCurrency(service.price)}</p>
                  {service.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {service.description}
                    </p>
                  )}
                </Card>
              ))}
              {filteredServices.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Nenhum serviço encontrado
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lado Direito - Carrinho */}
      <Card className="w-96 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho
            {itemCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Carrinho vazio</p>
              <p className="text-sm mt-1">Clique nos itens para adicionar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      {item.type === 'produto' ? (
                        <Package className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Wrench className="h-3 w-3 text-muted-foreground" />
                      )}
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, item.type, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.id, item.type, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="text-right min-w-[60px]">
                    <p className="font-bold text-sm text-primary">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeFromCart(item.id, item.type)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/30">
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
          </div>
          <Button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Finalizar Venda
          </Button>
        </div>
      </Card>

      {/* Payment Modal */}
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
