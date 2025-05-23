
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
import { useNavigate, Link } from "react-router-dom";
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
  const { user, logout, profile } = useUser();
  // Admin-Status aus dem Profil abrufen und Debug-Log hinzufügen
  const isAdmin = profile?.is_admin === true;
  
  console.log("[Navbar] Profil geladen:", {
    profile,
    isAdmin,
    hasAdminField: profile ? 'is_admin' in profile : false
  });
  
  const { language } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const { resetOnboarding } = useOnboarding();
  const navigate = useNavigate();

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

  // Function to handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    // Close the sheet if it's open
    if (isSheetOpen) {
      setIsSheetOpen(false);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    const { success } = await logout();
    if (success) {
      toast.success(language === 'en' ? "Logged out successfully" : "Erfolgreich abgemeldet");
      navigate('/');
    } else {
      toast.error(language === 'en' ? "Failed to log out" : "Abmelden fehlgeschlagen");
    }
  };

  // Handle chat request submission
  const handleChatRequest = () => {
    if (!message.trim()) {
      toast.error(language === 'en' ? "Please enter a message" : "Bitte geben Sie eine Nachricht ein");
      return;
    }

    // Here you would typically send the message to your support system
    // For now, we'll just show a success toast and close the dialog
    toast.success(
      language === 'en' 
        ? "Your support request has been sent. We'll get back to you soon." 
        : "Ihre Support-Anfrage wurde gesendet. Wir melden uns in Kürze bei Ihnen."
    );
    
    setMessage("");
    setIsChatOpen(false);
  };

  // Navigation links with improved handling
  const NavLinks = () => (
    <>
      {user && (
        <Button 
          variant="ghost" 
          onClick={() => handleNavigation('/dashboard')}
          className="text-foreground/80 hover:text-foreground"
          type="button"
        >
          {t.dashboard}
        </Button>
      )}
      
      {isAdmin && (
        <Button 
          variant="ghost" 
          onClick={() => handleNavigation('/admin')}
          className="text-foreground/80 hover:text-foreground"
          type="button"
        >
          {t.admin}
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        onClick={() => handleNavigation('/pricing')}
        className="text-foreground/80 hover:text-foreground"
        type="button"
      >
        {t.pricing}
      </Button>
    </>
  );

  // Login/Register Buttons with improved handling
  const renderLoginButtons = (inMobileMenu = false) => {
    return (
      <div 
        className={`flex ${inMobileMenu ? "flex-col w-full gap-3" : "items-center gap-2"}`}
      >
        <Button 
          variant={inMobileMenu ? "outline" : "ghost"} 
          className={inMobileMenu ? "w-full justify-start" : ""}
          onClick={() => handleNavigation('/login')}
          type="button"
        >
          {t.login}
        </Button>
        <Button 
          className={inMobileMenu ? "w-full justify-start" : ""} 
          onClick={() => handleNavigation('/register')}
          type="button"
        >
          {t.register}
        </Button>
      </div>
    );
  };

  // Profile menu for logged in users
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
          <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
            {t.profile}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsPersonalizationOpen(true)}>
            {t.personalize}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => resetOnboarding()}>
            {t.restartOnboarding}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
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
          onClick={() => handleNavigation('/')}
          className="text-xl font-bold text-primary p-0"
          type="button"
        >
          Enhance Stream
        </Button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavLinks />
          
          <Button 
            variant="outline" 
            onClick={() => setIsChatOpen(true)}
            type="button"
          >
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
                  {user && (
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setIsSheetOpen(false);
                        handleNavigation('/dashboard');
                      }}
                      className="justify-start"
                      type="button"
                    >
                      {t.dashboard}
                    </Button>
                  )}
                  
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setIsSheetOpen(false);
                        handleNavigation('/admin');
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
                      setIsSheetOpen(false);
                      handleNavigation('/pricing');
                    }}
                    className="justify-start"
                    type="button"
                  >
                    {t.pricing}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsSheetOpen(false);
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
                        setIsSheetOpen(false);
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
            <Button onClick={handleChatRequest}>{t.sendRequest}</Button>
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
