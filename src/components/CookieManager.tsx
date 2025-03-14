
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { CookieConsent } from "@/components/CookieConsent";
import { 
  saveCookieConsent, 
  getCookieConsentStatus, 
  getCookieConsent 
} from "@/lib/cookieManager";

/**
 * Component to manage cookie settings and provide a button to open cookie settings
 */
export function CookieManager() {
  const { language } = useLanguage();
  const [showDialog, setShowDialog] = useState(false);
  
  const translations = {
    en: {
      manageCookies: "Manage Cookies"
    },
    de: {
      manageCookies: "Cookie-Einstellungen"
    }
  };

  const t = translations[language];

  return (
    <>
      <CookieConsent />
    </>
  );
}

/**
 * Button component to open cookie settings dialog
 */
export function CookieSettingsButton() {
  const { language } = useLanguage();
  const [showDialog, setShowDialog] = useState(false);
  
  const translations = {
    en: {
      manageCookies: "Manage Cookies"
    },
    de: {
      manageCookies: "Cookie-Einstellungen"
    }
  };

  const t = translations[language];

  const handleOpenDialog = () => {
    // Display the dialog by simulating a "pending" state
    const currentConsent = getCookieConsent();
    // Save current settings with "pending" status to trigger the dialog
    saveCookieConsent('pending', currentConsent);
    // Force a reload to show the dialog
    window.location.reload();
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleOpenDialog}
      className="text-xs"
    >
      {t.manageCookies}
    </Button>
  );
}
