-- Adicionar campos para controle avançado de despesas
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS is_fixed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS linked_movement_id UUID REFERENCES inventory_movements(id);

-- Criar bucket para comprovantes de despesas
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-receipts', 'expense-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para comprovantes
CREATE POLICY "Users can upload their expense receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'expense-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their expense receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'expense-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their expense receipts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'expense-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their expense receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'expense-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);