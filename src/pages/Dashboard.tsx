import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Dashboard = () => {
  const [streamUrl, setStreamUrl] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [chatterCount, setChatterCount] = useState(0);
  const [followerProgress, setFollowerProgress] = useState(0);
  const [followerPlan, setFollowerPlan] = useState(null);

  // Mock data for demonstration
  const userData = {
    username: "DemoUser",
    userId: "12345",
    email: "demo@example.com",
    plan: "Starter",
  };

  const handleSaveUrl = () => {
    console.log("Saving stream URL:", streamUrl);
    // Implementation for saving URL will come later
  };

  const addViewers = (count: number) => {
    setViewerCount(prev => prev + count);
  };

  const addChatters = (count: number) => {
    setChatterCount(prev => prev + count);
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Information */}
        <Card className="p-6 bg-card/50 backdrop-blur">
          <h2 className="text-xl font-bold mb-4">User Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Username:</span> {userData.username}</p>
            <p><span className="font-medium">User ID:</span> {userData.userId}</p>
            <p><span className="font-medium">Email:</span> {userData.email}</p>
            <p><span className="font-medium">Current Plan:</span> {userData.plan}</p>
            <div className="flex gap-2 mt-4">
              <Input 
                placeholder="Enter stream URL" 
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
              />
              <Button onClick={handleSaveUrl}>Save URL</Button>
            </div>
          </div>
        </Card>

        {/* Stream Preview & Stats */}
        <Card className="p-6 bg-card/50 backdrop-blur">
          <h2 className="text-xl font-bold mb-4">Stream Preview & Stats</h2>
          <div className="aspect-video bg-black/50 rounded-lg mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Viewers</p>
              <p className="text-xl font-bold">{viewerCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Chatters</p>
              <p className="text-xl font-bold">{chatterCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Followers</p>
              <p className="text-xl font-bold">0</p>
            </div>
          </div>
        </Card>

        {/* Viewer Bot Controls */}
        <Card className="p-6 bg-card/50 backdrop-blur">
          <h2 className="text-xl font-bold mb-4">Viewer Bot Controls</h2>
          <Input className="mb-4" placeholder="Stream URL" />
          <div className="flex gap-2">
            <Button onClick={() => addViewers(1)}>+1 Viewer</Button>
            <Button onClick={() => addViewers(3)}>+3 Viewers</Button>
            <Button onClick={() => addViewers(5)}>+5 Viewers</Button>
          </div>
        </Card>

        {/* Chatter Bot Controls */}
        <Card className="p-6 bg-card/50 backdrop-blur">
          <h2 className="text-xl font-bold mb-4">Chatter Bot Controls</h2>
          <Input className="mb-4" placeholder="Stream URL" />
          <div className="flex gap-2">
            <Button onClick={() => addChatters(1)}>+1 Chatter</Button>
            <Button onClick={() => addChatters(3)}>+3 Chatters</Button>
            <Button onClick={() => addChatters(5)}>+5 Chatters</Button>
          </div>
        </Card>

        {/* Follower Controls */}
        <Card className="col-span-full p-6 bg-card/50 backdrop-blur">
          <h2 className="text-xl font-bold mb-4">Follower Controls</h2>
          {followerPlan ? (
            <>
              <div className="w-full bg-secondary rounded-full h-2 mb-4">
                <div 
                  className="bg-primary h-full rounded-full" 
                  style={{ width: `${followerProgress}%` }}
                ></div>
              </div>
              <p className="text-center">{followerProgress}/100 followers</p>
            </>
          ) : (
            <p className="text-center text-muted-foreground">No active follower plan</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;