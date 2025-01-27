import { useUser } from "@/lib/useUser";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ViewerPricingCard } from "@/components/pricing/ViewerPricingCard";
import { FollowerPricingCard } from "@/components/pricing/FollowerPricingCard";

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
        <ViewerPricingCard 
          title="Free" 
          price={0} 
          viewers={10} 
          chatters={2}
          isFree
          currentPlan={currentPlan}
        />
        <ViewerPricingCard 
          title="Starter" 
          price={9.99} 
          viewers={15} 
          chatters={5}
          priceId="price_YOUR_ACTUAL_PRICE_ID"
          currentPlan={currentPlan}
        />
        <ViewerPricingCard 
          title="Basic" 
          price={29.99} 
          viewers={35} 
          chatters={8}
          priceId="price_1Qklku01379EnnGJtin4BVcc"
          currentPlan={currentPlan}
        />
        <ViewerPricingCard 
          title="Professional" 
          price={89.99} 
          viewers={100} 
          chatters={20}
          isPopular
          priceId="price_YOUR_ACTUAL_PRICE_ID"
          currentPlan={currentPlan}
        />
        <ViewerPricingCard 
          title="Expert" 
          price={159.99} 
          viewers={300} 
          chatters={90}
          priceId="price_YOUR_ACTUAL_PRICE_ID"
          currentPlan={currentPlan}
        />
        <ViewerPricingCard 
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