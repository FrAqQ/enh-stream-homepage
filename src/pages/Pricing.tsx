import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { PricingCard } from "@/components/pricing/PricingCard";
import { capitalize } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Pricing = () => {
  const { platform = 'twitch' } = useParams();
  const { user } = useUser();
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [currentFollowerPlan, setCurrentFollowerPlan] = useState("None");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (user?.id) {
        try {
          console.log("Fetching current subscription status...");
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('plan, follower_plan, subscription_status')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user plan:', error);
            setCurrentPlan("Free");
            setCurrentFollowerPlan("None");
            setSubscriptionStatus("inactive");
            return;
          }

          if (profile?.subscription_status === 'active') {
            console.log("Active subscription found:", profile.plan);
            setCurrentPlan(profile.plan || "Free");
            setCurrentFollowerPlan(profile.follower_plan || "None");
            setSubscriptionStatus('active');
          } else {
            console.log("No active subscription found, setting to Free plan");
            setCurrentPlan("Free");
            setCurrentFollowerPlan("None");
            setSubscriptionStatus('inactive');
          }
        } catch (error) {
          console.error('Error:', error);
          setCurrentPlan("Free");
          setCurrentFollowerPlan("None");
          setSubscriptionStatus("inactive");
        }
      }
    };

    fetchUserPlan();
    const interval = setInterval(fetchUserPlan, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const capitalizedPlatform = capitalize(platform);

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-center mb-4">{capitalizedPlatform} Plans</h1>
      <p className="text-muted-foreground text-center mb-8">
        Choose the perfect plan for your {platform} streaming needs
      </p>

      <div className="flex items-center justify-center gap-4 mb-12">
        <Label htmlFor="billing-toggle" className={!isYearly ? "font-bold" : ""}>Monthly</Label>
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <Label htmlFor="billing-toggle" className={isYearly ? "font-bold" : ""}>
          Yearly <span className="text-primary">(Save 20%)</span>
        </Label>
      </div>
      
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Viewer & Chatter Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <PricingCard 
            title="Free" 
            price={0} 
            viewers={10} 
            chatters={8}
            isFree
            platform={capitalizedPlatform}
            currentPlan={currentPlan}
            isYearly={isYearly}
          />
          <PricingCard 
            title="Starter" 
            price={12.99} 
            viewers={25} 
            chatters={10}
            priceId={isYearly ? "price_yearly_starter" : "price_1Qklku01379EnnGJtin4BVcc"}
            platform={capitalizedPlatform}
            currentPlan={currentPlan}
            isYearly={isYearly}
          />
          <PricingCard 
            title="Basic" 
            price={29.99} 
            viewers={50} 
            chatters={16}
            priceId={isYearly ? "price_yearly_basic" : "price_1Qm2w001379EnnGJPVwgRD9F"}
            platform={capitalizedPlatform}
            currentPlan={currentPlan}
            isYearly={isYearly}
          />
          <PricingCard 
            title="Professional" 
            price={129.99} 
            viewers={200} 
            chatters={80}
            isPopular
            priceId={isYearly ? "price_yearly_professional" : "price_1Qm2E301379EnnGJjSesajsz"}
            platform={capitalizedPlatform}
            currentPlan={currentPlan}
            isYearly={isYearly}
          />
          <PricingCard 
            title="Expert" 
            price={199.99} 
            viewers={300} 
            chatters={180}
            priceId={isYearly ? "price_yearly_expert" : "price_1Qm2Ke01379EnnGJNfHjqbBo"}
            platform={capitalizedPlatform}
            currentPlan={currentPlan}
            isYearly={isYearly}
          />
          <PricingCard 
            title="Ultimate" 
            price={599.99} 
            viewers={1000} 
            chatters={400}
            priceId={isYearly ? "price_yearly_ultimate" : "price_1Qm2VA01379EnnGJTiStzUOq"}
            platform={capitalizedPlatform}
            currentPlan={currentPlan}
            isYearly={isYearly}
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Follower Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <PricingCard 
            title="Follower Basic" 
            price={24.99} 
            viewers={0} 
            chatters={0}
            followers={100}
            followersPerDay={100}
            totalFollowers={3000}
            priceId={isYearly ? "price_yearly_follower_basic" : "price_follower_basic"}
            platform={capitalizedPlatform}
            currentPlan={currentFollowerPlan}
            isFollowerPlan
            isYearly={isYearly}
          />
          <PricingCard 
            title="Follower Plus" 
            price={49.99} 
            viewers={0} 
            chatters={0}
            followers={250}
            followersPerDay={250}
            totalFollowers={7500}
            priceId={isYearly ? "price_yearly_follower_plus" : "price_follower_plus"}
            platform={capitalizedPlatform}
            currentPlan={currentFollowerPlan}
            isFollowerPlan
            isYearly={isYearly}
          />
          <PricingCard 
            title="Follower Pro" 
            price={99.99} 
            viewers={0} 
            chatters={0}
            followers={500}
            followersPerDay={500}
            totalFollowers={15000}
            isPopular
            priceId={isYearly ? "price_yearly_follower_pro" : "price_follower_pro"}
            platform={capitalizedPlatform}
            currentPlan={currentFollowerPlan}
            isFollowerPlan
            isYearly={isYearly}
          />
          <PricingCard 
            title="Follower Elite" 
            price={199.99} 
            viewers={0} 
            chatters={0}
            followers={1000}
            followersPerDay={1000}
            totalFollowers={30000}
            priceId={isYearly ? "price_yearly_follower_elite" : "price_follower_elite"}
            platform={capitalizedPlatform}
            currentPlan={currentFollowerPlan}
            isFollowerPlan
            isYearly={isYearly}
          />
        </div>
      </div>
    </div>
  );
};

export default Pricing;