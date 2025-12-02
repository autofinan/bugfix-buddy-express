-- Drop the security definer function that was causing the error
DROP FUNCTION IF EXISTS public.calculate_sale_profit(numeric, numeric, integer);