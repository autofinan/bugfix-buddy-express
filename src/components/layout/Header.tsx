import { Store, User, LogOut, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/context/CartContext"; 
import { Badge } from "@/components/ui/badge"; 
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onCartToggle?: () => void;
}

export default function Header({ onCartToggle }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { items } = useCart();
  
  const totalItemsInCart = (items || []).reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 flex-shrink-0 border-b bg-gradient-header shadow-md">
      <div className="flex h-14 sm:h-16 items-center px-3 sm:px-4 lg:px-6 gap-2">

        {/* Botão Menu Mobile - sempre visível em telas pequenas */}
        <SidebarTrigger className="lg:hidden" />

        {/* Logo e Título */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm flex-shrink-0">
            <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white truncate">MeuGestorPro</h1>
            <p className="text-xs text-white/80 truncate">Gestão Profissional</p>
          </div>
        </div>

        {/* Lado Direito */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* Botão Carrinho */}
          {onCartToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCartToggle}
              className="relative text-white hover:bg-white/10 h-9 w-9"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {totalItemsInCart > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-[10px] sm:text-xs bg-secondary hover:bg-secondary"
                >
                  {totalItemsInCart}
                </Badge>
              )}
            </Button>
          )}

          {/* Menu do Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-white hover:bg-white/10 h-9">
                <User className="h-4 w-4" />
                <span className="hidden md:inline-block max-w-24 lg:max-w-32 truncate text-sm">
                  {user?.email || 'Usuário'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50">
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
