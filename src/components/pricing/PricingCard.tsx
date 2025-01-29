import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/lib/useUser";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface PricingCardProps {
  title: string;
  price: number;
  viewers: number;
  chatters: number;
  followers?: number;
  followersPerDay?: number;
  totalFollowers?: number;
  isPopular?: boolean;
  isFree?: boolean;
  priceId?: string;
  currentPlan: string;
  platform: string;
  isFollowerPlan?: boolean;
  isYearly?: boolean;
}

export function PricingCard({ 
  title, 
  price: originalPrice, 
  viewers, 
  chatters,
  followers,
  followersPerDay,
  totalFollowers,
  isPopular,
  isFree,
  priceId,
  currentPlan,
  platform,
  isFollowerPlan,
  isYearly = false
}: PricingCardProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const planFullName = `${platform} ${title}`;
  const isCurrentPlan = currentPlan === planFullName;
  const isDefaultFreePlan = isFree && user && (!currentPlan || currentPlan === "Free");

  function calculateDiscountedPrice(originalPrice: number, planTitle: string, isYearly: boolean): number {
    let price = originalPrice;
    
    if (isFollowerPlan) {
      switch (planTitle) {
        case "Follower Plus":
          price = originalPrice * 0.95; // 5% discount
          break;
        case "Follower Pro":
          price = originalPrice * 0.90; // 10% discount
          break;
        case "Follower Elite":
          price = originalPrice * 0.80; // 20% discount
          break;
      }
    }

    if (isYearly) {
      price = price * 12 * 0.80; // 20% yearly discount
    }

    return price;
  }

  const price = isFree ? 0 : calculateDiscountedPrice(originalPrice, title, isYearly);

  const calculateSavings = () => {
    if (title === "Starter" || (isFollowerPlan && title === "Follower Basic")) {
      return null;
    }

    if (isFollowerPlan) {
      const basePrice = isYearly ? originalPrice * 12 : originalPrice;
      let savings;
      let percentage;

      switch (title) {
        case "Follower Plus":
          savings = basePrice * 0.05;
          percentage = "5.0";
          break;
        case "Follower Pro":
          savings = basePrice * 0.10;
          percentage = "10.0";
          break;
        case "Follower Elite":
          savings = basePrice * 0.20;
          percentage = "20.0";
          break;
        default:
          return null;
      }

      if (isYearly) {
        savings = savings * 0.80; // Apply 20% yearly discount to savings
      }

      return {
        amount: savings.toFixed(2),
        percentage
      };
    } else if (!isFollowerPlan && !isFree) {
      const baseViewerPrice = 0.50;
      const baseChatterPrice = 0.75;
      
      let regularPrice = (viewers * baseViewerPrice) + (chatters * baseChatterPrice);
      if (isYearly) {
        regularPrice = regularPrice * 12;
      }
      
      const savings = regularPrice - price;
      const savingsPercentage = ((regularPrice - price) / regularPrice) * 100;
      
      return {
        amount: savings > 0 ? savings.toFixed(2) : "0",
        percentage: savingsPercentage > 0 ? savingsPercentage.toFixed(1) : "0"
      };
    }
    return null;
  };

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

        const updateData = isFollowerPlan 
          ? { follower_plan: planFullName, subscription_status: 'inactive', current_period_end: null }
          : { plan: planFullName, subscription_status: 'inactive', current_period_end: null };

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "Plan Updated",
          description: `You have been switched to the ${planFullName} plan`,
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const currentProfilePlan = isFollowerPlan ? profile?.follower_plan : profile?.plan;
      const isActiveSubscription = profile?.subscription_status === 'active';

      if (currentProfilePlan === planFullName && isActiveSubscription) {
        toast({
          title: "Already Subscribed",
          description: "You are already subscribed to this plan",
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
        body: JSON.stringify({ 
          priceId,
          platform,
          planName: title,
          isFollowerPlan
        }),
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        console.error('Checkout error response:', errorData);
        
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

  const savings = calculateSavings();
  const savingsColor = isPopular ? "text-primary" : "text-accent-foreground";

  return (
    <Card className={`p-6 relative flex flex-col h-[440px] ${isPopular ? 'border-primary' : 'bg-card/50 backdrop-blur'}`}>
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded-full text-xs">
          Most Popular
        </span>
      )}
      
      {/* Header Section - Fixed Height */}
      <div className="h-20">
        <h3 className="text-xl font-bold mb-2">{planFullName}</h3>
      </div>
      
      {/* Pricing Section - Fixed Height */}
      <div className="h-32">
        <div className="mb-2">
          <p className="text-3xl font-bold">
            {isFree ? 'Free' : `€${price.toFixed(2)}`}
            <span className="text-sm font-normal text-muted-foreground block">
              {!isFree && `/${isYearly ? 'year' : 'month'}`}
            </span>
          </p>
        </div>
        
        {!isFree && savings && (
          <div className={`text-sm ${savingsColor} font-medium`}>
            <p>You save €{savings.amount}</p>
            <p>({savings.percentage}%) / {isYearly ? 'year' : 'month'}</p>
          </div>
        )}
      </div>

      {/* Features Section - Fixed Height */}
      <div className="flex-grow space-y-3">
        <ul className="space-y-2">
          {isFollowerPlan ? (
            <>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> {followersPerDay} Followers / Day
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> {totalFollowers} Total Followers / Month
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> {viewers} Viewers
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> {chatters} Chatters
              </li>
            </>
          )}
          <li className="flex items-center gap-2">
            <span className="text-primary">✓</span> Duration: {isFree ? 'Forever' : isYearly ? '12 Months' : '1 Month'}
          </li>
        </ul>
      </div>

      {/* Button Section - Fixed Height */}
      <div className="h-10 mt-4">
        <Button 
          className="w-full"
          onClick={handleSelectPlan}
          variant={isCurrentPlan || isDefaultFreePlan ? "secondary" : "default"}
        >
          {isCurrentPlan || isDefaultFreePlan ? 'Current Plan' : 'Select Plan'}
        </Button>
      </div>
    </Card>
  );
}