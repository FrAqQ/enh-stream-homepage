
import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeOption = 'dark' | 'light' | 'system';
type AccentColor = 'purple' | 'blue' | 'green' | 'orange' | 'red';

interface PersonalizationContextType {
  theme: ThemeOption;
  accentColor: AccentColor;
  cardArrangement: string[];
  setTheme: (theme: ThemeOption) => void;
  setAccentColor: (color: AccentColor) => void;
  rearrangeCards: (cardIds: string[]) => void;
  resetPersonalization: () => void;
}

const defaultCardArrangement = ['stats', 'progress', 'controls', 'preview'];

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeOption>('dark');
  const [accentColor, setAccentColorState] = useState<AccentColor>('purple');
  const [cardArrangement, setCardArrangement] = useState<string[]>(defaultCardArrangement);

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') as ThemeOption;
    const savedAccentColor = localStorage.getItem('accentColor') as AccentColor;
    const savedCardArrangement = localStorage.getItem('cardArrangement');

    if (savedTheme) setThemeState(savedTheme);
    if (savedAccentColor) setAccentColorState(savedAccentColor);
    if (savedCardArrangement) setCardArrangement(JSON.parse(savedCardArrangement));
    
    // Apply theme and accent color
    applyTheme(savedTheme || theme);
    applyAccentColor(savedAccentColor || accentColor);
  }, []);

  const applyTheme = (newTheme: ThemeOption) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      prefersDark ? root.classList.add('dark') : root.classList.remove('dark');
    }
  };

  const applyAccentColor = (color: AccentColor) => {
    const root = document.documentElement;
    root.setAttribute('data-accent-color', color);
    
    // This would be used with actual CSS variables defined elsewhere
  };

  const setTheme = (newTheme: ThemeOption) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const setAccentColor = (color: AccentColor) => {
    localStorage.setItem('accentColor', color);
    setAccentColorState(color);
    applyAccentColor(color);
  };

  const rearrangeCards = (cardIds: string[]) => {
    localStorage.setItem('cardArrangement', JSON.stringify(cardIds));
    setCardArrangement(cardIds);
  };

  const resetPersonalization = () => {
    localStorage.removeItem('theme');
    localStorage.removeItem('accentColor');
    localStorage.removeItem('cardArrangement');
    
    setThemeState('dark');
    setAccentColorState('purple');
    setCardArrangement(defaultCardArrangement);
    
    applyTheme('dark');
    applyAccentColor('purple');
  };

  return (
    <PersonalizationContext.Provider 
      value={{ 
        theme, 
        accentColor, 
        cardArrangement,
        setTheme, 
        setAccentColor,
        rearrangeCards,
        resetPersonalization
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}
