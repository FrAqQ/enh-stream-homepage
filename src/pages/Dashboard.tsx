
import { Users, MessageSquare, Activity, Clock, Calendar } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useUser } from "@/lib/useUser"
import { supabase } from "@/lib/supabaseClient"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { StreamPreview } from "@/components/dashboard/StreamPreview"
import { StreamSettings } from "@/components/dashboard/StreamSettings"
import ViewerControls from "@/components/dashboard/ViewerControls"
import { ProgressCard } from "@/components/dashboard/ProgressCard"
import { useToast } from "@/hooks/use-toast"
import { getViewerCount } from "@/services/viewerScraper"
import { getChatterCount } from "@/services/chatterScraper"
import { PLAN_VIEWER_LIMITS, PLAN_CHATTER_LIMITS } from "@/lib/constants"
import { OnboardingTooltip } from "@/components/ui/onboarding-tooltip"
import ViewerHistoryGraph from "@/components/dashboard/ViewerHistoryGraph"
import { Onboarding } from "@/components/Onboarding"
import { LoadingOverlay } from "@/components/ui/loading-overlay"

const Dashboard = () => {
  const { user, profile, chatterStats, loadChatterStats, updateUserChatters, isLoading: profileIsLoading } = useUser();
  const { toast } = useToast();
  const [streamUrl, setStreamUrl] = useState("");
  // Enhanced viewers and chatters (the ones we add)
  const [enhancedViewerCount, setEnhancedViewerCount] = useState(0);  
  const [chatterCount, setChatterCount] = useState(0);
  // Actual Twitch stats
  const [actualViewerCount, setActualViewerCount] = useState(0);
  const [viewerGrowth, setViewerGrowth] = useState("0");
  const [followerProgress, setFollowerProgress] = useState(0);
  const [followerPlan, setFollowerPlan] = useState<any>(null);
  const [twitchChannel, setTwitchChannel] = useState("");
  const [embed, setEmbed] = useState<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [userPlan, setUserPlan] = useState("Free");
  const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
  const [dashboardReady, setDashboardReady] = useState(false);
  
  // Add new state for viewer history
  const [viewerHistory, setViewerHistory] = useState<any[]>([]);
  
  // Calculate total viewers (actual + enhanced)
  const totalViewerCount = actualViewerCount + enhancedViewerCount;

  // Überarbeitete Logik zum Laden des Profils
  useEffect(() => {
    if (!profileIsLoading && profile) {
      // Dashboard kann jetzt gerendert werden
      setDashboardReady(true);
      
      // Daten aus dem Profil übernehmen
      setEnhancedViewerCount(profile.viewers_active || 0);
      setUserPlan(profile.plan || "Free");
      setSubscriptionStatus(profile.subscription_status || "inactive");
      
      console.log("[Dashboard] Profil geladen:", {
        plan: profile.plan,
        status: profile.subscription_status,
        viewers: profile.viewers_active,
        viewer_limit: profile.viewer_limit
      });
    }
  }, [profile, profileIsLoading]);

  // Lade Chatter-Statistiken, wenn sich die Stream-URL ändert
  useEffect(() => {
    if (streamUrl && user?.id) {
      loadChatterStats(streamUrl);
    }
  }, [streamUrl, user?.id, loadChatterStats]);

  // Generate viewer history data
  useEffect(() => {
    // Generate past 24 hours of data
    const generateHistory = () => {
      const history = [];
      const now = new Date();
      
      for (let i = 0; i < 24; i++) {
        const time = new Date(now);
        time.setHours(time.getHours() - (23 - i));
        
        // Generate some random but sensible data
        const botCount = i < 12 ? Math.floor(Math.random() * 10) : enhancedViewerCount;
        const actualCount = Math.floor(Math.random() * 15) + 5;
        const totalCount = botCount + actualCount;
        
        history.push({
          time: time.getHours() + ':00',
          botViewers: botCount,
          actualViewers: actualCount,
          total: totalCount
        });
      }
      
      return history;
    };
    
    setViewerHistory(generateHistory());
  }, [enhancedViewerCount]);

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
        
        // Lade Chatter-Statistiken nach dem Speichern der URL
        if (user?.id) {
          loadChatterStats(streamUrl);
        }
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
        setActualViewerCount(count);
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
    if (actualViewerCount === 0) return { percentage: 0, status: "No viewers" };
    
    const targetChatterCount = actualViewerCount * 0.45;
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
    if (!profile) return;
    
    // Holen des Viewer-Limits aus dem Profil
    const viewerLimit = profile.viewer_limit || 4;
    
    // Berechne, wie viele Viewer noch hinzugefügt werden können, ohne das Limit zu überschreiten
    const remainingCapacity = Math.max(0, viewerLimit - enhancedViewerCount);
    
    if (remainingCapacity === 0) {
      toast({
        title: "Plan Limit Reached",
        description: `Your ${userPlan} plan allows a maximum of ${viewerLimit} enhanced viewers`,
        variant: "destructive",
      });
      return;
    }
    
    // Wenn der gewünschte Wert das verbleibende Limit überschreitet, füge nur so viele hinzu, wie möglich
    const adjustedCount = Math.min(count, remainingCapacity);
    
    // Wenn die Anzahl angepasst wurde, informiere den Benutzer
    if (adjustedCount < count) {
      toast({
        title: "Limit Adjusted",
        description: `Added ${adjustedCount} viewers (adjusted from ${count} to stay within your plan limit of ${viewerLimit})`,
      });
    }
    
    // Aktualisiere die Anzahl der aktiven Viewer
    setEnhancedViewerCount(prev => prev + adjustedCount);
    
    // Update databaseService
    if (user) {
      const updatedCount = enhancedViewerCount + adjustedCount;
      const { updateViewersActive } = require("@/lib/databaseService").databaseService;
      updateViewersActive(user.id, updatedCount)
        .catch(err => console.error("Error updating viewers active:", err));
    }

    // Update viewer history with new data point
    const now = new Date();
    const timeStr = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
    
    setViewerHistory(prev => {
      const newHistory = [...prev];
      if (newHistory.length > 0) {
        // Update the last entry
        const lastEntry = newHistory[newHistory.length - 1];
        lastEntry.botViewers = enhancedViewerCount + adjustedCount;
        lastEntry.total = lastEntry.botViewers + lastEntry.actualViewers;
      }
      return newHistory;
    });
  };

  const addChatters = async (count: number) => {
    if (!profile || !streamUrl || !user) return;
    
    const chatterLimit = profile.chatter_limit || 1;
    
    // Prüfe, ob das Hinzufügen das Limit überschreiten würde
    const currentChatters = chatterStats?.enhanced_chatters || 0;
    const remainingCapacity = Math.max(0, chatterLimit - currentChatters);
    
    if (remainingCapacity === 0) {
      toast({
        title: "Plan Limit Reached",
        description: `Your ${userPlan} plan allows a maximum of ${chatterLimit} enhanced chatters`,
        variant: "destructive",
      });
      return;
    }
    
    // Wenn der gewünschte Wert das verbleibende Limit überschreitet, füge nur so viele hinzu, wie möglich
    const adjustedCount = Math.min(count, remainingCapacity);
    
    // Wenn die Anzahl angepasst wurde, informiere den Benutzer
    if (adjustedCount < count) {
      toast({
        title: "Limit Adjusted",
        description: `Added ${adjustedCount} chatters (adjusted from ${count} to stay within your plan limit of ${chatterLimit})`,
      });
    }
    
    // Nutze die neue Funktion im useUser hook mit der angepassten Anzahl
    const success = await updateUserChatters(streamUrl, adjustedCount);
    
    if (success) {
      if (adjustedCount === count) {
        toast({
          title: "Success",
          description: `Added ${adjustedCount} chatters to your stream`,
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to add chatters",
        variant: "destructive",
      });
    }
  };

  // Zeige Ladebildschirm, wenn Dashboard noch nicht bereit ist
  if (profileIsLoading || !dashboardReady) {
    return (
      <div className="container mx-auto px-4 pt-20 pb-8">
        <LoadingOverlay 
          isLoading={true}
          text="Dashboard wird geladen..."
          fullScreen={false}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-20 pb-8">
      {/* Include the Onboarding component */}
      <Onboarding />
      
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
      
      <OnboardingTooltip
        id="stats-cards-tooltip"
        content={{
          en: "These cards show your stream's key performance metrics at a glance.",
          de: "Diese Karten zeigen die wichtigsten Leistungskennzahlen deines Streams auf einen Blick."
        }}
        position="bottom"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Twitch Viewers"
            value={actualViewerCount}
            subtitle="Real viewers from Twitch"
            change={`${viewerGrowth}% from first stream`}
            icon={Users}
          />
          <StatsCard
            title="Enhanced Viewers"
            value={enhancedViewerCount}
            subtitle="Added by you"
            icon={Users}
            limit={profile?.viewer_limit || 4}
          />
          <StatsCard
            title="Stream Health"
            value={`${streamHealth.percentage}%`}
            change={streamHealth.status}
            icon={Activity}
          />
        </div>
      </OnboardingTooltip>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <OnboardingTooltip
          id="stream-preview-tooltip"
          content={{
            en: "This is a live preview of your stream. Make sure your stream is running for accurate statistics.",
            de: "Dies ist eine Live-Vorschau deines Streams. Stelle sicher, dass dein Stream läuft, um genaue Statistiken zu erhalten."
          }}
          position="top"
        >
          <StreamPreview
            twitchChannel={twitchChannel}
          />
        </OnboardingTooltip>
        <StreamSettings
          streamUrl={streamUrl}
          setStreamUrl={setStreamUrl}
          handleSaveUrl={handleSaveUrl}
          userData={userData}
        />
      </div>

      {/* Viewer History Graph */}
      <div className="mb-8">
        <ViewerHistoryGraph viewerData={viewerHistory} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ViewerControls
          title="Viewer Controls"
          onAdd={addViewers}
          type="viewer"
          streamUrl={streamUrl}
          viewerCount={enhancedViewerCount}
          viewerLimit={profile?.viewer_limit || 4}
          actualStreamCount={actualViewerCount}
        />
        <ViewerControls
          title="Chatter Controls"
          onAdd={addChatters}
          type="chatter"
          streamUrl={streamUrl}
          viewerCount={chatterCount}
          viewerLimit={profile?.plan ? 
            (profile?.subscription_status === 'active' ?
              PLAN_CHATTER_LIMITS[profile.plan as keyof typeof PLAN_CHATTER_LIMITS] :
              PLAN_CHATTER_LIMITS.Free) :
            PLAN_CHATTER_LIMITS.Free}
          chatterStats={chatterStats}
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
