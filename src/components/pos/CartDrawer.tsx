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
          className="fixed bottom-8 right-8 z-50 h-16 px-6 shadow-elegant hover:shadow-glow transition-all duration-300 bg-gradient-primary hover:scale-105 rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {items.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
                >
                  {items.length}
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs opacity-90 font-medium">Carrinho</span>
              <span className="text-lg font-bold">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md bg-gradient-subtle">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            Carrinho de Compras
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4 h-[calc(100%-80px)]">
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
