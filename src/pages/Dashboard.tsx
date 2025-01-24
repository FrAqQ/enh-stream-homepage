import { Users, MessageSquare, TrendingUp, Activity, Clock, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import { useUser } from "@/lib/useUser"
import { supabase } from "@/lib/supabaseClient"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { StreamPreview } from "@/components/dashboard/StreamPreview"
import { StreamSettings } from "@/components/dashboard/StreamSettings"
import { BotControls } from "@/components/dashboard/BotControls"
import { ProgressCard } from "@/components/dashboard/ProgressCard"

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
  const [userPlan, setUserPlan] = useState("Free");

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (user?.id) {
        try {
          console.log("Fetching user plan for ID:", user.id);
          
          // First try to get the profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user plan:', error);
            
            // If profile doesn't exist, create it
            if (error.code === '42P01' || error.message.includes('does not exist')) {
              console.log("Profiles table not found or profile doesn't exist, creating profile...");
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([
                  { id: user.id, email: user.email, plan: 'Free' }
                ]);
              
              if (insertError) {
                console.error('Error creating profile:', insertError);
                setUserPlan("Free");
                return;
              }
              
              setUserPlan("Free");
              return;
            }
            
            setUserPlan("Free"); // Fallback to Free plan if there's an error
            return;
          }

          console.log("Fetched profile:", profile);
          setUserPlan(profile?.plan || "Free");
        } catch (err) {
          console.error("Unexpected error fetching user plan:", err);
          setUserPlan("Free");
        }
      }
    };

    fetchUserPlan();
  }, [user]);

  // Define userData at the component level
  const userData = {
    username: user?.email?.split('@')[0] || "DemoUser",
    userId: user?.id || "12345",
    email: user?.email || "demo@example.com",
    plan: userPlan, // Use the userPlan state instead of hardcoded value
    followerPlan: "None"
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
      const currentDomain = window.location.hostname.split(':')[0];
      console.log("Current domain for Twitch embed:", currentDomain);
      
      const protocol = window.location.protocol;
      console.log("Current protocol:", protocol);
      
      const isDevelopment = process.env.NODE_ENV === 'development';
      console.log("Development mode:", isDevelopment);
      
      if (window.Twitch) {
        // Cleanup any existing embed
        const container = document.getElementById('twitch-embed');
        if (container) {
          container.innerHTML = '';
          // Add security attributes to the container
          container.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
          container.setAttribute('loading', 'lazy');
        }

        // Include all possible parent domains
        const parentDomains = [
          currentDomain,
          'localhost',
          '127.0.0.1',
          'lovable.app',
          'lovableproject.com',
          currentDomain.endsWith('lovableproject.com') ? currentDomain : '',
          currentDomain.endsWith('lovable.app') ? currentDomain : '',
          window.location.host // Include the full host with port if present
        ].filter(Boolean);

        console.log("Using parent domains:", parentDomains);

        const embedOptions = {
          width: "100%",
          height: "100%",
          channel: channelName,
          layout: "video",
          autoplay: true,
          muted: true,
          parent: parentDomains,
          theme: "dark"
        };

        console.log("Creating embed with options:", embedOptions);

        const newEmbed = new window.Twitch.Embed("twitch-embed", embedOptions);

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
        <StatsCard
          title="Total Viewers"
          value={viewerCount}
          change="+20.1% from last month"
          icon={Users}
        />
        <StatsCard
          title="Active Chatters"
          value={chatterCount}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StreamPreview
          twitchChannel={twitchChannel}
          isScriptLoaded={isScriptLoaded}
          createEmbed={createEmbed}
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
          title="Viewer Bot Controls"
          onAdd={addViewers}
          type="viewer"
        />
        <BotControls
          title="Chatter Bot Controls"
          onAdd={addChatters}
          type="chatter"
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
  )
}

export default Dashboard
