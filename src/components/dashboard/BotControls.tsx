
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/lib/useUser"
import { AlertCircle, Info, Settings, Play, PlayCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { PLAN_VIEWER_LIMITS, PLAN_CHATTER_LIMITS } from "@/lib/constants"
import { supabase } from "@/lib/supabaseClient"
import { useLanguage } from "@/lib/LanguageContext"
import { Slider } from "@/components/ui/slider"
import { 
  API_ENDPOINTS, 
  addViewerAllocation,
  getServersWithViewers, 
  getViewerAllocationsForUser,
  removeViewerAllocation,
  removeAllViewerAllocations
} from "@/config/apiEndpoints"
import { serverManager } from "@/services/serverManager"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface BotControlsProps {
  title: string
  onAdd: (count: number) => void
  type: "viewer" | "chatter"
  streamUrl: string
}

export function BotControls({ title, onAdd, type, streamUrl }: BotControlsProps) {
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(false);
  const [adjustmentMode, setAdjustmentMode] = useState<"percentage" | "fixed">("percentage");
  const [adjustmentValue, setAdjustmentValue] = useState(20); // Default to 20% increase
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useUser();
  const { language } = useLanguage();

  const translations = {
    en: {
      tooltipMessage: "Please enter a stream URL first",
      currentViewers: "Current Viewers",
      currentChatters: "Current Chatters",
      targetViewers: "Target Viewers",
      targetChatters: "Target Chatters",
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
      tryAgainLater: "Please try again later when server resources are available.",
      planLimitReached: "Plan limit reached",
      upgradeRequired: "Upgrade your plan to add more viewers.",
      approachingLimit: "Approaching limit",
      limitWarning: "You're at {percent}% of your plan limit. Consider upgrading for more capacity.",
      apply: "Apply Changes",
      processing: "Processing...",
      removeAll: "Remove All",
      settings: "Advanced Settings",
      autoAdjustment: "Auto Adjustment",
      autoAdjustmentDescription: "Automatically adjust viewers based on stream metrics",
      adjustmentMode: "Adjustment Mode",
      percentage: "Percentage",
      fixed: "Fixed Number",
      adjustmentValue: "Adjustment Value",
      autoAdjustmentEnabled: "Auto-adjustment enabled",
      targetReached: "Target reached",
      adjustingViewers: "Adjusting viewers..."
    },
    de: {
      tooltipMessage: "Bitte geben Sie zuerst eine Stream-URL ein",
      currentViewers: "Aktuelle Zuschauer",
      currentChatters: "Aktuelle Chatter",
      targetViewers: "Ziel Zuschauer",
      targetChatters: "Ziel Chatter",
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
      tryAgainLater: "Bitte versuchen Sie es später erneut, wenn Serverressourcen verfügbar sind.",
      planLimitReached: "Planlimit erreicht",
      upgradeRequired: "Aktualisieren Sie Ihren Plan, um mehr Zuschauer hinzuzufügen.",
      approachingLimit: "Limitgrenze nähert sich",
      limitWarning: "Sie sind bei {percent}% Ihres Planlimits. Erwägen Sie ein Upgrade für mehr Kapazität.",
      apply: "Änderungen anwenden",
      processing: "Verarbeitung...",
      removeAll: "Alle entfernen",
      settings: "Erweiterte Einstellungen",
      autoAdjustment: "Automatische Anpassung",
      autoAdjustmentDescription: "Zuschauer automatisch basierend auf Stream-Metriken anpassen",
      adjustmentMode: "Anpassungsmodus",
      percentage: "Prozentsatz",
      fixed: "Feste Anzahl",
      adjustmentValue: "Anpassungswert",
      autoAdjustmentEnabled: "Automatische Anpassung aktiviert",
      targetReached: "Ziel erreicht",
      adjustingViewers: "Zuschauer werden angepasst..."
    }
  };

  const t = translations[language];

  useEffect(() => {
    const fetchCurrentCount = async () => {
      if (user?.id) {
        if (type === 'viewer') {
          // For viewers, get the active count from the profile
          if (profile?.viewers_active !== undefined) {
            setCurrentCount(profile.viewers_active);
            setTargetCount(profile.viewers_active);
            return;
          }
        } else {
          // For chatters, continue with the current approach
          const tableName = 'chatter_counts';
          const countField = 'chatter_count';
          
          const { data, error } = await supabase
            .from(tableName)
            .select(countField)
            .eq('user_id', user.id)
            .single();

          if (!error && data) {
            setCurrentCount(data[countField]);
            setTargetCount(data[countField]);
          }
        }
      }
    };

    fetchCurrentCount();
  }, [user, profile, type]);

  // Auto-adjustment interval effect
  useEffect(() => {
    if (!autoAdjustEnabled || !streamUrl) return;

    let interval: NodeJS.Timeout;
    
    const adjustViewers = async () => {
      try {
        if (type === 'viewer') {
          // Get current real viewer count from Twitch
          const response = await fetch(`/api/get-stream-stats?url=${encodeURIComponent(streamUrl)}`);
          if (!response.ok) return;
          
          const data = await response.json();
          const realViewerCount = data.viewerCount || 0;
          
          // Calculate target based on mode and value
          let targetViewerCount = realViewerCount;
          if (adjustmentMode === "percentage") {
            targetViewerCount = Math.round(realViewerCount * (1 + adjustmentValue / 100));
          } else {
            targetViewerCount = realViewerCount + adjustmentValue;
          }
          
          // Ensure we don't exceed plan limits
          const limit = getLimit();
          if (targetViewerCount > limit) {
            targetViewerCount = limit;
          }
          
          // If there's a significant difference, update
          if (Math.abs(targetViewerCount - currentCount) >= 5) {
            setTargetCount(targetViewerCount);
            await applyChanges(targetViewerCount - currentCount);
            toast({
              title: t.autoAdjustmentEnabled,
              description: t.adjustingViewers,
              variant: "default",
            });
          }
        }
      } catch (error) {
        console.error("Auto-adjustment error:", error);
      }
    };
    
    // Initial adjustment after enabling
    adjustViewers();
    
    // Set up interval for periodic adjustments (every 5 minutes)
    interval = setInterval(adjustViewers, 300000);
    
    return () => clearInterval(interval);
  }, [autoAdjustEnabled, streamUrl, adjustmentMode, adjustmentValue, currentCount]);

  const getLimit = () => {
    if (type === "viewer") {
      // Use the profile's viewer limit if available
      return profile?.viewer_limit || 4;
    } else {
      const userPlan = profile?.plan || "Free";
      const subscriptionActive = profile?.subscription_status === 'active';
      const planKey = subscriptionActive ? userPlan : "Free";
      return PLAN_CHATTER_LIMITS[planKey as keyof typeof PLAN_CHATTER_LIMITS] || PLAN_CHATTER_LIMITS.Free;
    }
  };

  const limit = getLimit();

  // Calculate usage percentage for UI indicators
  const usagePercentage = (currentCount / limit) * 100;
  
  // Get indicator color based on usage percentage
  const getIndicatorColor = () => {
    if (usagePercentage >= 90) return "bg-red-500";
    if (usagePercentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Check if approaching limit and show warning
  useEffect(() => {
    if (usagePercentage >= 80 && usagePercentage < 100) {
      toast({
        title: t.approachingLimit,
        description: t.limitWarning.replace("{percent}", Math.round(usagePercentage).toString()),
        variant: "warning",
      });
    }
  }, [usagePercentage]);

  // Modify the updateCount function to use RPC calls instead of direct DB updates
  const updateCount = async (newCount: number) => {
    if (!user?.id) return;

    if (type === 'viewer') {
      const currentViewerCount = profile?.viewers_active || 0;
      const changeAmount = newCount - currentViewerCount;
      
      // Determine whether to increment or decrement
      if (changeAmount > 0) {
        // Increment viewers
        const { data, error } = await supabase.rpc('increment_viewer_count', {
          user_id: user.id,
          count: Math.abs(changeAmount)
        });

        if (error) {
          console.error('Error incrementing viewers_active:', error);
          toast({
            title: "Error",
            description: `Failed to update ${type} count`,
            variant: "destructive",
          });
        }
      } else if (changeAmount < 0) {
        // Decrement viewers
        const { data, error } = await supabase.rpc('decrement_viewer_count', {
          user_id: user.id,
          count: Math.abs(changeAmount)
        });

        if (error) {
          console.error('Error decrementing viewers_active:', error);
          toast({
            title: "Error",
            description: `Failed to update ${type} count`,
            variant: "destructive",
          });
        }
      } else {
        // No change needed
        return;
      }
    } else {
      // For chatters, continue with the current approach
      const tableName = 'chatter_counts';
      const countField = 'chatter_count';
      
      const { data, error } = await supabase
        .from(tableName)
        .select(countField)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        const currentCount = data[countField];
        const changeAmount = newCount - currentCount;
        
        // Determine whether to increment or decrement
        if (changeAmount > 0) {
          // Increment chatters
          const { data: updateData, error: updateError } = await supabase
            .from(tableName)
            .update({ [countField]: currentCount + changeAmount })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Error updating chatter_count:', updateError);
            toast({
              title: "Error",
              description: `Failed to update ${type} count`,
              variant: "destructive",
            });
          }
        } else if (changeAmount < 0) {
          // Decrement chatters
          const { data: updateData, error: updateError } = await supabase
            .from(tableName)
            .update({ [countField]: currentCount + changeAmount })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Error updating chatter_count:', updateError);
            toast({
              title: "Error",
              description: `Failed to update ${type} count`,
              variant: "destructive",
            });
          }
        } else {
          // No change needed
          return;
        }
      }
    }
  };

  const findBestServer = (count: number): string | null => {
    // Verwende den serverManager, um den besten Server für die Anzahl der Viewer zu finden
    return serverManager.getBestServerForViewers(API_ENDPOINTS, Math.abs(count));
  };

  const distributeViewerRemoval = (userId: string, streamUrl: string, totalToRemove: number): {[serverHost: string]: number} => {
    const allocations = getViewerAllocationsForUser(userId, streamUrl);
    const serverDistribution: {[serverHost: string]: number} = {};
    let remainingToRemove = totalToRemove;
    
    // Sortiere Server nach Anzahl der Viewer (absteigend)
    const serversSorted = Object.keys(allocations).sort((a, b) => allocations[b] - allocations[a]);
    
    for (const server of serversSorted) {
      if (remainingToRemove <= 0) break;
      
      const viewersOnServer = allocations[server];
      if (viewersOnServer <= 0) continue;
      
      const toRemoveFromServer = Math.min(remainingToRemove, viewersOnServer);
      serverDistribution[server] = toRemoveFromServer;
      remainingToRemove -= toRemoveFromServer;
    }
    
    console.log(`Viewer removal distribution for ${totalToRemove} viewers:`, serverDistribution);
    return serverDistribution;
  };

  const tryRequest = async (count: number): Promise<boolean> => {
    try {
      const actionType = type === 'viewer' ? 'viewer' : 'chatter';
      const apiEndpoint = count > 0 ? `add_${actionType}` : `remove_${actionType}`;
      
      // Bei positiven Counts (Hinzufügen von Viewern)
      if (count > 0) {
        // Find the best server
        const serverHost = findBestServer(count);
        
        if (!serverHost) {
          console.error("Kein geeigneter Server gefunden, alle Server sind ausgelastet.");
          toast({
            title: t.serverBusy,
            description: t.tryAgainLater,
            variant: "destructive",
          });
          return false;
        }

        // Bevor wir den Request senden, prüfen wir serverseitig nochmals das Limit
        if (type === 'viewer' && user?.id) {
          // Prüfe aktuelles Limit und aktive Viewer
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('viewer_limit, viewers_active, plan, subscription_status')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error("Fehler beim Abrufen der Profilinformationen:", profileError);
            toast({
              title: "Fehler",
              description: "Konnte Benutzerlimit nicht überprüfen",
              variant: "destructive",
            });
            return false;
          }
          
          const currentViewers = profileData?.viewers_active || 0;
          let viewerLimit = 4; // Default Free Limit
          
          // Bestimme Limit basierend auf Plan
          if (profileData?.subscription_status === 'active') {
            if (profileData.plan?.includes('Ultimate')) viewerLimit = 1000;
            else if (profileData.plan?.includes('Expert')) viewerLimit = 300;
            else if (profileData.plan?.includes('Professional')) viewerLimit = 200;
            else if (profileData.plan?.includes('Basic')) viewerLimit = 50;
            else if (profileData.plan?.includes('Starter')) viewerLimit = 25;
          }
          
          // Prüfe, ob das Limit überschritten werden würde
          if (currentViewers + count > viewerLimit) {
            toast({
              title: t.viewerLimitReached,
              description: t.maxViewersAllowed.replace("${0}", viewerLimit.toString()),
              variant: "destructive",
            });
            return false;
          }
        }

        // Reserviere Kapazität für diesen Server
        serverManager.reserveCapacity(serverHost, Math.abs(count));
        
        const apiUrl = `https://${serverHost}:5000/${apiEndpoint}`;
        
        console.log(`Sende Anfrage zum Hinzufügen an Server mit Details:`, {
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
            count: Math.abs(count)
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response data:", data);
        
        // Erfolgreicher Request: Allokation speichern
        if (user?.id) {
          addViewerAllocation(user.id, streamUrl, serverHost, Math.abs(count));
        }
        
        return true;
      } 
      // Bei negativen Counts (Entfernen von Viewern)
      else {
        const absTotalToRemove = Math.abs(count);
        
        // Wenn der spezielle "Remove All" Wert verwendet wird
        if (absTotalToRemove === 99999) {
          const serversWithViewers = getServersWithViewers(user?.id || "123", streamUrl);
          
          if (serversWithViewers.length === 0) {
            console.log("Keine Server mit Viewern gefunden.");
            return true; // Nichts zu entfernen
          }
          
          // Für jeden Server mit Viewern einen Remove-Request senden
          for (const serverHost of serversWithViewers) {
            const allocations = getViewerAllocationsForUser(user?.id || "123", streamUrl);
            const viewersOnServer = allocations[serverHost] || 0;
            
            if (viewersOnServer > 0) {
              const apiUrl = `https://${serverHost}:5000/${apiEndpoint}`;
              
              console.log(`Sende Anfrage zum Entfernen aller Viewer vom Server ${serverHost}:`, {
                user_id: user?.id,
                twitch_url: streamUrl,
                count: viewersOnServer,
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
                  [`${type}_count`]: viewersOnServer
                })
              });
              
              if (!response.ok) {
                console.error(`Fehler beim Entfernen aller Viewer von Server ${serverHost}`);
              } else {
                if (user?.id) {
                  removeViewerAllocation(user.id, streamUrl, serverHost, viewersOnServer);
                }
              }
            }
          }
          
          if (user?.id) {
            removeAllViewerAllocations(user.id, streamUrl);
          }
          
          return true;
        } 
        // Normale Entfernung einer bestimmten Anzahl
        else {
          const removalDistribution = distributeViewerRemoval(
            user?.id || "123",
            streamUrl,
            absTotalToRemove
          );
          
          // Für jeden Server in der Verteilung einen separaten Request senden
          for (const [serverHost, countToRemove] of Object.entries(removalDistribution)) {
            if (countToRemove <= 0) continue;
            
            const apiUrl = `https://${serverHost}:5000/${apiEndpoint}`;
            
            console.log(`Sende Anfrage zum Entfernen von ${countToRemove} Viewern vom Server ${serverHost}:`, {
              user_id: user?.id,
              twitch_url: streamUrl,
              count: countToRemove,
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
                [`${type}_count`]: countToRemove
              })
            });
            
            if (!response.ok) {
              console.error(`Fehler beim Entfernen von ${countToRemove} Viewern von Server ${serverHost}`);
            } else {
              if (user?.id) {
                removeViewerAllocation(user.id, streamUrl, serverHost, countToRemove);
              }
            }
          }
          
          return true;
        }
      }
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

  const applyChanges = async (changeAmount: number) => {
    if (!streamUrl) {
      toast({
        title: t.error,
        description: t.tooltipMessage,
        variant: "destructive",
      });
      return;
    }
    
    // Don't do anything if target equals current
    if (targetCount === currentCount) return;
    
    changeAmount = targetCount - currentCount;
    
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
      const possibleIncrease = limit - currentCount;
      setTargetCount(currentCount + possibleIncrease);
      changeAmount = possibleIncrease;
      
      toast({
        title: t.viewerLimitReached,
        description: t.maxViewersAllowed.replace("${0}", limit.toString()),
        variant: "default",
      });
      
      if (possibleIncrease <= 0) return;
    }

    setIsProcessing(true);
    
    try {
      const success = await tryRequest(changeAmount);
      if (success) {
        const newCount = currentCount + changeAmount;
        setCurrentCount(newCount);
        await updateCount(newCount);
        onAdd(changeAmount);
        
        toast({
          title: t.success,
          description: changeAmount > 0 ? t.reachIncreased : t.viewersRemoved,
          variant: "default",
        });
        
        // Start cooldown
        setIsOnCooldown(true);
        setTimeout(() => {
          setIsOnCooldown(false);
        }, 5000);
      }
    } catch (error) {
      console.error(`Error modifying ${type} count:`, error);
      toast({
        title: t.error,
        description: `Failed to modify ${type} count`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAdd = async (count: number) => {
    if (isOnCooldown || isProcessing) {
      toast({
        title: t.cooldownActive,
        description: t.cooldownMessage,
        variant: "destructive",
      });
      return;
    }
    
    const newTarget = Math.min(currentCount + count, limit);
    setTargetCount(newTarget);
    await applyChanges(newTarget - currentCount);
  };

  const handleQuickRemove = async (count: number) => {
    if (isOnCooldown || isProcessing) {
      toast({
        title: t.cooldownActive,
        description: t.cooldownMessage,
        variant: "destructive",
      });
      return;
    }
    
    const newTarget = Math.max(currentCount - count, 0);
    setTargetCount(newTarget);
    await applyChanges(newTarget - currentCount);
  };

  const handleRemoveAll = async () => {
    if (isOnCooldown || isProcessing) {
      toast({
        title: t.cooldownActive,
        description: t.cooldownMessage,
        variant: "destructive",
      });
      return;
    }
    
    setTargetCount(0);
    setIsProcessing(true);
    
    try {
      const success = await tryRequest(-99999);
      if (success) {
        setCurrentCount(0);
        await updateCount(0);
        onAdd(-currentCount);
        
        toast({
          title: t.success,
          description: t.viewersRemoved,
          variant: "default",
        });
      }
    } catch (error) {
      console.error(`Error removing all ${type}:`, error);
      toast({
        title: t.error,
        description: `Failed to remove all ${type}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsOnCooldown(true);
      setTimeout(() => {
        setIsOnCooldown(false);
      }, 5000);
    }
  };

  const isActionDisabled = () => {
    return isOnCooldown || isProcessing || !streamUrl;
  };

  // Calculate difference between target and current for status indicators
  const calculateDifference = () => {
    return targetCount - currentCount;
  };

  const getDifferenceClass = () => {
    const diff = calculateDifference();
    if (diff > 0) return "text-green-500";
    if (diff < 0) return "text-red-500";
    return "text-gray-500";
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
          <div className="ml-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.settings}</DialogTitle>
                  <DialogDescription>
                    {t.autoAdjustmentDescription}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="auto-adjust" 
                      checked={autoAdjustEnabled}
                      onCheckedChange={setAutoAdjustEnabled}
                    />
                    <Label htmlFor="auto-adjust">{t.autoAdjustment}</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t.adjustmentMode}</Label>
                    <Select 
                      value={adjustmentMode} 
                      onValueChange={(value) => setAdjustmentMode(value as "percentage" | "fixed")}
                      disabled={!autoAdjustEnabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">{t.percentage}</SelectItem>
                        <SelectItem value="fixed">{t.fixed}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t.adjustmentValue}</Label>
                    <Slider
                      value={[adjustmentValue]}
                      min={adjustmentMode === "percentage" ? 5 : 1}
                      max={adjustmentMode === "percentage" ? 100 : 50}
                      step={adjustmentMode === "percentage" ? 5 : 1}
                      onValueChange={([value]) => setAdjustmentValue(value)}
                      disabled={!autoAdjustEnabled}
                    />
                    <div className="text-right text-sm">
                      {adjustmentMode === "percentage" ? `${adjustmentValue}%` : `+${adjustmentValue}`}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{type === "viewer" ? t.currentViewers : t.currentChatters}</span>
              <div className="flex items-center">
                <span>{currentCount}/{limit}</span>
                {usagePercentage >= 75 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 ml-1 text-yellow-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t.limitWarning.replace("{percent}", Math.round(usagePercentage).toString())}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            <Progress 
              value={usagePercentage} 
              className="h-2"
              indicatorClassName={getIndicatorColor()}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>{type === "viewer" ? t.targetViewers : t.targetChatters}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{targetCount}</span>
                {targetCount !== currentCount && (
                  <span className={`text-xs ${getDifferenceClass()}`}>
                    {calculateDifference() > 0 ? '+' : ''}{calculateDifference()}
                  </span>
                )}
              </div>
            </div>
            <Slider
              value={[targetCount]}
              min={0}
              max={limit}
              step={1}
              onValueChange={([value]) => setTargetCount(value)}
              disabled={isActionDisabled()}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{Math.floor(limit / 2)}</span>
              <span>{limit}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-between">
            <Button 
              onClick={() => applyChanges(targetCount - currentCount)}
              disabled={isActionDisabled() || targetCount === currentCount}
              className="flex-1"
              variant={targetCount > currentCount ? "default" : "outline"}
            >
              {isProcessing ? (
                <>
                  <span className="animate-pulse mr-2">●</span>
                  {t.processing}
                </>
              ) : (
                <>
                  {calculateDifference() !== 0 && (
                    <span className={`mr-2 ${getDifferenceClass()}`}>
                      {calculateDifference() > 0 ? '+' : ''}{calculateDifference()}
                    </span>
                  )}
                  {t.apply}
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleRemoveAll}
              disabled={isActionDisabled() || currentCount === 0}
              variant="destructive"
            >
              {t.removeAll}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div>
              <h4 className="text-sm font-medium mb-2">{language === 'de' ? 'Schnellzugriff: Hinzufügen' : 'Quick Add'}</h4>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => handleQuickAdd(1)} 
                  variant="outline"
                  disabled={isActionDisabled()}
                  size="sm"
                  className="justify-start"
                >
                  <Play className="h-3 w-3 mr-2" /> +1
                </Button>
                <Button 
                  onClick={() => handleQuickAdd(5)} 
                  variant="outline"
                  disabled={isActionDisabled()}
                  size="sm"
                  className="justify-start"
                >
                  <Play className="h-3 w-3 mr-2" /> +5
                </Button>
                <Button 
                  onClick={() => handleQuickAdd(20)} 
                  variant="outline"
                  disabled={isActionDisabled()}
                  size="sm"
                  className="justify-start"
                >
                  <PlayCircle className="h-3 w-3 mr-2" /> +20
                </Button>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">{language === 'de' ? 'Schnellzugriff: Entfernen' : 'Quick Remove'}</h4>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => handleQuickRemove(1)} 
                  variant="outline"
                  disabled={isActionDisabled() || currentCount < 1}
                  size="sm"
                  className="justify-start text-red-500"
                >
                  <Play className="h-3 w-3 mr-2" /> -1
                </Button>
                <Button 
                  onClick={() => handleQuickRemove(5)} 
                  variant="outline"
                  disabled={isActionDisabled() || currentCount < 5}
                  size="sm"
                  className="justify-start text-red-500"
                >
                  <Play className="h-3 w-3 mr-2" /> -5
                </Button>
                <Button 
                  onClick={() => handleQuickRemove(20)} 
                  variant="outline"
                  disabled={isActionDisabled() || currentCount < 20}
                  size="sm"
                  className="justify-start text-red-500"
                >
                  <PlayCircle className="h-3 w-3 mr-2" /> -20
                </Button>
              </div>
            </div>
          </div>
          
          {autoAdjustEnabled && (
            <div className="mt-2 p-2 bg-muted/50 rounded-md flex items-center">
              <div className="animate-pulse w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs">{t.autoAdjustmentEnabled}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
