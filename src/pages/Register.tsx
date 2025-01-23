import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(60); // 60 seconds cooldown
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const startCooldown = () => {
    setCooldownActive(true);
    setCooldownTime(60);
    
    const interval = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCooldownActive(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cooldownActive) {
      toast({
        variant: "destructive",
        title: "Please wait",
        description: `Please wait ${cooldownTime} seconds before trying again`,
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Starting registration process for email:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            plan: "free",
            follower_plan: "none",
          },
        },
      });

      if (error) {
        console.error("Registration error:", error);
        
        if (error.status === 429) {
          console.log("Rate limit hit, activating cooldown");
          startCooldown();
          toast({
            variant: "destructive",
            title: "Too many attempts",
            description: `Please wait ${cooldownTime} seconds before trying again. This helps prevent spam and protect our service.`,
          });
          return;
        }
        
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message || "An error occurred during registration. Please try again.",
        });
        return;
      }

      console.log("Registration successful, user data:", data);
      toast({
        title: "Success",
        description: "Registration successful! You can now log in.",
      });
      
      navigate("/login");
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 bg-card/50 backdrop-blur">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading || cooldownActive}
              pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              title="Please enter a valid email address"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading || cooldownActive}
              minLength={6}
            />
          </div>
          <Button 
            className="w-full" 
            type="submit" 
            disabled={isLoading || cooldownActive}
          >
            {cooldownActive 
              ? `Please wait ${cooldownTime}s` 
              : isLoading 
                ? "Registering..." 
                : "Register"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Register;