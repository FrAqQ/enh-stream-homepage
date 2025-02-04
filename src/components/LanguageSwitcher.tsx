import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { Flag } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-2">
      <Button
        variant={language === 'en' ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage('en')}
        className="flex items-center gap-2"
      >
        <Flag className="h-4 w-4" />
        EN
      </Button>
      <Button
        variant={language === 'de' ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage('de')}
        className="flex items-center gap-2"
      >
        <Flag className="h-4 w-4" />
        DE
      </Button>
    </div>
  );
}