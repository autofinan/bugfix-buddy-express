import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, ScanBarcode, ShoppingCart, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { PaymentModal } from './PaymentModal';

interface Product {
  id: string;
  name: string;
  price: number;
  barcode?: string;
  stock?: number;
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
        .select('id, name, price, barcode, stock')
        .eq('is_active', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 150);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const handleBarcodeScan = (code: string) => {
    const product = products.find(p => p.barcode === code);
    
    if (product) {
      addToCart(product);
      playBeep();
      toast({
        title: "✓ Produto adicionado",
        description: product.name,
        duration: 1500,
      });
    } else {
      toast({
        title: "Produto não encontrado",
        description: `Código: ${code}`,
        variant: "destructive",
        duration: 2000,
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

  const total = getTotal();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header Compacto */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex-shrink-0 safe-area-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">PDV Mobile</h1>
            <p className="text-xs opacity-80">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">Total</p>
            <p className="text-xl font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      {/* Botão Principal de Scanner */}
      <div className="p-4 flex-shrink-0">
        <Button
          onClick={() => setShowScanner(true)}
          size="lg"
          className="w-full h-28 text-xl font-bold flex flex-col items-center justify-center gap-3 bg-primary hover:bg-primary/90 shadow-xl rounded-xl"
        >
          <ScanBarcode className="h-12 w-12" />
          <span>ESCANEAR PRODUTO</span>
        </Button>
      </div>

      {/* Lista de Itens do Carrinho */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {cart.length === 0 ? (
          <Card className="p-8 text-center bg-muted/30 border-dashed">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">
              Carrinho vazio
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Toque em "Escanear Produto" para começar
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <Card key={item.id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <p className="font-bold text-sm text-primary">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer Fixo - Finalizar Venda */}
      {cart.length > 0 && (
        <div className="p-4 bg-card border-t shadow-lg flex-shrink-0 safe-area-bottom">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{itemCount} itens</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
          </div>
          <Button
            onClick={() => setShowPayment(true)}
            size="lg"
            className="w-full h-14 text-lg font-bold"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Finalizar Venda
          </Button>
        </div>
      )}

      {/* Scanner Modal - Mantém aberto após leitura */}
      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleBarcodeScan}
        keepOpen={true}
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
