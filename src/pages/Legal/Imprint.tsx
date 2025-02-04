
import { useLanguage } from "@/lib/LanguageContext";

const Imprint = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Legal Notice",
      subtitle: "Information according to § 5 TMG and § 18 of the Media State Treaty (MStV)",
      contact: {
        title: "1. Contact",
        address: [
          "Tino Strasser",
          "Walther-Rathenau-Str. 59",
          "75180 Pforzheim",
          "Germany",
          "",
          "Email: support@enhanceyour.stream"
        ]
      },
      sections: [
        {
          title: "2. VAT ID",
          content: "Value added tax identification number according to § 27a of the German Value Added Tax Act: DE369399418"
        },
        {
          title: "3. Register Information",
          content: "This website is a private project and is not subject to commercial register entry."
        },
        {
          title: "4. EU Dispute Resolution",
          content: "The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr. We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board."
        },
        {
          title: "5. Liability for Content",
          content: "As a service provider, we are responsible for our own content on our internet presence according to § 7 Paragraph 1 TMG. According to §§ 8 to 10 TMG, however, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.\n\nObligations to remove or block the use of information according to general laws remain unaffected. However, liability in this regard is only possible from the time of knowledge of a specific legal violation. Upon becoming aware of corresponding legal violations, we will remove this content immediately.\n\nWe expressly point out that we do not represent any of the social networks that are the subject of our services.\n\nWe are committed to equal rights. Where content on the internet presences operated by Enhance Stream uses the masculine term, this is done solely for the purpose of better readability and comprehension."
        },
        {
          title: "6. Liability for Links",
          content: "Our offer contains links to external websites of third parties, over whose content we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the pages is always responsible for the content of the linked pages. The linked pages were checked for possible legal violations at the time of linking. Illegal content was not recognizable at the time of linking.\n\nHowever, a permanent control of the content of the linked pages is not reasonable without concrete evidence of a violation of law. If we become aware of any legal violations, we will remove such links immediately."
        },
        {
          title: "7. Copyright",
          content: "The content and works created by the site operators on these pages are subject to German copyright law. The reproduction, editing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator. Downloads and copies of this site are only permitted for private, non-commercial use.\n\nInsofar as the content on this site was not created by the operator, the copyrights of third parties are respected. In particular, third-party content is marked as such. Should you nevertheless become aware of a copyright infringement, please inform us accordingly. If we become aware of any infringements, we will remove such content immediately. Please contact support@enhanceyour.stream if you suspect a copyright violation."
        }
      ]
    },
    de: {
      title: "Impressum",
      subtitle: "Angaben gemäß § 5 TMG und § 18 des Medienstaatsvertrags (MStV)",
      contact: {
        title: "1. Kontakt",
        address: [
          "Tino Strasser",
          "Walther-Rathenau-Str. 59",
          "75180 Pforzheim",
          "Deutschland",
          "",
          "E-Mail: support@enhanceyour.stream"
        ]
      },
      sections: [
        {
          title: "2. Umsatzsteuer-ID",
          content: "Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: DE369399418"
        },
        {
          title: "3. Registerdaten",
          content: "Diese Website ist ein privates Projekt und unterliegt keiner Handelsregistereintragung."
        },
        {
          title: "4. EU-Streitschlichtung",
          content: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
        },
        {
          title: "5. Haftung für Inhalte",
          content: "Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf unseren Internetpräsenzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.\n\nVerpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.\n\nWir weisen ausdrücklich darauf hin, dass wir keines der sozialen Netzwerke, die Gegenstand unserer Dienstleistungen sind, vertreten.\n\nWir bekennen uns zur Gleichberechtigung. Wo Inhalte auf den von Enhance Stream betriebenen Internetpräsenzen den männlichen Begriff anführen, geschieht dies ausschließlich zum Zwecke der besseren Lesbarkeit und Verständlichkeit."
        },
        {
          title: "6. Haftung für Links",
          content: "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.\n\nEine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen."
        },
        {
          title: "7. Urheberrecht",
          content: "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.\n\nSoweit die Inhalte auf dieser Seite nicht vom Betreiber selbst erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen. Bitte wenden Sie sich an support@enhanceyour.stream, wenn Sie einen Urheberrechtsverstoß vermuten."
        }
      ]
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">{t.title}</h1>
        <p className="text-lg mb-8">{t.subtitle}</p>
        
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">{t.contact.title}</h2>
            <div className="whitespace-pre-line">
              {t.contact.address.join("\n")}
            </div>
          </div>

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

export default Imprint;
