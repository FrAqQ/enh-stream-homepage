import { useLanguage } from "@/lib/LanguageContext";

const Cancellation = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Right of Withdrawal",
      content: "Right of withdrawal content will be placed here."
    },
    de: {
      title: "Widerrufsbelehrung",
      content: "Hier wird die Widerrufsbelehrung platziert."
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">{t.title}</h1>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p>{t.content}</p>
        </div>
      </div>
    </div>
  );
};

export default Cancellation;