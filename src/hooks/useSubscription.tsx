
import { useState, useEffect } from "react"
import { useUser } from "@/lib/useUser"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

export const useSubscription = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [userPlan, setUserPlan] = useState("Free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");

  const fetchUserPlan = async () => {
    if (user?.id) {
      try {
        console.log("Starting plan fetch for user:", user.id);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan, subscription_status, current_period_end')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast({
            title: "Error",
            description: "Failed to fetch subscription status",
            variant: "destructive",
          });
          return;
        }

        console.log("Raw profile data:", profile);

        const isActive = profile?.subscription_status === 'active';
        const periodEnd = profile?.current_period_end;
        const isExpired = periodEnd ? new Date(periodEnd) < new Date() : true;

        console.log("Subscription check:", {
          isActive,
          periodEnd,
          isExpired,
          currentStatus: profile?.subscription_status,
          currentPlan: profile?.plan
        });

        if (isActive && !isExpired) {
          console.log("Active subscription found:", {
            plan: profile.plan,
            status: profile.subscription_status,
            periodEnd: profile.current_period_end
          });
          
          if (profile.plan !== userPlan) {
            setUserPlan(profile.plan || "Free");
            setSubscriptionStatus('active');
            toast({
              title: "Plan Updated",
              description: `Your plan has been updated to ${profile.plan}`,
            });
          }
        } else {
          console.log("No active subscription or expired:", {
            currentStatus: profile?.subscription_status,
            currentPlan: profile?.plan,
            periodEnd: profile?.current_period_end
          });
          setUserPlan("Free");
          setSubscriptionStatus('inactive');
        }
      } catch (err) {
        console.error("Unexpected error in subscription check:", err);
        toast({
          title: "Error",
          description: "Failed to verify subscription status",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    fetchUserPlan();
    const interval = setInterval(fetchUserPlan, 5000);
    return () => clearInterval(interval);
  }, [user, toast]);

  return {
    userPlan,
    subscriptionStatus
  };
};
