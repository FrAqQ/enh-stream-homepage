import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

const PRICE_TO_PLAN_MAP = {
  'price_1Qklku01379EnnGJtin4BVcc': 'Starter',
  'price_1Qm2r901379EnnGJUPjUHV4L': 'Basic',
  'price_1Qm2E301379EnnGJjSesajsz': 'Professional',
  'price_1Qm2Ke01379EnnGJNfHjqbBo': 'Expert',
  'price_1Qm2VA01379EnnGJTiStzUOq': 'Ultimate'
};

serve(async (req) => {
  console.log('Webhook function started');

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log('Received webhook body:', body);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    let event;
    try {
      event = JSON.parse(body);
      console.log('Successfully parsed webhook event:', event.type);
    } catch (err) {
      console.error('Error parsing webhook event:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { 
        status: 400,
        headers: corsHeaders
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    console.log('Supabase client created');

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Processing checkout.session.completed');
        const session = event.data.object;

        try {
          const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items.data.price', 'metadata']
          });
          console.log('Expanded session:', expandedSession);

          const priceId = expandedSession.line_items?.data[0]?.price?.id;
          if (!priceId) {
            console.error('No price ID found in session');
            throw new Error('No price ID found in session');
          }

          const planName = PRICE_TO_PLAN_MAP[priceId];
          if (!planName) {
            console.error(`No plan mapping found for price ID: ${priceId}`);
            throw new Error(`Unknown price ID: ${priceId}`);
          }

          const platform = expandedSession.metadata?.platform || 'Twitch';
          const fullPlanName = `${platform} ${planName}`;

          const customerEmail = expandedSession.customer_details?.email;
          if (!customerEmail) {
            console.error('No customer email found in session');
            throw new Error('No customer email found in session');
          }

          console.log(`Updating user ${customerEmail} to plan ${fullPlanName}`);

          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              plan: fullPlanName,
              subscription_status: 'active',
              stripe_customer_id: session.customer,
              current_period_end: new Date(session.expires_at * 1000).toISOString()
            })
            .eq('email', customerEmail);

          if (updateError) {
            console.error('Failed to update profile:', updateError);
            throw updateError;
          }

          console.log(`Successfully updated subscription for ${customerEmail}`);
        } catch (error) {
          console.error('Error processing checkout.session.completed:', error);
          throw error;
        }
        break;
      }

      case 'customer.subscription.updated': {
        console.log('Processing customer.subscription.updated');
        const subscription = event.data.object;
        
        try {
          const priceId = subscription.items.data[0]?.price?.id;
          const customerEmail = subscription.customer_email;
          const customerId = subscription.customer;

          if (!priceId) {
            console.error('Missing price ID');
            throw new Error('Missing price ID');
          }

          const customer = await stripe.customers.retrieve(customerId);
          const email = typeof customer !== 'string' ? customer.email : null;

          if (!email) {
            console.error('No customer email found');
            throw new Error('No customer email found');
          }

          const planName = PRICE_TO_PLAN_MAP[priceId];
          if (!planName) {
            console.error(`No plan mapping found for price ID: ${priceId}`);
            throw new Error(`No plan mapping found for price ID: ${priceId}`);
          }

          // Get the current platform from the profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('plan')
            .eq('email', email)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            throw profileError;
          }

          const currentPlatform = profile?.plan?.split(' ')[0] || 'Twitch';
          const fullPlanName = `${currentPlatform} ${planName}`;

          console.log(`Updating subscription for ${email} to plan ${fullPlanName}`);

          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              plan: fullPlanName,
              subscription_status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('email', email);

          if (updateError) {
            console.error('Failed to update subscription:', updateError);
            throw updateError;
          }

          console.log(`Successfully updated subscription for ${email}`);
        } catch (error) {
          console.error('Error processing customer.subscription.updated:', error);
          throw error;
        }
        break;
      }

      case 'payment_intent.succeeded': {
        console.log('Processing payment_intent.succeeded');
        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});