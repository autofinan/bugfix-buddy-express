import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  ShoppingCart,
  Package,
  FileText,
  DollarSign,
  BarChart3,
  Tags,
  Archive,
  Upload,
  PackagePlus,
  CreditCard,
  Settings,
  Wrench,
  Brain,
  TrendingUp,
  Users,
  Wallet,
  PieChart,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    items: [
      {
        title: 'Início',
        url: '/',
        icon: Home,
      },
    ],
  },
  {
    title: 'Vendas',
    items: [
      {
        title: 'PDV',
        url: '/pos',
        icon: CreditCard,
      },
      {
        title: 'Vendas',
        url: '/sales',
        icon: ShoppingCart,
      },
      {
        title: 'Orçamentos',
        url: '/budgets',
        icon: FileText,
      },
    ],
  },
  {
    title: 'Produtos',
    items: [
      {
        title: 'Produtos',
        url: '/products',
        icon: Package,
      },
      {
        title: 'Serviços',
        url: '/services',
        icon: Wrench,
      },
      {
        title: 'Cadastro em Lote',
        url: '/bulk-products',
        icon: PackagePlus,
      },
      {
        title: 'Importar CSV',
        url: '/import-csv',
        icon: Upload,
      },
      {
        title: 'Categorias',
        url: '/categories',
        icon: Tags,
      },
    ],
  },
  {
    title: 'Gestão',
    items: [
      {
        title: 'Estoque',
        url: '/stock',
        icon: Archive,
      },
      {
        title: 'Despesas',
        url: '/expenses',
        icon: DollarSign,
      },
      {
        title: 'Relatórios',
        url: '/reports',
        icon: BarChart3,
      },
      {
        title: 'DRE',
        url: '/reports/dre',
        icon: TrendingUp,
      },
      {
        title: 'Fluxo de Caixa',
        url: '/reports/cashflow',
        icon: Wallet,
      },
      {
        title: 'Curva ABC',
        url: '/reports/abc',
        icon: PieChart,
      },
      {
        title: 'Assistente Financeiro',
        url: '/financial-assistant',
        icon: Brain,
      },
      {
        title: 'Configurações',
        url: '/settings',
        icon: Settings,
      },
      {
        title: 'Funcionários',
        url: '/employees',
        icon: Users,
      },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { permissions, isOwner } = useAuth();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border py-4 px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-lg flex-shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            {state !== "collapsed" && (
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-sidebar-foreground truncate">MeuGestorPro</h2>
                <p className="text-xs text-sidebar-foreground/60 truncate">Sistema de Gestão</p>
              </div>
            )}
          </div>
          <SidebarTrigger className="lg:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => {
          // Ocultar grupo "Gestão" para funcionários, exceto Estoque
          if (group.title === 'Gestão' && !isOwner) {
            // Mostrar apenas Estoque para funcionários
            const estoqueItem = group.items.find(item => item.url === '/stock');
            if (!estoqueItem) return null;
            
            return (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem key={estoqueItem.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === estoqueItem.url}
                      >
                        <Link to={estoqueItem.url}>
                          <estoqueItem.icon className="w-4 h-4 flex-shrink-0" />
                          {state !== "collapsed" && <span>{estoqueItem.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                    {group.items.map((item) => {
                      // Filtrar itens do grupo Gestão baseado em permissões
                      if (group.title === 'Gestão') {
                        if (item.url === '/expenses' && !permissions.canViewExpenses) return null;
                        if (item.url === '/reports' && !permissions.canViewReports) return null;
                        if (item.url === '/financial-assistant' && !permissions.canViewFinancialAssistant) return null;
                        if (item.url === '/settings' && !permissions.canAccessSettings) return null;
                        if (item.url === '/employees' && !permissions.canAccessSettings) return null;
                      }

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.url}
                        >
                        <Link to={item.url}>
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          {state !== "collapsed" && <span>{item.title}</span>}
                        </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
