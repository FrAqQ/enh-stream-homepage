
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/LanguageContext";
import { OnboardingTooltip } from "@/components/ui/onboarding-tooltip";
import { useUser } from "@/lib/useUser";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useUser();

  // Überarbeitete Session-Prüfung mit Schutz vor Endlosschleifen
  useEffect(() => {
    let isMounted = true;
    
    const checkExistingSession = async () => {
      console.log("[Login] Prüfe auf bestehende Session...");
      
      // Wenn bereits eine Weiterleitung versucht wurde, beenden
      if (redirectAttempted) {
        if (isMounted) setCheckingSession(false);
        return;
      }
      
      try {
        // Wenn user bereits geladen ist (über useUser Hook)
        if (user) {
          console.log("[Login] Bereits eingeloggt über useUser, leite weiter...");
          if (isMounted) {
            setRedirectAttempted(true);
            navigate("/dashboard", { replace: true });
          }
          return;
        }
        
        // Manuelle Session-Prüfung
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && !redirectAttempted) {
          console.log("[Login] Bereits eingeloggt über Session-Check, leite weiter...");
          if (isMounted) {
            setRedirectAttempted(true);
            navigate("/dashboard", { replace: true });
          }
        }
      } catch (error) {
        console.error("[Login] Session check error:", error);
      } finally {
        if (isMounted) setCheckingSession(false);
      }
    };
    
    // Nur einmal beim Mounten prüfen
    checkExistingSession();
    
    return () => {
      isMounted = false;
    };
  }, [navigate, redirectAttempted, user]);

  const translations = {
    en: {
      title: "Login",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password",
      loginButton: "Login",
      loginLoading: "Logging in...",
      loginSuccess: "Successfully logged in",
      loginFailed: "Login failed",
      checkCredentials: "Please check your credentials and try again.",
      emailNotConfirmed: "Email not confirmed",
      confirmEmail: "Please confirm your email address first.",
      emailTooltip: "Enter the email address you used during registration.",
      passwordTooltip: "Enter your password to access your account."
    },
    de: {
      title: "Anmelden",
      emailPlaceholder: "E-Mail",
      passwordPlaceholder: "Passwort",
      loginButton: "Anmelden",
      loginLoading: "Anmeldung läuft...",
      loginSuccess: "Sie wurden erfolgreich eingeloggt",
      loginFailed: "Login fehlgeschlagen",
      checkCredentials: "Bitte überprüfen Sie Ihre Anmeldedaten und versuchen Sie es erneut.",
      emailNotConfirmed: "E-Mail nicht bestätigt",
      confirmEmail: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.",
      emailTooltip: "Geben Sie die E-Mail-Adresse ein, die Sie bei der Registrierung verwendet haben.",
      passwordTooltip: "Geben Sie Ihr Passwort ein, um auf Ihr Konto zuzugreifen."
    }
  };

  const t = translations[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Login] Login-Formular gesendet");
    setIsLoading(true);

    try {
      console.log("[Login] Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[Login] Login error:", error);
        
        // Specific message for unconfirmed email
        if (error.message === "Email not confirmed") {
          toast({
            title: t.emailNotConfirmed,
            description: t.confirmEmail,
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        // General error message
        toast({
          title: t.loginFailed,
          description: t.checkCredentials,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      console.log("[Login] Login erfolgreich, Nutzerdaten:", data);
      
      // Erfolgsmeldung anzeigen
      toast({
        title: "Success",
        description: t.loginSuccess,
      });
      
      // Zeitverzögerung hinzufügen, um sicherzustellen, dass die Seite bereit ist
      setTimeout(() => {
        setIsLoading(false);
        setRedirectAttempted(true);
        navigate("/dashboard", { replace: true });
      }, 500);
      
    } catch (error) {
      console.error("[Login] Unexpected login error:", error);
      toast({
        title: t.loginFailed,
        description: t.checkCredentials,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Wenn die Sitzung noch geprüft wird, zeigen wir einen Ladeindikator
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Lädt...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 md:pt-24 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-4 md:p-6 bg-card/50 backdrop-blur shadow-lg">
        <h1 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">{t.title}</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <OnboardingTooltip
              id="login-email-tooltip"
              content={{
                en: t.emailTooltip,
                de: t.emailTooltip
              }}
              position="top"
            >
              <Input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </OnboardingTooltip>
          </div>
          <div>
            <OnboardingTooltip
              id="login-password-tooltip"
              content={{
                en: t.passwordTooltip,
                de: t.passwordTooltip
              }}
              position="bottom"
            >
              <Input
                type="password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="transition-all focus:ring-2 focus:ring-primary"
              />
            </OnboardingTooltip>
          </div>
          <Button 
            className="w-full transition-all hover:scale-[1.02]" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? t.loginLoading : t.loginButton}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
