
import { useLanguage } from "@/lib/LanguageContext";

const Cancellation = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Right of Withdrawal",
      lastUpdated: "This Right of Withdrawal Policy was last updated on February 4, 2025.",
      intro: "The operators of the website (hereinafter also referred to as \"Enhance Stream\") https://enhanceyour.stream and all related pages and subpages require the following right of withdrawal policy for the use and utilization of the services offered on the platform:",
      content: [
        "As is customary with digital products and services, the right of withdrawal expires when the order execution begins. Upon conclusion of the contract, you expressly agree that we have begun executing the contract before the expiry of the withdrawal period and that you have lost your right of withdrawal with the commencement of contract execution.",
        "An order can only be withdrawn if the execution of the order has not yet begun and the order is not yet in Enhance Stream's internal processing system. If you wish to withdraw an order, please use the following form and send it to us by email or mail:"
      ],
      formHeader: "—————————————",
      address: [
        "Tino Strasser",
        "Walther-Rathenau-Str. 57",
        "75180 Pforzheim",
        "Germany",
        "",
        "Email: support@enhanceyour.stream"
      ],
      formFields: [
        "– I/We (*) hereby withdraw from the contract concluded by me/us (*) for the purchase of the following goods (*)/ provision of the following service (*)",
        "– Ordered on (*)",
        "– Order number",
        "– Name of user(s)",
        "– Address of user(s)",
        "– Signature of user(s) (only for paper notifications)",
        "– Date"
      ],
      formFooter: "—————————————",
      note: "(*) Delete as applicable."
    },
    de: {
      title: "Widerrufsbelehrung",
      lastUpdated: "Diese Widerrufsbelehrung wurde zuletzt am 04.02.2025 aktualisiert.",
      intro: "Die Betreiber der Website (im Folgenden auch \"Enhance Stream\" genannt) https://enhanceyour.stream und alle damit verbundenen Seiten und Unterseiten setzen die folgende Widerrufsbelehrung für die Nutzung und Inanspruchnahme der auf der Plattform angebotenen Dienstleistungen voraus:",
      content: [
        "Wie bei digitalen Produkten bzw. Dienstleistungen üblich erlischt das Widerrufsrecht mit Beginn der Auftragsausführung. Bei Vertragsabschluss stimmen Sie ausdrücklich zu, dass wir mit der Ausführung des Vertrages vor Ablauf der Widerrufsfrist begonnen haben und dass Sie ihr Widerrufsrecht mit Beginn der Ausführung des Vertrages verloren haben.",
        "Eine Bestellung kann nur dann widerrufen werden, wenn die Durchführung des Auftrages noch nicht begonnen hat und der Auftrag sich noch nicht im internen Verarbeitungssystem von Enhance Stream befindet. Wenn Sie eine Bestellung widerrufen möchten, nutzen Sie bitte folgendes Formular und senden Sie es per E-Mail oder per Post an uns:"
      ],
      formHeader: "—————————————",
      address: [
        "Tino Strasser",
        "Walther-Rathenau-Str. 57",
        "75180 Pforzheim",
        "Deutschland",
        "",
        "E-Mail: support@enhanceyour.stream"
      ],
      formFields: [
        "– Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/ die Erbringung der folgenden Dienstleistung (*)",
        "– Bestellt am (*)",
        "– Bestellnummer",
        "– Name des/der Nutzers(s)",
        "– Anschrift des/der Nutzers(s)",
        "– Unterschrift des/der Nutzers(s) (nur bei Mitteilung auf Papier)",
        "– Datum"
      ],
      formFooter: "—————————————",
      note: "(*) Unzutreffendes bitte streichen."
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
          {t.content.map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
          <div className="my-8">
            <p>{t.formHeader}</p>
            <div className="whitespace-pre-line my-4">
              {t.address.join("\n")}
            </div>
            <div className="my-4">
              {t.formFields.map((field, index) => (
                <p key={index} className="mb-2">{field}</p>
              ))}
            </div>
            <p>{t.formFooter}</p>
          </div>
          <p className="mt-4 italic">{t.note}</p>
        </div>
      </div>
    </div>
  );
};

export default Cancellation;
