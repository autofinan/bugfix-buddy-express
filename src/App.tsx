import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

import Header from "./components/layout/Header";
import { AppSidebar } from "./components/layout/AppSidebar";

// Produtos
import ProductsPage from "./components/products/ProductsView";
import BulkProductsPage from "./components/products/BulkProductsView";
import ImportCSVPage from "./components/products/ImportCSVView";

// PDV
import POSPage from "./components/pos/POSView";

// Orçamentos, despesas, vendas, relatórios, categorias, estoque
import BudgetsPage from "./components/budgets/BudgetsView";
import ExpensesPage from "./components/expenses/ExpensesDashboard";
import SalesPage from "./components/sales/SalesView";
import ReportsPage from "./components/reports/ReportsView";
import CategoriesPage from "./components/categories/CategoriesView";
import StockAdjustmentPage from "./components/inventory/StockAdjustmentView";

// Sidebar Provider
import { SidebarProvider } from "@/components/ui/sidebar";

const queryClient = new QueryClient();

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-primary-foreground rounded"></div>
          </div>
          <p className="text-lg font-medium text-foreground">Carregando Sistema POS...</p>
          <p className="text-sm text-muted-foreground mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Auth />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <div className="flex min-h-screen bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/pdv" element={<POSPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/bulk-products" element={<BulkProductsPage />} />
                  <Route path="/import-csv" element={<ImportCSVPage />} />
                  <Route path="/budgets" element={<BudgetsPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/sales" element={<SalesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/stock" element={<StockAdjustmentPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
