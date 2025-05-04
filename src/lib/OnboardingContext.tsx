
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

interface OnboardingContextType {
  showOnboarding: boolean;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 5; // Total number of onboarding steps
  const { language } = useLanguage();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
    if (!hasCompletedOnboarding) {
      // Show onboarding after a short delay to allow the page to load
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding completed
      localStorage.setItem('hasCompletedOnboarding', 'true');
      setShowOnboarding(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('hasCompletedOnboarding');
    localStorage.removeItem('seenTooltips');
    setCurrentStep(0);
    setShowOnboarding(true);
  };

  return (
    <OnboardingContext.Provider 
      value={{ 
        showOnboarding, 
        currentStep, 
        totalSteps,
        nextStep, 
        prevStep, 
        skipOnboarding,
        resetOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
