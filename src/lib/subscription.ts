import { supabase } from "./supabaseClient";
import { type ToastAPI } from "@/hooks/use-toast";

interface PlanSelectionProps {
  user: any;
  toast: ToastAPI;
  isCurrentPlan: boolean;
  isFree: boolean;
  priceId?: string;
  title: string;
}

interface FollowerPlanSelectionProps {
  user: any;
  toast: ToastAPI;
  priceId?: string;
}

export const handlePlanSelection = async ({
  user,
  toast,
  isCurrentPlan,
  isFree,
  priceId,
  title,
}: PlanSelectionProps) => {
  if (!user) {
    toast({
      title: "Login Required",
      description: "Please login to subscribe to this plan",
      variant: "destructive",
    });
    return;
  }

  if (isCurrentPlan) {
    toast({
      title: "Current Plan",
      description: "You are already subscribed to this plan",
    });
    return;
  }

  if (isFree) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      console.log('Attempting to cancel subscription...');
      const cancelResponse = await fetch('https://qdxpxqdewqrbvlsajeeo.supabase.co/functions/v1/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      const cancelData = await cancelResponse.json();
      
      if (!cancelResponse.ok) {
        throw new Error(cancelData.error || 'Failed to cancel subscription');
      }

      console.log('Subscription cancellation response:', cancelData);
      
      if (cancelData.cancelled_count > 0) {
        toast({
          title: "Subscription Cancelled",
          description: "Your previous subscription has been cancelled",
        });
      }

      toast({
        title: "Plan Updated",
        description: "You have been switched to the Free plan",
      });
      
      window.location.reload();
      return;
    } catch (error) {
      console.error('Error switching to free plan:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to switch to free plan. Please try again.",
        variant: "destructive",
      });
      return;
    }
  }

  if (!priceId) {
    toast({
      title: "Configuration Error",
      description: "No price ID configured for this plan",
      variant: "destructive",
    });
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No session found');
    }

    console.log('Checking subscription status...');
    const subscriptionResponse = await fetch('https://qdxpxqdewqrbvlsajeeo.supabase.co/functions/v1/check-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ priceId }),
    });

    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.json();
      console.error('Subscription check error response:', errorData);
      throw new Error(errorData.error || 'Failed to check subscription status');
    }

    const subscriptionData = await subscriptionResponse.json();
    console.log('Subscription check response:', subscriptionData);
    
    if (subscriptionData.subscribed) {
      toast({
        title: "Already Subscribed",
        description: "You already have an active subscription to this plan",
      });
      return;
    }

    console.log('Creating checkout session...');
    const checkoutResponse = await fetch('https://qdxpxqdewqrbvlsajeeo.supabase.co/functions/v1/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ priceId }),
    });

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json();
      console.error('Checkout error response:', errorData);
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { url } = await checkoutResponse.json();
    if (url) {
      console.log('Redirecting to checkout URL:', url);
      window.open(url, '_blank');
    } else {
      throw new Error('No checkout URL received');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to start checkout process. Please try again.",
      variant: "destructive",
    });
  }
};

export const handleFollowerPlanSelection = async ({
  user,
  toast,
  priceId,
}: FollowerPlanSelectionProps) => {
  if (!user) {
    toast({
      title: "Login Required",
      description: "Please login to subscribe to this plan",
      variant: "destructive",
    });
    return;
  }

  if (!priceId) {
    toast({
      title: "Configuration Error",
      description: "No price ID configured for this plan",
      variant: "destructive",
    });
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No session found');
    }

    const response = await fetch('https://qdxpxqdewqrbvlsajeeo.supabase.co/functions/v1/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    if (url) {
      window.open(url, '_blank');
    } else {
      throw new Error('No checkout URL received');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to start checkout process. Please try again.",
      variant: "destructive",
    });
  }
};