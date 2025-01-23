import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        
        // Spezifische Fehlermeldung für nicht bestätigte E-Mail
        if (error.message === "Email not confirmed") {
          toast({
            title: "E-Mail nicht bestätigt",
            description: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.",
            variant: "destructive"
          });
          return;
        }

        // Allgemeine Fehlermeldung
        toast({
          title: "Login fehlgeschlagen",
          description: "Bitte überprüfen Sie Ihre Anmeldedaten und versuchen Sie es erneut.",
          variant: "destructive"
        });
        return;
      }

      console.log("Login successful:", data);
      toast({
        title: "Erfolg",
        description: "Sie wurden erfolgreich eingeloggt",
      });
      
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 bg-card/50 backdrop-blur">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Passwort"
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
            {isLoading ? "Anmeldung läuft..." : "Anmelden"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;