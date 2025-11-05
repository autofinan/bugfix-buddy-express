import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export interface FinancialData {
  lucro_liquido: number;
  margem: number;
  receita: number;
  custos: number;
  despesas: number;
  tendencia: "positiva" | "negativa" | "neutra";
  crescimento_receita: number;
  alertas: Alert[];
  historico_6_meses: MonthlyData[];
  categorias_top: CategoryAnalysis[];
  benchmark: BenchmarkData;
  padroes: Pattern[];
}

export interface Alert {
  id: string;
  severity: "critical" | "warning" | "info" | "success";
  title: string;
  description: string;
  action?: string;
}

export interface MonthlyData {
  month: string;
  receita: number;
  custos: number;
  despesas: number;
  lucro: number;
}

export interface CategoryAnalysis {
  name: string;
  value: number;
  percentage: number;
  trend: "up" | "down" | "stable";
  type: "receita" | "despesa";
}

export interface BenchmarkData {
  margem_atual: number;
  margem_media_6_meses: number;
  status: "acima" | "abaixo" | "na_media";
  diferenca: number;
}

export interface Pattern {
  type: string;
  description: string;
  impact: "positive" | "negative" | "neutral";
}

export class FinanceAnalyzer {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async analyze(): Promise<FinancialData> {
    const historico = await this.getHistorico6Meses();
    const mesAtual = historico[historico.length - 1];
    const mesAnterior = historico[historico.length - 2];

    const margem = mesAtual.receita > 0 
      ? (mesAtual.lucro / mesAtual.receita) * 100 
      : 0;

    const crescimento = mesAnterior?.receita > 0
      ? ((mesAtual.receita - mesAnterior.receita) / mesAnterior.receita) * 100
      : 0;

    const tendencia = crescimento > 5 ? "positiva" : crescimento < -5 ? "negativa" : "neutra";

    const alertas = await this.generateAlerts(mesAtual, mesAnterior);
    const categorias = await this.analyzeCategories();
    const benchmark = this.calculateBenchmark(historico);
    const padroes = await this.detectPatterns(historico);

    return {
      lucro_liquido: mesAtual.lucro,
      margem,
      receita: mesAtual.receita,
      custos: mesAtual.custos,
      despesas: mesAtual.despesas,
      tendencia,
      crescimento_receita: crescimento,
      alertas,
      historico_6_meses: historico,
      categorias_top: categorias,
      benchmark,
      padroes,
    };
  }

  private async getHistorico6Meses(): Promise<MonthlyData[]> {
    const historico: MonthlyData[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);

      const { data: sales } = await supabase
        .from("sales")
        .select("total")
        .eq("owner_id", this.userId)
        .eq("canceled", false)
        .gte("date", startDate.toISOString())
        .lte("date", endDate.toISOString());

      const receita = sales?.reduce((sum, s) => sum + Number(s.total), 0) || 0;

      const { data: saleItems } = await supabase
        .from("sale_items")
        .select("quantity, custo_unitario")
        .eq("owner_id", this.userId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      const custos = saleItems?.reduce((sum, item) => {
        return sum + (Number(item.quantity) * Number(item.custo_unitario || 0));
      }, 0) || 0;

      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("owner_id", this.userId)
        .gte("expense_date", format(startDate, "yyyy-MM-dd"))
        .lte("expense_date", format(endDate, "yyyy-MM-dd"));

      const despesas = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      historico.push({
        month: format(date, "MMM/yy"),
        receita,
        custos,
        despesas,
        lucro: receita - custos - despesas,
      });
    }

    return historico;
  }

  private async generateAlerts(mesAtual: MonthlyData, mesAnterior: MonthlyData): Promise<Alert[]> {
    const alertas: Alert[] = [];

    // Gastando mais que fatura
    if (mesAtual.despesas + mesAtual.custos > mesAtual.receita && mesAtual.receita > 0) {
      alertas.push({
        id: "spending-more",
        severity: "critical",
        title: "Você está gastando mais do que faturando!",
        description: `Suas despesas e custos somam mais que seu faturamento. Reduza custos urgentemente.`,
        action: "Revise suas despesas e corte gastos desnecessários"
      });
    }

    // Queda no lucro
    if (mesAnterior && mesAtual.lucro < mesAnterior.lucro && mesAnterior.lucro > 0) {
      const queda = ((mesAnterior.lucro - mesAtual.lucro) / mesAnterior.lucro) * 100;
      if (queda > 15) {
        alertas.push({
          id: "profit-drop",
          severity: "warning",
          title: "Seu lucro caiu em relação ao mês anterior",
          description: `Seu lucro caiu ${queda.toFixed(0)}% em relação ao mês anterior.`,
          action: "Verifique seus custos e preços de venda"
        });
      }
    }

    // Margem de lucro baixa
    const margem = mesAtual.receita > 0 ? (mesAtual.lucro / mesAtual.receita) * 100 : 0;
    if (margem < 10 && margem > 0) {
      alertas.push({
        id: "low-margin",
        severity: "warning",
        title: "Margem de Lucro Baixa",
        description: `Sua margem está em ${margem.toFixed(1)}%. Revise preços ou reduza custos.`,
        action: "Analise a estrutura de custos e reprecifique produtos"
      });
    }

    return alertas;
  }

