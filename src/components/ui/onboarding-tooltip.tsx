
import React, { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";

interface OnboardingTooltipProps {
  id: string;
  content: {
    en: string;
    de: string;
  };
  children: React.ReactNode;
  position?: "top" | "right" | "bottom" | "left";
}

export const OnboardingTooltip = ({ 
  id, 
  content, 
  children, 
  position = "top" 
}: OnboardingTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { language } = useLanguage();
  
  useEffect(() => {
    // Check if this tooltip has been seen before
    const seenTooltips = JSON.parse(localStorage.getItem("seenTooltips") || "[]");
    if (!seenTooltips.includes(id)) {
      setIsOpen(true);
    } else {
      setDismissed(true);
    }
  }, [id]);

  const handleDismiss = () => {
    setIsOpen(false);
    setDismissed(true);
    
    // Save that this tooltip has been seen
    const seenTooltips = JSON.parse(localStorage.getItem("seenTooltips") || "[]");
    if (!seenTooltips.includes(id)) {
      seenTooltips.push(id);
      localStorage.setItem("seenTooltips", JSON.stringify(seenTooltips));
    }
  };

  if (dismissed) {
    return <>{children}</>;
  }

  const tooltipText = language === "en" ? content.en : content.de;

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <div className="tooltip-trigger">{children}</div>
        </TooltipTrigger>
        <TooltipContent 
          side={position} 
          className="p-4 max-w-xs bg-card border-primary shadow-lg animate-fade-in"
        >
          <div className="space-y-2">
            <p>{tooltipText}</p>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleDismiss}>
                {language === "en" ? "Got it" : "Verstanden"}
              </Button>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
