// src/App.tsx

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Demo from "./pages/Demo";
import DemoDashboard from "./pages/DemoDashboard";
import Settings from "./pages/Settings";
import PublicInvoice from "./pages/PublicInvoice";
import PublicNF from "./pages/PublicNF";
import DRE from "./pages/reports/DRE";
import CashFlow from "./pages/reports/CashFlow";
import ABCCurve from "./pages/reports/ABCCurve";
import ServicesView from "./components/services/ServicesView";
import FinancialAssistantView from "./components/financial-assistant/FinancialAssistantView";

import Header from "./components/layout/Header";
import { AppSidebar } from "./components/layout/AppSidebar";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Produtos
import ProductsPage from "./components/products/ProductsView";
import BulkProductsPage from "./components/products/BulkProductsView";
import ImportCSVPage from "./components/products/ImportCSVView";

// PDV
import POSPage from "./components/pos/POSView";

// Orçamentos, despesas, vendas, relatórios, categorias, estoque
import BudgetsPage from "./components/budgets/BudgetsView";
import ExpensesPage from "./components/expenses/ExpensesView";
import { SalesViewEnhanced } from "./components/sales/SalesViewEnhanced";
import ReportsPage from "./components/reports/ReportsView";
import CategoriesPage from "./components/categories/CategoriesView";
import StockAdjustmentPage from "./components/inventory/StockAdjustmentView";
import StockPage from "./pages/Stock";
import EmployeeManagement from "./pages/EmployeeManagement";
import { MobilePOSView } from "./components/pos/MobilePOSView";

// Sidebar Provider
import { SidebarProvider } from "@/components/ui/sidebar";

const queryClient = new QueryClient();

function App() {
  const { user, loading } = useAuth();
  
  // Detectar se está em modo quiosque (fullscreen) - DEVE estar antes do early return
  const [isKioskMode, setIsKioskMode] = React.useState(false);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsKioskMode(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Routes>
          {/* Rotas públicas - SEM autenticação necessária */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/demo/dashboard" element={<DemoDashboard />} />
          <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
          <Route path="/nf/:id" element={<PublicNF />} />
          
          {user ? (
            <Route path="*" element={
              <SidebarProvider>
                <div className="flex min-h-screen w-full bg-gradient-subtle">
                  {/* Sidebar - colapsável no mobile e oculta em modo quiosque */}
                  {!isKioskMode && <AppSidebar />}

                  {/* Área principal */}
                  <div className="flex flex-1 flex-col w-full min-w-0">
                    {!isKioskMode && <Header />}

                    {/* main responsivo */}
                    <main className={`flex-1 overflow-y-auto ${!isKioskMode ? 'p-3 sm:p-4 md:p-6' : 'p-0'} w-full`}>
                      <div className="max-w-full mx-auto">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/pos" element={<POSPage />} />
                          <Route path="/pos/mobile" element={<MobilePOSView />} />
                          <Route path="/products" element={<ProductsPage />} />
                          <Route path="/bulk-products" element={<BulkProductsPage />} />
                          <Route path="/import-csv" element={<ImportCSVPage />} />
                          <Route path="/services" element={<ServicesView />} />
                          <Route 
                            path="/financial-assistant" 
                            element={
                              <ProtectedRoute requiredPermission="canViewFinancialAssistant">
                                <FinancialAssistantView />
                              </ProtectedRoute>
                            } 
                          />
                          <Route path="/budgets" element={<BudgetsPage />} />
                          <Route path="/stock" element={<StockPage />} />
                          <Route 
                            path="/expenses" 
                            element={
                              <ProtectedRoute requiredPermission="canViewExpenses">
                                <ExpensesPage />
                              </ProtectedRoute>
                            } 
                          />
                          <Route path="/sales" element={<SalesViewEnhanced />} />
                          <Route 
                            path="/reports" 
                            element={
                              <ProtectedRoute requiredPermission="canViewReports">
                                <ReportsPage />
                              </ProtectedRoute>
                            } 
                          />
                          <Route path="/categories" element={<CategoriesPage />} />
                          <Route path="/stock-adjustment" element={<StockAdjustmentPage />} />
                          <Route 
                            path="/settings" 
                            element={
                              <ProtectedRoute requiredPermission="canAccessSettings">
                                <Settings />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/employees" 
                            element={
                              <ProtectedRoute requireOwner>
                                <EmployeeManagement />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/reports/dre" 
                            element={
                              <ProtectedRoute requireOwner>
                                <DRE />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/reports/cashflow" 
                            element={
                              <ProtectedRoute requireOwner>
                                <CashFlow />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/reports/abc" 
                            element={
                              <ProtectedRoute requireOwner>
                                <ABCCurve />
                              </ProtectedRoute>
                            } 
                          />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            } />
          ) : (
            <Route path="*" element={<Navigate to="/auth" replace />} />
          )}
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
