
import { useEffect, useState } from "react";
import { useUser } from "@/lib/useUser";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Menu, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { PersonalizationPanel } from "./PersonalizationPanel";
import { useOnboarding } from "@/lib/OnboardingContext";
import { OnboardingTooltip } from "./ui/onboarding-tooltip";

const Navbar = () => {
  const { user, logout } = useUser();
  const { language } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const { resetOnboarding } = useOnboarding();
  const navigate = useNavigate();

  // Debug-Ausgabe beim Rendern
  useEffect(() => {
    console.log("[Navbar] Gerendert - User-Status:", !!user);
    console.log("[Navbar] Navigate Funktion verfügbar:", !!navigate);
    console.log("[Navbar] User-Objekt:", user);
  }, [user, navigate]);

  // Überarbeitete Admin-Status-Prüfung mit Abhängigkeit von user
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        console.log("[Navbar] Admin-Status geprüft:", profile?.is_admin || false);
        setIsAdmin(profile?.is_admin || false);
      } catch (error) {
        console.error("[Navbar] Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleChatRequest = async () => {
    if (!user) {
      toast(language === 'en' ? 'Please login to chat with us' : 'Bitte melden Sie sich an, um mit uns zu chatten');
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_requests')
        .insert([{ user_id: user.id, message }]);

      if (error) throw error;

      toast.success(language === 'en' ? 'Chat request sent' : 'Chat-Anfrage wurde gesendet');
      setIsChatOpen(false);
      setMessage("");
    } catch (error) {
      toast.error(language === 'en' ? 'Error sending chat request' : 'Fehler beim Senden der Chat-Anfrage');
    }
  };

  // Direkte Navigation mit festen Callback-Funktionen
  const handleLogout = async () => {
    try {
      console.log("[Navbar] Logout Funktion gestartet");
      await logout();
      console.log("[Navbar] Logout erfolgreich, navigiere zur Startseite");
      toast.success(language === 'en' ? 'Successfully signed out' : 'Erfolgreich abgemeldet');
      navigate('/');
    } catch (error) {
      console.error("[Navbar] Logout error:", error);
      toast.error(language === 'en' ? 'Error signing out' : 'Fehler beim Abmelden');
    }
  };

  // Direkte Navigation für alle Bereiche
  const handleLoginClick = () => {
    console.log("[Navbar] Navigation zu /login");
    navigate("/login");
  };

  const handleRegisterClick = () => {
    console.log("[Navbar] Navigation zu /register");
    navigate("/register");
  };
  
  const handleProfileClick = () => {
    console.log("[Navbar] Navigation zu /profile");
    navigate("/profile");
  };

  const handleDashboardClick = () => {
    console.log("[Navbar] Navigation zu /dashboard");
    navigate("/dashboard");
  };

  const handlePricingClick = () => {
    console.log("[Navbar] Navigation zu /pricing");
    navigate("/pricing");
  };

  const handleAdminClick = () => {
    console.log("[Navbar] Navigation zu /admin");
    navigate("/admin");
  };

  const handleHomeClick = () => {
    console.log("[Navbar] Navigation zur Startseite");
    navigate("/");
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
  };

  const translations = {
    en: {
      dashboard: "Dashboard",
      admin: "Admin Dashboard",
      pricing: "Pricing",
      login: "Login",
      register: "Register",
      profile: "Profile",
      logout: "Logout",
      chatWithUs: "Support Chat",
      sendRequest: "Send request",
      chatMessage: "How can we help you?",
      menu: "Menu",
      personalize: "Personalize",
      restartOnboarding: "Restart Onboarding",
      personalizeTooltip: "Customize your experience with themes and colors"
    },
    de: {
      dashboard: "Dashboard",
      admin: "Admin Dashboard",
      pricing: "Preise",
      login: "Anmelden",
      register: "Registrieren",
      profile: "Profil",
      logout: "Abmelden",
      chatWithUs: "Support Chat",
      sendRequest: "Anfrage senden",
      chatMessage: "Wie können wir Ihnen helfen?",
      menu: "Menü",
      personalize: "Personalisieren",
      restartOnboarding: "Onboarding neu starten",
      personalizeTooltip: "Passen Sie Ihr Erlebnis mit Themes und Farben an"
    }
  };

  const t = translations[language];

  // Navigations-Links mit direkten Klick-Handlern
  const NavLinks = () => (
    <>
      <Button 
        variant="ghost" 
        onClick={handleDashboardClick}
        className="text-foreground/80 hover:text-foreground"
        type="button"
      >
        {t.dashboard}
      </Button>
      
      {isAdmin && (
        <Button 
          variant="ghost" 
          onClick={handleAdminClick} 
          className="text-foreground/80 hover:text-foreground"
          type="button"
        >
          {t.admin}
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        onClick={handlePricingClick} 
        className="text-foreground/80 hover:text-foreground"
        type="button"
      >
        {t.pricing}
      </Button>
    </>
  );

  // Login/Register Buttons mit expliziten Handlern
  const renderLoginButtons = (inMobileMenu = false) => {
    return (
      <div 
        className={`flex ${inMobileMenu ? "flex-col w-full gap-3" : "items-center gap-2"}`}
      >
        <Button 
          variant={inMobileMenu ? "outline" : "ghost"} 
          className={inMobileMenu ? "w-full justify-start" : ""}
          onClick={handleLoginClick}
          type="button"
        >
          {t.login}
        </Button>
        <Button 
          className={inMobileMenu ? "w-full justify-start" : ""} 
          onClick={handleRegisterClick}
          type="button"
        >
          {t.register}
        </Button>
      </div>
    );
  };

  // Profilmenü mit expliziten Handlern
  const AuthButtons = ({ inMobileMenu = false }) => {
    if (!user) {
      return renderLoginButtons(inMobileMenu);
    }
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full" type="button">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => handleProfileClick()}>
            {t.profile}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsPersonalizationOpen(true)}>
            {t.personalize}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => resetOnboarding()}>
            {t.restartOnboarding}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => handleLogout()}>
            {t.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={handleHomeClick} 
          className="text-xl font-bold text-primary p-0"
          type="button"
        >
          Enhance Stream
        </Button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavLinks />
          
          <Button variant="outline" onClick={() => setIsChatOpen(true)} type="button">
            {t.chatWithUs}
          </Button>

          {user && (
            <OnboardingTooltip
              id="personalize-tooltip"
              content={{
                en: t.personalizeTooltip,
                de: t.personalizeTooltip
              }}
              position="bottom"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsPersonalizationOpen(true)}
                className="relative"
                type="button"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">{t.personalize}</span>
              </Button>
            </OnboardingTooltip>
          )}

          <LanguageSwitcher />
          
          <AuthButtons />
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          
          {!isMobile && <AuthButtons />}
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" type="button">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t.menu}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <div className="flex flex-col gap-6 py-6">
                <div className="flex flex-col gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      closeSheet();
                      handleDashboardClick();
                    }} 
                    className="justify-start"
                    type="button"
                  >
                    {t.dashboard}
                  </Button>
                  
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        closeSheet();
                        handleAdminClick();
                      }} 
                      className="justify-start"
                      type="button"
                    >
                      {t.admin}
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      closeSheet();
                      handlePricingClick();
                    }} 
                    className="justify-start"
                    type="button"
                  >
                    {t.pricing}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      closeSheet();
                      setIsChatOpen(true);
                    }}
                    className="justify-start"
                    type="button"
                  >
                    {t.chatWithUs}
                  </Button>

                  {user && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        closeSheet();
                        setIsPersonalizationOpen(true);
                      }}
                      className="justify-start"
                      type="button"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {t.personalize}
                    </Button>
                  )}
                </div>
                
                <div className="mt-auto border-t pt-4">
                  {isMobile && <AuthButtons inMobileMenu={true} />}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.chatMessage}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={t.chatMessage}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={handleChatRequest} type="button">{t.sendRequest}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Personalization Panel */}
      <PersonalizationPanel 
        open={isPersonalizationOpen} 
        onOpenChange={setIsPersonalizationOpen} 
      />
    </nav>
  );
};

export default Navbar;
