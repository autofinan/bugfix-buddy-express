import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response('Missing signature', { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err);
      return new Response(`Webhook Error: ${err?.message || 'Unknown error'}`, { status: 400 });
    }

    console.log('Received event:', event.type);

    // Criar cliente Supabase com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const priceBasic = Deno.env.get('STRIPE_PRICE_BASIC');
    const pricePro = Deno.env.get('STRIPE_PRICE_PRO');

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        
        if (!userId) {
          console.error('No user_id in checkout session metadata');
          break;
        }

        console.log('Checkout completed for user:', userId);

        // Obter subscription para pegar o price_id
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0]?.price.id;
          
          let plan: 'free' | 'basic' | 'pro' = 'free';
          if (priceId === priceBasic) {
            plan = 'basic';
          } else if (priceId === pricePro) {
            plan = 'pro';
          }

          const billingUntil = new Date(subscription.current_period_end * 1000).toISOString();

          console.log('Updating user plan:', { userId, plan, billingUntil });

          const { error } = await supabase
            .from('user_plans')
            .update({
              plan,
              billing_until: billingUntil,
              ai_questions_used: 0,
              ai_questions_reset_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          if (error) {
            console.error('Error updating user plan:', error);
          } else {
            console.log('User plan updated successfully');
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          console.error('No user_id in subscription metadata');
          break;
        }

        console.log('Invoice paid for user:', userId);

        const priceId = subscription.items.data[0]?.price.id;
        let plan: 'free' | 'basic' | 'pro' = 'free';
        if (priceId === priceBasic) {
          plan = 'basic';
        } else if (priceId === pricePro) {
          plan = 'pro';
        }

        const billingUntil = new Date(subscription.current_period_end * 1000).toISOString();

        const { error } = await supabase
          .from('user_plans')
          .update({
            plan,
            billing_until: billingUntil,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Error renewing user plan:', error);
        } else {
          console.log('User plan renewed successfully');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          console.error('No user_id in subscription metadata');
          break;
        }

        console.log('Payment failed for user:', userId);

        // Rebaixar para free
        const { error } = await supabase
          .from('user_plans')
          .update({
            plan: 'free',
            billing_until: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Error downgrading user plan:', error);
        } else {
          console.log('User plan downgraded to free');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          console.error('No user_id in subscription metadata');
          break;
        }

        console.log('Subscription deleted for user:', userId);

        // Rebaixar para free
        const { error } = await supabase
          .from('user_plans')
          .update({
            plan: 'free',
            billing_until: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (error) {
          console.error('Error downgrading user plan:', error);
        } else {
          console.log('User plan downgraded to free');
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
