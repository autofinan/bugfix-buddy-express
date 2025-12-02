import { Store, User, LogOut } from "lucide-react";
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
    <header className="sticky top-0 z-50 flex-shrink-0 border-b bg-gradient-to-r from-blue-600 to-green-500 shadow-lg">
      <div className="flex h-14 sm:h-16 items-center px-3 sm:px-4 lg:px-6 gap-2">
        {/* Botão Menu Mobile */}
        <SidebarTrigger className="lg:hidden text-white hover:bg-white/20" />
        
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Ícone PNG */}
          <img 
            src="/logo/icone_grande SF.png" 
            alt="GestorMEI" 
            className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 object-contain drop-shadow-lg"
          />
          
          {/* Texto - visível em telas médias+ */}
          <div className="hidden sm:flex flex-col min-w-0">
            <div className="flex items-baseline gap-0.5">
              <span className="text-base sm:text-lg font-bold text-white drop-shadow">
                Gestor
              </span>
              <span className="text-base sm:text-lg font-bold text-white drop-shadow">
                MEI
              </span>
            </div>
            <p className="text-xs text-white/90 truncate">
              Gestão Profissional
            </p>
          </div>
        </div>
        
        {/* Lado Direito */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Botão Carrinho (se existir) */}
          {onCartToggle && totalItemsInCart > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCartToggle}
              className="relative text-white hover:bg-white/20 h-9 w-9"
            >
              <Store className="h-5 w-5" />
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-green-500 hover:bg-green-600 border-2 border-white"
              >
                {totalItemsInCart}
              </Badge>
            </Button>
          )}
          
          {/* Menu do Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-white hover:bg-white/20 h-9"
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline-block max-w-32 truncate text-sm">
                  {user?.email?.split('@')[0] || 'Usuário'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 w-56">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium truncate">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuItem onClick={signOut} className="cursor-pointer">
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
