
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/lib/useUser"
import { AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { PLAN_VIEWER_LIMITS, PLAN_CHATTER_LIMITS } from "@/lib/constants"
import { supabase } from "@/lib/supabaseClient"
import { useLanguage } from "@/lib/LanguageContext"
import { API_ENDPOINTS } from "@/config/apiEndpoints"
import { serverManager } from "@/services/serverManager"
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
  const [currentCount, setCurrentCount] = useState(0);
  const { toast } = useToast();
  const { user } = useUser();
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
      cantRemoveViewers: `You cannot remove ${0} viewers when you only have ${0}`,
      viewerLimitReached: "Viewer limit reached",
      maxViewersAllowed: `Your plan allows a maximum of ${0} viewers`,
      success: "Success",
      reachIncreased: "Reach successfully increased!",
      viewersRemoved: "Viewers successfully removed!",
      error: "Error",
      warning: "Warning",
      cooldownActive: "Cooldown Active",
      cooldownMessage: "Please wait 5 seconds before increasing reach further.",
      serverBusy: "All servers are currently busy",
      tryAgainLater: "Please try again later when server resources are available."
    },
    de: {
      tooltipMessage: "Bitte geben Sie zuerst eine Stream-URL ein",
      currentViewers: "Aktuelle Zuschauer",
      currentChatters: "Aktuelle Chatter",
      viewer: "Zuschauer",
      viewers: "Zuschauer",
      chatter: "Chatter",
      chatters: "Chatter",
      notEnoughViewers: "Nicht genügend Zuschauer",
      cantRemoveViewers: `Sie können nicht ${0} Zuschauer entfernen, wenn Sie nur ${0} haben`,
      viewerLimitReached: "Zuschauerlimit erreicht",
      maxViewersAllowed: `Ihr Plan erlaubt maximal ${0} Zuschauer`,
      success: "Erfolgreich",
      reachIncreased: "Reichweite erfolgreich erhöht!",
      viewersRemoved: "Zuschauer erfolgreich entfernt!",
      error: "Fehler",
      warning: "Warnung",
      cooldownActive: "Cooldown Aktiv",
      cooldownMessage: "Bitte warten Sie 5 Sekunden, bevor Sie die Reichweite weiter erhöhen.",
      serverBusy: "Alle Server sind derzeit ausgelastet",
      tryAgainLater: "Bitte versuchen Sie es später erneut, wenn Serverressourcen verfügbar sind."
    }
  };

  const t = translations[language];

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (user?.id) {
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
          setUserPlan(profile?.plan || "Free");
        } else {
          setUserPlan("Free");
        }
      }
    };

    fetchUserPlan();
    const interval = setInterval(fetchUserPlan, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const fetchCurrentCount = async () => {
      if (user?.id) {
        const tableName = type === 'viewer' ? 'viewer_counts' : 'chatter_counts';
        const countField = type === 'viewer' ? 'viewer_count' : 'chatter_count';
        
        const { data, error } = await supabase
          .from(tableName)
          .select(countField)
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setCurrentCount(data[countField]);
        }
      }
    };

    fetchCurrentCount();
  }, [user, type]);

  const getLimit = () => {
    if (type === "viewer") {
      return PLAN_VIEWER_LIMITS[userPlan as keyof typeof PLAN_VIEWER_LIMITS] || PLAN_VIEWER_LIMITS.Free;
    } else {
      return PLAN_CHATTER_LIMITS[userPlan as keyof typeof PLAN_CHATTER_LIMITS] || PLAN_CHATTER_LIMITS.Free;
    }
  };

  const limit = getLimit();

  const updateCount = async (newCount: number) => {
    if (!user?.id) return;

    const tableName = type === 'viewer' ? 'viewer_counts' : 'chatter_counts';
    const countField = type === 'viewer' ? 'viewer_count' : 'chatter_count';

    const { error } = await supabase
      .from(tableName)
      .upsert({
        user_id: user.id,
        [countField]: newCount,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`Error updating ${type} count:`, error);
      toast({
        title: "Error",
        description: `Failed to update ${type} count`,
        variant: "destructive",
      });
    }
  };

  const findBestServer = (count: number): string | null => {
    // Verwende den serverManager, um den besten Server für die Anzahl der Viewer zu finden
    return serverManager.getBestServerForViewers(API_ENDPOINTS, Math.abs(count));
  };

  const tryRequest = async (count: number): Promise<boolean> => {
    try {
      const actionType = type === 'viewer' ? 'viewer' : 'chatter';
      const apiEndpoint = count > 0 ? `add_${actionType}` : `remove_${actionType}`;
      
      // Bei Entfernung von Viewern ist die Serverauslastung egal, nehmen wir den ersten verfügbaren
      let serverHost;
      if (count < 0) {
        serverHost = API_ENDPOINTS[0]; // Für Entfernung nutzen wir einfach den ersten Server
      } else {
        // Für Hinzufügen suchen wir den besten Server basierend auf Auslastung
        serverHost = findBestServer(count);
        
        if (!serverHost) {
          console.error("Kein geeigneter Server gefunden, alle Server sind ausgelastet.");
          toast({
            title: t.serverBusy,
            description: t.tryAgainLater,
            variant: "destructive",
          });
          return false;
        }

        // Reserviere Kapazität für diesen Server
        serverManager.reserveCapacity(serverHost, Math.abs(count));
      }
      
      const apiUrl = `https://${serverHost}:5000/${apiEndpoint}`;
      
      console.log(`Sende Anfrage an Server mit Details:`, {
        user_id: user?.id,
        twitch_url: streamUrl,
        count: Math.abs(count),
        api_host: serverHost,
        url: apiUrl
      });
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          user_id: user?.id || "123",
          twitch_url: streamUrl,
          [`${type}_count`]: Math.abs(count)
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response data:", data);
      
      return true;
    } catch (error) {
      console.error("Fehler bei der Serveranfrage:", error);
      toast({
        title: t.error,
        description: String(error),
        variant: "destructive",
      });
      return false;
    }
  };

  const modifyCount = async (changeAmount: number) => {
    if (changeAmount < 0 && Math.abs(changeAmount) > currentCount) {
      toast({
        title: t.notEnoughViewers,
        description: t.cantRemoveViewers
          .replace("${0}", Math.abs(changeAmount).toString())
          .replace("${0}", currentCount.toString()),
        variant: "destructive",
      });
      return;
    }

    if (changeAmount > 0 && currentCount + changeAmount > limit) {
      toast({
        title: t.viewerLimitReached,
        description: t.maxViewersAllowed.replace("${0}", limit.toString()),
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await tryRequest(changeAmount);
      if (success) {
        const newCount = currentCount + changeAmount;
        setCurrentCount(newCount);
        await updateCount(newCount);
        onAdd(changeAmount);
      }
    } catch (error) {
      console.error(`Error modifying ${type} count:`, error);
      toast({
        title: "Error",
        description: `Failed to modify ${type} count`,
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

    await modifyCount(count);
    
    setIsOnCooldown(true);
    setTimeout(() => {
      setIsOnCooldown(false);
    }, 5000);
  };

  const isButtonDisabled = (count: number) => {
    if (count < 0) {
      return isOnCooldown || !streamUrl || Math.abs(count) > currentCount;
    }
    return isOnCooldown || !streamUrl || currentCount + count > limit;
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
              <span>{currentCount}/{limit}</span>
            </div>
            <Progress value={(currentCount / limit) * 100} />
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
            <Button 
              onClick={() => handleButtonClick(20)} 
              variant="outline"
              disabled={isButtonDisabled(20)}
            >
              +20 {type === "viewer" ? t.viewers : t.chatters}
            </Button>
            <Button 
              onClick={() => handleButtonClick(50)} 
              variant="outline"
              disabled={isButtonDisabled(50)}
            >
              +50 {type === "viewer" ? t.viewers : t.chatters}
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
            <Button 
              onClick={() => handleButtonClick(-5)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isButtonDisabled(-5)}
            >
              -5 {type === "viewer" ? t.viewers : t.chatters}
            </Button>
            <Button 
              onClick={() => handleButtonClick(-20)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isButtonDisabled(-20)}
            >
              -20 {type === "viewer" ? t.viewers : t.chatters}
            </Button>
            <Button 
              onClick={() => handleButtonClick(-50)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isButtonDisabled(-50)}
            >
              -50 {type === "viewer" ? t.viewers : t.chatters}
            </Button>
            <Button 
              onClick={() => handleButtonClick(-99999)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isButtonDisabled(-99999)}
            >
              {language === 'de' ? 'Alle entfernen' : 'Remove all'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
