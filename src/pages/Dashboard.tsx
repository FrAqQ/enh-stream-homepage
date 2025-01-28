<lov-code>
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

  const saveStats = async (viewers: number, chatters: number) => {
    if (!user?.id || !streamUrl) return;

    try {
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
        console.error("Error saving stats:", error);
        toast({
          title: "Error",
          description: "Failed to save stream statistics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in saveStats:", error);
    }
  };

  const calculateViewerGrowth = async () => {
    if (!user?.id || !streamUrl) return;

    try {
      // Get the first recorded viewer count for this stream
      const { data: firstRecord } = await supabase
        .from('stream_stats')
        .select('viewer_count')
        .eq('user_id', user.id)
        .eq('stream_url', streamUrl)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      // Get average of recent viewer counts (last month)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentStats } = await supabase
        .from('stream_stats')
        .select('viewer_count')
        .eq('user_id', user.id)
        .eq('stream_url', streamUrl)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (firstRecord && recentStats && recentStats.length > 0) {
        const firstCount = firstRecord.viewer_count;
        const recentAverage = recentStats.reduce((sum, stat) => sum + stat.viewer_count, 0) / recentStats.length;
        
        const growthRate = ((recentAverage - firstCount) / firstCount) * 100;
        setViewerGrowth(`${growthRate.toFixed(1)}%`);
      }
    } catch (error) {
      console.error("Error calculating viewer growth:", error);
    }
  };

  const updateViewerCount = useCallback(async () => {
    if (streamUrl) {
      try {
        console.log("Fetching viewer count for URL:", streamUrl);
        const count = await getViewerCount(streamUrl);
        console.log("Received viewer count:", count);
        setViewerCount(count);
        
        // Save stats after updating counts
        await saveStats(count, chatterCount);
        // Calculate growth rate
        await calculateViewerGrowth();
      } catch (error) {
        console.error("Error updating viewer count:", error);
      }
    }
  }, [streamUrl, chatterCount]);

  const updateChatterCount = useCallback(async () => {
    if (streamUrl) {
      try {
        console.log("Fetching chatter count for URL:", streamUrl);
        const count = await getChatterCount(streamUrl);
        console.log("Received chatter count:", count);
        setChatterCount(count);
      } catch (error) {
        console.error("Error updating chatter count:", error);
      }
    }
  }, [streamUrl]);

  useEffect(() => {
    if (streamUrl) {
      console.log("Setting up viewer and chatter count update interval");
      updateViewerCount();
      updateChatterCount();
      const interval = setInterval(() => {
        updateViewerCount();
        updateChatterCount();
      }, 10000);
      return () => {
        console.log("Cleaning up viewer and chatter count interval");
        clearInterval(interval);
      };
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
          change={`${viewerGrowth} from first record`}
          icon={Users}
        />
        <StatsCard
          title="Active Chatters"
          value={chatterCount}
          subtitle="Last 10 minutes"
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

