```typescript
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/lib/useUser"
import { AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { PLAN_VIEWER_LIMITS } from "@/lib/constants"
import { supabase } from "@/lib/supabaseClient"
import { useLanguage } from "@/lib/LanguageContext"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  const { language } = useLanguage();

  const translations = {
    en: {
      tooltipMessage: "Please enter a stream URL first",
      currentViewers: "Current Viewers",
      currentChatters: "Current Chatters",
      viewer: "Viewer",
      viewers: "Viewers",
      chatter: "Chatter",
      chatters: "Chatters",
      notEnoughViewers: "Not enough viewers",
      cantRemoveViewers: "You cannot remove {count} viewers when you only have {current}",
      viewerLimitReached: "Viewer limit reached",
      maxViewersAllowed: "Your plan allows a maximum of {limit} viewers",
      securityNotice: "Security Notice",
      certificateWarning: "Please visit https://v220250171253310506.hotsrv.de:5000 directly in your browser, click 'Advanced' and accept the certificate before continuing.",
      warning: "Warning",
      success: "Success",
      reachIncreased: "Reach successfully increased!",
      viewersRemoved: "Viewers successfully removed!",
      error: "Error",
      cooldownActive: "Cooldown Active",
      cooldownMessage: "Please wait 5 seconds before increasing reach further."
    },
    de: {
      tooltipMessage: "Bitte geben Sie zuerst eine Stream-URL ein",
      currentViewers: "Aktuelle Zuschauer",
      currentChatters: "Aktuelle Chatter",
      viewer: "Zuschauer",
      viewers: "Zuschauer",
      chatter: "Chatter",
      chatters: "Chatters",
      notEnoughViewers: "Nicht genügend Zuschauer",
      cantRemoveViewers: "Sie können nicht {count} Zuschauer entfernen, wenn Sie nur {current} haben",
      viewerLimitReached: "Zuschauerlimit erreicht",
      maxViewersAllowed: "Ihr Plan erlaubt maximal {limit} Zuschauer",
      securityNotice: "Sicherheitshinweis",
      certificateWarning: "Bitte besuchen Sie https://v220250171253310506.hotsrv.de:5000 direkt in Ihrem Browser, klicken Sie auf 'Erweitert' und akzeptieren Sie das Zertifikat, bevor Sie fortfahren.",
      warning: "Warnung",
      success: "Erfolgreich",
      reachIncreased: "Reichweite erfolgreich erhöht!",
      viewersRemoved: "Zuschauer erfolgreich entfernt!",
      error: "Fehler",
      cooldownActive: "Cooldown Aktiv",
      cooldownMessage: "Bitte warten Sie 5 Sekunden, bevor Sie die Reichweite weiter erhöhen."
    }
  };

  const t = translations[language];

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (user?.id) {
        console.log("Fetching current user plan...");
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('plan, subscription_status')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user plan:', error);
          setUserPlan("Free");
          return;
        }

        if (profile?.subscription_status === 'active') {
          console.log("Active subscription found with plan:", profile?.plan);
          setUserPlan(profile?.plan || "Free");
        } else {
          console.log("No active subscription found, setting to Free plan");
          setUserPlan("Free");
        }
      }
    };

    fetchUserPlan();
    const interval = setInterval(fetchUserPlan, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const viewerLimit = PLAN_VIEWER_LIMITS[userPlan as keyof typeof PLAN_VIEWER_LIMITS] || PLAN_VIEWER_LIMITS.Free;

  const modifyViewers = async (viewerCount: number) => {
    if (viewerCount < 0 && Math.abs(viewerCount) > currentViewers) {
      toast({
        title: t.notEnoughViewers,
        description: t.cantRemoveViewers
          .replace("{count}", Math.abs(viewerCount).toString())
          .replace("{current}", currentViewers.toString()),
        variant: "destructive",
      });
      return;
    }

    if (viewerCount > 0 && currentViewers + viewerCount > viewerLimit) {
      toast({
        title: t.viewerLimitReached,
        description: t.maxViewersAllowed.replace("{limit}", viewerLimit.toString()),
        variant: "destructive",
      });
      return;
    }

    try {
      if (!hasShownCertWarning) {
        toast({
          title: t.securityNotice,
          description: t.certificateWarning,
          duration: 10000,
          variant: "default",
        });
        setHasShownCertWarning(true);
      }
      
      const endpoint = viewerCount > 0 ? 'add_viewer' : 'remove_viewer';
      const apiUrl = `https://v220250171253310506.hotsrv.de:5000/${endpoint}`;
      
      const requestData = {
        user_id: user?.id || "anonymous",
        twitch_url: streamUrl,
        viewer_count: Math.abs(viewerCount)
      };

      console.log(`Making API request to ${apiUrl} with details:`, requestData);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestData)
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response:", errorData);
        throw new Error(`HTTP error! status: ${response.status}\nResponse: ${errorData}`);
      }

      const data = await response.json();
      console.log("API Response data:", data);

      if (data.status === "error") {
        console.error("Server reported an error:", data.message);
        toast({
          title: t.error,
          description: data.message,
          variant: "destructive",
        });
        return;
      }

      const newViewerCount = currentViewers + viewerCount;
      setCurrentViewers(newViewerCount);

      toast({
        title: t.success,
        description: viewerCount > 0 ? t.reachIncreased : t.viewersRemoved,
      });
      
      onAdd(viewerCount);
    } catch (error) {
      console.error("Detailed error information:", {
        error,
        type: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      
      let errorMessage = "Error processing request. ";
      if (error instanceof Error) {
        if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
          errorMessage = "Server connection failed. Please:\n" +
                        "1. Visit https://v220250171253310506.hotsrv.de:5000 directly\n" +
                        "2. Click 'Advanced' and 'Accept Risk'\n" +
                        "3. Return here and try again\n" +
                        "If problems persist, contact support.";
        } else {
          errorMessage += error.message;
        }
      }

      toast({
        title: t.error,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleButtonClick = async (count: number) => {
    if (isOnCooldown) {
      toast({
        title: t.cooldownActive,
        description: t.cooldownMessage,
        variant: "destructive",
      });
      return;
    }

    if (type === "viewer") {
      await modifyViewers(count);
    }
    
    setIsOnCooldown(true);
    setTimeout(() => {
      setIsOnCooldown(false);
    }, 5000);
  };

  const isButtonDisabled = (count: number) => {
    if (count < 0) {
      return isOnCooldown || !streamUrl || Math.abs(count) > currentViewers;
    }
    return isOnCooldown || !streamUrl || currentViewers + count > viewerLimit;
  };

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          {title}
          {!streamUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t.tooltipMessage}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{type === "viewer" ? t.currentViewers : t.currentChatters}</span>
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
              +1 {type === "viewer" ? t.viewer : t.chatter}
            </Button>
            <Button 
              onClick={() => handleButtonClick(3)} 
              variant="outline"
              disabled={isButtonDisabled(3)}
            >
              +3 {type === "viewer" ? t.viewers : t.chatters}
            </Button>
            <Button 
              onClick={() => handleButtonClick(5)} 
              variant="outline"
              disabled={isButtonDisabled(5)}
            >
              +5 {type === "viewer" ? t.viewers : t.chatters}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => handleButtonClick(-1)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isButtonDisabled(-1)}
            >
              -1 {type === "viewer" ? t.viewer : t.chatter}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```
