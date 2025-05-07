
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./lib/useUser";
import { LanguageProvider } from "./lib/LanguageContext";
import { OnboardingProvider } from "./lib/OnboardingContext";
import { PersonalizationProvider } from "./lib/PersonalizationContext";
import { Onboarding } from "./components/Onboarding";
import { LoadingOverlay } from "./components/ui/loading-overlay";
import { ApiErrorBoundary } from "./components/ApiErrorBoundary";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Terms from "./pages/Legal/Terms";
import Privacy from "./pages/Legal/Privacy";
import Cancellation from "./pages/Legal/Cancellation";
import Imprint from "./pages/Legal/Imprint";
import { CookieManager } from "./components/CookieManager";
import { useState, useEffect } from "react";

// Create React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Überarbeiteter ProtectedRoute mit verbesserter Zugriffskontrolle
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, isLoading, loadError, retryLoading } = useUser();
  const [loadingAttempts, setLoadingAttempts] = useState(0);
  
  // Stellen Sie sicher, dass wir nicht in eine Endlosschleife geraten
  useEffect(() => {
    if (isLoading && loadingAttempts < 3) {
      const timer = setTimeout(() => {
        setLoadingAttempts(prev => prev + 1);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, loadingAttempts]);
  
  // Wenn zu viele Ladeversuche fehlschlagen, zeigen wir eine Fehlermeldung an
  if (loadingAttempts >= 3 && isLoading) {
    console.log("[ProtectedRoute] Zu viele Ladeversuche, zeige Fehlermeldung");
    return (
      <LoadingOverlay 
        isLoading={false}
        error={new Error("Das Profil konnte nicht geladen werden. Bitte versuchen Sie es später erneut.")}
        fullScreen
        onRetry={() => {
          setLoadingAttempts(0);
          retryLoading();
        }}
      />
    );
  }
  
  // Behandle explizit den Lade-Zustand
  if (isLoading && loadingAttempts < 3) {
    console.log(`[ProtectedRoute] Profil wird geladen... (Versuch ${loadingAttempts + 1})`);
    return (
      <LoadingOverlay 
        isLoading={true} 
        fullScreen 
        text="Ihr Profil wird geladen..." 
        onRetry={() => {
          console.log("[ProtectedRoute] LoadingOverlay retry triggered");
          setLoadingAttempts(0);
          retryLoading();
        }}
        loadingTimeout={3000}
      />
    );
  }
  
  // Behandle explizit den Fehler-Zustand
  if (loadError) {
    return (
      <LoadingOverlay 
        isLoading={false}
        error={loadError}
        fullScreen
        onRetry={() => {
          console.log("[ProtectedRoute] LoadingOverlay error retry triggered");
          setLoadingAttempts(0);
          retryLoading();
        }}
      />
    );
  }
  
  // Ohne User können wir nicht fortfahren
  if (!user) {
    console.log("[ProtectedRoute] No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Bei Admin-Seiten prüfen wir zusätzlich
  if (requireAdmin) {
    const { profile } = useUser();
    
    if (!profile?.is_admin) {
      console.log("[ProtectedRoute] Admin access required but user is not admin");
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

const App = () => {
  // Debug: CSS-Check für globale Styles die Klicks behindern könnten
  console.log("[DEBUG] App rendering - Checking global CSS");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <PersonalizationProvider>
            <OnboardingProvider>
              <ApiErrorBoundary>
                <BrowserRouter>
                  <div className="min-h-screen bg-background text-foreground flex flex-col">
                    <Navbar />
                    <div className="flex-1">
                      <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/index" element={<Landing />} />
                        <Route path="/dashboard" element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                          <ProtectedRoute requireAdmin={true}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/cancellation" element={<Cancellation />} />
                        <Route path="/imprint" element={<Imprint />} />
                      </Routes>
                    </div>
                    <Footer />
                  </div>
                  <Toaster />
                  <Sonner />
                  <CookieManager />
                  <Onboarding />
                </BrowserRouter>
              </ApiErrorBoundary>
            </OnboardingProvider>
          </PersonalizationProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
