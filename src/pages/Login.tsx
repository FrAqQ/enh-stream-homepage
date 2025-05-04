
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/LanguageContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();

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
      confirmEmail: "Please confirm your email address first."
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
      confirmEmail: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse."
    }
  };

  const t = translations[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        
        // Specific message for unconfirmed email
        if (error.message === "Email not confirmed") {
          toast({
            title: t.emailNotConfirmed,
            description: t.confirmEmail,
            variant: "destructive"
          });
          return;
        }

        // General error message
        toast({
          title: t.loginFailed,
          description: t.checkCredentials,
          variant: "destructive"
        });
        return;
      }

      console.log("Login successful:", data);
      toast({
        title: "Erfolg",
        description: t.loginSuccess,
      });
      
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 bg-card/50 backdrop-blur">
        <h1 className="text-2xl font-bold text-center mb-6">{t.title}</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button 
            className="w-full" 
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
