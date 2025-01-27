import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/lib/useUser";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

const PricingCard = ({ 
  title, 
  price, 
  viewers, 
  chatters,
  isPopular,
  isFree,
  priceId,
  currentPlan
}: { 
  title: string;
  price: number;
  viewers: number;
  chatters: number;
  isPopular?: boolean;
  isFree?: boolean;
  priceId?: string;
  currentPlan: string;
}) => {
  const { user } = useUser();
  const { toast } = useToast();
  const isCurrentPlan = currentPlan === title;

  const handleSelectPlan = async () => {
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

        // First try to cancel any existing subscription
        try {
          const cancelResponse = await fetch('https://qdxpxqdewqrbvlsajeeo.supabase.co/functions/v1/cancel-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            }
          });

          if (!cancelResponse.ok) {
            console.log('No active subscription to cancel or error cancelling');
          }
        } catch (error) {
          console.error('Error cancelling subscription:', error);
        }

        // Update profile to free plan
        const { error } = await supabase
          .from('profiles')
          .update({ 
            plan: 'Free',
            subscription_status: 'inactive',
            current_period_end: null
          })
          .eq('id', user.id);

        if (error) throw error;

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
          description: "Failed to switch to free plan. Please try again.",
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

      // Create checkout session directly
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
        
        // Handle specific error cases
        if (errorData.error === "Already subscribed to this plan") {
          toast({
            title: "Already Subscribed",
            description: "You already have an active subscription to this plan",
          });
          return;
        }
        
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

  return (
    <Card className={`p-6 relative ${isPopular ? 'border-primary' : 'bg-card/50 backdrop-blur'}`}>
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded-full text-xs">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-6">{isFree ? 'Free' : `€${price.toFixed(2)}`}</p>
      <ul className="space-y-2 mb-6">
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> {viewers} Viewers
        </li>
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> {chatters} Chatters
        </li>
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> Duration: {isFree ? 'Forever' : '1 Month'}
        </li>
      </ul>
      <Button 
        className="w-full"
        onClick={handleSelectPlan}
        variant={isCurrentPlan ? "secondary" : "default"}
      >
        {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
      </Button>
    </Card>
  );
};

const FollowerPricingCard = ({ 
  title, 
  price, 
  followers,
  duration,
  isPopular,
  priceId 
}: { 
  title: string;
  price: number;
  followers: number;
  duration: string;
  isPopular?: boolean;
  priceId?: string;
}) => {
  const { user } = useUser();
  const { toast } = useToast();

  const handleSelectPlan = async () => {
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
        window.open(url, '_blank'); // Hier öffnen wir den Link in einem neuen Tab
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

  return (
    <Card className={`p-6 relative ${isPopular ? 'border-primary' : 'bg-card/50 backdrop-blur'}`}>
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded-full text-xs">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-6">€{price.toFixed(2)}</p>
      <ul className="space-y-2 mb-6">
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> {followers} Followers/day
        </li>
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> Duration: {duration}
        </li>
      </ul>
      <Button 
        className="w-full"
        onClick={handleSelectPlan}
      >
        Select Plan
      </Button>
    </Card>
  );
};

const Pricing = () => {
  const { user } = useUser();
  const [currentPlan, setCurrentPlan] = useState("Free");

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (user?.id) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user plan:', error);
            return;
          }

          if (profile?.plan) {
            setCurrentPlan(profile.plan);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };

    fetchUserPlan();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-center mb-4">Viewer & Chatter Plans</h1>
      <p className="text-muted-foreground text-center mb-12">Choose the perfect plan for your streaming needs</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-20">
        <PricingCard 
          title="Free" 
          price={0} 
          viewers={10} 
          chatters={2}
          isFree
          currentPlan={currentPlan}
        />
        <PricingCard 
          title="Starter" 
          price={9.99} 
          viewers={15} 
          chatters={5}
          priceId="price_1Qklku01379EnnGJtin4BVcc"
          currentPlan={currentPlan}
        />
        <PricingCard 
          title="Basic" 
          price={29.99} 
          viewers={35} 
          chatters={8}
          priceId="price_1Qklku01379EnnGJtin4BVcc"
          currentPlan={currentPlan}
        />
        <PricingCard 
          title="Professional" 
          price={89.99} 
          viewers={100} 
          chatters={20}
          isPopular
          priceId="price_YOUR_ACTUAL_PRICE_ID"
          currentPlan={currentPlan}
        />
        <PricingCard 
          title="Expert" 
          price={159.99} 
          viewers={300} 
          chatters={90}
          priceId="price_YOUR_ACTUAL_PRICE_ID"
          currentPlan={currentPlan}
        />
        <PricingCard 
          title="Ultimate" 
          price={249.99} 
          viewers={600} 
          chatters={200}
          priceId="price_YOUR_ACTUAL_PRICE_ID"
          currentPlan={currentPlan}
        />
      </div>

      <h2 className="text-4xl font-bold text-center mb-4">Follower Plans</h2>
      <p className="text-muted-foreground text-center mb-12">Boost your follower count with our targeted plans</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <FollowerPricingCard 
          title="Starter" 
          price={9.99} 
          followers={100} 
          duration="1 Week"
          priceId="price_YOUR_ACTUAL_PRICE_ID"
        />
        <FollowerPricingCard 
          title="Basic" 
          price={29.99} 
          followers={100} 
          duration="1 Month"
          priceId="price_YOUR_ACTUAL_PRICE_ID"
        />
        <FollowerPricingCard 
          title="Professional" 
          price={114.99} 
          followers={250} 
          duration="2 Months"
          isPopular
          priceId="price_YOUR_ACTUAL_PRICE_ID"
        />
        <FollowerPricingCard 
          title="Expert" 
          price={194.99} 
          followers={500} 
          duration="2 Months"
          priceId="price_YOUR_ACTUAL_PRICE_ID"
        />
        <FollowerPricingCard 
          title="Ultimate" 
          price={414.99} 
          followers={1000} 
          duration="2 Months"
          priceId="price_YOUR_ACTUAL_PRICE_ID"
        />
      </div>
    </div>
  );
};

export default Pricing;