  private async analyzeCategories(): Promise<CategoryAnalysis[]> {
    const categorias: CategoryAnalysis[] = [];
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());

    // Top receitas por produto
    const { data: topProducts } = await supabase
      .from("sale_items")
      .select("product_id, products(name), quantity, unit_price")
      .eq("owner_id", this.userId)
      .gte("created_at", currentMonthStart.toISOString())
      .lte("created_at", currentMonthEnd.toISOString());

    if (topProducts) {
      const productTotals = new Map<string, { name: string; value: number }>();
      
      topProducts.forEach((item: any) => {
        const name = item.products?.name || "Produto";
        const value = Number(item.quantity) * Number(item.unit_price);
        const current = productTotals.get(name) || { name, value: 0 };
        productTotals.set(name, { name, value: current.value + value });
      });

      const sortedProducts = Array.from(productTotals.values())
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      const totalReceita = sortedProducts.reduce((sum, p) => sum + p.value, 0);

      sortedProducts.forEach(p => {
        categorias.push({
          name: p.name,
          value: p.value,
          percentage: totalReceita > 0 ? (p.value / totalReceita) * 100 : 0,
          trend: "stable",
          type: "receita"
        });
      });
    }

    // Top despesas por categoria
    const { data: topExpenses } = await supabase
      .from("expenses")
      .select("category, amount")
      .eq("owner_id", this.userId)
      .gte("expense_date", format(currentMonthStart, "yyyy-MM-dd"))
      .lte("expense_date", format(currentMonthEnd, "yyyy-MM-dd"));

    if (topExpenses) {
      const expenseTotals = new Map<string, number>();
      
      topExpenses.forEach((exp: any) => {
        const cat = exp.category || "Outros";
        expenseTotals.set(cat, (expenseTotals.get(cat) || 0) + Number(exp.amount));
      });

      const sortedExpenses = Array.from(expenseTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const totalDespesas = sortedExpenses.reduce((sum, [_, val]) => sum + val, 0);

      sortedExpenses.forEach(([cat, val]) => {
        categorias.push({
          name: cat,
          value: val,
          percentage: totalDespesas > 0 ? (val / totalDespesas) * 100 : 0,
          trend: "stable",
          type: "despesa"
        });
      });
    }

    return categorias;
  }

  private calculateBenchmark(historico: MonthlyData[]): BenchmarkData {
    const margemAtual = historico[historico.length - 1].receita > 0
      ? (historico[historico.length - 1].lucro / historico[historico.length - 1].receita) * 100
      : 0;

    const margensHistoricas = historico
      .filter(h => h.receita > 0)
      .map(h => (h.lucro / h.receita) * 100);

    const margemMedia = margensHistoricas.length > 0
      ? margensHistoricas.reduce((sum, m) => sum + m, 0) / margensHistoricas.length
      : 0;

    const diferenca = margemAtual - margemMedia;
    const status = Math.abs(diferenca) < 2 ? "na_media" : diferenca > 0 ? "acima" : "abaixo";

    return {
      margem_atual: margemAtual,
      margem_media_6_meses: margemMedia,
      status,
      diferenca
    };
  }

  private async detectPatterns(historico: MonthlyData[]): Promise<Pattern[]> {
    const padroes: Pattern[] = [];

    // Padrão de crescimento consistente
    const crescimentos = [];
    for (let i = 1; i < historico.length; i++) {
      if (historico[i - 1].receita > 0) {
        const cresc = ((historico[i].receita - historico[i - 1].receita) / historico[i - 1].receita) * 100;
        crescimentos.push(cresc);
      }
    }

    const crescimentoPositivo = crescimentos.filter(c => c > 0).length;
    if (crescimentoPositivo >= 4) {
      padroes.push({
        type: "crescimento_consistente",
        description: "Suas vendas têm crescido consistentemente nos últimos meses.",
        impact: "positive"
      });
    }

    // Padrão de custos crescentes
    const aumentoCustos = historico.slice(-3).every((h, i, arr) => 
      i === 0 || h.custos > arr[i - 1].custos
    );

    if (aumentoCustos) {
      padroes.push({
        type: "custos_crescentes",
        description: "Seus custos têm aumentado nos últimos 3 meses.",
        impact: "negative"
      });
    }

    return padroes;
  }
}
