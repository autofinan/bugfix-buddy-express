/*
  # Fix calculate_abc_curve function

  1. Issue
    - UPDATE statement without WHERE clause causing SQL error
    - Removed unnecessary UPDATE operation
  2. Solution
    - Recalculate classification directly in CTE instead of UPDATE
    - Simplify logic to avoid UPDATE statement
*/

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

  -- Montar resultado com classificação direta
  WITH calculated AS (
    SELECT 
      id,
      name,
      revenue,
      quantity_sold,
      ROUND((revenue / v_total_revenue * 100)::numeric, 2) as revenue_percentage,
      ROUND(SUM(revenue / v_total_revenue * 100) OVER (ORDER BY revenue DESC)::numeric, 2) as cumulative_percentage
    FROM temp_abc
  ),
  classified AS (
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
    FROM calculated
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

  RETURN v_result;
END;
$$;