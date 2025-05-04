
import React from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  fullScreen?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function LoadingOverlay({ 
  isLoading, 
  text = "Loading...", 
  fullScreen = false,
  className,
  children
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

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
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          {text && <p className="text-foreground">{text}</p>}
        </div>
      </div>
    </div>
  );
}
