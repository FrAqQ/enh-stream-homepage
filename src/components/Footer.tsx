import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";

const Footer = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      terms: "Terms and Conditions",
      privacy: "Privacy Policy",
      cancellation: "Right of Withdrawal",
      imprint: "Imprint",
      rights: "All rights reserved"
    },
    de: {
      terms: "AGB",
      privacy: "Datenschutzerklärung",
      cancellation: "Widerrufsbelehrung",
      imprint: "Impressum",
      rights: "Alle Rechte vorbehalten"
    }
  };

  const t = translations[language];

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              {t.terms}
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              {t.privacy}
            </Link>
            <Link to="/cancellation" className="text-sm text-muted-foreground hover:text-foreground">
              {t.cancellation}
            </Link>
            <Link to="/imprint" className="text-sm text-muted-foreground hover:text-foreground">
              {t.imprint}
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Enhance Stream. {t.rights}.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;