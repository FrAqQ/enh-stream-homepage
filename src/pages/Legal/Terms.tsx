import { useLanguage } from "@/lib/LanguageContext";

const Terms = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Terms and Conditions",
      lastUpdated: "These Terms and Conditions were last updated on May 28, 2024.",
      content: "English version of the Terms and Conditions will be provided soon."
    },
    de: {
      title: "Allgemeine Geschäftsbedingungen",
      lastUpdated: "Diese Allgemeinen Geschäftsbedingungen wurden zuletzt am 28.05.2024 aktualisiert.",
      content: `Die Betreiber der Website https://followerfabrik.de und allen damit verbundenen Seiten und Unterseiten setzen die folgenden Allgemeinen Geschäftsbedingungen für die Nutzung der auf der Plattform angebotenen Dienstleistungen voraus.

Funktion der AGB
Die Allgemeinen Geschäftsbedingungen (kurz „AGB") stellen eine Vereinbarung zwischen Personen, die auf der oben genannten Plattform kostenpflichtig Dienstleistungen in Anspruch nehmen (im Folgenden kurz „Nutzer" genannt) sowie den Betreibern der Plattform (im Folgenden „Betreiber" oder „Followerfabrik" genannt) dar. Sie müssen vom Nutzer akzeptiert werden, sobald dieser eine kostenpflichtige Dienstleistung in Anspruch nimmt oder sich mit seinen persönlichen Daten auf der Plattform anmeldet.

Angaben zum Betreiber: https://followerfabrik.de/impressum

Gültigkeit
Die AGB sind gültig ab dem 10.01.2022 und können jederzeit von den Betreibern geändert werden. Wird eine grobe inhaltliche Veränderung vorgenommen, die das Verhalten der Nutzer beeinträchtigen könnte, so müssen alle aktiven Nutzer (mit aktivierten Benutzerkonten) auf schriftlichem Weg darüber in Kenntnis gesetzt werden.

Ein Benutzerkonto kann auf https://followerfabrik.de/my-account erstellt werden.

Funktionen der Plattform
a) Bestellen
Es wird die Möglichkeit geboten, verschiedene digitale Dienstleistungen in Anspruch zu nehmen. Hierzu muss die gewünschte Dienstleistung in den digitalen Warenkorb gelegt und die Bestellung anschließend mit Anklicken der Schaltfläche „Zahlungspflichtig bestellen" getätigt werden. Eine Bestellung wird im Regelfall innerhalb der auf der jeweiligen Detailseite angegebenen Startzeit gestartet. Der Nutzer ist zahlungspflichtig, sobald er die oben genannte Schaltfläche anklickt. Mit dem Anklicken der Schaltfläche bestätigt der Nutzer außerdem ausdrücklich die Richtigkeit und Vollständigkeit der angegebenen Daten, einschließlich Name, Firmenname (optional), Adresse, E-Mail-Adresse und ggf. Telefonnummer.

[... Rest of the German terms and conditions ...]`
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">{t.title}</h1>
        <p className="text-muted-foreground mb-8">{t.lastUpdated}</p>
        <div className="prose prose-sm max-w-none dark:prose-invert space-y-4">
          {t.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Terms;