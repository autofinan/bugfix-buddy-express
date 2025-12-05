import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, TrendingUp, Calendar, Plus, Edit2, Award, Zap, DollarSign, ShoppingCart, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface Goal {
  id: string;
  month: string;
  revenue_goal: number | null;
  profit_goal: number | null;
  sales_count_goal: number | null;
}

interface MonthlyData {
  month: string;
  revenue: number;
  goal: number;
}

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [currentRevenue, setCurrentRevenue] = useState(0);
  const [currentProfit, setCurrentProfit] = useState(0);
  const [currentSalesCount, setCurrentSalesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [historicalData, setHistoricalData] = useState<MonthlyData[]>([]);
  
  const [formData, setFormData] = useState({
    revenue_goal: "",
    profit_goal: "",
    sales_count_goal: "",
  });

  // Usar primeiro dia do mês atual para compatibilidade com tipo date
  const currentMonth = format(new Date(), "yyyy-MM-01");

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchCurrentMetrics();
      fetchHistoricalData();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from("monthly_goals")
        .select("*")
        .eq("owner_id", user?.id)
        .order("month", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
      
      const current = data?.find(g => g.month.startsWith(currentMonth.substring(0, 7)));
      setCurrentGoal(current || null);
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
    }
  };

  const fetchCurrentMetrics = async () => {
    try {
      const startOfMonth = `${currentMonth}-01`;
      const endOfMonth = new Date(new Date(startOfMonth).getFullYear(), new Date(startOfMonth).getMonth() + 1, 0).toISOString().split('T')[0];

      const { data: sales, error } = await supabase
        .from("sales")
        .select("total, id")
        .eq("owner_id", user?.id)
        .gte("date", startOfMonth)
        .lte("date", endOfMonth)
        .eq("canceled", false);

      if (error) throw error;

      const revenue = sales?.reduce((sum, s) => sum + (s.total || 0), 0) || 0;
      setCurrentRevenue(revenue);
      setCurrentSalesCount(sales?.length || 0);

      // Buscar lucro via RPC
      const { data: profitData } = await supabase.rpc("get_sales_with_profit");
      const monthSales = profitData?.filter((s: any) => 
        s.date >= startOfMonth && s.date <= endOfMonth && !s.canceled
      ) || [];
      const profit = monthSales.reduce((sum: number, s: any) => sum + (s.total_profit || 0), 0);
      setCurrentProfit(profit);
    } catch (error) {
      console.error("Erro ao buscar métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const months: MonthlyData[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = format(date, "yyyy-MM-01");
        const startOfMonth = `${monthStr}-01`;
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

        const { data: sales } = await supabase
          .from("sales")
          .select("total")
          .eq("owner_id", user?.id)
          .gte("date", startOfMonth)
          .lte("date", endOfMonth)
          .eq("canceled", false);

        const { data: goalData } = await supabase
          .from("monthly_goals")
          .select("revenue_goal")
          .eq("owner_id", user?.id)
          .gte("month", monthStr)
          .lt("month", format(new Date(date.getFullYear(), date.getMonth() + 1, 1), "yyyy-MM-dd"))
          .single();

        months.push({
          month: format(date, "MMM", { locale: ptBR }),
          revenue: sales?.reduce((sum, s) => sum + (s.total || 0), 0) || 0,
          goal: goalData?.revenue_goal || 0,
        });
      }

      setHistoricalData(months);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    }
  };

  const handleSaveGoal = async () => {
    try {
      const goalData = {
        owner_id: user?.id,
        month: editingGoal?.month || currentMonth,
        revenue_goal: formData.revenue_goal ? Number(formData.revenue_goal) : null,
        profit_goal: formData.profit_goal ? Number(formData.profit_goal) : null,
        sales_count_goal: formData.sales_count_goal ? Number(formData.sales_count_goal) : null,
      };

      if (editingGoal) {
        const { error } = await supabase
          .from("monthly_goals")
          .update(goalData)
          .eq("id", editingGoal.id);
        if (error) throw error;
        toast.success("Meta atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("monthly_goals")
          .insert(goalData);
        if (error) throw error;
        toast.success("Meta criada com sucesso!");
      }

      setDialogOpen(false);
      setEditingGoal(null);
      setFormData({ revenue_goal: "", profit_goal: "", sales_count_goal: "" });
      fetchGoals();
    } catch (error: any) {
      toast.error("Erro ao salvar meta: " + error.message);
    }
  };

  const openEditDialog = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        revenue_goal: goal.revenue_goal?.toString() || "",
        profit_goal: goal.profit_goal?.toString() || "",
        sales_count_goal: goal.sales_count_goal?.toString() || "",
      });
    } else {
      setEditingGoal(null);
      setFormData({ revenue_goal: "", profit_goal: "", sales_count_goal: "" });
    }
    setDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateProgress = (current: number, goal: number | null) => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const revenueProgress = calculateProgress(currentRevenue, currentGoal?.revenue_goal);
  const profitProgress = calculateProgress(currentProfit, currentGoal?.profit_goal);
  const salesProgress = calculateProgress(currentSalesCount, currentGoal?.sales_count_goal);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Carregando metas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-display">Metas</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe e gerencie suas metas mensais
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => openEditDialog()} 
              className="btn-gradient gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-0 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-display">
                {editingGoal ? "Editar Meta" : "Nova Meta do Mês"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Meta de Faturamento</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Ex: 10000"
                    value={formData.revenue_goal}
                    onChange={(e) => setFormData({ ...formData, revenue_goal: e.target.value })}
                    className="input-premium pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Meta de Lucro</Label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Ex: 3000"
                    value={formData.profit_goal}
                    onChange={(e) => setFormData({ ...formData, profit_goal: e.target.value })}
                    className="input-premium pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Meta de Vendas (quantidade)</Label>
                <div className="relative">
                  <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Ex: 50"
                    value={formData.sales_count_goal}
                    onChange={(e) => setFormData({ ...formData, sales_count_goal: e.target.value })}
                    className="input-premium pl-10"
                  />
                </div>
              </div>
              <Button onClick={handleSaveGoal} className="w-full btn-gradient">
                {editingGoal ? "Atualizar Meta" : "Criar Meta"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Meta Principal do Mês */}
      <Card className="card-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-50" />
        <div className="relative p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Target className="h-6 w-6 text-white icon-neon" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Meta Principal do Mês</h2>
              <p className="text-white/70 text-sm">
                {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            {currentGoal && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditDialog(currentGoal)}
                className="ml-auto text-white/80 hover:text-white hover:bg-white/20"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {currentGoal?.revenue_goal ? (
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/70 text-sm">Faturamento atual</p>
                  <p className="text-4xl font-bold text-white">{formatCurrency(currentRevenue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm">Meta</p>
                  <p className="text-2xl font-semibold text-white/90">
                    {formatCurrency(currentGoal.revenue_goal)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress 
                  value={revenueProgress} 
                  className="h-4 bg-white/20"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">{revenueProgress.toFixed(1)}% concluído</span>
                  <span className="text-white/80">
                    Faltam {formatCurrency(Math.max(0, (currentGoal.revenue_goal || 0) - currentRevenue))}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-white/50 mx-auto mb-3" />
              <p className="text-white/70">Nenhuma meta definida para este mês</p>
              <Button 
                onClick={() => openEditDialog()} 
                variant="secondary" 
                className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Definir Meta
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Metas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Meta de Lucro */}
        <Card className="card-premium p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-success">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Meta de Lucro</h3>
              <p className="text-sm text-muted-foreground">Lucro líquido mensal</p>
            </div>
          </div>
          {currentGoal?.profit_goal ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(currentProfit)}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {formatCurrency(currentGoal.profit_goal)}
                </span>
              </div>
              <Progress value={profitProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">{profitProgress.toFixed(1)}% da meta</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Meta não definida</p>
          )}
        </Card>

        {/* Meta de Vendas */}
        <Card className="card-premium p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-accent">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Meta de Vendas</h3>
              <p className="text-sm text-muted-foreground">Quantidade de vendas</p>
            </div>
          </div>
          {currentGoal?.sales_count_goal ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {currentSalesCount}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {currentGoal.sales_count_goal} vendas
                </span>
              </div>
              <Progress value={salesProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">{salesProgress.toFixed(1)}% da meta</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Meta não definida</p>
          )}
        </Card>

        {/* Status Geral */}
        <Card className="card-premium p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-secondary">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Status Geral</h3>
              <p className="text-sm text-muted-foreground">Desempenho do mês</p>
            </div>
          </div>
          <div className="space-y-3">
            {revenueProgress >= 100 ? (
              <div className="flex items-center gap-2 text-success">
                <Award className="h-5 w-5" />
                <span className="font-medium">Meta atingida! 🎉</span>
              </div>
            ) : revenueProgress >= 75 ? (
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Quase lá!</span>
              </div>
            ) : revenueProgress >= 50 ? (
              <div className="flex items-center gap-2 text-warning">
                <BarChart3 className="h-5 w-5" />
                <span className="font-medium">No caminho certo</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-5 w-5" />
                <span className="font-medium">Continue focado!</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Média diária necessária para bater a meta
            </p>
          </div>
        </Card>
      </div>

      {/* Histórico de Metas - Gráfico */}
      <Card className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-primary">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Histórico de Metas</h3>
            <p className="text-sm text-muted-foreground">Faturamento vs Meta (últimos 6 meses)</p>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(230, 80%, 55%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(230, 80%, 55%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGoal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(260, 70%, 60%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(260, 70%, 60%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                name="Faturamento"
                stroke="hsl(230, 80%, 55%)" 
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="goal" 
                name="Meta"
                stroke="hsl(260, 70%, 60%)" 
                fillOpacity={1}
                fill="url(#colorGoal)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Lista de Metas Anteriores */}
      {goals.length > 0 && (
        <Card className="card-premium p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Histórico de Metas
          </h3>
          <div className="space-y-3">
            {goals.slice(0, 6).map((goal) => (
              <div 
                key={goal.id} 
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {format(new Date(goal.month + "-01"), "MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Meta: {goal.revenue_goal ? formatCurrency(goal.revenue_goal) : "Não definida"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(goal)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
