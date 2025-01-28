import { Users, MessageSquare, TrendingUp, Activity, Clock, Calendar } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useUser } from "@/lib/useUser"
import { supabase } from "@/lib/supabaseClient"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { StreamPreview } from "@/components/dashboard/StreamPreview"
import { StreamSettings } from "@/components/dashboard/StreamSettings"
import { BotControls } from "@/components/dashboard/BotControls"
import { ProgressCard } from "@/components/dashboard/ProgressCard"
import { useToast } from "@/hooks/use-toast"

const Dashboard = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [streamUrl, setStreamUrl] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [chatterCount, setChatterCount] = useState(0);
  const [followerProgress, setFollowerProgress] = useState(0);
  const [followerPlan, setFollowerPlan] = useState<any>(null);
  const [twitchChannel, setTwitchChannel] = useState("");
  const [embed, setEmbed] = useState<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [userPlan, setUserPlan] = useState("Free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");

  const createEmbed = useCallback((channelName: string) => {
    console.log("Creating embed for channel:", channelName);
    try {
      if (window.Twitch && window.Twitch.Embed) {
        const embed = new window.Twitch.Embed("twitch-embed", {
          width: "100%",
          height: "100%",
          channel: channelName,
          layout: "video",
          parent: [window.location.hostname],
          autoplay: false,
          muted: true
        });
        setEmbed(embed);
      } else {
        console.error("Twitch embed script not loaded properly");
      }
    } catch (error) {
      console.error("Error creating Twitch embed:", error);
    }
  }, []);

  const handleSaveUrl = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save settings",
        variant: "destructive",
      });
      return;
    }

    try {
      const channelName = streamUrl.split('/').pop() || '';
      console.log("Saving channel name:", channelName);
      setTwitchChannel(channelName);

      toast({
        title: "Success",
        description: "Stream settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving stream URL:", error);
      toast({
        title: "Error",
        description: "Failed to save stream settings",
        variant: "destructive",
      });
    }
  };

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
    const interval = setInterval(fetchUserPlan, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [user, toast]);

  const userData = {
    username: user?.email?.split('@')[0] || "DemoUser",
    userId: user?.id || "12345",
    email: user?.email || "demo@example.com",
    plan: userPlan,
    followerPlan: "None",
    subscriptionStatus
  };

  const addViewers = (count: number) => {
    setViewerCount(prev => prev + count);
  };

  const addChatters = (count: number) => {
    setChatterCount(prev => prev + count);
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://embed.twitch.tv/embed/v1.js";
    script.async = true;
    script.onload = () => {
      console.log("Twitch embed script loaded");
      setIsScriptLoaded(true);
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 pt-20 pb-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gradient">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Current Plan:</span>
          <span className="font-semibold text-primary">{userPlan}</span>
          {subscriptionStatus === 'active' && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
              Active
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Viewers"
          value={viewerCount}
          change="+20.1% from last month"
          icon={Users}
        />
        <StatsCard
          title="Active Chatters"
          value={chatterCount}
          change="+15% from last hour"
          icon={MessageSquare}
        />
        <StatsCard
          title="Growth Rate"
          value="+12.5%"
          change="Increased by 7.2%"
          icon={TrendingUp}
        />
        <StatsCard
          title="Stream Health"
          value="98%"
          change="Excellent condition"
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StreamPreview
          twitchChannel={twitchChannel}
          isScriptLoaded={isScriptLoaded}
          createEmbed={createEmbed}
        />
        <StreamSettings
          streamUrl={streamUrl}
          setStreamUrl={setStreamUrl}
          handleSaveUrl={handleSaveUrl}
          userData={userData}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BotControls
          title="Viewer Bot Controls"
          onAdd={addViewers}
          type="viewer"
          streamUrl={streamUrl}
        />
        <BotControls
          title="Chatter Bot Controls"
          onAdd={addChatters}
          type="chatter"
          streamUrl={streamUrl}
        />
      </div>

      <ProgressCard
        title="Daily Follower Progress"
        icon={Clock}
        current={12}
        total={50}
        timeLabels={["0h", "12h", "24h"]}
      />

      <div className="mt-8">
        <ProgressCard
          title="Monthly Follower Progress"
          icon={Calendar}
          current={145}
          total={500}
          timeLabels={["Day 1", "Day 15", "Day 30"]}
        />
      </div>
    </div>
  );
};

export default Dashboard;