
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/lib/useUser"
import { AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { PLAN_VIEWER_LIMITS } from "@/lib/constants"
import { supabase } from "@/lib/supabaseClient"
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
        title: "Nicht genügend Zuschauer",
        description: `Sie können nicht ${Math.abs(viewerCount)} Zuschauer entfernen, wenn Sie nur ${currentViewers} haben.`,
        variant: "destructive",
      });
      return;
    }

    if (viewerCount > 0 && currentViewers + viewerCount > viewerLimit) {
      toast({
        title: "Zuschauerlimit erreicht",
        description: `Sie können keine weiteren Zuschauer hinzufügen. Ihr Plan erlaubt maximal ${viewerLimit} Zuschauer.`,
        variant: "destructive",
      });
      return;
    }

    try {
      if (!hasShownCertWarning) {
        toast({
          title: "Sicherheitshinweis",
          description: "Bitte besuchen Sie https://v220250171253310506.hotsrv.de:5000 direkt in Ihrem Browser, klicken Sie auf 'Erweitert' und akzeptieren Sie das Zertifikat, bevor Sie fortfahren.",
          duration: 10000,
          variant: "default",
        });
        setHasShownCertWarning(true);
      }

      const endpoint = viewerCount > 0 ? 'add_viewer' : 'remove_viewer';
      const apiUrl = `https://v220250171253310506.hotsrv.de:5000/${endpoint}`;
      
      console.log(`Starte Reichweitensteigerung mit Details:`, {
        user_id: user?.id,
        twitch_url: streamUrl,
        viewer_count: Math.abs(viewerCount)
      });
      
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
          viewer_count: Math.abs(viewerCount)
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
          title: "Warnung",
          description: "Es gab ein Problem bei der Reichweitensteigerung. Server-Nachricht: " + data.message,
          variant: "destructive",
        });
        return;
      }

      const newViewerCount = currentViewers + viewerCount;
      setCurrentViewers(newViewerCount);

      toast({
        title: "Erfolgreich",
        description: viewerCount > 0 
          ? "Reichweite erfolgreich erhöht!" 
          : "Zuschauer erfolgreich entfernt!",
      });
      
      onAdd(viewerCount);
    } catch (error) {
      console.error("Detailed error information:", {
        error,
        type: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      
      let errorMessage = "Fehler bei der Reichweitensteigerung. ";
      if (error instanceof Error) {
        if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
          errorMessage = "Serververbindung fehlgeschlagen. Bitte:\n" +
                        "1. Besuchen Sie https://v220250171253310506.hotsrv.de:5000 direkt\n" +
                        "2. Klicken Sie auf 'Erweitert' und 'Risiko akzeptieren'\n" +
                        "3. Kehren Sie hierher zurück und versuchen Sie es erneut\n" +
                        "Bei anhaltenden Problemen kontaktieren Sie den Support.";
        } else {
          errorMessage += error.message;
        }
      }

      toast({
        title: "Fehler",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleButtonClick = async (count: number) => {
    if (isOnCooldown) {
      toast({
        title: "Cooldown Aktiv",
        description: "Bitte warten Sie 5 Sekunden, bevor Sie die Reichweite weiter erhöhen.",
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
                  <p>Bitte geben Sie zuerst eine Stream-URL ein</p>
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
              <span>{type === "viewer" ? "Aktuelle Zuschauer" : "Aktuelle Chatter"}</span>
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
              +1 {type === "viewer" ? "Zuschauer" : "Chatter"}
            </Button>
            <Button 
              onClick={() => handleButtonClick(3)} 
              variant="outline"
              disabled={isButtonDisabled(3)}
            >
              +3 {type === "viewer" ? "Zuschauer" : "Chatter"}
            </Button>
            <Button 
              onClick={() => handleButtonClick(5)} 
              variant="outline"
              disabled={isButtonDisabled(5)}
            >
              +5 {type === "viewer" ? "Zuschauer" : "Chatter"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => handleButtonClick(-1)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isButtonDisabled(-1)}
            >
              -1 {type === "viewer" ? "Zuschauer" : "Chatter"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

