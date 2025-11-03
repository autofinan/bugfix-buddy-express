-- Create payment_fees table
CREATE TABLE IF NOT EXISTS public.payment_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  method TEXT NOT NULL,
  installments INTEGER DEFAULT 1,
  fee_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(owner_id, method, installments)
);

-- Enable RLS on payment_fees
ALTER TABLE public.payment_fees ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_fees
CREATE POLICY "Users can view their own payment fees"
  ON public.payment_fees FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own payment fees"
  ON public.payment_fees FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own payment fees"
  ON public.payment_fees FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own payment fees"
  ON public.payment_fees FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Add gross_amount and net_amount to sales table
ALTER TABLE public.sales 
  ADD COLUMN IF NOT EXISTS gross_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS net_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1;

-- Trigger to update updated_at on payment_fees
CREATE TRIGGER update_payment_fees_updated_at
  BEFORE UPDATE ON public.payment_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payment fees for existing users
INSERT INTO public.payment_fees (owner_id, method, installments, fee_percentage)
SELECT DISTINCT owner_id, 'debito', 1, 2.5
FROM public.sales
WHERE owner_id IS NOT NULL
ON CONFLICT (owner_id, method, installments) DO NOTHING;

INSERT INTO public.payment_fees (owner_id, method, installments, fee_percentage)
SELECT DISTINCT owner_id, 'credito_vista', 1, 3.5
FROM public.sales
WHERE owner_id IS NOT NULL
ON CONFLICT (owner_id, method, installments) DO NOTHING;

INSERT INTO public.payment_fees (owner_id, method, installments, fee_percentage)
SELECT DISTINCT owner_id, 'credito_parcelado', 2, 4.5
FROM public.sales
WHERE owner_id IS NOT NULL
ON CONFLICT (owner_id, method, installments) DO NOTHING;

INSERT INTO public.payment_fees (owner_id, method, installments, fee_percentage)
SELECT DISTINCT owner_id, 'credito_parcelado', 3, 5.0
FROM public.sales
WHERE owner_id IS NOT NULL
ON CONFLICT (owner_id, method, installments) DO NOTHING;