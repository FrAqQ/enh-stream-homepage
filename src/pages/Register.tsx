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
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate email format first
    if (!validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address",
      });
      setIsLoading(false);
      return;
    }

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
          emailRedirectTo: undefined,
          // Explicitly disable email confirmation
          gotrue_meta_security: {
            captcha_token: null
          }
        },
      });

      if (error) {
        console.error("Registration error:", error);
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
              disabled={isLoading}
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
              disabled={isLoading}
              minLength={6}
            />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Register;