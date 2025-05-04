
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/LanguageContext";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Registration",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password",
      registerButton: "Register",
      registering: "Registering...",
      registerSuccess: "Registration successful! You can log in now.",
      registerFailed: "Registration failed",
      unexpectedError: "An unexpected error occurred. Please try again later."
    },
    de: {
      title: "Registrierung",
      emailPlaceholder: "E-Mail",
      passwordPlaceholder: "Passwort",
      registerButton: "Registrieren",
      registering: "Registriere...",
      registerSuccess: "Registrierung erfolgreich! Sie können sich jetzt einloggen.",
      registerFailed: "Registrierung fehlgeschlagen",
      unexpectedError: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
    }
  };

  const t = translations[language];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Starting registration for:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/login'
        }
      });

      if (error) {
        console.error("Registration error details:", error);
        toast({
          title: t.registerFailed,
          description: `Fehler: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (data?.user) {
        console.log("Registration successful, user data:", data.user);
        toast({
          title: "Erfolg",
          description: t.registerSuccess,
        });
        navigate("/login");
      }
    } catch (err) {
      console.error("Unexpected error during registration:", err);
      toast({
        title: t.registerFailed,
        description: t.unexpectedError,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 bg-card/50 backdrop-blur">
        <h1 className="text-2xl font-bold text-center mb-6">{t.title}</h1>
        <form onSubmit={handleRegister} className="space-y-4">
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
            {isLoading ? t.registering : t.registerButton}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Register;
