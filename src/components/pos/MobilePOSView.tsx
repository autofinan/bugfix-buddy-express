import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ScanBarcode, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { PaymentModal } from './PaymentModal';

interface Product {
  id: string;
  name: string;
  price: number;
  barcode?: string;
}

interface CartItem extends Product {
  quantity: number;
  type: 'produto' | 'servico';
}

export function MobilePOSView() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, barcode')
        .eq('is_active', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive"
      });
    }
  };

  const handleBarcodeScan = (code: string) => {
    const product = products.find(p => p.barcode === code);
    
    if (product) {
      addToCart(product);
      toast({
        title: "Produto adicionado",
        description: `${product.name} adicionado ao carrinho.`
      });
    } else {
      toast({
        title: "Produto não encontrado",
        description: `Código de barras ${code} não cadastrado.`,
        variant: "destructive"
      });
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, type: 'produto' }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
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
      title: "Venda concluída",
      description: "Venda registrada com sucesso!"
    });
  };

  const total = getTotal();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">PDV Mobile</h1>
            <p className="text-sm opacity-90">GestorMEI</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-90">Total</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      {/* Scan Button - Destaque */}
      <div className="p-4">
        <Button
          onClick={() => setShowScanner(true)}
          size="lg"
          className="w-full h-24 text-xl font-bold"
        >
          <ScanBarcode className="h-8 w-8 mr-3" />
          BIPAR PRODUTO
        </Button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {cart.length === 0 ? (
          <Card className="p-8 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Carrinho vazio
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Escaneie produtos para começar
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-8 w-8 p-0"
                    >
                      -
                    </Button>
                    <span className="font-semibold w-8 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-8 w-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Finalizar */}
      {cart.length > 0 && (
        <div className="p-4 bg-card border-t shadow-lg">
          <Button
            onClick={() => setShowPayment(true)}
            size="lg"
            className="w-full h-16 text-lg font-bold"
          >
            Finalizar Venda - {formatCurrency(total)}
          </Button>
        </div>
      )}

      {/* Scanner Modal */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleBarcodeScan}
      />

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
