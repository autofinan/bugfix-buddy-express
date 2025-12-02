import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePlan } from "@/hooks/usePlan";
import { PaymentModal } from "./PaymentModal";
import { Minus, Plus, Trash2, ShoppingCart, X, Maximize, Minimize } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface FastSaleCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock?: number;
  barcode?: string;
  image_url?: string;
  type: "produto" | "servico";
}

export default function FastSaleView() {
  const [cart, setCart] = useState<FastSaleCartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>("");
  const [currentProduct, setCurrentProduct] = useState<FastSaleCartItem | null>(null);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isPro, canUseFeature } = usePlan();

  // Verificar acesso ao PDV Rápido (apenas PRO)
  useEffect(() => {
    if (!isPro) {
      setShowPlanDialog(true);
    }
  }, [isPro]);

  // Buscar configurações da loja
  useEffect(() => {
    fetchStoreSettings();
  }, []);

  // Entrar em fullscreen automaticamente
  useEffect(() => {
    if (isPro && containerRef.current && !isFullscreen) {
      enterFullscreen();
    }
  }, [isPro]);

  // Manter foco no input sempre
  useEffect(() => {
    const interval = setInterval(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Detectar mudanças no fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Bloquear teclas e ações indesejadas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloquear zoom e outras teclas
      if (
        (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'p' && !showPayment) ||
        (e.ctrlKey && e.key === 'o') ||
        e.key === 'F5' ||
        e.key === 'F11'
      ) {
        e.preventDefault();
      }

      // Atalhos do PDV
      if (e.key === 'F1') {
        e.preventDefault();
        toast({
          title: "Atalhos do PDV Rápido",
          description: "F2: Pesquisar | F3: Cancelar item | F4: Finalizar | ESC: Sair fullscreen",
          duration: 5000,
        });
      }
      if (e.key === 'F3' && cart.length > 0) {
        e.preventDefault();
        removeFromCart(cart[cart.length - 1].id);
      }
      if (e.key === 'F4' && cart.length > 0) {
        e.preventDefault();
        setShowPayment(true);
      }
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [cart, showPayment, isFullscreen]);

  const enterFullscreen = async () => {
    if (containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Erro ao entrar em fullscreen:', error);
      }
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Erro ao sair do fullscreen:', error);
      }
    }
  };

  const fetchStoreSettings = async () => {
    try {
      const { data } = await supabase
        .from("store_settings")
        .select("*")
        .maybeSingle();
      
      setStoreSettings(data);
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
    }
  };

  // Som de beep
  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.error("Erro ao tocar som:", error);
    }
  };

  const handleScan = async (barcode: string) => {
    if (!barcode.trim()) return;

    setLastScanned(barcode);

    try {
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .or(`barcode.eq.${barcode},sku.eq.${barcode}`)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !product) {
        toast({
          title: "Produto não encontrado",
          description: `Código: ${barcode}`,
          variant: "destructive",
          duration: 2000,
        });
        return;
      }

      if (product.stock !== null && product.stock <= 0) {
        toast({
          title: "Estoque esgotado",
          description: product.name,
          variant: "destructive",
          duration: 2000,
        });
        return;
      }

      addToCart(product);
      playBeep();
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
    }
  };

  const addToCart = (product: any) => {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      
      if (existing) {
        if (product.stock !== null && existing.quantity >= product.stock) {
          toast({
            title: "Estoque insuficiente",
            description: `Apenas ${product.stock} unidades disponíveis`,
            variant: "destructive",
            duration: 2000,
          });
          return current;
        }

        const updated = current.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        
        setCurrentProduct(updated.find(item => item.id === product.id) || null);
        return updated;
      }

      const newItem: FastSaleCartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock,
        barcode: product.barcode,
        image_url: product.image_url,
        type: "produto" as const
      };

      setCurrentProduct(newItem);
      return [...current, newItem];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(current =>
      current.map(item => {
        if (item.id === id) {
          if (item.stock !== null && quantity > item.stock) {
            toast({
              title: "Estoque insuficiente",
              description: `Apenas ${item.stock} unidades disponíveis`,
              variant: "destructive",
              duration: 2000,
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
    setCurrentProduct(null);
  };

  const clearCart = () => {
    setCart([]);
    setLastScanned("");
    setCurrentProduct(null);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSaleComplete = () => {
    setShowPayment(false);
    clearCart();
    toast({
      title: "✅ Venda finalizada",
      description: "Venda registrada com sucesso!",
      duration: 3000,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const primaryColor = storeSettings?.primary_color || "#10b981";
  const storeName = storeSettings?.store_name || "GestorMEI";

  // Bloqueio para plano não-PRO
  if (!isPro) {
    return (
      <AlertDialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">PDV Rápido é Exclusivo do Plano PRO</AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-4">
              <p className="font-medium text-foreground">
                O PDV Rápido é um recurso premium com:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                <li>Tela cheia profissional para operação</li>
                <li>Leitura automática de código de barras</li>
                <li>Interface otimizada para alta velocidade</li>
                <li>Som de confirmação em cada item</li>
                <li>Atalhos de teclado avançados</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Assine o Plano PRO para liberar este e outros recursos exclusivos.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => window.location.href = '/settings'}>
              Conhecer Planos PRO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: '#f5f7fc' }}
    >
      {/* Input invisível para leitura de código de barras */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleScan(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
        autoFocus
      />

      {/* TOPO - 80px */}
      <div 
        className="h-20 px-6 flex items-center justify-between border-b-2"
        style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
      >
        <div className="flex items-center gap-4">
          <ShoppingCart className="h-8 w-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">
              {storeName} - PDV Rápido
            </h1>
            <p className="text-xs text-white/90">
              Modo Quiosque Ativado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-white/90 text-sm">
          <span>F1: Ajuda</span>
          <span>F3: Remover</span>
          <span>F4: Finalizar</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            className="text-white hover:bg-white/20"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Produto Atual */}
      {currentProduct && (
        <div className="px-6 py-3 bg-white border-b">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Último escaneado:</span>
            <span className="text-2xl font-bold" style={{ color: primaryColor }}>
              {currentProduct.name}
            </span>
            <span className="text-lg text-muted-foreground">
              {currentProduct.barcode || lastScanned}
            </span>
          </div>
        </div>
      )}

      {/* CORPO - Grid 2 colunas */}
      <div className="flex-1 grid grid-cols-3 gap-0 overflow-hidden">
        {/* ESQUERDA - TABELA (2 colunas) */}
        <div className="col-span-2 bg-white border-r overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b bg-muted/30">
            <h2 className="text-lg font-semibold">Lista da Venda ({itemCount} itens)</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <ShoppingCart className="h-24 w-24 text-muted-foreground/30 mb-4" />
                <p className="text-2xl font-medium text-muted-foreground">
                  Escaneie um produto para começar
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Aponte o leitor de código de barras ou digite o código
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-muted/50 z-10">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Descrição</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Quantidade</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Preço Unitário</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Preço Total</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr 
                      key={item.id}
                      className={`border-b transition-colors ${
                        index === cart.length - 1 
                          ? 'bg-emerald-50 animate-pulse' 
                          : index % 2 === 0 
                            ? 'bg-muted/20' 
                            : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-4 text-sm font-mono">
                        {item.barcode || item.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-4 text-base font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-xl font-bold w-12 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-base">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-4 text-right text-lg font-bold" style={{ color: primaryColor }}>
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* DIREITA - PAINEL (1 coluna) */}
        <div className="bg-gradient-to-b from-white to-muted/30 p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Imagem do Produto Atual */}
          {currentProduct && (
            <Card>
              <CardContent className="p-4">
                {currentProduct.image_url ? (
                  <img 
                    src={currentProduct.image_url} 
                    alt={currentProduct.name}
                    className="w-full aspect-square object-cover rounded-lg mb-3"
                  />
                ) : (
                  <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center mb-3">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Código do Produto</p>
                    <p className="font-mono text-sm">{currentProduct.barcode || lastScanned}</p>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Quantidade</p>
                      <p className="text-2xl font-bold">{currentProduct.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Preço Unit.</p>
                      <p className="text-lg font-semibold">{formatCurrency(currentProduct.price)}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Preço Total do Item</p>
                    <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                      {formatCurrency(currentProduct.price * currentProduct.quantity)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumo da Venda */}
          <Card style={{ borderColor: primaryColor, borderWidth: 2 }}>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Resumo da Venda</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="text-muted-foreground">Total de Itens</span>
                  <span className="font-bold">{itemCount}</span>
                </div>
                
                <div className="pt-3 border-t-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-semibold">VALOR TOTAL</span>
                    <span className="text-4xl font-bold" style={{ color: primaryColor }}>
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="space-y-3 mt-auto">
            <Button
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
              className="w-full h-16 text-xl font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingCart className="mr-3 h-6 w-6" />
              Concluir Venda
            </Button>

            {cart.length > 0 && (
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full h-12 text-base"
              >
                <X className="mr-2 h-5 w-5" />
                Cancelar Venda
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Pagamento */}
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
