-- Criar função que retorna o owner_id correto (MEI)
-- Se for owner, retorna seu próprio ID
-- Se for employee, retorna o ID do owner que o criou
CREATE OR REPLACE FUNCTION public.get_my_owner_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT created_by 
      FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'employee'
      LIMIT 1
    ),
    auth.uid()
  );
$$;

-- Atualizar função set_owner_id para usar o owner_id correto
CREATE OR REPLACE FUNCTION public.set_owner_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := public.get_my_owner_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Atualizar policies de produtos para permitir acesso compartilhado
DROP POLICY IF EXISTS prd_select_owner ON public.products;
DROP POLICY IF EXISTS prd_ins_owner ON public.products;
DROP POLICY IF EXISTS prd_upd_owner ON public.products;
DROP POLICY IF EXISTS prd_del_owner ON public.products;

CREATE POLICY prd_select_shared ON public.products
FOR SELECT USING (owner_id = public.get_my_owner_id());

CREATE POLICY prd_ins_shared ON public.products
FOR INSERT WITH CHECK (owner_id = public.get_my_owner_id());

CREATE POLICY prd_upd_shared ON public.products
FOR UPDATE USING (owner_id = public.get_my_owner_id())
WITH CHECK (owner_id = public.get_my_owner_id());

CREATE POLICY prd_del_shared ON public.products
FOR DELETE USING (owner_id = public.get_my_owner_id());

-- Atualizar policies de categorias
DROP POLICY IF EXISTS cat_select_owner ON public.categories;
DROP POLICY IF EXISTS cat_ins_owner ON public.categories;
DROP POLICY IF EXISTS cat_upd_owner ON public.categories;
DROP POLICY IF EXISTS cat_del_owner ON public.categories;

CREATE POLICY cat_select_shared ON public.categories
FOR SELECT USING (owner_id = public.get_my_owner_id());

CREATE POLICY cat_ins_shared ON public.categories
FOR INSERT WITH CHECK (owner_id = public.get_my_owner_id());

CREATE POLICY cat_upd_shared ON public.categories
FOR UPDATE USING (owner_id = public.get_my_owner_id())
WITH CHECK (owner_id = public.get_my_owner_id());

CREATE POLICY cat_del_shared ON public.categories
FOR DELETE USING (owner_id = public.get_my_owner_id());

-- Atualizar policies de vendas
DROP POLICY IF EXISTS sal_select_owner ON public.sales;
DROP POLICY IF EXISTS sal_ins_owner ON public.sales;
DROP POLICY IF EXISTS sal_upd_owner ON public.sales;
DROP POLICY IF EXISTS sal_del_owner ON public.sales;

CREATE POLICY sal_select_shared ON public.sales
FOR SELECT USING (owner_id = public.get_my_owner_id());

CREATE POLICY sal_ins_shared ON public.sales
FOR INSERT WITH CHECK (owner_id = public.get_my_owner_id());

CREATE POLICY sal_upd_shared ON public.sales
FOR UPDATE USING (owner_id = public.get_my_owner_id())
WITH CHECK (owner_id = public.get_my_owner_id());

CREATE POLICY sal_del_shared ON public.sales
FOR DELETE USING (owner_id = public.get_my_owner_id() AND public.is_owner(auth.uid()));

-- Atualizar policies de sale_items
DROP POLICY IF EXISTS sli_select_owner ON public.sale_items;
DROP POLICY IF EXISTS sli_ins_owner ON public.sale_items;
DROP POLICY IF EXISTS sli_upd_owner ON public.sale_items;
DROP POLICY IF EXISTS sli_del_owner ON public.sale_items;

CREATE POLICY sli_select_shared ON public.sale_items
FOR SELECT USING (EXISTS (
  SELECT 1 FROM sales s 
  WHERE s.id = sale_items.sale_id 
  AND s.owner_id = public.get_my_owner_id()
));

CREATE POLICY sli_ins_shared ON public.sale_items
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM sales s 
  WHERE s.id = sale_items.sale_id 
  AND s.owner_id = public.get_my_owner_id()
));

CREATE POLICY sli_upd_shared ON public.sale_items
FOR UPDATE USING (EXISTS (
  SELECT 1 FROM sales s 
  WHERE s.id = sale_items.sale_id 
  AND s.owner_id = public.get_my_owner_id()
));

CREATE POLICY sli_del_shared ON public.sale_items
FOR DELETE USING (EXISTS (
  SELECT 1 FROM sales s 
  WHERE s.id = sale_items.sale_id 
  AND s.owner_id = public.get_my_owner_id()
));

