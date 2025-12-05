import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const saleId = url.searchParams.get('id');

    if (!saleId) {
      return new Response(
        JSON.stringify({ error: 'Sale ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados da venda
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (
          *,
          products (name),
          services (name)
        )
      `)
      .eq('id', saleId)
      .single();

    if (saleError || !sale) {
      console.error('Sale not found:', saleError);
      return new Response(
        JSON.stringify({ error: 'Sale not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados do proprietário (MEI)
    const { data: storeSettings } = await supabase
      .from('store_settings')
      .select('*')
      .eq('owner_id', sale.owner_id)
      .single();

    // Mapear método de pagamento
    const paymentMethodMap: Record<string, string> = {
      'pix': 'PIX',
      'cartao': 'Cartão de Crédito/Débito',
      'dinheiro': 'Dinheiro',
      'pending': 'Pendente'
    };

    // Preparar dados para retorno
    const comprovanteData = {
      saleId: sale.id,
      saleDate: sale.created_at,
      total: Number(sale.total),
      subtotal: sale.subtotal ? Number(sale.subtotal) : undefined,
      discountType: sale.discount_type,
      discountValue: sale.discount_value ? Number(sale.discount_value) : undefined,
      paymentMethod: paymentMethodMap[sale.payment_method] || sale.payment_method,
      note: sale.note,
      items: (sale.sale_items || []).map((item: any) => ({
        name: item.products?.name || item.services?.name || 'Produto/Serviço',
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        totalPrice: Number(item.total_price)
      })),
      owner: {
        name: storeSettings?.store_name || 'MEI',
        cnpj: storeSettings?.cnpj,
        address: storeSettings?.address,
        phone: storeSettings?.phone
      },
      customer: sale.cliente_nome ? {
        name: sale.cliente_nome
      } : undefined,
      plan: 'free' // Por padrão free, pode ser expandido depois
    };

    return new Response(
      JSON.stringify(comprovanteData),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error fetching sale data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
