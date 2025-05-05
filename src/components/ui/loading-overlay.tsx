
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
  loadingTimeout = 8000 // 8 Sekunden Standardtimeout
}: LoadingOverlayProps) {
  const [showTimeout, setShowTimeout] = React.useState(false);
  
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (isLoading) {
      // Timer starten, nach dem die Timeout-UI angezeigt wird
      timer = setTimeout(() => {
        setShowTimeout(true);
      }, loadingTimeout);
    } else {
      setShowTimeout(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, loadingTimeout]);
  
  if (!isLoading && !error) return <>{children}</>;

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
                <Button onClick={onRetry} className="mt-2" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
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
                  <p className="text-muted-foreground text-sm mt-2">
                    Das dauert länger als erwartet...
                  </p>
                )}
              </div>
              {showTimeout && onRetry && (
                <Button onClick={onRetry} className="mt-2" variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
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
