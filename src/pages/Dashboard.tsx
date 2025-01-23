import { useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { StreamPreview } from "@/components/dashboard/StreamPreview";
import { ViewerAnalytics } from "@/components/dashboard/ViewerAnalytics";

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
      
      <StatsCards 
        viewerCount={viewerCount}
        chatterCount={chatterCount}
      />
      
      <StreamPreview 
        streamUrl={streamUrl}
        onStreamUrlChange={setStreamUrl}
        onSaveUrl={handleSaveUrl}
        userData={userData}
      />
      
      <ViewerAnalytics 
        chartData={chartData}
        onAddViewers={addViewers}
        onAddChatters={addChatters}
      />
    </div>
  );
};

export default Dashboard;