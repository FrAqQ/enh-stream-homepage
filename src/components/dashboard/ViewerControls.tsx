
import React, { useState, useEffect } from "react";
import { Users, Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { OnboardingTooltip } from "@/components/ui/onboarding-tooltip";
import { PLAN_VIEWER_LIMITS } from "@/lib/constants"
import { ChatterStats } from "@/lib/useUser";

interface ViewerControlsProps {
  title: string;
  onAdd: (count: number) => void;
  type: "viewer" | "chatter";
  streamUrl: string;
  viewerCount: number; // This is the enhanced/bot viewers or chatters
  viewerLimit: number;
  actualStreamCount?: number; // This is the actual Twitch stream count (only relevant for viewers)
  chatterStats?: ChatterStats; // Neue Statistiken für Chatter
}

const ViewerControls = ({
  title,
  onAdd,
  type,
  streamUrl,
  viewerCount,
  viewerLimit,
  actualStreamCount,
  chatterStats
}: ViewerControlsProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState(1);
  const [autoStopMinutes, setAutoStopMinutes] = useState<number | null>(null);
  const [autoStopTimerId, setAutoStopTimerId] = useState<NodeJS.Timeout | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  
  const isLimitReached = viewerCount >= viewerLimit;
  const percentageFilled = Math.min(100, (viewerCount / viewerLimit) * 100);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoStopTimerId && remainingTime !== null) {
      intervalId = setInterval(() => {
        setRemainingTime(prev => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          } else {
            if (intervalId) clearInterval(intervalId);
            return 0;
          }
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoStopTimerId, remainingTime]);

  useEffect(() => {
    if (remainingTime === 0) {
      handleResetViewers();
      setAutoStopTimerId(null);
      setRemainingTime(null);
      toast({
        title: "Viewers Stopped",
        description: "Auto-stop timer has completed and viewers have been reset.",
      });
    }
  }, [remainingTime]);

  const handleAddViewers = () => {
    if (!streamUrl) {
      toast({
        title: "Error",
        description: "Please save a stream URL first",
        variant: "destructive",
      });
      return;
    }

    if (isLimitReached) {
      toast({
        title: "Limit Reached",
        description: `Your current plan allows a maximum of ${viewerLimit} ${type === "viewer" ? "viewers" : "chatters"}`,
        variant: "destructive",
      });
      return;
    }

    onAdd(amount);
    toast({
      title: "Success",
      description: `Added ${amount} ${type === "viewer" ? "viewers" : "chatters"}`,
    });
  };

  const handleResetViewers = () => {
    // This would typically call an API to reset the viewers
    // For now we'll just simulate it with a toast notification
    toast({
      title: "Viewers Reset",
      description: `All ${type === "viewer" ? "viewers" : "chatters"} have been reset`,
    });
    
    // Cancel any existing auto-stop timer
    if (autoStopTimerId) {
      clearTimeout(autoStopTimerId);
      setAutoStopTimerId(null);
      setRemainingTime(null);
    }
  };

  const handlePresetClick = (percentage: number) => {
    const newAmount = Math.max(1, Math.floor((viewerLimit * percentage) / 100));
    setAmount(newAmount);
  };

  const startAutoStopTimer = (minutes: number) => {
    // Cancel any existing timer
    if (autoStopTimerId) {
      clearTimeout(autoStopTimerId);
    }
    
    // Set new timer
    const timeInMs = minutes * 60 * 1000;
    const timerId = setTimeout(() => {
      handleResetViewers();
      setAutoStopTimerId(null);
      setRemainingTime(null);
    }, timeInMs);
    
    setAutoStopTimerId(timerId);
    setAutoStopMinutes(minutes);
    setRemainingTime(minutes * 60);
    
    toast({
      title: "Auto-Stop Timer Set",
      description: `Viewers will automatically stop after ${minutes} minutes`,
    });
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Bestimme die anzuzeigende Zahl basierend auf dem Typ
  const getDisplayedCount = () => {
    if (type === "chatter" && chatterStats) {
      // Für Chatter zeigen wir die erweiterten (hinzugefügten) Chatter an
      return chatterStats.enhanced_chatters;
    }
    // Für Viewer oder wenn keine Chatter-Statistiken verfügbar sind
    return viewerCount;
  };

  const displayedCount = getDisplayedCount();

  return (
    <OnboardingTooltip
      id={`${type}-controls-tooltip`}
      content={{
        en: type === "viewer" 
          ? "Here you can add viewers to your stream. Use the slider to select how many viewers to add at once."
          : "Control your chat activity here. Adjust message frequency with the slider."
        ,
        de: type === "viewer"
          ? "Hier kannst du Viewer zu deinem Stream hinzufügen. Nutze den Schieberegler, um die Anzahl der Viewer festzulegen."
          : "Hier kannst du deine Chat-Aktivität steuern. Passe die Nachrichtenfrequenz mit dem Schieberegler an."
      }}
      position="left"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>
            {type === "viewer"
              ? "Control how many viewers are active on your stream"
              : "Control chat engagement and message frequency"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLimitReached && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Limit Reached</AlertTitle>
              <AlertDescription>
                You've reached your plan's limit of {viewerLimit} {type === "viewer" ? "viewers" : "chatters"}. 
                Upgrade your plan for higher limits.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Amount to add:</span>
              <span className="font-medium">{amount}</span>
            </div>
            
            <div className="relative pt-5 pb-8">
              <Slider
                value={[amount]}
                min={1}
                max={viewerLimit}
                step={1}
                onValueChange={(values) => setAmount(values[0])}
                disabled={isLimitReached}
                indicatorColor={isLimitReached ? "bg-red-500" : ""}
              />
              <div className="absolute inset-0 flex items-center pointer-events-none">
                <div 
                  className="absolute text-xs px-2 py-1 rounded bg-primary text-primary-foreground shadow-sm" 
                  style={{ 
                    left: `${(amount / viewerLimit) * 100}%`, 
                    transform: 'translateX(-50%) translateY(-100%)',
                    top: '0'
                  }}
                >
                  {amount}
                </div>
              </div>
              <div className="absolute bottom-0 text-xs text-muted-foreground w-full text-center">
                {/* Hier Anzeige je nach Typ anpassen */}
                {type === "viewer" ? (
                  <span>{displayedCount} of {viewerLimit} enhanced viewers active</span>
                ) : (
                  <span>
                    {displayedCount} of {viewerLimit} enhanced chatters active
                    {chatterStats && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Total: {chatterStats.total_chatters}, Natural: {chatterStats.natural_chatters})
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
            
            {type === "viewer" && actualStreamCount !== undefined && (
              <div className="mt-2 p-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Current Twitch viewers:</span> {actualStreamCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Total viewers:</span> {actualStreamCount + displayedCount}
                </p>
              </div>
            )}
            
            {type === "chatter" && chatterStats && (
              <div className="mt-2 p-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Enhanced chatters:</span> {chatterStats.enhanced_chatters}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Natural chatters:</span> {chatterStats.natural_chatters}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Total chatters:</span> {chatterStats.total_chatters}
                </p>
              </div>
            )}
            
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePresetClick(25)}
                className="flex-1"
              >
                Low (25%)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePresetClick(50)}
                className="flex-1"
              >
                Normal (50%)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePresetClick(100)}
                className="flex-1"
                disabled={isLimitReached}
              >
                Max (100%)
              </Button>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Auto-Stop Timer:</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => startAutoStopTimer(30)}
                  className="flex-1"
                >
                  30m
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => startAutoStopTimer(60)}
                  className="flex-1"
                >
                  1h
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => startAutoStopTimer(120)}
                  className="flex-1"
                >
                  2h
                </Button>
              </div>
              
              {remainingTime !== null && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Auto-stop in:</span>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="text-sm font-medium">{formatTime(remainingTime)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 ml-2 text-xs" 
                      onClick={() => {
                        if (autoStopTimerId) {
                          clearTimeout(autoStopTimerId);
                          setAutoStopTimerId(null);
                          setRemainingTime(null);
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleResetViewers}
            disabled={displayedCount === 0}
          >
            Reset {type === "viewer" ? "Viewers" : "Chatters"}
          </Button>
          
          <OnboardingTooltip
            id={`add-${type}-button-tooltip`}
            content={{
              en: type === "viewer" 
                ? "Click here to add the selected number of viewers to your stream."
                : "Click to add chatters that will send messages in your stream chat.",
              de: type === "viewer"
                ? "Klicke hier, um die gewählte Anzahl an Viewern zu deinem Stream hinzuzufügen."
                : "Klicke, um Chatter hinzuzufügen, die Nachrichten in deinem Stream-Chat senden werden."
            }}
            position="bottom"
          >
            <Button 
              onClick={handleAddViewers}
              disabled={isLimitReached || !streamUrl}
            >
              Add {amount} {type === "viewer" ? "Viewer" : "Chatter"}
              {amount !== 1 ? "s" : ""}
            </Button>
          </OnboardingTooltip>
        </CardFooter>
      </Card>
    </OnboardingTooltip>
  );
};

export default ViewerControls;
