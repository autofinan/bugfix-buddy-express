import { TrendingUp, User, LogOut, ShoppingCart, Bell, Menu } from "lucide-react";
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
import { Link } from "react-router-dom";

interface HeaderProps {
  onMenuToggle?: () => void;
  onCartToggle?: () => void;
}

export default function Header({ onMenuToggle, onCartToggle }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { items } = useCart();

  const totalItemsInCart = (items || []).reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="flex-shrink-0 border-b bg-white shadow-sm sticky top-0 z-40">
      <div className="flex h-16 items-center px-4 lg:px-6">

        {/* Logo e Nome do Sistema */}
        <div className="flex items-center gap-3 flex-1">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-md transition-transform group-hover:scale-105">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary tracking-tight">MeuGestorPro</h1>
              <p className="text-[10px] text-muted-foreground leading-none">Gestão Inteligente para seu Negócio</p>
            </div>
          </Link>
        </div>

        {/* Ações do Header */}
        <div className="flex items-center gap-2">

          {/* Botão PDV Rápido */}
          <Button
            asChild
            variant="default"
            size="sm"
            className="hidden md:flex bg-gradient-primary hover:shadow-elegant transition-all"
          >
            <Link to="/pos">
              <ShoppingCart className="h-4 w-4 mr-2" />
              PDV
            </Link>
          </Button>

          {/* Notificações */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-muted"
          >
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              3
            </Badge>
          </Button>

          {/* Menu do Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted">
                <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:inline-block max-w-32 truncate font-medium">
                  {user?.email?.split('@')[0] || 'Usuário'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
        </div>

      </div>
    </header>
  );
}
