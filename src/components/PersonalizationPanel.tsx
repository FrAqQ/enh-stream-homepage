
import React from "react";
import { usePersonalization } from "@/lib/PersonalizationContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

interface PersonalizationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PersonalizationPanel = ({ open, onOpenChange }: PersonalizationPanelProps) => {
  const { 
    theme, 
    accentColor, 
    setTheme, 
    setAccentColor, 
    resetPersonalization 
  } = usePersonalization();
  
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Personalize Your Dashboard",
      themeSection: "Theme",
      themeLight: "Light",
      themeDark: "Dark",
      themeSystem: "System",
      accentSection: "Accent Color",
      reset: "Reset to Default",
      save: "Save Changes"
    },
    de: {
      title: "Personalisieren Sie Ihr Dashboard",
      themeSection: "Theme",
      themeLight: "Hell",
      themeDark: "Dunkel",
      themeSystem: "System",
      accentSection: "Akzentfarbe",
      reset: "Zurücksetzen",
      save: "Änderungen speichern"
    }
  };

  const t = translations[language];

  const accentColors = [
    { id: 'purple', label: language === 'en' ? 'Purple' : 'Lila', className: 'bg-[hsl(252,87%,73%)]' },
    { id: 'blue', label: language === 'en' ? 'Blue' : 'Blau', className: 'bg-blue-500' },
    { id: 'green', label: language === 'en' ? 'Green' : 'Grün', className: 'bg-green-500' },
    { id: 'orange', label: language === 'en' ? 'Orange' : 'Orange', className: 'bg-orange-500' },
    { id: 'red', label: language === 'en' ? 'Red' : 'Rot', className: 'bg-red-500' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Theme Selection */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t.themeSection}</h3>
            <RadioGroup 
              value={theme} 
              onValueChange={(val) => setTheme(val as 'dark' | 'light' | 'system')}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">{t.themeLight}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">{t.themeDark}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system">{t.themeSystem}</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Accent Color Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">{t.accentSection}</h3>
            <div className="grid grid-cols-5 gap-2">
              {accentColors.map((color) => (
                <button
                  key={color.id}
                  className={`flex items-center justify-center rounded-md p-2 h-12 transition-all ${color.className}`}
                  onClick={() => setAccentColor(color.id as any)}
                  title={color.label}
                >
                  {accentColor === color.id && <CheckCircle className="text-white h-5 w-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={resetPersonalization}>
            {t.reset}
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            {t.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
