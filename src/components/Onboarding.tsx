
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/OnboardingContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Users, Activity, MessageSquare, Clock, Settings } from "lucide-react";

export const Onboarding = () => {
  const { showOnboarding, currentStep, totalSteps, nextStep, prevStep, skipOnboarding } = useOnboarding();
  const { language } = useLanguage();

  const onboardingContent = {
    en: [
      {
        title: "Welcome to Enhance Stream",
        description: "Let's take a quick tour to help you get started with our platform.",
        icon: <Settings className="h-8 w-8 text-primary mb-2" />
      },
      {
        title: "Dashboard Overview",
        description: "The Dashboard gives you a quick overview of your streaming performance and key metrics.",
        icon: <Activity className="h-8 w-8 text-primary mb-2" />
      },
      {
        title: "Viewer Controls",
        description: "Use the viewer controls to adjust your viewer count and enhance your stream visibility. You can add viewers, set up auto-stop timers, and monitor limits.",
        icon: <Users className="h-8 w-8 text-primary mb-2" />
      },
      {
        title: "Chatter Management",
        description: "Control chat engagement by adding active chatters to your stream. This makes your stream appear more lively and interactive.",
        icon: <MessageSquare className="h-8 w-8 text-primary mb-2" />
      },
      {
        title: "Stream Analytics",
        description: "Track your performance over time with detailed graphs and stats. See how your stream is growing and identify the best times to go live.",
        icon: <Clock className="h-8 w-8 text-primary mb-2" />
      }
    ],
    de: [
      {
        title: "Willkommen bei Enhance Stream",
        description: "Wir führen Sie in einer kurzen Tour durch unsere Plattform.",
        icon: <Settings className="h-8 w-8 text-primary mb-2" />
      },
      {
        title: "Dashboard Übersicht",
        description: "Das Dashboard bietet Ihnen einen schnellen Überblick über Ihre Streaming-Leistung und wichtige Kennzahlen.",
        icon: <Activity className="h-8 w-8 text-primary mb-2" />
      },
      {
        title: "Zuschauer-Steuerung",
        description: "Nutzen Sie die Zuschauer-Steuerung, um Ihre Zuschauerzahlen anzupassen und die Sichtbarkeit Ihres Streams zu verbessern. Sie können Zuschauer hinzufügen, Auto-Stop-Timer einrichten und Limits überwachen.",
        icon: <Users className="h-8 w-8 text-primary mb-2" />
      },
      {
        title: "Chatter-Verwaltung",
        description: "Steuern Sie die Chat-Aktivität, indem Sie aktive Chatter zu Ihrem Stream hinzufügen. Dies macht Ihren Stream lebendiger und interaktiver.",
        icon: <MessageSquare className="h-8 w-8 text-primary mb-2" />
      },
      {
        title: "Stream-Analytik",
        description: "Verfolgen Sie Ihre Leistung im Zeitverlauf mit detaillierten Grafiken und Statistiken. Sehen Sie, wie Ihr Stream wächst und identifizieren Sie die besten Zeiten für Ihre Übertragungen.",
        icon: <Clock className="h-8 w-8 text-primary mb-2" />
      }
    ]
  };

  const content = onboardingContent[language][currentStep];

  if (!showOnboarding) return null;

  return (
    <Dialog open={showOnboarding} onOpenChange={skipOnboarding}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            {content.icon}
          </div>
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{content.title}</h2>
            <div className="text-sm text-muted-foreground">
              {currentStep + 1} / {totalSteps}
            </div>
          </div>
          <p>{content.description}</p>
          
          <div className="progress-bar w-full h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-out" 
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between pt-4">
            <div>
              {currentStep > 0 && (
                <Button variant="outline" onClick={prevStep}>
                  {language === "en" ? "Back" : "Zurück"}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={skipOnboarding}>
                {language === "en" ? "Skip" : "Überspringen"}
              </Button>
              <Button onClick={nextStep}>
                {currentStep < totalSteps - 1 
                  ? (language === "en" ? "Next" : "Weiter") 
                  : (language === "en" ? "Finish" : "Fertig")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
