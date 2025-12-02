-- Criar função central de snapshot financeiro
CREATE OR REPLACE FUNCTION public.financial_snapshot(p_owner_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_month_start date := date_trunc('month', CURRENT_DATE)::date;
  v_current_month_end date := (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date;
  v_last_90_days date := CURRENT_DATE - interval '90 days';
  v_result json;
  v_receita_total numeric := 0;
  v_cpv numeric := 0;
  v_despesas_fixas numeric := 0;
  v_despesas_variaveis numeric := 0;
  v_lucro_bruto numeric := 0;
  v_lucro_operacional numeric := 0;
  v_lucro_liquido numeric := 0;
  v_ticket_medio numeric := 0;
  v_total_vendas integer := 0;
  v_margem_bruta numeric := 0;
  v_margem_operacional numeric := 0;
  v_margem_liquida numeric := 0;
BEGIN
  -- Calcular receita total do mês atual
  SELECT COALESCE(SUM(total), 0)
  INTO v_receita_total
  FROM sales
  WHERE owner_id = p_owner_id
    AND date >= v_current_month_start
    AND date <= v_current_month_end
    AND COALESCE(canceled, false) = false;

  -- Calcular CPV (Custo dos Produtos Vendidos)
  SELECT COALESCE(SUM(si.quantity * COALESCE(si.custo_unitario, 0)), 0)
  INTO v_cpv
  FROM sale_items si
  JOIN sales s ON s.id = si.sale_id
  WHERE s.owner_id = p_owner_id
    AND s.date >= v_current_month_start
    AND s.date <= v_current_month_end
    AND COALESCE(s.canceled, false) = false;

  -- Calcular despesas fixas
  SELECT COALESCE(SUM(amount), 0)
  INTO v_despesas_fixas
  FROM expenses
  WHERE owner_id = p_owner_id
    AND expense_date >= v_current_month_start
    AND expense_date <= v_current_month_end
    AND is_fixed = true;

  -- Calcular despesas variáveis
  SELECT COALESCE(SUM(amount), 0)
  INTO v_despesas_variaveis
  FROM expenses
  WHERE owner_id = p_owner_id
    AND expense_date >= v_current_month_start
    AND expense_date <= v_current_month_end
    AND COALESCE(is_fixed, false) = false;

  -- Calcular lucros
  v_lucro_bruto := v_receita_total - v_cpv;
  v_lucro_operacional := v_lucro_bruto - v_despesas_fixas - v_despesas_variaveis;
  v_lucro_liquido := v_lucro_operacional;

  -- Calcular margens
  IF v_receita_total > 0 THEN
    v_margem_bruta := (v_lucro_bruto / v_receita_total) * 100;
    v_margem_operacional := (v_lucro_operacional / v_receita_total) * 100;
    v_margem_liquida := (v_lucro_liquido / v_receita_total) * 100;
  END IF;

  -- Calcular ticket médio e total de vendas
  SELECT 
    COALESCE(COUNT(*), 0),
    CASE WHEN COUNT(*) > 0 THEN v_receita_total / COUNT(*) ELSE 0 END
  INTO v_total_vendas, v_ticket_medio
  FROM sales
  WHERE owner_id = p_owner_id
    AND date >= v_current_month_start
    AND date <= v_current_month_end
    AND COALESCE(canceled, false) = false;

  -- Montar resultado JSON consolidado
  SELECT json_build_object(
    'periodo_atual', json_build_object(
      'receita_total', v_receita_total,
      'cpv', v_cpv,
      'despesas_fixas', v_despesas_fixas,
      'despesas_variaveis', v_despesas_variaveis,
      'lucro_bruto', v_lucro_bruto,
      'lucro_operacional', v_lucro_operacional,
      'lucro_liquido', v_lucro_liquido,
      'margem_bruta', v_margem_bruta,
      'margem_operacional', v_margem_operacional,
      'margem_liquida', v_margem_liquida,
      'ticket_medio', v_ticket_medio,
      'total_vendas', v_total_vendas
    ),
    'fluxo_caixa_90d', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          day::date as data,
          COALESCE((SELECT SUM(total) FROM sales WHERE owner_id = p_owner_id AND date::date = day::date AND COALESCE(canceled, false) = false), 0) as entradas,
          COALESCE((SELECT SUM(amount) FROM expenses WHERE owner_id = p_owner_id AND expense_date = day::date), 0) as saidas,
          COALESCE((SELECT SUM(total) FROM sales WHERE owner_id = p_owner_id AND date::date = day::date AND COALESCE(canceled, false) = false), 0) -
          COALESCE((SELECT SUM(amount) FROM expenses WHERE owner_id = p_owner_id AND expense_date = day::date), 0) as saldo
        FROM generate_series(v_last_90_days, CURRENT_DATE, '1 day'::interval) day
        ORDER BY day
      ) t
    ),
    'produtos_mais_vendidos', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          p.id,
          p.name,
          SUM(si.quantity) as quantidade_vendida,
          SUM(si.total_price) as receita_gerada,
          ROUND(AVG(si.unit_price)::numeric, 2) as preco_medio
        FROM sale_items si
        JOIN sales s ON s.id = si.sale_id
        JOIN products p ON p.id = si.product_id
        WHERE s.owner_id = p_owner_id
          AND s.date >= v_current_month_start
          AND s.date <= v_current_month_end
          AND COALESCE(s.canceled, false) = false
        GROUP BY p.id, p.name
        ORDER BY quantidade_vendida DESC
        LIMIT 10
      ) t
    ),
    'produtos_parados', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          p.id,
          p.name,
          p.stock,
          COALESCE(MAX(s.date), p.created_at) as ultima_venda
        FROM products p
        LEFT JOIN sale_items si ON si.product_id = p.id
        LEFT JOIN sales s ON s.id = si.sale_id AND COALESCE(s.canceled, false) = false
        WHERE p.owner_id = p_owner_id
          AND p.is_active = true
          AND (MAX(s.date) IS NULL OR MAX(s.date) < CURRENT_DATE - interval '30 days')
        GROUP BY p.id, p.name, p.stock, p.created_at
        HAVING p.stock > 0
        ORDER BY ultima_venda
        LIMIT 20
      ) t
    ),
    'estoque_critico', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          p.id,
          p.name,
          p.stock,
          p.min_stock,
          p.stock - p.min_stock as diferenca
        FROM products p
        WHERE p.owner_id = p_owner_id
          AND p.is_active = true
          AND p.stock <= p.min_stock
        ORDER BY diferenca
        LIMIT 20
      ) t
    ),
    'sazonalidade_12m', (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          TO_CHAR(mes, 'YYYY-MM') as mes,
          COALESCE(SUM(s.total), 0) as receita,
          COALESCE(COUNT(s.id), 0) as num_vendas,
          CASE WHEN COUNT(s.id) > 0 THEN SUM(s.total) / COUNT(s.id) ELSE 0 END as ticket_medio
        FROM generate_series(
          date_trunc('month', CURRENT_DATE - interval '11 months'),
          date_trunc('month', CURRENT_DATE),
          '1 month'::interval
        ) mes
        LEFT JOIN sales s ON 
          s.owner_id = p_owner_id AND
          date_trunc('month', s.date) = mes AND
          COALESCE(s.canceled, false) = false
        GROUP BY mes
        ORDER BY mes
      ) t
    ),
    'ponto_equilibrio', json_build_object(
      'custos_fixos', v_despesas_fixas,
      'margem_contribuicao', CASE WHEN v_receita_total > 0 THEN ((v_receita_total - v_cpv) / v_receita_total) ELSE 0 END,
      'ticket_medio', v_ticket_medio,
      'pe_receita', CASE WHEN ((v_receita_total - v_cpv) / NULLIF(v_receita_total, 0)) > 0 
                         THEN v_despesas_fixas / ((v_receita_total - v_cpv) / v_receita_total)
                         ELSE 0 END,
      'pe_unidades', CASE WHEN v_ticket_medio > 0 AND ((v_receita_total - v_cpv) / NULLIF(v_receita_total, 0)) > 0
                          THEN v_despesas_fixas / (v_ticket_medio * ((v_receita_total - v_cpv) / v_receita_total))
                          ELSE 0 END,
      'receita_atual', v_receita_total,
      'atingido', v_receita_total >= (CASE WHEN ((v_receita_total - v_cpv) / NULLIF(v_receita_total, 0)) > 0 
                                            THEN v_despesas_fixas / ((v_receita_total - v_cpv) / v_receita_total)
                                            ELSE 0 END)
    ),
    'das_estimado', ROUND((v_receita_total * 0.06)::numeric, 2),
    'projecao_30d', json_build_object(
      'receita_estimada', ROUND((v_receita_total * 1.1)::numeric, 2),
      'lucro_estimado', ROUND((v_lucro_liquido * 1.1)::numeric, 2),
      'base_calculo', 'média atual + 10%'
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;