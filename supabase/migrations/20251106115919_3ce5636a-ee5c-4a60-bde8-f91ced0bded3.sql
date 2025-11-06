-- Criar função calculate_dre
CREATE OR REPLACE FUNCTION calculate_dre(
  p_owner_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_revenue numeric := 0;
  v_direct_costs numeric := 0;
  v_gross_profit numeric := 0;
  v_gross_margin numeric := 0;
  v_operational_expenses numeric := 0;
  v_operational_profit numeric := 0;
  v_operational_margin numeric := 0;
  v_taxes_fees numeric := 0;
  v_net_profit numeric := 0;
  v_net_margin numeric := 0;
BEGIN
  -- Calcular Receita Bruta (total das vendas não canceladas)
  SELECT COALESCE(SUM(s.total), 0)
  INTO v_revenue
  FROM sales s
  WHERE s.owner_id = p_owner_id
    AND s.date >= p_start_date
    AND s.date < (p_end_date + interval '1 day')
    AND COALESCE(s.canceled, false) = false;

  -- Calcular Custos Diretos (custo_unitario * quantity dos itens vendidos)
  SELECT COALESCE(SUM(si.custo_unitario * si.quantity), 0)
  INTO v_direct_costs
  FROM sale_items si
  JOIN sales s ON s.id = si.sale_id
  WHERE s.owner_id = p_owner_id
    AND s.date >= p_start_date
    AND s.date < (p_end_date + interval '1 day')
    AND COALESCE(s.canceled, false) = false
    AND si.custo_unitario IS NOT NULL;

  -- Calcular Lucro Bruto
  v_gross_profit := v_revenue - v_direct_costs;
  
  -- Calcular Margem Bruta
  IF v_revenue > 0 THEN
    v_gross_margin := (v_gross_profit / v_revenue) * 100;
  END IF;

  -- Calcular Despesas Operacionais (exceto impostos/taxas)
  SELECT COALESCE(SUM(e.amount), 0)
  INTO v_operational_expenses
  FROM expenses e
  WHERE e.owner_id = p_owner_id
    AND e.expense_date >= p_start_date
    AND e.expense_date <= p_end_date
    AND e.category NOT IN ('Impostos', 'Taxas', 'Tributos');

  -- Calcular Lucro Operacional
  v_operational_profit := v_gross_profit - v_operational_expenses;
  
  -- Calcular Margem Operacional
  IF v_revenue > 0 THEN
    v_operational_margin := (v_operational_profit / v_revenue) * 100;
  END IF;

  -- Calcular Impostos e Taxas
  SELECT COALESCE(SUM(e.amount), 0)
  INTO v_taxes_fees
  FROM expenses e
  WHERE e.owner_id = p_owner_id
    AND e.expense_date >= p_start_date
    AND e.expense_date <= p_end_date
    AND e.category IN ('Impostos', 'Taxas', 'Tributos');

  -- Calcular Lucro Líquido
  v_net_profit := v_operational_profit - v_taxes_fees;
  
  -- Calcular Margem Líquida
  IF v_revenue > 0 THEN
    v_net_margin := (v_net_profit / v_revenue) * 100;
  END IF;

  -- Retornar JSON
  RETURN json_build_object(
    'revenue', v_revenue,
    'direct_costs', v_direct_costs,
    'gross_profit', v_gross_profit,
    'gross_margin', v_gross_margin,
    'operational_expenses', v_operational_expenses,
    'operational_profit', v_operational_profit,
    'operational_margin', v_operational_margin,
    'taxes_fees', v_taxes_fees,
    'net_profit', v_net_profit,
    'net_margin', v_net_margin
  );
END;
$$;

-- Criar função calculate_abc_curve
CREATE OR REPLACE FUNCTION calculate_abc_curve(
  p_owner_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_revenue numeric := 0;
  v_result json;
BEGIN
  -- Criar tabela temporária com dados dos produtos
  CREATE TEMP TABLE IF NOT EXISTS temp_abc ON COMMIT DROP AS
  SELECT 
    p.id,
    p.name,
    SUM(si.total_price) as revenue,
    SUM(si.quantity) as quantity_sold
  FROM sale_items si
  JOIN sales s ON s.id = si.sale_id
  JOIN products p ON p.id = si.product_id
  WHERE s.owner_id = p_owner_id
    AND s.date >= p_start_date
    AND s.date < (p_end_date + interval '1 day')
    AND COALESCE(s.canceled, false) = false
    AND si.product_id IS NOT NULL
  GROUP BY p.id, p.name
  ORDER BY revenue DESC;

  -- Calcular receita total
  SELECT COALESCE(SUM(revenue), 0) INTO v_total_revenue FROM temp_abc;

  -- Se não houver receita, retornar vazio
  IF v_total_revenue = 0 THEN
    RETURN json_build_object(
      'class_a', '[]'::json,
      'class_b', '[]'::json,
      'class_c', '[]'::json,
      'total_revenue', 0
    );
  END IF;

  -- Adicionar percentuais e classificar
  CREATE TEMP TABLE IF NOT EXISTS temp_abc_classified ON COMMIT DROP AS
  SELECT 
    id,
    name,
    revenue,
    quantity_sold,
    (revenue / v_total_revenue * 100) as revenue_percentage,
    SUM(revenue / v_total_revenue * 100) OVER (ORDER BY revenue DESC) as cumulative_percentage
  FROM temp_abc;

  -- Classificar em A, B, C
  UPDATE temp_abc_classified
  SET revenue_percentage = ROUND(revenue_percentage::numeric, 2),
      cumulative_percentage = ROUND(cumulative_percentage::numeric, 2);

  -- Montar resultado
  WITH classified AS (
    SELECT 
      id,
      name,
      revenue,
      quantity_sold,
      revenue_percentage,
      cumulative_percentage,
      CASE 
        WHEN cumulative_percentage <= 80 THEN 'A'
        WHEN cumulative_percentage <= 95 THEN 'B'
        ELSE 'C'
      END as class
    FROM temp_abc_classified
  )
  SELECT json_build_object(
    'class_a', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (SELECT * FROM classified WHERE class = 'A' ORDER BY revenue DESC) t
    ), '[]'::json),
    'class_b', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (SELECT * FROM classified WHERE class = 'B' ORDER BY revenue DESC) t
    ), '[]'::json),
    'class_c', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (SELECT * FROM classified WHERE class = 'C' ORDER BY revenue DESC) t
    ), '[]'::json),
    'total_revenue', v_total_revenue
  ) INTO v_result;

  DROP TABLE IF EXISTS temp_abc;
  DROP TABLE IF EXISTS temp_abc_classified;

  RETURN v_result;
END;
$$;