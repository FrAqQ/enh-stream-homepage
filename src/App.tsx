
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
import { useState } from "react";

// Einen optimierten React Query Client erstellen
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 Minuten
    },
  },
});

// Optimierte ProtectedRoute Komponente mit weniger Komplexität
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, isLoading, profile } = useUser();

  if (isLoading) {
    return <LoadingOverlay isLoading={true} fullScreen text="Ihr Profil wird geladen..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin-Anforderung prüfen
  if (requireAdmin && !profile?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  console.log("App rendering started");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <PersonalizationProvider>
            <OnboardingProvider>
              <BrowserRouter>
                <ApiErrorBoundary>
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
                </ApiErrorBoundary>
              </BrowserRouter>
            </OnboardingProvider>
          </PersonalizationProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
