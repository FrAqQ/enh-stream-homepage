import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Preise-zu-Plan-Mapping
const PRICE_TO_PLAN = {
  'price_basic': 'Basic',
  'price_pro': 'Pro',
  'price_expert': 'Expert',
  'price_enterprise': 'Enterprise'
} as const;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    console.error('No stripe signature found');
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    // Verifiziere den Webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Webhook Event Type:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Hole die erweiterte Session mit Line Items
      const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });

      const customerEmail = expandedSession.customer_details?.email;
      if (!customerEmail) {
        throw new Error('No customer email found in session');
      }

      // Hole die Price ID aus den Line Items
      const priceId = expandedSession.line_items?.data[0]?.price?.id;
      if (!priceId) {
        throw new Error('No price ID found in session');
      }

      // Bestimme den Plan basierend auf der Price ID
      const newPlan = PRICE_TO_PLAN[priceId as keyof typeof PRICE_TO_PLAN];
      if (!newPlan) {
        throw new Error(`Unknown price ID: ${priceId}`);
      }

      // Erstelle Supabase Client
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Update den User Plan in der profiles Tabelle
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ plan: newPlan })
        .eq('email', customerEmail);

      if (updateError) {
        throw new Error(`Failed to update user plan: ${updateError.message}`);
      }

      console.log(`Successfully updated plan to ${newPlan} for user ${customerEmail}`);
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Für andere Event-Typen
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});