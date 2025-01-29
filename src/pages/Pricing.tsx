import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { PricingCard } from "@/components/pricing/PricingCard";
import { capitalize } from "@/lib/utils";

const Pricing = () => {
  const { platform = 'twitch' } = useParams();
  const { user } = useUser();
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [currentFollowerPlan, setCurrentFollowerPlan] = useState("None");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");

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
      <p className="text-muted-foreground text-center mb-12">
        Choose the perfect plan for your {platform} streaming needs
      </p>
      
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
          />
          <PricingCard 
            title="Starter" 
            price={12.99} 
            viewers={25} 
            chatters={20}
            priceId="price_1Qklku01379EnnGJtin4BVcc"
            platform={capitalizedPlatform}
            currentPlan={currentPlan}
          />
          <PricingCard 
            title="Basic" 
            price={29.99} 
            viewers={50} 
            chatters={32}
            priceId="price_1Qm2w001379EnnGJPVwgRD9F"
            platform={capitalizedPlatform}
            currentPlan={currentPlan}
          />
          <PricingCard 
            title="Professional" 
            price={129.99} 
            viewers={200} 
            chatters={80}
            isPopular
            priceId="price_1Qm2E301379EnnGJjSesajsz"
            platform={capitalizedPlatform}
            currentPlan={currentPlan}
          />
          <PricingCard 
            title="Expert" 
            price={199.99} 
            viewers={300} 
            chatters={180}
            priceId="price_1Qm2Ke01379EnnGJNfHjqbBo"
            platform={capitalizedPlatform}
            currentPlan={currentPlan}
          />
          <PricingCard 
            title="Ultimate" 
            price={599.99} 
            viewers={1000} 
            chatters={400}
            priceId="price_1Qm2VA01379EnnGJTiStzUOq"
            platform={capitalizedPlatform}
            currentPlan={currentPlan}
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Follower Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <PricingCard 
            title="Follower Basic" 
            price={49.99} 
            viewers={0} 
            chatters={0}
            followers={100}
            priceId="price_follower_basic"
            platform={capitalizedPlatform}
            currentPlan={currentFollowerPlan}
            isFollowerPlan
          />
          <PricingCard 
            title="Follower Plus" 
            price={99.99} 
            viewers={0} 
            chatters={0}
            followers={250}
            priceId="price_follower_plus"
            platform={capitalizedPlatform}
            currentPlan={currentFollowerPlan}
            isFollowerPlan
          />
          <PricingCard 
            title="Follower Pro" 
            price={199.99} 
            viewers={0} 
            chatters={0}
            followers={500}
            isPopular
            priceId="price_follower_pro"
            platform={capitalizedPlatform}
            currentPlan={currentFollowerPlan}
            isFollowerPlan
          />
          <PricingCard 
            title="Follower Elite" 
            price={399.99} 
            viewers={0} 
            chatters={0}
            followers={1000}
            priceId="price_follower_elite"
            platform={capitalizedPlatform}
            currentPlan={currentFollowerPlan}
            isFollowerPlan
          />
        </div>
      </div>
    </div>
  );
};

export default Pricing;