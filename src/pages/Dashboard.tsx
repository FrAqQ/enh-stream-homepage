import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Users, MessageSquare, TrendingUp, Activity, Link as LinkIcon, Clock, Calendar } from "lucide-react";
import { useUser } from "@/lib/useUser";

// Define Twitch types
declare global {
  interface Window {
    Twitch: {
      Embed: {
        VIDEO_READY: string;
        new (elementId: string, options: any): {
          addEventListener: (event: string, callback: () => void) => void;
          getPlayer: () => any;
        };
      };
    };
  }
}

const Dashboard = () => {
  const { user } = useUser();
  const [streamUrl, setStreamUrl] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [chatterCount, setChatterCount] = useState(0);
  const [followerProgress, setFollowerProgress] = useState(0);
  const [followerPlan, setFollowerPlan] = useState<any>(null);
  const [twitchChannel, setTwitchChannel] = useState("");
  const [embed, setEmbed] = useState<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Define userData at the component level
  const userData = {
    username: user?.email?.split('@')[0] || "DemoUser",
    userId: user?.id || "12345",
    email: user?.email || "demo@example.com",
    plan: "Starter",
  };

  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src="https://embed.twitch.tv/embed/v1.js"]')) {
      console.log("Twitch script already exists");
      setIsScriptLoaded(true);
      return;
    }

    // Load Twitch embed script
    const script = document.createElement('script');
    script.src = "https://embed.twitch.tv/embed/v1.js";
    script.async = true;
    
    script.onload = () => {
      console.log("Twitch embed script loaded successfully");
      setIsScriptLoaded(true);
      if (twitchChannel) {
        console.log("Initializing existing channel:", twitchChannel);
        createEmbed(twitchChannel);
      }
    };

    script.onerror = (error) => {
      console.error("Error loading Twitch script:", error);
    };
    
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://embed.twitch.tv/embed/v1.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []); // Run only once on mount

  const initTwitchEmbed = (channelName: string) => {
    try {
      if (!channelName) {
        console.log("No channel name provided");
        return;
      }
      
      console.log("Initializing Twitch embed for channel:", channelName);
      
      // Cleanup any existing embed
      const container = document.getElementById('twitch-embed');
      if (container) {
        container.innerHTML = '';
      }

      if (!isScriptLoaded) {
        console.log("Waiting for Twitch script to load...");
        return;
      }

      createEmbed(channelName);
      
    } catch (error) {
      console.error('Error initializing Twitch embed:', error);
    }
  };

  const createEmbed = (channelName: string) => {
    try {
      console.log("Creating Twitch embed with channel:", channelName);
      // Get full hostname without port number
      const currentDomain = window.location.hostname.split(':')[0];
      console.log("Current domain for Twitch embed:", currentDomain);
      
      // Get the protocol (http or https)
      const protocol = window.location.protocol;
      console.log("Current protocol:", protocol);
      
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development';
      console.log("Development mode:", isDevelopment);
      
      if (window.Twitch) {
        // Cleanup any existing embed
        const container = document.getElementById('twitch-embed');
        if (container) {
          container.innerHTML = '';
        }

        const parentDomains = [
          currentDomain,
          'localhost',
          '127.0.0.1',
          'lovable.app',
          'lovableproject.com',
          currentDomain.endsWith('lovableproject.com') ? currentDomain : '',
          currentDomain.endsWith('lovable.app') ? currentDomain : ''
        ].filter(Boolean);

        console.log("Using parent domains:", parentDomains);

        const newEmbed = new window.Twitch.Embed("twitch-embed", {
          width: "100%",
          height: "100%",
          channel: channelName,
          layout: "video",
          autoplay: true,
          muted: true,
          parent: parentDomains,
          theme: "dark"
        });

        console.log("Twitch embed created with parent domains:", parentDomains);

        newEmbed.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
          console.log('Twitch embed is ready');
          setEmbed(newEmbed);
          setTwitchChannel(channelName);
        });
      } else {
        console.error('Twitch embed script not loaded');
      }
    } catch (error) {
      console.error('Error creating Twitch embed:', error);
    }
  };

  const extractChannelName = (url: string): string => {
    try {
      if (!url) return "";
      
      let channelName = "";
      if (url.includes('twitch.tv/')) {
        channelName = url.split('twitch.tv/')[1].split('/')[0].split('?')[0];
      } else {
        channelName = url.trim();
      }
      
      console.log("Extracted channel name:", channelName);
      return channelName;
    } catch (error) {
      console.error('Error extracting channel name:', error);
      return "";
    }
  };

  const handleSaveUrl = () => {
    console.log("Saving stream URL:", streamUrl);
    const channelName = extractChannelName(streamUrl);
    if (channelName) {
      initTwitchEmbed(channelName);
    }
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
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <div id="twitch-embed" className="w-full h-full min-h-[400px]"></div>
              <div className="mt-2 text-sm text-muted-foreground">
                <div>Current channel: {twitchChannel || 'None'}</div>
                <div>Domain: {window.location.hostname || 'localhost'}</div>
              </div>
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
                    placeholder="Enter Twitch channel name or URL" 
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
      </div>

      {/* Bot Controls and Progress sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

      {/* Follower Plan Progress */}
      <Card className="glass-morphism mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Daily Follower Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">24-Hour Progress</span>
              <span className="text-sm font-medium">12/50 Followers</span>
            </div>
            <Progress value={25} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0h</span>
              <span>12h</span>
              <span>24h</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Follower Progress */}
      <Card className="glass-morphism">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Follower Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">30-Day Progress</span>
              <span className="text-sm font-medium">145/500 Followers</span>
            </div>
            <Progress value={29} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Day 1</span>
              <span>Day 15</span>
              <span>Day 30</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;