import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Users, MessageSquare, TrendingUp, Activity, Link as LinkIcon } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis } from "recharts";

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
        {/* Stats Cards */}
        <Card className="glass-morphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Viewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{viewerCount}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="glass-morphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Chatters</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatterCount}</div>
            <p className="text-xs text-muted-foreground">+15% from last hour</p>
          </CardContent>
        </Card>
        
        <Card className="glass-morphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">Increased by 7.2%</p>
          </CardContent>
        </Card>
        
        <Card className="glass-morphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stream Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">Excellent condition</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Stream Preview */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Stream Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full max-w-2xl mx-auto bg-black/20 rounded-lg overflow-hidden">
              {streamUrl ? (
                <iframe
                  src={streamUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No stream URL configured
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stream Settings */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Stream Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Stream URL</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter stream URL" 
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    className="bg-background/50"
                  />
                  <Button onClick={handleSaveUrl}>Save</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Username</label>
                  <p className="text-sm text-muted-foreground">{userData.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Plan</label>
                  <p className="text-sm text-muted-foreground">{userData.plan}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Viewer Analytics */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Viewer Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ChartContainer
                config={{
                  viewers: {
                    label: "Viewers",
                    theme: {
                      light: "#8B5CF6",
                      dark: "#8B5CF6",
                    },
                  },
                }}
              >
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="viewerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="viewers"
                    stroke="#8B5CF6"
                    fillOpacity={1}
                    fill="url(#viewerGradient)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bot Controls */}
        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Viewer Bot Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => addViewers(1)} variant="outline">+1 Viewer</Button>
                <Button onClick={() => addViewers(3)} variant="outline">+3 Viewers</Button>
                <Button onClick={() => addViewers(5)} variant="outline">+5 Viewers</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Chatter Bot Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => addChatters(1)} variant="outline">+1 Chatter</Button>
                <Button onClick={() => addChatters(3)} variant="outline">+3 Chatters</Button>
                <Button onClick={() => addChatters(5)} variant="outline">+5 Chatters</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
