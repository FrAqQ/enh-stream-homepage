import { useState } from "react";
import { Users, MessageSquare, TrendingUp, Activity } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import StreamPreview from "@/components/dashboard/StreamPreview";
import ViewerAnalytics from "@/components/dashboard/ViewerAnalytics";

const Dashboard = () => {
  const [streamUrl, setStreamUrl] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [chatterCount, setChatterCount] = useState(0);

  // Mock data for demonstration
  const userData = {
    username: "DemoUser",
    plan: "Starter",
  };

  // Mock data for the chart
  const chartData = [
    { time: "00:00", viewers: 10 },
    { time: "01:00", viewers: 25 },
    { time: "02:00", viewers: 15 },
    { time: "03:00", viewers: 30 },
    { time: "04:00", viewers: 45 },
    { time: "05:00", viewers: 35 },
  ];

  const handleSaveUrl = () => {
    console.log("Saving stream URL:", streamUrl);
  };

  const addViewers = (count: number) => {
    setViewerCount(prev => prev + count);
  };

  const addChatters = (count: number) => {
    setChatterCount(prev => prev + count);
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-8">
      <h1 className="text-4xl font-bold mb-8 text-gradient">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Viewers"
          value={viewerCount}
          subtitle="+20.1% from last month"
          icon={Users}
        />
        <StatsCard
          title="Active Chatters"
          value={chatterCount}
          subtitle="+15% from last hour"
          icon={MessageSquare}
        />
        <StatsCard
          title="Growth Rate"
          value="+12.5%"
          subtitle="Increased by 7.2%"
          icon={TrendingUp}
        />
        <StatsCard
          title="Stream Health"
          value="98%"
          subtitle="Excellent condition"
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StreamPreview
          streamUrl={streamUrl}
          setStreamUrl={setStreamUrl}
          handleSaveUrl={handleSaveUrl}
          userData={userData}
        />
        <ViewerAnalytics
          chartData={chartData}
          onAddViewers={addViewers}
          onAddChatters={addChatters}
        />
      </div>
    </div>
  );
};

export default Dashboard;