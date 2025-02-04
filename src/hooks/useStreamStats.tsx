
import { useState, useCallback, useEffect } from "react"
import { useUser } from "@/lib/useUser"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { getViewerCount } from "@/services/viewerScraper"
import { getChatterCount } from "@/services/chatterScraper"

export const useStreamStats = (streamUrl: string) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [viewerCount, setViewerCount] = useState(0);
  const [chatterCount, setChatterCount] = useState(0);
  const [viewerGrowth, setViewerGrowth] = useState("0");

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

  return {
    viewerCount,
    chatterCount,
    viewerGrowth,
    setViewerCount,
    setChatterCount
  };
};
