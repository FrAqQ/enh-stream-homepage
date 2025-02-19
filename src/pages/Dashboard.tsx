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
import { PLAN_VIEWER_LIMITS, PLAN_CHATTER_LIMITS } from "@/lib/constants"

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

  const fetchUserPlan = async () => {
    if (user?.id) {
      try {
        console.log("Starting plan fetch for user:", user.id);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan, subscription_status')
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

        if (profile) {
          console.log("Profile found:", {
            plan: profile.plan,
            status: profile.subscription_status
          });
          
          setUserPlan(profile.plan || "Free");
          setSubscriptionStatus(profile.subscription_status || "inactive");
        } else {
          console.log("No profile found, setting to Free plan");
          setUserPlan("Free");
          setSubscriptionStatus("inactive");
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
  }, [user]);

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

        if (user?.id) {
          const { data, error } = await supabase
            .from('chatter_counts')
            .upsert({
              user_id: user.id,
              chatter_count: count,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });

          if (error) {
            console.error("Error updating chatter count:", error);
          }
        }

        return count;
      } catch (error) {
        console.error("Error updating chatter count:", error);
      }
    }
    return 0;
  }, [streamUrl, user?.id]);

  useEffect(() => {
    if (user?.id) {
      const fetchInitialChatterCount = async () => {
        const { data, error } = await supabase
          .from('chatter_counts')
          .select('chatter_count')
          .eq('user_id', user.id);

        if (!error && data && data.length > 0) {
          setChatterCount(data[0].chatter_count);
        } else {
          const { error: insertError } = await supabase
            .from('chatter_counts')
            .insert([
              {
                user_id: user.id,
                chatter_count: 0
              }
            ]);
          
          if (insertError) {
            console.error("Error creating initial chatter count:", insertError);
          }
        }
      };

      fetchInitialChatterCount();
    }
  }, [user?.id]);

  useEffect(() => {
    if (streamUrl) {
      const fetchAndSaveStats = async () => {
        console.log("Fetching and saving stats for URL:", streamUrl);
        const viewers = await updateViewerCount();
        const chatters = await updateChatterCount();
        await saveStreamStats(viewers, chatters);
        await calculateViewerGrowth();
      };

      console.log("Setting up stats tracking for URL:", streamUrl);
      fetchAndSaveStats();
      
      const interval = setInterval(fetchAndSaveStats, 600000);
      
      return () => clearInterval(interval);
    }
  }, [streamUrl, updateViewerCount, updateChatterCount]);

  const saveStreamStats = async (viewers: number, chatters: number) => {
    try {
      if (!user?.id || !streamUrl) {
        console.log("Missing user ID or stream URL, skipping stats save");
        return;
      }

      console.log("Saving stream stats:", {
        user_id: user.id,
        stream_url: streamUrl,
        viewers,
        chatters
      });

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
      } else {
        console.log("Successfully saved stream stats");
      }
    } catch (error) {
      console.error('Detailed error in saveStreamStats:', {
        error,
        type: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const calculateViewerGrowth = async () => {
    try {
      if (!user?.id || !streamUrl) return;

      console.log("Calculating viewer growth for:", {
        user_id: user.id,
        stream_url: streamUrl
      });

      const { data: firstRecord, error: firstRecordError } = await supabase
        .from('stream_stats')
        .select('viewer_count')
        .eq('user_id', user.id)
        .eq('stream_url', streamUrl)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (firstRecordError) {
        console.error('Error fetching first record:', firstRecordError);
        return;
      }

      if (!firstRecord) {
        console.log("No previous records found");
        return;
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentStats, error: recentStatsError } = await supabase
        .from('stream_stats')
        .select('viewer_count')
        .eq('user_id', user.id)
        .eq('stream_url', streamUrl)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (recentStatsError) {
        console.error('Error fetching recent stats:', recentStatsError);
        return;
      }

      if (!recentStats?.length) {
        console.log("No recent stats found");
        return;
      }

      const avgRecentViewers = recentStats.reduce((sum, stat) => sum + stat.viewer_count, 0) / recentStats.length;
      const growthRate = ((avgRecentViewers - firstRecord.viewer_count) / firstRecord.viewer_count) * 100;
      
      console.log("Growth calculation:", {
        firstCount: firstRecord.viewer_count,
        avgRecent: avgRecentViewers,
        growthRate
      });

      setViewerGrowth(growthRate.toFixed(1));
    } catch (error) {
      console.error('Error calculating viewer growth:', error);
    }
  };

  const calculateStreamHealth = () => {
    if (viewerCount === 0) return { percentage: 0, status: "No viewers" };
    
    const targetChatterCount = viewerCount * 0.45; // Geändert von 0.65 auf 0.45
    const healthPercentage = Math.min(100, (chatterCount / targetChatterCount) * 100);
    
    let status = "Needs improvement";
    if (healthPercentage >= 100) {
      status = "Excellent condition";
    } else if (healthPercentage >= 75) {
      status = "Good condition";
    } else if (healthPercentage >= 50) {
      status = "Fair condition";
    }

    return {
      percentage: Math.round(healthPercentage),
      status
    };
  };

  const streamHealth = calculateStreamHealth();

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

  const userData = {
    username: user?.email?.split('@')[0] || "DemoUser",
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
          limit={PLAN_VIEWER_LIMITS[userPlan as keyof typeof PLAN_VIEWER_LIMITS]}
        />
        <StatsCard
          title="Chat Messages"
          value={chatterCount}
          subtitle="Last 10 minutes"
          change="Calculating..."
          icon={MessageSquare}
          limit={PLAN_CHATTER_LIMITS[userPlan as keyof typeof PLAN_CHATTER_LIMITS]}
        />
        <StatsCard
          title="Growth Rate"
          value="+12.5%"
          change="Increased by 7.2%"
          icon={TrendingUp}
        />
        <StatsCard
          title="Stream Health"
          value={`${streamHealth.percentage}%`}
          change={streamHealth.status}
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
          title="Viewer Controls"
          onAdd={(count) => setViewerCount(prev => prev + count)}
          onRemove={(count) => setViewerCount(prev => prev - count)}
          type="viewer"
          streamUrl={streamUrl}
        />
        <BotControls
          title="Chatter Controls"
          onAdd={(count) => setChatterCount(prev => prev + count)}
          onRemove={(count) => setChatterCount(prev => prev - count)}
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
