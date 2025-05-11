
import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "./ui/error-boundary";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { Link } from "react-router-dom";

// Custom fallback component for API errors
const ApiFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  const { language } = useLanguage();
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>
        {language === 'en' ? "API Connection Error" : "API-Verbindungsfehler"}
      </AlertTitle>
      <AlertDescription className="space-y-4">
        <p>
          {language === 'en' 
            ? "We're having trouble connecting to our servers. This could be a temporary issue."
            : "Wir haben Probleme, eine Verbindung zu unseren Servern herzustellen. Dies könnte ein vorübergehendes Problem sein."}
        </p>
        <div className="flex space-x-4">
          <Button onClick={resetErrorBoundary}>
            {language === 'en' ? "Try Again" : "Erneut versuchen"}
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            {language === 'en' ? "Go to Home" : "Zur Startseite"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export interface ApiErrorBoundaryProps {
  children: React.ReactNode;
}

export function ApiErrorBoundary({ children }: ApiErrorBoundaryProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [networkError, setNetworkError] = useState<boolean>(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkError(false);
      toast({
        title: language === 'en' ? "Connection restored" : "Verbindung wiederhergestellt",
        description: language === 'en' ? "You're back online" : "Sie sind wieder online"
      });
    };

    const handleOffline = () => {
      setNetworkError(true);
      toast({
        title: language === 'en' ? "Connection lost" : "Verbindung verloren",
        description: language === 'en' ? "Please check your internet connection" : "Bitte überprüfen Sie Ihre Internetverbindung",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language, toast]);

  return (
    <>
      {networkError && (
        <Alert variant="destructive" className="mb-4 max-w-md mx-auto">
          <AlertTitle>
            {language === 'en' ? "No Internet Connection" : "Keine Internetverbindung"}
          </AlertTitle>
          <AlertDescription>
            {language === 'en' 
              ? "Please check your network connection and try again." 
              : "Bitte überprüfen Sie Ihre Netzwerkverbindung und versuchen Sie es erneut."}
          </AlertDescription>
        </Alert>
      )}
      <ErrorBoundary fallback={<ApiFallback error={new Error()} resetErrorBoundary={() => window.location.reload()} />}>
        {children}
      </ErrorBoundary>
    </>
  );
}
