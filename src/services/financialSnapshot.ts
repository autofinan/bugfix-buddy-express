import { supabase } from "@/integrations/supabase/client";

export interface FinancialSnapshot {
  periodo_atual: {
    receita_total: number;
    cpv: number;
    despesas_fixas: number;
    despesas_variaveis: number;
    lucro_bruto: number;
    lucro_operacional: number;
    lucro_liquido: number;
    margem_bruta: number;
    margem_operacional: number;
    margem_liquida: number;
    ticket_medio: number;
    total_vendas: number;
  };
  fluxo_caixa_90d: Array<{
    data: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }>;
  produtos_mais_vendidos: Array<{
    id: string;
    name: string;
    quantidade_vendida: number;
    receita_gerada: number;
    preco_medio: number;
  }>;
  produtos_parados: Array<{
    id: string;
    name: string;
    stock: number;
    ultima_venda: string;
  }>;
  estoque_critico: Array<{
    id: string;
    name: string;
    stock: number;
    min_stock: number;
    diferenca: number;
  }>;
  sazonalidade_12m: Array<{
    mes: string;
    receita: number;
    num_vendas: number;
    ticket_medio: number;
  }>;
  ponto_equilibrio: {
    custos_fixos: number;
    margem_contribuicao: number;
    ticket_medio: number;
    pe_receita: number;
    pe_unidades: number;
    receita_atual: number;
    atingido: boolean;
  };
  das_estimado: number;
  projecao_30d: {
    receita_estimada: number;
    lucro_estimado: number;
    base_calculo: string;
  };
}

export class FinancialSnapshotService {
  static async getSnapshot(ownerId: string): Promise<FinancialSnapshot | null> {
    try {
      const { data, error } = await supabase.rpc("financial_snapshot", {
        p_owner_id: ownerId,
      });

      if (error) {
        console.error("Erro ao buscar snapshot financeiro:", error);
        return null;
      }

      return data as unknown as FinancialSnapshot;
    } catch (error) {
      console.error("Erro ao buscar snapshot financeiro:", error);
      return null;
    }
  }
}
