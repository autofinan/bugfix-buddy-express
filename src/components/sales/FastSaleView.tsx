import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Minus, ShoppingCart, CreditCard, Banknote, Smartphone, Grid3X3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SearchDropdown } from "@/components/ui/search-dropdown";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku?: string;
  barcode?: string;
  category?: {
    name: string;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
}

type PaymentMethod = "pix" | "cartao" | "dinheiro";

export function FastSaleView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("dinheiro");
  const [note, setNote] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSaleNumber, setLastSaleNumber] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          stock,
          sku,
          barcode,
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .gt('stock', 0)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar produtos",
        variant: "destructive"
      });
    }
  };

  const filterProducts = () => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm)
    );

    setFilteredProducts(filtered.slice(0, 10)); // Limit to 10 results
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Estoque insuficiente",
          description: `Apenas ${product.stock} unidades disponíveis`,
          variant: "destructive"
        });
        return;
      }
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }

    setSearchTerm("");
    setFilteredProducts([]);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.product.id !== productId));
      return;
    }

    const product = cart.find(item => item.product.id === productId)?.product;
    if (product && newQuantity > product.stock) {
      toast({
        title: "Estoque insuficiente",
        description: `Apenas ${product.stock} unidades disponíveis`,
        variant: "destructive"
      });
      return;
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const completeSale = async () => {
    if (cart.length === 0) return;

    setIsLoading(true);
    try {
      // Create sale record
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          total: getTotal(),
          payment_method: selectedPayment,
          note: note || null
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update stock and create inventory movements
      for (const item of cart) {
        // Update product stock
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: item.product.stock - item.quantity })
          .eq('id', item.product.id);

        if (stockError) throw stockError;

        // Create inventory movement
        const { error: movementError } = await supabase
          .from('inventory_movements')
          .insert({
            product_id: item.product.id,
            type: 'out',
            quantity: item.quantity,
            reason: `Venda #${sale.id.slice(-8)}`
          });

        if (movementError) throw movementError;
      }

      setLastSaleNumber(sale.id.slice(-8));
      setCart([]);
      setNote("");
      setShowPaymentModal(false);
      setShowReceipt(true);
      await fetchProducts(); // Refresh products to update stock

      toast({
        title: "Venda realizada",
        description: `Venda #${sale.id.slice(-8)} concluída com sucesso`
      });

    } catch (error) {
      console.error('Error completing sale:', error);
      toast({
        title: "Erro",
        description: "Erro ao finalizar venda",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods = [
    { id: "pix" as PaymentMethod, name: "PIX", icon: Smartphone },
    { id: "cartao" as PaymentMethod, name: "Cartão", icon: CreditCard },
    { id: "dinheiro" as PaymentMethod, name: "Dinheiro", icon: Banknote },
  ];

  const searchOptions = products.map(product => ({
    value: product.name,
    label: `${product.name} - R$ ${product.price.toFixed(2)}`,
    category: product.category?.name || "Sem categoria"
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Venda Rápida</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGrid(!showGrid)}
        >
          <Grid3X3 className="mr-2 h-4 w-4" />
          {showGrid ? "Ocultar Grid" : "Mostrar Grid"}
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <SearchDropdown
            value={searchTerm}
            onValueChange={(value) => {
              setSearchTerm(value);
              const selectedProduct = products.find(p => p.name === value);
              if (selectedProduct) {
                addToCart(selectedProduct);
              }
            }}
            options={searchOptions}
            placeholder="Buscar produto por nome, SKU ou código de barras..."
            emptyMessage="Nenhum produto encontrado"
          />

          {/* Search Results for manual typing */}
          {searchTerm && !searchOptions.find(opt => opt.value === searchTerm) && filteredProducts.length > 0 && (
            <div className="mt-4 space-y-2 max-h-60 overflow-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => addToCart(product)}
                >
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {product.sku && <Badge variant="outline">SKU: {product.sku}</Badge>}
                      {product.category && <Badge variant="secondary">{product.category.name}</Badge>}
                      <Badge variant="outline">Estoque: {product.stock}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">R$ {product.price.toFixed(2)}</p>
                    <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid */}
      {showGrid && products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Produtos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {products.slice(0, 24).map((product) => (
                <div
                  key={product.id}
                  className="group bg-gradient-subtle border rounded-xl p-3 hover:shadow-elegant hover:scale-[1.02] hover:border-primary/20 relative transition-all duration-200"
                >
                  <div className="space-y-2">
                    <div className="aspect-square bg-background/50 rounded-lg flex items-center justify-center text-2xl font-bold text-primary/70">
                      {product.name.charAt(0)}
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                      <p className="text-xs text-primary font-semibold">
                        R$ {product.price.toFixed(2)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {product.stock} un
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="w-full bg-gradient-primary hover:opacity-90 text-white border-0"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {products.length > 24 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Mostrando 24 de {products.length} produtos. Use a busca para encontrar mais.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cart - Always visible and at top when has items */}
      {cart.length > 0 && (
        <Card className="sticky top-4 z-20 bg-background/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrinho ({cart.length} {cart.length === 1 ? 'item' : 'itens'})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    R$ {item.product.price.toFixed(2)} cada
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="font-bold">
                      R$ {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-primary">R$ {getTotal().toFixed(2)}</span>
              </div>
              
              <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4 bg-gradient-primary hover:opacity-90" size="lg">
                    Fechar Venda
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Finalizar Venda</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">R$ {getTotal().toFixed(2)}</p>
                      <p className="text-muted-foreground">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Forma de Pagamento</label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {paymentMethods.map((method) => (
                          <Button
                            key={method.id}
                            variant={selectedPayment === method.id ? "default" : "outline"}
                            onClick={() => setSelectedPayment(method.id)}
                            className="flex flex-col gap-2 h-auto py-4"
                          >
                            <method.icon className="h-6 w-6" />
                            <span className="text-xs">{method.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Observação (opcional)</label>
                      <Textarea
                        placeholder="Adicionar observação..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <Button 
                      onClick={completeSale} 
                      disabled={isLoading}
                      className="w-full"
                      size="lg"
                    >
                      {isLoading ? "Processando..." : "Confirmar Venda"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Venda Concluída</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="text-6xl">✅</div>
            <div>
              <h3 className="text-2xl font-bold">Venda #{lastSaleNumber}</h3>
              <p className="text-xl font-semibold">R$ {getTotal().toFixed(2)}</p>
              <p className="text-muted-foreground">
                Pagamento: {paymentMethods.find(p => p.id === selectedPayment)?.name}
              </p>
            </div>
            <Button onClick={() => setShowReceipt(false)} className="w-full">
              Nova Venda
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}