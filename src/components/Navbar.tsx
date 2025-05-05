
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
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Menu, Settings, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { PersonalizationPanel } from "./PersonalizationPanel";
import { useOnboarding } from "@/lib/OnboardingContext";
import { OnboardingTooltip } from "./ui/onboarding-tooltip";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user } = useUser();
  const { language } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const { resetOnboarding } = useOnboarding();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      setIsAdmin(profile?.is_admin || false);
    };

    checkAdminStatus();
  }, [user]);

  const handleChatRequest = async () => {
    if (!user) {
      toast.error(language === 'en' ? 'Please login to chat with us' : 'Bitte melden Sie sich an, um mit uns zu chatten');
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

  // Verbesserte Logout-Funktion mit Feedback und Weiterleitung
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error(language === 'en' ? 'Error signing out' : 'Fehler beim Abmelden');
        return;
      }
      
      // Erfolgsmeldung anzeigen
      toast.success(language === 'en' ? 'Successfully signed out' : 'Erfolgreich abgemeldet');
      
      // Zur Startseite navigieren
      navigate('/');
    } catch (error) {
      console.error("Unexpected logout error:", error);
      toast.error(language === 'en' ? 'Error signing out' : 'Fehler beim Abmelden');
    }
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

  const closeSheet = () => {
    setIsSheetOpen(false);
  };

  const NavLinks = () => (
    <>
      <Link to="/dashboard" className="text-foreground/80 hover:text-foreground">
        {t.dashboard}
      </Link>
      
      {isAdmin && (
        <Link to="/admin" className="text-foreground/80 hover:text-foreground">
          {t.admin}
        </Link>
      )}
      
      <Link to="/pricing" className="text-foreground/80 hover:text-foreground">
        {t.pricing}
      </Link>
    </>
  );

  const AuthButtons = ({ inMobileMenu = false }) => (
    <>
      {!user ? (
        <div className={`flex ${inMobileMenu ? "flex-col w-full gap-3" : "items-center gap-2"}`}>
          <Link to="/login" onClick={inMobileMenu ? closeSheet : undefined}>
            <Button variant={inMobileMenu ? "outline" : "ghost"} className={inMobileMenu ? "w-full justify-start" : ""}>
              {t.login}
            </Button>
          </Link>
          <Link to="/register" onClick={inMobileMenu ? closeSheet : undefined}>
            <Button className={inMobileMenu ? "w-full justify-start" : ""}>
              {t.register}
            </Button>
          </Link>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.user_metadata.avatar_url} />
                <AvatarFallback>
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/profile">{t.profile}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsPersonalizationOpen(true)}>
              {t.personalize}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={resetOnboarding}>
              {t.restartOnboarding}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              {t.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          Enhance Stream
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavLinks />
          
          <Button variant="outline" onClick={() => setIsChatOpen(true)}>
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
              <Button size="icon" variant="outline">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t.menu}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <div className="flex flex-col gap-6 py-6">
                <div className="flex flex-col gap-4">
                  <NavLinks />
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsChatOpen(true);
                      closeSheet();
                    }}
                    className="justify-start"
                  >
                    {t.chatWithUs}
                  </Button>

                  {user && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsPersonalizationOpen(true);
                        closeSheet();
                      }}
                      className="justify-start"
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
