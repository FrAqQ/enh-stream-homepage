
import React from "react";
import { Loader, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  fullScreen?: boolean;
  className?: string;
  children?: React.ReactNode;
  error?: Error | null;
  onRetry?: () => void;
  loadingTimeout?: number; // Zeit in ms bevor Timeout-UI angezeigt wird
}

export function LoadingOverlay({ 
  isLoading, 
  text = "Loading...", 
  fullScreen = false,
  className,
  children,
  error,
  onRetry,
  loadingTimeout = 5000 // 5 Sekunden Standardtimeout
}: LoadingOverlayProps) {
  const [showTimeout, setShowTimeout] = React.useState(false);
  const [secondsWaiting, setSecondsWaiting] = React.useState(0);
  
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let secondsTimer: ReturnType<typeof setInterval>;
    
    if (isLoading) {
      // Timer starten, nach dem die Timeout-UI angezeigt wird
      timer = setTimeout(() => {
        setShowTimeout(true);
      }, loadingTimeout);
      
      // Sekunden-Counter aktualisieren
      secondsTimer = setInterval(() => {
        setSecondsWaiting(prev => prev + 1);
      }, 1000);
    } else {
      setShowTimeout(false);
      setSecondsWaiting(0);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
      if (secondsTimer) clearInterval(secondsTimer);
    };
  }, [isLoading, loadingTimeout]);
  
  if (!isLoading && !error) return <>{children}</>;

  // Funktion, die garantiert, dass onRetry aufgerufen wird
  const handleRetry = () => {
    if (onRetry) {
      console.log("Retry button clicked, calling onRetry function");
      onRetry();
    } else {
      console.warn("Retry button clicked, but no onRetry function provided");
    }
  };

  return (
    <div className={cn(
      "relative",
      fullScreen && "fixed inset-0 z-50",
      className
    )}>
      {children && <div className="opacity-50">{children}</div>}
      
      <div className={cn(
        "flex flex-col items-center justify-center",
        fullScreen ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50" : 
        "absolute inset-0 bg-background/50 backdrop-blur-sm"
      )}>
        <div className="flex flex-col items-center space-y-4 p-4 rounded-lg bg-background/80 shadow-lg">
          {error ? (
            <>
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-foreground font-medium">Ein Fehler ist aufgetreten</p>
              <p className="text-muted-foreground text-sm max-w-md text-center">
                {error.message || "Beim Laden der Daten gab es ein Problem."}
              </p>
              {onRetry && (
                <Button onClick={handleRetry} className="mt-2 gap-2" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Erneut versuchen
                </Button>
              )}
            </>
          ) : (
            <>
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <div className="flex flex-col items-center">
                <p className="text-foreground">{text}</p>
                {showTimeout && (
                  <div className="flex flex-col items-center mt-2">
                    <p className="text-muted-foreground text-sm">
                      Das dauert länger als erwartet...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Warte seit {secondsWaiting}s)
                    </p>
                  </div>
                )}
              </div>
              {showTimeout && onRetry && (
                <Button 
                  onClick={handleRetry}
                  className="mt-2 gap-2" 
                  variant="outline" 
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Neu laden
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
