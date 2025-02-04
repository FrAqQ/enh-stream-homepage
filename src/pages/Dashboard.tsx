
import { useState } from "react"
import { Users, MessageSquare, TrendingUp, Activity, Clock, Calendar } from "lucide-react"
import { useUser } from "@/lib/useUser"
import { useToast } from "@/hooks/use-toast"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { StreamPreview } from "@/components/dashboard/StreamPreview"
import { StreamSettings } from "@/components/dashboard/StreamSettings"
import { BotControls } from "@/components/dashboard/BotControls"
import { ProgressCard } from "@/components/dashboard/ProgressCard"
import { useStreamStats } from "@/hooks/useStreamStats"
import { useSubscription } from "@/hooks/useSubscription"
import { useStreamUrl } from "@/lib/StreamUrlContext"

const Dashboard = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const { streamUrl, setStreamUrl, twitchChannel, setTwitchChannel } = useStreamUrl();
  const { viewerCount, chatterCount, viewerGrowth, setViewerCount, setChatterCount } = useStreamStats(streamUrl);
  const { userPlan, subscriptionStatus } = useSubscription();
  const [followerProgress] = useState(0);
  const [followerPlan] = useState<any>(null);

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
        />
        <StatsCard
          title="Chat Messages"
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
          title="Viewer Controls"
          onAdd={addViewers}
          type="viewer"
          streamUrl={streamUrl}
        />
        <BotControls
          title="Chatter Controls"
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
