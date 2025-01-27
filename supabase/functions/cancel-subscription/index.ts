import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user?.email) {
      throw new Error('No email found')
    }

    console.log('Cancelling subscription for user:', user.email)

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Find customer by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    })

    if (customers.data.length === 0) {
      console.log('No customer found for email:', user.email)
      return new Response(
        JSON.stringify({ message: 'No active subscriptions found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Get all active subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active'
    })

    console.log('Found active subscriptions:', subscriptions.data.length)

    // Cancel all active subscriptions
    for (const subscription of subscriptions.data) {
      console.log('Cancelling subscription:', subscription.id)
      await stripe.subscriptions.cancel(subscription.id)
    }

    // Update the user's profile in Supabase
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        plan: 'Free',
        subscription_status: 'inactive',
        current_period_end: null
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        message: 'All subscriptions cancelled successfully',
        cancelled_count: subscriptions.data.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error cancelling subscriptions:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})