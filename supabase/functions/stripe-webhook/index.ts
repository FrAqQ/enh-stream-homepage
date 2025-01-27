import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature')
    
    if (!signature) {
      console.error('No stripe signature found')
      return new Response('No signature', { status: 400 })
    }

    const body = await req.text()
    
    // Verify the webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
      console.log('Webhook verified:', event.type)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      // Retrieve the session to get line items
      const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      })

      const customerEmail = expandedSession.customer_details?.email
      if (!customerEmail) {
        throw new Error('No customer email found in session')
      }

      // Get the price ID from the line items
      const priceId = expandedSession.line_items?.data[0]?.price?.id
      if (!priceId) {
        throw new Error('No price ID found in session')
      }

      // Map price IDs to plan names
      const planMapping: { [key: string]: string } = {
        'price_basic': 'Basic',
        'price_pro': 'Pro',
        'price_expert': 'Expert',
        'price_enterprise': 'Enterprise'
      }

      const newPlan = planMapping[priceId]
      if (!newPlan) {
        throw new Error(`Unknown price ID: ${priceId}`)
      }

      // Create Supabase client
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

      // Update the user's plan in the profiles table
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ plan: newPlan })
        .eq('email', customerEmail)

      if (updateError) {
        throw new Error(`Failed to update user plan: ${updateError.message}`)
      }

      console.log(`Successfully updated plan to ${newPlan} for user ${customerEmail}`)
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Return a response for other event types
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})