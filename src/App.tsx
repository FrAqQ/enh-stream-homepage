
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import { Button } from "./components/ui/button";

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

// Debugging-Komponente für UI-Tests
const TestNavigationButtons = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: 10000,
      background: "#333",
      padding: "10px",
      borderRadius: "5px",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}>
      <h3 style={{ color: "white", margin: "0 0 10px 0" }}>Navigation Tester</h3>
      <Button 
        onClick={() => {
          console.log("Test Login Navigation");
          navigate("/login");
        }}
        style={{ background: "#f00" }}
      >
        TEST LOGIN
      </Button>
      <Button 
        onClick={() => {
          console.log("Test Register Navigation");
          navigate("/register");
        }}
        style={{ background: "#0f0", color: "#000" }}
      >
        TEST REGISTER
      </Button>
      <Button 
        onClick={() => {
          console.log("Return Home");
          navigate("/");
        }}
        style={{ background: "#00f" }}
      >
        TEST HOME
      </Button>
    </div>
  );
};

// Verbesserte Protected Route Komponente mit direkter Fehlerbehebung
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, loadError, retryLoading } = useUser();
  
  // Behandle explizit den Lade-Zustand
  if (isLoading) {
    return (
      <LoadingOverlay 
        isLoading={true} 
        fullScreen 
        text="Ihr Profil wird geladen..." 
        onRetry={() => {
          console.log("LoadingOverlay retry triggered");
          retryLoading();
        }}
        loadingTimeout={3000} // Schnellerer Timeout, angepasst an den Datenbank-Timeout
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
          console.log("LoadingOverlay error retry triggered");
          retryLoading();
        }}
      />
    );
  }
  
  // Ohne Profil oder User können wir nicht fortfahren
  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" />;
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
                          <ProtectedRoute>
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
                    
                    {/* Debugging UI für Navigations-Tests */}
                    <TestNavigationButtons />
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