-- Atualizar policies de inventory_movements
DROP POLICY IF EXISTS imv_select_owner ON public.inventory_movements;
DROP POLICY IF EXISTS imv_ins_owner ON public.inventory_movements;
DROP POLICY IF EXISTS imv_upd_owner ON public.inventory_movements;
DROP POLICY IF EXISTS imv_del_owner ON public.inventory_movements;

CREATE POLICY imv_select_shared ON public.inventory_movements
FOR SELECT USING (EXISTS (
  SELECT 1 FROM products p 
  WHERE p.id = inventory_movements.product_id 
  AND p.owner_id = public.get_my_owner_id()
));

CREATE POLICY imv_ins_shared ON public.inventory_movements
FOR INSERT WITH CHECK (EXISTS (
  SELECT 1 FROM products p 
  WHERE p.id = inventory_movements.product_id 
  AND p.owner_id = public.get_my_owner_id()
));

CREATE POLICY imv_upd_shared ON public.inventory_movements
FOR UPDATE USING (EXISTS (
  SELECT 1 FROM products p 
  WHERE p.id = inventory_movements.product_id 
  AND p.owner_id = public.get_my_owner_id()
));

CREATE POLICY imv_del_shared ON public.inventory_movements
FOR DELETE USING (EXISTS (
  SELECT 1 FROM products p 
  WHERE p.id = inventory_movements.product_id 
  AND p.owner_id = public.get_my_owner_id()
));

-- Atualizar policies de services
DROP POLICY IF EXISTS "Users can view their own services" ON public.services;
DROP POLICY IF EXISTS "Users can create their own services" ON public.services;
DROP POLICY IF EXISTS "Users can update their own services" ON public.services;
DROP POLICY IF EXISTS "Users can delete their own services" ON public.services;

CREATE POLICY services_select_shared ON public.services
FOR SELECT USING (owner_id = public.get_my_owner_id());

CREATE POLICY services_ins_shared ON public.services
FOR INSERT WITH CHECK (owner_id = public.get_my_owner_id());

CREATE POLICY services_upd_shared ON public.services
FOR UPDATE USING (owner_id = public.get_my_owner_id())
WITH CHECK (owner_id = public.get_my_owner_id());

CREATE POLICY services_del_shared ON public.services
FOR DELETE USING (owner_id = public.get_my_owner_id());

-- Atualizar policies de service_categories
DROP POLICY IF EXISTS "Users can view their own service categories" ON public.service_categories;
DROP POLICY IF EXISTS "Users can create their own service categories" ON public.service_categories;
DROP POLICY IF EXISTS "Users can update their own service categories" ON public.service_categories;
DROP POLICY IF EXISTS "Users can delete their own service categories" ON public.service_categories;

CREATE POLICY svc_cat_select_shared ON public.service_categories
FOR SELECT USING (owner_id = public.get_my_owner_id());

CREATE POLICY svc_cat_ins_shared ON public.service_categories
FOR INSERT WITH CHECK (owner_id = public.get_my_owner_id());

CREATE POLICY svc_cat_upd_shared ON public.service_categories
FOR UPDATE USING (owner_id = public.get_my_owner_id())
WITH CHECK (owner_id = public.get_my_owner_id());

CREATE POLICY svc_cat_del_shared ON public.service_categories
FOR DELETE USING (owner_id = public.get_my_owner_id() AND is_default = false);

-- Atualizar policies de service_variations
DROP POLICY IF EXISTS "Users can view their own service variations" ON public.service_variations;
DROP POLICY IF EXISTS "Users can create their own service variations" ON public.service_variations;
DROP POLICY IF EXISTS "Users can update their own service variations" ON public.service_variations;
DROP POLICY IF EXISTS "Users can delete their own service variations" ON public.service_variations;

CREATE POLICY svc_var_select_shared ON public.service_variations
FOR SELECT USING (owner_id = public.get_my_owner_id());

CREATE POLICY svc_var_ins_shared ON public.service_variations
FOR INSERT WITH CHECK (owner_id = public.get_my_owner_id());

CREATE POLICY svc_var_upd_shared ON public.service_variations
FOR UPDATE USING (owner_id = public.get_my_owner_id())
WITH CHECK (owner_id = public.get_my_owner_id());

CREATE POLICY svc_var_del_shared ON public.service_variations
FOR DELETE USING (owner_id = public.get_my_owner_id());