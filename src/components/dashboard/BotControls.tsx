import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/lib/useUser"
import { AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { PLAN_VIEWER_LIMITS } from "@/lib/constants"
import { supabase } from "@/lib/supabaseClient"

interface BotControlsProps {
  title: string
  onAdd: (count: number) => void
  type: "viewer" | "chatter"
  streamUrl: string
}

export function BotControls({ title, onAdd, type, streamUrl }: BotControlsProps) {
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [currentViewers, setCurrentViewers] = useState(0);
  const { toast } = useToast();
  const { user } = useUser();
  const [hasShownCertWarning, setHasShownCertWarning] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("Free");

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (user?.id) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user plan:', error);
          setUserPlan("Free");
          return;
        }

        console.log("Fetched user plan:", profile?.plan);
        setUserPlan(profile?.plan || "Free");
      }
    };

    fetchUserPlan();
  }, [user]);

  const viewerLimit = PLAN_VIEWER_LIMITS[userPlan as keyof typeof PLAN_VIEWER_LIMITS] || PLAN_VIEWER_LIMITS.Free;

  const addViewer = async (viewerCount: number) => {
    // For removing viewers, check if we have enough viewers to remove
    if (viewerCount < 0 && Math.abs(viewerCount) > currentViewers) {
      toast({
        title: "Not Enough Viewers",
        description: `You can't remove ${Math.abs(viewerCount)} viewers when you only have ${currentViewers}.`,
        variant: "destructive",
      });
      return;
    }

    // For adding viewers, check against the limit
    if (viewerCount > 0 && currentViewers + viewerCount > viewerLimit) {
      toast({
        title: "Viewer Limit Reached",
        description: `You can't add more viewers. Your plan allows a maximum of ${viewerLimit} viewers.`,
        variant: "destructive",
      });
      return;
    }

    try {
      if (!hasShownCertWarning) {
        toast({
          title: "Security Notice",
          description: "Please visit https://152.53.122.45:5000 directly in your browser, click 'Advanced' and accept the certificate before continuing.",
          duration: 10000,
          variant: "default",
        });
        setHasShownCertWarning(true);
      }

      console.log("Starting viewer addition/removal request with details:", {
        user_id: user?.id,
        twitch_url: streamUrl,
        viewer_count: viewerCount
      });
      
      const apiUrl = "https://152.53.122.45:5000/add_viewer";
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          user_id: user?.id || "123",
          twitch_url: streamUrl,
          viewer_count: viewerCount // This now can be negative
        })
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response data:", data);

      if (data.message && (
        data.message.toLowerCase().includes('fehler') || 
        data.message.toLowerCase().includes('error') ||
        data.message.toLowerCase().includes('konnte nicht gestartet')
      )) {
        console.error("Server reported an error:", data.message);
        toast({
          title: "Warning",
          description: "The viewer bot encountered an issue. Server message: " + data.message,
          variant: "destructive",
        });
        return;
      }

      // Update current viewers count (now handles both addition and removal)
      setCurrentViewers(prev => prev + viewerCount);

      toast({
        title: "Success",
        description: viewerCount > 0 
          ? "Viewers added successfully!" 
          : "Viewers removed successfully!",
      });
      
      onAdd(viewerCount);
    } catch (error) {
      console.error("Detailed error information:", {
        error,
        type: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      
      let errorMessage = "Failed to modify viewers. ";
      if (error instanceof Error) {
        if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
          errorMessage = "Server connection failed. Please:\n" +
                        "1. Visit https://152.53.122.45:5000 directly\n" +
                        "2. Click 'Advanced' and 'Accept the Risk'\n" +
                        "3. Return here and try again\n" +
                        "If issues persist, contact support.";
        } else {
          errorMessage += error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleButtonClick = async (count: number) => {
    if (isOnCooldown) {
      toast({
        title: "Cooldown Active",
        description: "Please wait 5 seconds before modifying bots.",
        variant: "destructive",
      });
      return;
    }

    if (type === "viewer") {
      await addViewer(count);
    }
    
    setIsOnCooldown(true);
    
    setTimeout(() => {
      setIsOnCooldown(false);
    }, 5000);
  };

  const isButtonDisabled = (count: number) => {
    if (count < 0) {
      // For negative counts (removal), check if we have enough viewers to remove
      return isOnCooldown || !streamUrl || Math.abs(count) > currentViewers;
    }
    // For positive counts (addition), check if we would exceed the limit
    return isOnCooldown || !streamUrl || currentViewers + count > viewerLimit;
  };

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          {title}
          {!hasShownCertWarning && (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current {type === "viewer" ? "Viewers" : "Chatters"}</span>
              <span>{currentViewers}/{viewerLimit}</span>
            </div>
            <Progress value={(currentViewers / viewerLimit) * 100} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => handleButtonClick(1)} 
              variant="outline"
              disabled={isButtonDisabled(1)}
            >
              +1 {type}
            </Button>
            <Button 
              onClick={() => handleButtonClick(3)} 
              variant="outline"
              disabled={isButtonDisabled(3)}
            >
              +3 {type}s
            </Button>
            <Button 
              onClick={() => handleButtonClick(5)} 
              variant="outline"
              disabled={isButtonDisabled(5)}
            >
              +5 {type}s
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => handleButtonClick(-1)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isButtonDisabled(-1)}
            >
              -1 {type}
            </Button>
            <Button 
              onClick={() => handleButtonClick(-3)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isButtonDisabled(-3)}
            >
              -3 {type}s
            </Button>
            <Button 
              onClick={() => handleButtonClick(-5)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isButtonDisabled(-5)}
            >
              -5 {type}s
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}