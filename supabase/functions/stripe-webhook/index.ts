import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    console.log('Received Stripe webhook event:', event.type);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing successful checkout:', session.id);

      // Get customer email from session
      const customerEmail = session.customer_details?.email;
      if (!customerEmail) {
        throw new Error('No customer email found in session');
      }

      // Get the price ID from the session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;

      // Map price IDs to plan names
      const planMapping: { [key: string]: string } = {
        'price_basic': 'Basic',
        'price_pro': 'Pro',
        'price_expert': 'Expert',
        'price_enterprise': 'Enterprise'
      };

      const newPlan = planMapping[priceId || ''] || 'Free';
      console.log('Updating plan to:', newPlan, 'for customer:', customerEmail);

      // Get user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .single();

      if (userError || !userData) {
        throw new Error(`User not found for email: ${customerEmail}`);
      }

      // Update user's plan
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ plan: newPlan })
        .eq('id', userData.id);

      if (updateError) {
        throw new Error(`Failed to update plan: ${updateError.message}`);
      }

      console.log('Successfully updated plan for user:', userData.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400 }
    );
  }
});