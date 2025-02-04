import { useState } from "react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { PricingCard } from "@/components/pricing/PricingCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/LanguageContext";

const Pricing = () => {
  const { user } = useUser();
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [currentFollowerPlan, setCurrentFollowerPlan] = useState("None");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [isYearly, setIsYearly] = useState(false);
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Plans",
      subtitle: "Choose the perfect plan for your streaming needs",
      monthly: "Monthly",
      yearly: "Yearly",
      save: "Save",
      viewerPlans: "Viewer & Chatter Plans",
      followerPlans: "Follower Plans",
      free: "Test Plan",
      starter: "Starter",
      basic: "Basic",
      professional: "Professional",
      expert: "Expert",
      ultimate: "Ultimate",
      followerBasic: "Follower Basic",
      followerPlus: "Follower Plus",
      followerPro: "Follower Pro",
      followerElite: "Follower Elite",
      viewers: "Viewers",
      chatters: "Chatters",
      followersPerDay: "Followers / Day",
      totalFollowers: "Total Followers / Month"
    },
    de: {
      title: "Pläne",
      subtitle: "Wählen Sie den perfekten Plan für Ihre Streaming-Bedürfnisse",
      monthly: "Monatlich",
      yearly: "Jährlich",
      save: "Sparen",
      viewerPlans: "Zuschauer & Chatter Pläne",
      followerPlans: "Follower Pläne",
      free: "Testplan",
      starter: "Starter",
      basic: "Basic",
      professional: "Professional",
      expert: "Experte",
      ultimate: "Ultimate",
      followerBasic: "Follower Basic",
      followerPlus: "Follower Plus",
      followerPro: "Follower Pro",
      followerElite: "Follower Elite",
      viewers: "Zuschauer",
      chatters: "Chatter",
      followersPerDay: "Follower / Tag",
      totalFollowers: "Gesamte Follower / Monat"
    }
  };

  const t = translations[language];

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

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-center mb-4">Enhance Stream {t.title}</h1>
      <p className="text-muted-foreground text-center mb-8">
        {t.subtitle}
      </p>

      <div className="flex items-center justify-center gap-4 mb-12">
        <Label htmlFor="billing-toggle" className={!isYearly ? "font-bold" : ""}>{t.monthly}</Label>
        <Switch
          id="billing-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
        />
        <Label htmlFor="billing-toggle" className={isYearly ? "font-bold" : ""}>
          {t.yearly} <span className="text-primary">({t.save} 20%)</span>
        </Label>
      </div>
      
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">{t.viewerPlans}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <PricingCard 
            title={t.free}
            price={0} 
            viewers={10} 
            chatters={4}
            isFree
            platform="Enhance Stream"
            currentPlan={currentPlan}
            isYearly={isYearly}
          />
          <PricingCard 
            title={t.starter}
            price={12.99} 
            viewers={25} 
            chatters={10}
            priceId={isYearly ? "price_yearly_starter" : "price_1Qklku01379EnnGJtin4BVcc"}
            platform="Enhance Stream"
            currentPlan={currentPlan}
            isYearly={isYearly}
          />
          <PricingCard 
            title={t.basic}
            price={29.99} 
            viewers={50} 
            chatters={16}
            priceId={isYearly ? "price_yearly_basic" : "price_1Qm2w001379EnnGJPVwgRD9F"}
            platform="Enhance Stream"
            currentPlan={currentPlan}
            isYearly={isYearly}
          />
          <PricingCard 
            title={t.professional}
            price={129.99} 
            viewers={200} 
            chatters={40}
            isPopular
            priceId={isYearly ? "price_yearly_professional" : "price_1Qm2E301379EnnGJjSesajsz"}
            platform="Enhance Stream"
            currentPlan={currentPlan}
            isYearly={isYearly}
          />
          <PricingCard 
            title={t.expert}
            price={199.99} 
            viewers={300} 
            chatters={90}
            priceId={isYearly ? "price_yearly_expert" : "price_1Qm2Ke01379EnnGJNfHjqbBo"}
            platform="Enhance Stream"
            currentPlan={currentPlan}
            isYearly={isYearly}
          />
          <PricingCard 
            title={t.ultimate}
            price={599.99} 
            viewers={1000} 
            chatters={200}
            priceId={isYearly ? "price_yearly_ultimate" : "price_1Qm2VA01379EnnGJTiStzUOq"}
            platform="Enhance Stream"
            currentPlan={currentPlan}
            isYearly={isYearly}
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-8">{t.followerPlans}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <PricingCard 
            title={t.followerBasic}
            price={24.99} 
            viewers={0} 
            chatters={0}
            followers={100}
            followersPerDay={100}
            totalFollowers={3000}
            priceId="price_follower_basic"
            platform="Enhance Stream"
            currentPlan={currentFollowerPlan}
            isFollowerPlan
            isYearly={false}
          />
          <PricingCard 
            title={t.followerPlus}
            price={49.99} 
            viewers={0} 
            chatters={0}
            followers={250}
            followersPerDay={250}
            totalFollowers={7500}
            priceId="price_follower_plus"
            platform="Enhance Stream"
            currentPlan={currentFollowerPlan}
            isFollowerPlan
            isYearly={false}
          />
          <PricingCard 
            title={t.followerPro}
            price={99.99} 
            viewers={0} 
            chatters={0}
            followers={500}
            followersPerDay={500}
            totalFollowers={15000}
            isPopular
            priceId="price_follower_pro"
            platform="Enhance Stream"
            currentPlan={currentFollowerPlan}
            isFollowerPlan
            isYearly={false}
          />
          <PricingCard 
            title={t.followerElite}
            price={199.99} 
            viewers={0} 
            chatters={0}
            followers={1000}
            followersPerDay={1000}
            totalFollowers={30000}
            priceId="price_follower_elite"
            platform="Enhance Stream"
            currentPlan={currentFollowerPlan}
            isFollowerPlan
            isYearly={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Pricing;