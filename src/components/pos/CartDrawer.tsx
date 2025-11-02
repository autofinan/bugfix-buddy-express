import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cart } from "./Cart"
import { CartItem } from "./POSView"
import { ShoppingCart } from "lucide-react"

interface CartDrawerProps {
  items: CartItem[];
  total: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CartDrawer({
  items,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  open,
  onOpenChange
}: CartDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="default" 
          size="lg"
          className="fixed bottom-6 right-6 z-50 h-14 px-6 shadow-elegant hover:shadow-glow transition-all duration-300 bg-gradient-primary"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {items.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {items.length}
              </Badge>
            )}
          </div>
          <div className="ml-3 flex flex-col items-start">
            <span className="text-xs opacity-90">Carrinho</span>
            <span className="font-bold">R$ {total.toFixed(2)}</span>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho de Compras
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-4 h-[calc(100%-80px)]">
          <Cart
            items={items}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            total={total}
            onCheckout={onCheckout}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
