import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, FileText, CheckCircle, X, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BudgetForm } from "./BudgetForm";
import { BudgetDetails } from "./BudgetDetails";
import { ConvertBudgetModal } from "./ConvertBudgetModal";
import { generateBudgetPDF } from "@/utils/pdfUtils";

interface Budget {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  subtotal: number;
  discount_type: string | null;
  discount_value: number;
  total: number;
  status: 'open' | 'converted' | 'canceled';
  notes: string | null;
  valid_until: string | null;
  created_at: string;
  converted_sale_id: string | null;
}

export default function BudgetsView() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [budgetToConvert, setBudgetToConvert] = useState<Budget | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [convertingBudgets, setConvertingBudgets] = useState<Set<string>>(new Set());
  const [generatingPdfs, setGeneratingPdfs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("budgets")
        .select(`
          id,
          subtotal,
          discount_type,
          discount_value,
          total,
          status,
          notes,
          valid_until,
          created_at,
          updated_at,
          converted_sale_id,
          canceled_at,
          cancel_reason,
          canceled_by,
          owner_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const budgetsWithCustomerData: Budget[] = await Promise.all(
        (data || []).map(async (budget): Promise<Budget> => {
          const { data: protectedData, error: protectedError } = await supabase
            .rpc('get_budget_with_protected_customer_data', { budget_id_param: budget.id });
          
          if (protectedError) {
            console.error(`Erro ao buscar dados protegidos do orçamento ${budget.id}:`, protectedError);
            return {
              ...budget,
              customer_name: null,
              customer_email: null,
              customer_phone: null,
            } as Budget;
          }
          
          const customerData = protectedData?.[0];
          return {
            ...budget,
            customer_name: customerData?.customer_name || null,
            customer_email: customerData?.customer_email || null,
            customer_phone: customerData?.customer_phone || null,
          } as Budget;
        })
      );
      
      console.log(`Acesso seguro a ${budgetsWithCustomerData.length} orçamentos via função protegida`);
      
      setBudgets(budgetsWithCustomerData);
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar orçamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToSale = async (paymentMethod: string, notes: string, saleDate: string) => {
    if (!budgetToConvert) return;
    
    setConvertingBudgets(prev => new Set(prev).add(budgetToConvert.id));
    
    try {
      console.log('🔄 Iniciando conversão de orçamento para venda:', budgetToConvert.id);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          total: budgetToConvert.total,
          subtotal: budgetToConvert.subtotal,
          discount_type: budgetToConvert.discount_type,
          discount_value: budgetToConvert.discount_value,
          payment_method: paymentMethod,
          note: notes || `Convertido do orçamento: ${budgetToConvert.id}`,
          date: new Date(saleDate + 'T12:00:00').toISOString()
        })
        .select()
        .single();

      if (saleError) throw saleError;

      const { data: budgetItems, error: itemsError } = await supabase
        .from("budget_items")
        .select("*")
        .eq("budget_id", budgetToConvert.id);

      if (itemsError) throw itemsError;

      if (budgetItems && budgetItems.length > 0) {
        const saleItems = budgetItems.map(item => ({
          sale_id: sale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));

        const { error: saleItemsError } = await supabase
          .from("sale_items")
          .insert(saleItems);

        if (saleItemsError) throw saleItemsError;

        for (const item of budgetItems) {
          const { data: product } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.product_id)
            .single();

          if (product) {
            const { error: stockError } = await supabase
              .from("products")
              .update({ 
                stock: Math.max(0, product.stock - item.quantity)
              })
              .eq("id", item.product_id);

            if (stockError) console.error("Erro ao atualizar estoque:", stockError);
          }
        }
      }

      const { error: updateError } = await supabase
        .from("budgets")
        .update({
          status: "converted",
          converted_sale_id: sale.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", budgetToConvert.id);

      if (updateError) throw updateError;

      console.log('✅ Venda criada com ID:', sale.id);
      
      toast({
        title: "Sucesso! 🎉",
        description: `Orçamento convertido em venda com sucesso!`,
      });

      setShowConvertModal(false);
      setBudgetToConvert(null);
      fetchBudgets();
    } catch (error: any) {
      console.error("❌ Erro detalhado ao converter orçamento:", error);
      
      let errorMessage = "Erro ao converter orçamento";
      if (error.message) {
        if (error.message.includes('not found')) {
          errorMessage = "Orçamento não encontrado ou já convertido";
        } else if (error.message.includes('payment_method')) {
          errorMessage = "Erro na forma de pagamento. Tente novamente";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setConvertingBudgets(prev => {
        const newSet = new Set(prev);
        newSet.delete(budgetToConvert.id);
        return newSet;
      });
    }
  };

  const handleCancelBudget = async (budgetId: string) => {
    try {
      const { error } = await supabase
        .from("budgets")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
          cancel_reason: "Cancelado pelo usuário"
        })
        .eq("id", budgetId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Orçamento cancelado com sucesso!"
      });

      fetchBudgets();
    } catch (error) {
      console.error("Erro ao cancelar orçamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar orçamento",
        variant: "destructive"
      });
    }
  };

  const handleGeneratePDF = async (budget: Budget) => {
    setGeneratingPdfs(prev => new Set(prev).add(budget.id));
    
    try {
      console.log("Iniciando geração de PDF para orçamento:", budget.id);
      await generateBudgetPDF(budget);
      
      toast({
        title: "📄 PDF Gerado!",
        description: "PDF do orçamento baixado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "❌ Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar PDF do orçamento",
        variant: "destructive"
      });
    } finally {
      setGeneratingPdfs(prev => {
        const newSet = new Set(prev);
        newSet.delete(budget.id);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="default" className="text-xs">Aberto</Badge>;
      case "converted":
        return <Badge variant="secondary" className="text-xs">Convertido</Badge>;
      case "canceled":
        return <Badge variant="destructive" className="text-xs">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = !searchTerm || 
      (budget.customer_name && 
       budget.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (budget.customer_email && 
       budget.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || budget.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando orçamentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header - Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus orçamentos e converta em vendas</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Filtros - Responsivo */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abertos</SelectItem>
            <SelectItem value="converted">Convertidos</SelectItem>
            <SelectItem value="canceled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Orçamentos - Responsivo */}
      <div className="grid gap-3 sm:gap-4">
        {filteredBudgets.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">Nenhum orçamento encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredBudgets.map((budget) => (
            <Card key={budget.id} className="card-hover border-0 shadow-md">
              <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg text-primary truncate">
                      {budget.customer_name || "Cliente não informado"}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                      <span>{new Date(budget.created_at).toLocaleDateString('pt-BR')}</span>
                      {getStatusBadge(budget.status)}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      R$ {budget.total.toFixed(2)}
                    </div>
                    {budget.discount_value > 0 && (
                      <div className="text-xs sm:text-sm text-green-600 font-medium">
                        Desc: {budget.discount_type === 'percentage' ? `${budget.discount_value}%` : `R$ ${budget.discount_value.toFixed(2)}`}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-3 p-3 sm:p-6">
                {/* Botões em Grid Responsivo */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBudget(budget);
                      setShowDetails(true);
                    }}
                    className="text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Ver Detalhes
                  </Button>

                  {budget.status === "open" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingBudget(budget);
                          setShowForm(true);
                        }}
                        className="text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Editar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBudgetToConvert(budget);
                          setShowConvertModal(true);
                        }}
                        disabled={convertingBudgets.has(budget.id)}
                        className="text-xs sm:text-sm h-8 sm:h-9 col-span-2 sm:col-span-1"
                      >
                        {convertingBudgets.has(budget.id) ? (
                          <>
                            <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-1 rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                            <span className="hidden sm:inline">Convertendo...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Converter em Venda</span>
                            <span className="sm:hidden">Converter</span>
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBudget(budget.id)}
                        disabled={convertingBudgets.has(budget.id)}
                        className="text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Cancelar
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleGeneratePDF(budget)}
                    disabled={generatingPdfs.has(budget.id)}
                    className="text-xs sm:text-sm h-8 sm:h-9"
                  >
                    {generatingPdfs.has(budget.id) ? (
                      <>
                        <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-1 rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showForm && (
        <BudgetForm
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) {
              setEditingBudget(null);
            }
          }}
          onSave={() => {
            setShowForm(false);
            setEditingBudget(null);
            fetchBudgets();
          }}
          budgetToEdit={editingBudget}
        />
      )}

      {showDetails && selectedBudget && (
        <BudgetDetails
          budget={selectedBudget}
          open={showDetails}
          onOpenChange={setShowDetails}
        />
      )}

      <ConvertBudgetModal
        budget={budgetToConvert}
        open={showConvertModal}
        onOpenChange={setShowConvertModal}
        onConfirm={handleConvertToSale}
        loading={budgetToConvert ? convertingBudgets.has(budgetToConvert.id) : false}
      />
    </div>
  );
}
