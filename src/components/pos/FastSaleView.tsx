import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePlan } from "@/hooks/usePlan";
import { PaymentModal } from "./PaymentModal";
import { Minus, Plus, Trash2, ShoppingCart, Maximize, Minimize, Clock, User, Search, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isPro, loading: planLoading } = usePlan();
  const { user } = useAuth();

  // Atualizar relógio
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Verificar acesso ao PDV Rápido (apenas PRO) - só após carregar
  useEffect(() => {
    if (!planLoading && !isPro) {
      setShowPlanDialog(true);
    }
  }, [isPro, planLoading]);

  // Buscar configurações da loja
  useEffect(() => {
    fetchStoreSettings();
  }, []);

  // Entrar em fullscreen automaticamente
  useEffect(() => {
    if (!planLoading && isPro && containerRef.current && !isFullscreen) {
      enterFullscreen();
    }
  }, [isPro, planLoading]);

  // Manter foco no input sempre
  useEffect(() => {
    const interval = setInterval(() => {
      if (!searchMode && inputRef.current && document.activeElement !== inputRef.current && !showPayment) {
        inputRef.current.focus();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [searchMode, showPayment]);

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
        (e.ctrlKey && e.key === 'o') ||
        e.key === 'F11'
      ) {
        e.preventDefault();
      }

      // Atalhos do PDV
      if (e.key === 'F1') {
        e.preventDefault();
        toast({
          title: "Atalhos do PDV Rápido",
          description: "F2: Pesquisar | F3: Cancelar item | F4: Finalizar | ESC: Sair",
          duration: 5000,
        });
      }
      if (e.key === 'F2') {
        e.preventDefault();
        setSearchMode(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'F3' && cart.length > 0) {
        e.preventDefault();
        removeFromCart(cart[cart.length - 1].id);
      }
      if (e.key === 'F4' && cart.length > 0) {
        e.preventDefault();
        setShowPayment(true);
      }
      if (e.key === 'Escape') {
        if (searchMode) {
          setSearchMode(false);
          setSearchQuery("");
          setSearchResults([]);
        } else if (isFullscreen) {
          exitFullscreen();
        }
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
  }, [cart, showPayment, isFullscreen, searchMode]);

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

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .ilike("name", `%${query}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Erro na busca:", error);
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

    // Fechar busca após adicionar
    setSearchMode(false);
    setSearchQuery("");
    setSearchResults([]);
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
    playBeep();
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
  const operatorName = user?.email?.split('@')[0] || 'Operador';

  // Loading do plano
  if (planLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <p className="text-muted-foreground">Carregando PDV...</p>
        </div>
      </div>
    );
  }

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

      {/* TOPO - Header Profissional */}
      <div 
        className="h-20 px-6 flex items-center justify-between border-b-2"
        style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
      >
        <div className="flex items-center gap-4">
          <ShoppingCart className="h-8 w-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">
              {storeName}
            </h1>
            <p className="text-xs text-white/90">
              PDV Rápido - Frente de Caixa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Informações do Operador */}
          <div className="flex items-center gap-2 text-white/90">
            <User className="h-4 w-4" />
            <span className="text-sm">{operatorName}</span>
          </div>

          {/* Relógio */}
          <div className="flex items-center gap-2 text-white">
            <Clock className="h-4 w-4" />
            <span className="text-lg font-mono">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Atalhos */}
          <div className="hidden lg:flex items-center gap-3 text-white/80 text-xs">
            <span className="px-2 py-1 bg-white/10 rounded">F1: Ajuda</span>
            <span className="px-2 py-1 bg-white/10 rounded">F2: Buscar</span>
            <span className="px-2 py-1 bg-white/10 rounded">F3: Remover</span>
            <span className="px-2 py-1 bg-white/10 rounded">F4: Finalizar</span>
          </div>

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

      {/* Barra de Busca (F2) */}
      {searchMode && (
        <div className="px-6 py-3 bg-white border-b shadow-sm">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Digite o nome do produto para buscar..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="flex-1 text-lg"
              autoFocus
            />
            <Button variant="outline" onClick={() => {
              setSearchMode(false);
              setSearchQuery("");
              setSearchResults([]);
            }}>
              Cancelar (ESC)
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto">
              {searchResults.map(product => (
                <div 
                  key={product.id}
                  className="p-3 hover:bg-muted cursor-pointer flex items-center justify-between border-b last:border-b-0"
                  onClick={() => {
                    addToCart(product);
                    playBeep();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.barcode || 'Sem código'} • Estoque: {product.stock || 0}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-lg" style={{ color: primaryColor }}>
                    {formatCurrency(product.price)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Produto Atual - Destaque */}
      {currentProduct && (
        <div className="px-6 py-4 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Imagem do Produto */}
              {currentProduct.image_url ? (
                <img 
                  src={currentProduct.image_url} 
                  alt={currentProduct.name}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Último produto:</p>
                <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>
                  {currentProduct.name}
                </h2>
                <div className="flex items-center gap-6 mt-1 text-sm text-muted-foreground">
                  <span>Código: {currentProduct.barcode || lastScanned || '-'}</span>
                  <span>Qtd: {currentProduct.quantity}</span>
                  <span>Unit: {formatCurrency(currentProduct.price)}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total do item</p>
              <p className="text-4xl font-bold" style={{ color: primaryColor }}>
                {formatCurrency(currentProduct.price * currentProduct.quantity)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CORPO - Grid 2 colunas */}
      <div className="flex-1 grid grid-cols-3 gap-0 overflow-hidden">
        {/* ESQUERDA - TABELA (2 colunas) */}
        <div className="col-span-2 bg-white border-r overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Cupom da Venda</h2>
            <span className="text-sm text-muted-foreground">{itemCount} itens</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <ShoppingCart className="h-24 w-24 text-muted-foreground/30 mb-4" />
                <p className="text-2xl font-medium text-muted-foreground">
                  Venda Aberta
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Escaneie um produto ou pressione F2 para buscar
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-muted/50 z-10">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Descrição</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Quant.</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Valor Unit.</th>
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
                          ? 'bg-emerald-50' 
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
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
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

        {/* DIREITA - PAINEL TOTAL */}
        <div className="bg-gradient-to-b from-white to-muted/30 flex flex-col">
          {/* Status da Venda */}
          <div className="px-6 py-4 border-b text-center">
            <span 
              className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                cart.length > 0 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {cart.length > 0 ? 'Venda em Andamento' : 'Venda Aberta'}
            </span>
          </div>

          {/* Total Destacado */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Total a Pagar
            </p>
            <p 
              className="text-6xl font-bold tracking-tight"
              style={{ color: primaryColor }}
            >
              {formatCurrency(total)}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'} no carrinho
            </p>
          </div>

          {/* Ações */}
          <div className="p-6 space-y-3">
            <Button
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
              className="w-full h-16 text-xl font-bold"
              style={{ backgroundColor: cart.length > 0 ? primaryColor : undefined }}
            >
              Finalizar Venda (F4)
            </Button>
            
            {cart.length > 0 && (
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full h-12 text-destructive border-destructive hover:bg-destructive/10"
              >
                Cancelar Venda
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div 
        className="h-10 px-6 flex items-center justify-between text-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <span className="text-white/90">
          {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
        <span className="text-white font-medium">
          {storeName} - Operador: {operatorName}
        </span>
      </div>

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
