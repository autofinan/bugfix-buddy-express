import { Store, User, LogOut, ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/context/CartContext"; 
import { Badge } from "@/components/ui/badge"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuToggle?: () => void;
  onCartToggle?: () => void;
}

export default function Header({ onMenuToggle, onCartToggle }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { items } = useCart();
  
  const totalItemsInCart = (items || []).reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="flex-shrink-0 border-b bg-background">
      <div className="flex h-16 items-center px-4 lg:px-6">
        
        {/* Lado Esquerdo */}
        <div className="flex items-center gap-3">
          
          {/* Botão Menu Mobile */}
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Logo e Título */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <Store className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">Sistema POS</h1>
              <p className="text-xs text-muted-foreground">Gestão de Vendas & Estoque</p>
            </div>
          </div>
        </div>

        {/* Lado Direito */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          
          {/* Botão Carrinho */}
          {onCartToggle && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onCartToggle}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItemsInCart > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {totalItemsInCart}
                </Badge>
              )}
            </Button>
          )}

          {/* Menu do Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline-block max-w-32 truncate">
                  {user?.email || 'Usuário'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
      </div>
    </header>
  );
}
