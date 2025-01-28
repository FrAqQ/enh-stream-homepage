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
import { getViewerCount } from "@/services/viewerScraper"
import { getChatterCount } from "@/services/chatterScraper"

const Dashboard = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [streamUrl, setStreamUrl] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [chatterCount, setChatterCount] = useState(0);
  const [viewerGrowth, setViewerGrowth] = useState("0");
  const [followerProgress, setFollowerProgress] = useState(0);
  const [followerPlan, setFollowerPlan] = useState<any>(null);
  const [twitchChannel, setTwitchChannel] = useState("");
  const [embed, setEmbed] = useState<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [userPlan, setUserPlan] = useState("Free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");

  const saveStreamStats = async (viewers: number, chatters: number) => {
    try {
      if (!user?.id || !streamUrl) return;

      const { error } = await supabase
        .from('stream_stats')
        .insert([
          {
            user_id: user.id,
            stream_url: streamUrl,
            viewer_count: viewers,
            chatter_count: chatters
          }
        ]);

      if (error) {
        console.error('Error saving stream stats:', error);
        toast({
          title: "Error",
          description: "Failed to save stream statistics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in saveStreamStats:', error);
    }
  };

  const calculateViewerGrowth = async () => {
    try {
      if (!user?.id || !streamUrl) return;

      // Get the first recorded viewer count for this URL
      const { data: firstRecord } = await supabase
        .from('stream_stats')
        .select('viewer_count')
        .eq('user_id', user.id)
        .eq('stream_url', streamUrl)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (!firstRecord) return;

      // Get average of recent viewer counts (last month)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentStats } = await supabase
        .from('stream_stats')
        .select('viewer_count')
        .eq('user_id', user.id)
        .eq('stream_url', streamUrl)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (!recentStats?.length) return;

      const avgRecentViewers = recentStats.reduce((sum, stat) => sum + stat.viewer_count, 0) / recentStats.length;
      const growthRate = ((avgRecentViewers - firstRecord.viewer_count) / firstRecord.viewer_count) * 100;
      
      setViewerGrowth(growthRate.toFixed(1));
    } catch (error) {
      console.error('Error calculating viewer growth:', error);
    }
  };

  const handleSaveUrl = () => {
    try {
      const url = new URL(streamUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        setTwitchChannel(pathParts[0]);
        toast({
          title: "Success",
          description: "Stream URL saved successfully",
        });
      }
    } catch (error) {
      console.error("Invalid URL:", error);
      toast({
        title: "Error",
        description: "Please enter a valid Twitch stream URL",
        variant: "destructive",
      });
    }
  };

  const updateViewerCount = useCallback(async () => {
    if (streamUrl) {
      try {
        const count = await getViewerCount(streamUrl);
        setViewerCount(count);
        return count;
      } catch (error) {
        console.error("Error updating viewer count:", error);
      }
    }
    return 0;
  }, [streamUrl]);

  const updateChatterCount = useCallback(async () => {
    if (streamUrl) {
      try {
        const count = await getChatterCount(streamUrl);
        setChatterCount(count);
        return count;
      } catch (error) {
        console.error("Error updating chatter count:", error);
      }
    }
    return 0;
  }, [streamUrl]);

  useEffect(() => {
    if (streamUrl) {
      const fetchAndSaveStats = async () => {
        const viewers = await updateViewerCount();
        const chatters = await updateChatterCount();
        await saveStreamStats(viewers, chatters);
        await calculateViewerGrowth();
      };

      fetchAndSaveStats();
      const interval = setInterval(fetchAndSaveStats, 10000);
      
      return () => clearInterval(interval);
    }
  }, [streamUrl, updateViewerCount, updateChatterCount]);

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
          change={`${viewerGrowth}% from first stream`}
          icon={Users}
        />
        <StatsCard
          title="Active Chatters"
          value={chatterCount}
          subtitle="Last 10 minutes"
          change="Calculating..."
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