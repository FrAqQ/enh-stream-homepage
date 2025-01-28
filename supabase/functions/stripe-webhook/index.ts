import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICE_TO_PLAN_MAP = {
  'price_1Qklku01379EnnGJtin4BVcc': 'Starter',
  'price_1Qm24A01379EnnGJBofCnhLN': 'Basic',
  'price_1Qm2E301379EnnGJjSesajsz': 'Professional',
  'price_1Qm2Ke01379EnnGJNfHjqbBo': 'Expert',
  'price_1Qm2VA01379EnnGJTiStzUOq': 'Ultimate'
};

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

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Verifiziere den Webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Webhook Event Type:', event.type);

    // Handle verschiedene Event-Typen
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Hole die erweiterte Session mit Line Items
        const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items'],
        });

        const customerEmail = expandedSession.customer_details?.email;
        if (!customerEmail) {
          throw new Error('No customer email found in session');
        }

        // Get the price ID from the line items
        const priceId = expandedSession.line_items?.data[0]?.price?.id;
        if (!priceId) {
          throw new Error('No price ID found in session');
        }

        // Map price ID to plan name
        const planName = PRICE_TO_PLAN_MAP[priceId as keyof typeof PRICE_TO_PLAN_MAP];
        if (!planName) {
          throw new Error(`No plan mapping found for price ID: ${priceId}`);
        }

        console.log(`Updating user ${customerEmail} to plan ${planName}`);

        // Erstelle Supabase Client
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

        // Update den User Plan in der profiles Tabelle
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            plan: planName,
            subscription_status: 'active',
            stripe_customer_id: session.customer,
            current_period_end: new Date(session.expires_at * 1000).toISOString()
          })
          .eq('email', customerEmail);

        if (updateError) {
          console.error('Failed to update profile:', updateError);
          throw new Error(`Failed to update subscription status: ${updateError.message}`);
        }

        console.log(`Successfully updated subscription for user ${customerEmail} to plan ${planName}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerEmail = subscription.customer_email;
        const priceId = subscription.items.data[0]?.price?.id;

        if (!customerEmail || !priceId) {
          throw new Error('Missing customer email or price ID');
        }

        const planName = PRICE_TO_PLAN_MAP[priceId as keyof typeof PRICE_TO_PLAN_MAP];
        if (!planName) {
          throw new Error(`No plan mapping found for price ID: ${priceId}`);
        }

        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            plan: planName,
            subscription_status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('email', customerEmail);

        if (updateError) {
          console.error('Failed to update subscription:', updateError);
          throw new Error(`Failed to update subscription: ${updateError.message}`);
        }

        console.log(`Successfully updated subscription for ${customerEmail} to ${planName}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerEmail = subscription.customer_email;

        if (!customerEmail) {
          throw new Error('No customer email found in subscription');
        }

        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            plan: 'Free',
            subscription_status: 'canceled',
            current_period_end: null
          })
          .eq('email', customerEmail);

        if (updateError) {
          console.error('Failed to cancel subscription:', updateError);
          throw new Error(`Failed to cancel subscription: ${updateError.message}`);
        }

        console.log(`Successfully cancelled subscription for ${customerEmail}`);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});