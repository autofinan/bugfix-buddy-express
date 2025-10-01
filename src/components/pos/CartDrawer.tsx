import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Cart } from "./Cart"
import { CartProduct } from "./POSView"
import { ShoppingCart } from "lucide-react"

interface CartDrawerProps {
  items: CartProduct[];
  total: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  items,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ShoppingCart size={18} />
          Carrinho ({items.length})
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Carrinho</SheetTitle>
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
