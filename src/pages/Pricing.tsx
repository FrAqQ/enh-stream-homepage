import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/lib/useUser";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const PricingCard = ({ 
  title, 
  price, 
  viewers, 
  chatters,
  isPopular,
  isFree,
  priceId
}: { 
  title: string;
  price: number;
  viewers: number;
  chatters: number;
  isPopular?: boolean;
  isFree?: boolean;
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

    if (isFree) {
      toast({
        title: "Free Plan",
        description: "You are already on the free plan",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      console.log('Starting checkout process for price:', priceId);
      const response = await fetch(`https://qdxpxqdewqrbvlsajeeo.supabase.co/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Checkout error:', errorData);
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
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
      >
        {isFree ? 'Current Plan' : 'Select Plan'}
      </Button>
    </Card>
  );
};

const FollowerPricingCard = ({ 
  title, 
  price, 
  followers,
  duration,
  isPopular 
}: { 
  title: string;
  price: number;
  followers: number;
  duration: string;
  isPopular?: boolean;
}) => {
  const { user } = useUser();
  const { toast } = useToast();

  const handleSelectPlan = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to subscribe to this plan",
        variant: "destructive",
      });
      return;
    }

    // Open Stripe payment link in new tab
    window.open('https://buy.stripe.com/test_14k14L3YLd2n22Y289', '_blank');
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
        />
        <PricingCard 
          title="Starter" 
          price={9.99} 
          viewers={15} 
          chatters={5}
          priceId="price_1OvKQyLkdIwHu7ixZxHUQBWz"  // Test Price ID
        />
        <PricingCard 
          title="Basic" 
          price={29.99} 
          viewers={35} 
          chatters={8}
          priceId="price_1OvKQyLkdIwHu7ixZxHUQBWz"  // Test Price ID
        />
        <PricingCard 
          title="Professional" 
          price={89.99} 
          viewers={100} 
          chatters={20}
          isPopular
          priceId="price_1OvKQyLkdIwHu7ixZxHUQBWz"  // Test Price ID
        />
        <PricingCard 
          title="Expert" 
          price={159.99} 
          viewers={300} 
          chatters={90}
        />
        <PricingCard 
          title="Ultimate" 
          price={249.99} 
          viewers={600} 
          chatters={200}
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
        />
        <FollowerPricingCard 
          title="Basic" 
          price={29.99} 
          followers={100} 
          duration="1 Month"
        />
        <FollowerPricingCard 
          title="Professional" 
          price={114.99} 
          followers={250} 
          duration="2 Months"
          isPopular 
        />
        <FollowerPricingCard 
          title="Expert" 
          price={194.99} 
          followers={500} 
          duration="2 Months"
        />
        <FollowerPricingCard 
          title="Ultimate" 
          price={414.99} 
          followers={1000} 
          duration="2 Months"
        />
      </div>
    </div>
  );
};

export default Pricing;
