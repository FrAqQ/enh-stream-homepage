
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/LanguageContext";
import { needsConsentPrompt, saveCookieConsent, getCookieConsent, ConsentStatus, CookieConsent as ConsentSettings } from "@/lib/cookieManager";

export function CookieConsent() {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [consent, setConsent] = useState<ConsentSettings>({
    analytics: true,
    preferences: true,
    marketing: false
  });

  // Check if we need to show the consent dialog
  useEffect(() => {
    const checkConsent = () => {
      if (needsConsentPrompt()) {
        setOpen(true);
        // Initialize with existing values if any
        setConsent(getCookieConsent());
      }
    };
    
    // Short delay to avoid showing immediately on page load
    const timer = setTimeout(checkConsent, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = () => {
    const allConsent: ConsentSettings = {
      analytics: true,
      preferences: true,
      marketing: true
    };
    saveCookieConsent('accepted', allConsent);
    setOpen(false);
  };

  const handleRejectAll = () => {
    saveCookieConsent('rejected');
    setOpen(false);
  };

  const handleSavePreferences = () => {
    saveCookieConsent('accepted', consent);
    setOpen(false);
  };

  const toggleConsent = (key: keyof ConsentSettings) => {
    setConsent(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const translations = {
    en: {
      title: "Cookie Preferences",
      description: "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking 'Accept All', you consent to our use of cookies.",
      essential: "Essential Cookies",
      essentialDescription: "These cookies are necessary for the website to function and cannot be disabled.",
      analytics: "Analytics Cookies",
      analyticsDescription: "These cookies help us understand how visitors interact with the website, and help us improve it.",
      preferences: "Preferences Cookies",
      preferencesDescription: "These cookies allow the website to remember choices you make and provide enhanced features.",
      marketing: "Marketing Cookies",
      marketingDescription: "These cookies are used to track visitors across websites to display relevant advertisements.",
      acceptAll: "Accept All",
      rejectAll: "Reject All",
      customize: "Customize",
      save: "Save Preferences"
    },
    de: {
      title: "Cookie-Einstellungen",
      description: "Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern, personalisierte Inhalte anzuzeigen und unseren Datenverkehr zu analysieren. Durch Klicken auf 'Alle akzeptieren' stimmen Sie der Verwendung von Cookies zu.",
      essential: "Essentielle Cookies",
      essentialDescription: "Diese Cookies sind für das Funktionieren der Website erforderlich und können nicht deaktiviert werden.",
      analytics: "Analytische Cookies",
      analyticsDescription: "Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, und helfen uns, sie zu verbessern.",
      preferences: "Präferenz-Cookies",
      preferencesDescription: "Diese Cookies ermöglichen es der Website, sich an Entscheidungen zu erinnern, die Sie treffen, und erweiterte Funktionen anzubieten.",
      marketing: "Marketing-Cookies",
      marketingDescription: "Diese Cookies werden verwendet, um Besucher über Websites hinweg zu verfolgen, um relevante Werbung anzuzeigen.",
      acceptAll: "Alle akzeptieren",
      rejectAll: "Alle ablehnen",
      customize: "Anpassen",
      save: "Einstellungen speichern"
    }
  };

  const t = translations[language];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>
            {t.description}
          </DialogDescription>
        </DialogHeader>
        
        {showCustomize ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">{t.essential}</div>
                <div className="text-sm text-muted-foreground">{t.essentialDescription}</div>
              </div>
              <Switch checked={true} disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">{t.analytics}</div>
                <div className="text-sm text-muted-foreground">{t.analyticsDescription}</div>
              </div>
              <Switch 
                checked={consent.analytics} 
                onCheckedChange={() => toggleConsent('analytics')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">{t.preferences}</div>
                <div className="text-sm text-muted-foreground">{t.preferencesDescription}</div>
              </div>
              <Switch 
                checked={consent.preferences} 
                onCheckedChange={() => toggleConsent('preferences')} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">{t.marketing}</div>
                <div className="text-sm text-muted-foreground">{t.marketingDescription}</div>
              </div>
              <Switch 
                checked={consent.marketing} 
                onCheckedChange={() => toggleConsent('marketing')} 
              />
            </div>
          </div>
        ) : null}
        
        <DialogFooter className="flex flex-col sm:flex-row sm:space-x-2">
          {showCustomize ? (
            <Button onClick={handleSavePreferences} className="w-full">{t.save}</Button>
          ) : (
            <>
              <Button onClick={handleRejectAll} variant="outline" className="w-full mb-2 sm:mb-0">
                {t.rejectAll}
              </Button>
              <Button onClick={() => setShowCustomize(true)} variant="outline" className="w-full mb-2 sm:mb-0">
                {t.customize}
              </Button>
              <Button onClick={handleAcceptAll} className="w-full">
                {t.acceptAll}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
