
import { useLanguage } from "@/lib/LanguageContext";

const Privacy = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "This Privacy Policy was last updated on February 4, 2025.",
      intro: "The operators of the website (hereinafter also referred to as 'Enhance Stream', 'Operators', 'We' or 'Our') https://enhanceyour.stream and all related pages and subpages require the following privacy policy for the use of the services offered on the platform.",
      sections: [
        {
          title: "1. Responsible Party",
          content: "The party responsible for this privacy policy and data processing on Enhance Stream is:\n\nTino Strasser\nWalther-Rathenau-Str. 57\n75180 Pforzheim\nEmail: info@enhanceyour.stream"
        },
        {
          title: "2. Personal Data",
          content: "According to Article 4 Paragraph 1 GDPR, personal data is any information relating to an identified or identifiable natural person."
        },
        {
          title: "3. Storage Duration",
          content: "Your personal data will only be stored at Enhance Stream for as long as necessary for the purposes for which it is processed."
        },
        {
          title: "4. User Rights",
          content: "You have the right to erasure, rectification, restriction of processing, and data portability according to Art. 16, 17, 18, and 20 GDPR."
        },
        {
          title: "5. Right to Object",
          content: "You can object to the processing of your personal data at any time (Art. 21 GDPR)."
        },
        {
          title: "6. Processing Purpose",
          content: "We collect, store, and use personal data to ensure a functioning website and to analyze the behavior of website visitors."
        },
        {
          title: "7. Right to Complain",
          content: "According to Art. 77 GDPR, you have the right to lodge a complaint with a supervisory authority."
        },
        {
          title: "8. Hosting",
          content: "Our hosting provider is Netcup GmbH, Daimlerstraße 25, 76185 Karlsruhe, Germany. More information: https://www.netcup.de/kontakt/datenschutzerklaerung.php"
        },
        {
          title: "9. SSL Encryption",
          content: "Our website is SSL encrypted to protect your personal data."
        },
        {
          title: "10. Order Process",
          content: "Enhance Stream collects and processes personal data during the order process, including name, address, email, and payment data."
        },
        {
          title: "11. Analytics Tools",
          content: "11.1 Google Analytics\nWe use Google Analytics to analyze user behavior on our website. More information: https://support.google.com/analytics/answer/9019185?hl=en\n\n11.2 Google Ads\nWe use Google Ads conversion tracking to determine the effectiveness of our advertising. More information: https://business.safety.google/adscontrollerterms/"
        },
        {
          title: "12. Payment Methods",
          content: "12.1 Stripe\nWhen you pay by credit card or other payment methods, payment data is transmitted to Stripe (Stripe Inc., 510 Townsend Street, San Francisco, CA 94103, USA). More information: https://stripe.com/privacy"
        },
        {
          title: "13. Other Third-Party Providers",
          content: "13.1 FastBill\nWe use FastBill for our accounting. More information: https://www.fastbill.com/privacy\n\n13.2 Sendinblue\nOur emails are sent via Sendinblue. More information: https://www.sendinblue.com/legal/privacypolicy/"
        }
      ]
    },
    de: {
      title: "Datenschutzerklärung",
      lastUpdated: "Diese Datenschutzerklärung wurde zuletzt am 04.02.2025 aktualisiert.",
      intro: "Die Betreiber der Website (im Folgenden auch \"Enhance Stream\", \"Betreiber\", \"Wir\" oder \"Unsere\" genannt) https://enhanceyour.stream und allen damit verbundenen Seiten und Unterseiten setzen die folgende Datenschutzerklärung für die Nutzung der auf der Plattform angebotenen Dienstleistungen voraus.",
      sections: [
        {
          title: "1. Verantwortlicher",
          content: "Verantwortlicher für diese Datenschutzerklärung und für die Datenverarbeitung auf Enhance Stream ist:\n\nTino Strasser\nWalther-Rathenau-Str. 57\n75180 Pforzheim\nE-Mail: info@enhanceyour.stream"
        },
        {
          title: "2. Personenbezogene Daten",
          content: "Gemäß Artikel 4 Absatz 1 DSGVO sind personenbezogene Daten alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen."
        },
        {
          title: "3. Speicherdauer",
          content: "Ihre personenbezogenen Daten werden bei Enhance Stream nur so lange gespeichert, wie es für die Zwecke, für die sie verarbeitet werden, erforderlich ist."
        },
        {
          title: "4. Rechte der Nutzer",
          content: "Sie haben das Recht auf Löschung, Berichtigung, Einschränkung der Verarbeitung und Datenübertragbarkeit gemäß Art. 16, 17, 18 und 20 DSGVO."
        },
        {
          title: "5. Widerspruchsrecht",
          content: "Sie können der Verarbeitung Ihrer personenbezogenen Daten jederzeit widersprechen (Art. 21 DSGVO)."
        },
        {
          title: "6. Verarbeitungszweck",
          content: "Wir erheben, speichern und verwenden personenbezogene Daten, um eine funktionierende Website zu gewährleisten und das Nutzerverhalten der Websitebesucher zu analysieren."
        },
        {
          title: "7. Beschwerderecht",
          content: "Gemäß Art. 77 DSGVO haben Sie das Recht, Beschwerde bei einer Aufsichtsbehörde einzulegen."
        },
        {
          title: "8. Hosting",
          content: "Unser Hosting-Provider ist Netcup GmbH, Daimlerstraße 25, 76185 Karlsruhe, Deutschland. Weitere Informationen: https://www.netcup.de/kontakt/datenschutzerklaerung.php"
        },
        {
          title: "9. SSL-Verschlüsselung",
          content: "Unsere Website ist durch SSL verschlüsselt, um Ihre personenbezogenen Daten zu schützen."
        },
        {
          title: "10. Bestellvorgang",
          content: "Enhance Stream erhebt und verarbeitet personenbezogene Daten beim Bestellvorgang, einschließlich Name, Adresse, E-Mail und Zahlungsdaten."
        },
        {
          title: "11. Analyse-Tools",
          content: "11.1 Google Analytics\nWir nutzen Google Analytics zur Analyse des Nutzerverhaltens auf unserer Website. Weitere Informationen: https://support.google.com/analytics/answer/9019185?hl=de\n\n11.2 Google Ads\nWir nutzen Google Ads Conversion-Tracking, um die Effektivität unserer Werbung zu ermitteln. Weitere Informationen: https://business.safety.google/adscontrollerterms/"
        },
        {
          title: "12. Zahlungsmethoden",
          content: "12.1 Stripe\nWenn Sie per Kreditkarte oder anderen Zahlungsmethoden bezahlen, werden Zahlungsdaten an Stripe (Stripe Inc., 510 Townsend Street, San Francisco, CA 94103, USA) übermittelt. Weitere Informationen: https://stripe.com/de/privacy"
        },
        {
          title: "13. Sonstige Drittanbieter",
          content: "13.1 FastBill\nWir nutzen FastBill für unsere Buchhaltung. Weitere Informationen: https://www.fastbill.com/datenschutz\n\n13.2 Sendinblue\nUnsere E-Mails werden über Sendinblue versendet. Weitere Informationen: https://de.sendinblue.com/legal/privacypolicy/"
        }
      ]
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">{t.title}</h1>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-muted-foreground mb-6">{t.lastUpdated}</p>
          <p className="mb-8">{t.intro}</p>
          {t.sections.map((section, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
              <div className="whitespace-pre-wrap">{section.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Privacy;
