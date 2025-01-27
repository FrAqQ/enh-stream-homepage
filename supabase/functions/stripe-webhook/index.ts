import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

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

        // Erstelle Supabase Client
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Update den User Plan in der profiles Tabelle
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'active',
            stripe_customer_id: session.customer,
            current_period_end: new Date(session.expires_at * 1000).toISOString()
          })
          .eq('email', customerEmail);

        if (updateError) {
          throw new Error(`Failed to update subscription status: ${updateError.message}`);
        }

        console.log(`Successfully updated subscription for user ${customerEmail}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerEmail = subscription.customer_email;

        if (!customerEmail) {
          throw new Error('No customer email found in subscription');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('email', customerEmail);

        if (updateError) {
          throw new Error(`Failed to update subscription: ${updateError.message}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerEmail = subscription.customer_email;

        if (!customerEmail) {
          throw new Error('No customer email found in subscription');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'canceled',
            current_period_end: null
          })
          .eq('email', customerEmail);

        if (updateError) {
          throw new Error(`Failed to cancel subscription: ${updateError.message}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);
        // Hier könntest du z.B. eine Benachrichtigung an den User senden
        break;
      }
    }

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