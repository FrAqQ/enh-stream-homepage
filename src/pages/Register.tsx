import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/LanguageContext";
import { OnboardingTooltip } from "@/components/ui/onboarding-tooltip";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ComplianceChecker } from "@/components/ui/compliance-checker";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!email) {
      errors.email = language === 'en' ? "Email is required" : "E-Mail ist erforderlich";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = language === 'en' ? "Email is invalid" : "E-Mail ist ungültig";
    }
    
    if (!password) {
      errors.password = language === 'en' ? "Password is required" : "Passwort ist erforderlich";
    } else if (password.length < 6) {
      errors.password = language === 'en' ? "Password must be at least 6 characters" : "Passwort muss mindestens 6 Zeichen lang sein";
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = language === 'en' ? "Passwords don't match" : "Passwörter stimmen nicht überein";
    }
    
    if (!agreedToTerms) {
      errors.terms = language === 'en' ? "You must agree to the terms" : "Sie müssen den Bedingungen zustimmen";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      
      if (error) throw error;
      
      // Create initial profile in the profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              plan: 'Free',
              subscription_status: 'inactive',
              viewers_active: 0
            }
          ]);
          
        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Continue anyway as the auth was successful
        }
      }
      
      toast({
        title: language === 'en' ? "Registration successful" : "Registrierung erfolgreich",
        description: language === 'en' 
          ? "Please check your email to confirm your registration" 
          : "Bitte überprüfen Sie Ihre E-Mail, um Ihre Registrierung zu bestätigen"
      });
      
      // Redirect to login after successful registration
      navigate("/login");
      
    } catch (error: any) {
      console.error("Registration error:", error);
      
      toast({
        title: language === 'en' ? "Registration failed" : "Registrierung fehlgeschlagen",
        description: error.message || (language === 'en' ? "An unexpected error occurred" : "Ein unerwarteter Fehler ist aufgetreten"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="container max-w-md mx-auto py-8">
        <Card className="w-full">
          <OnboardingTooltip
            id="register-page-tooltip"
            content={{
              en: "Fill in your details to create a new account. We'll send you a confirmation email to verify your address.",
              de: "Füllen Sie Ihre Daten aus, um ein neues Konto zu erstellen. Wir senden Ihnen eine Bestätigungs-E-Mail zur Verifizierung Ihrer Adresse."
            }}
            position="bottom"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                {language === 'en' ? "Create Account" : "Konto erstellen"}
              </CardTitle>
              <CardDescription className="text-center">
                {language === 'en' 
                  ? "Enter your details to create a new account" 
                  : "Geben Sie Ihre Daten ein, um ein neues Konto zu erstellen"}
              </CardDescription>
            </CardHeader>
          </OnboardingTooltip>

          <LoadingOverlay isLoading={isLoading}>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {language === 'en' ? "Email" : "E-Mail"}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={language === 'en' ? "your@email.com" : "ihre@email.de"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={formErrors.email ? "border-destructive" : ""}
                  />
                  {formErrors.email && (
                    <p className="text-sm font-medium text-destructive">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    {language === 'en' ? "Password" : "Passwort"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={formErrors.password ? "border-destructive" : ""}
                  />
                  {formErrors.password && (
                    <p className="text-sm font-medium text-destructive">{formErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {language === 'en' ? "Confirm Password" : "Passwort bestätigen"}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={formErrors.confirmPassword ? "border-destructive" : ""}
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-sm font-medium text-destructive">{formErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="terms" className="text-sm">
                    {language === 'en' ? (
                      <>I agree to the <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></>
                    ) : (
                      <>Ich stimme den <Link to="/terms" className="text-primary hover:underline">AGB</Link> und der <Link to="/privacy" className="text-primary hover:underline">Datenschutzerklärung</Link> zu</>
                    )}
                  </label>
                </div>
                {formErrors.terms && (
                  <p className="text-sm font-medium text-destructive">{formErrors.terms}</p>
                )}

                <Alert variant="default" className="mt-4 border-yellow-500 bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {language === 'en'
                      ? "Please use our services responsibly and in accordance with platform guidelines."
                      : "Bitte nutzen Sie unsere Dienste verantwortungsvoll und in Übereinstimmung mit den Plattformrichtlinien."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full">
                  {language === 'en' ? "Register" : "Registrieren"}
                </Button>
                <p className="text-sm text-center">
                  {language === 'en' ? (
                    <>Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link></>
                  ) : (
                    <>Haben Sie bereits ein Konto? <Link to="/login" className="text-primary hover:underline">Anmelden</Link></>
                  )}
                </p>
              </CardFooter>
            </form>
          </LoadingOverlay>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
