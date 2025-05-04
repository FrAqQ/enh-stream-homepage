
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/OnboardingContext";
import { useLanguage } from "@/lib/LanguageContext";

export const Onboarding = () => {
  const { showOnboarding, currentStep, totalSteps, nextStep, prevStep, skipOnboarding } = useOnboarding();
  const { language } = useLanguage();

  const onboardingContent = {
    en: [
      {
        title: "Welcome to Enhance Stream",
        description: "Let's take a quick tour to help you get started with our platform."
      },
      {
        title: "Dashboard Overview",
        description: "The Dashboard gives you a quick overview of your streaming performance and viewer statistics."
      },
      {
        title: "Viewer Controls",
        description: "Use the viewer controls to adjust your viewer count and enhance your stream visibility."
      },
      {
        title: "Personalization",
        description: "Customize your experience by changing themes and rearranging your dashboard."
      },
      {
        title: "Ready to Start!",
        description: "You're all set! Explore the platform and boost your streaming experience."
      }
    ],
    de: [
      {
        title: "Willkommen bei Enhance Stream",
        description: "Wir führen Sie in einer kurzen Tour durch unsere Plattform."
      },
      {
        title: "Dashboard Übersicht",
        description: "Das Dashboard bietet Ihnen einen schnellen Überblick über Ihre Streaming-Leistung und Zuschauer-Statistiken."
      },
      {
        title: "Zuschauer-Steuerung",
        description: "Nutzen Sie die Zuschauer-Steuerung, um Ihre Zuschauerzahlen anzupassen und die Sichtbarkeit Ihres Streams zu verbessern."
      },
      {
        title: "Personalisierung",
        description: "Passen Sie Ihre Erfahrung an, indem Sie Themes ändern und Ihr Dashboard neu anordnen."
      },
      {
        title: "Bereit zum Start!",
        description: "Sie sind startklar! Erkunden Sie die Plattform und verbessern Sie Ihr Streaming-Erlebnis."
      }
    ]
  };

  const content = onboardingContent[language][currentStep];

  if (!showOnboarding) return null;

  return (
    <Dialog open={showOnboarding} onOpenChange={skipOnboarding}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
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
