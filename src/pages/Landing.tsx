import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MessageCircle, TrendingUp, Trophy, Zap, Heart, Target, Users2, MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";

const Landing = () => {
  const { language } = useLanguage();

  const translations = {
    en: {
      hero: {
        title: "Increase Your Stream Reach",
        subtitle: "Boost your presence on Twitch, YouTube, TikTok and Instagram with our comprehensive marketing solution. Perfect for aspiring streamers looking to increase their visibility."
      },
      cta: {
        start: "Get Started",
        pricing: "View Pricing"
      },
      whyUs: {
        title: "Why Choose Our Service?",
        community: {
          title: "Build Community",
          description: "Start building your community with active viewers and engaged chat participants at the most competitive prices in the market."
        },
        chat: {
          title: "Active Chat Environment",
          description: "Create a vibrant chat atmosphere that encourages real viewers to participate and enhances your stream's authenticity."
        },
        visibility: {
          title: "Increase Visibility",
          description: "Higher viewer numbers improve your ranking in the Twitch directory, especially in your language category, making you more discoverable."
        },
        multiPlatform: {
          title: "Multi-Platform Support",
          description: "Boost your presence on Twitch, YouTube, TikTok and Instagram with our comprehensive solutions."
        },
        pricing: {
          title: "Best Value",
          description: "We offer the most cost-effective packages in the market with unmatched features and flexibility in every price tier."
        },
        trust: {
          title: "Build Trust",
          description: "Our gradual approach to increasing viewer and chatter numbers helps build trust and authenticity in your channel."
        }
      },
      bestResults: {
        title: "How to Achieve the Best Results",
        friends: {
          title: "Invite Real Friends",
          description: "Start by inviting friends to your stream, even if they're not familiar with the games. Real interactions create an authentic atmosphere."
        },
        chat: {
          title: "Encourage Chat Activity",
          description: "Encourage your friends to participate in chat discussions. Even simple comments help create an engaging environment that attracts organic viewers."
        },
        combine: {
          title: "Combine With Our Services",
          description: "Use our packages along with real viewers to maximize your growth potential. This combination significantly improves your conversion rate with organic viewers."
        }
      },
      revenue: {
        title: "Maximize Your Streaming Revenue",
        subscriptions: {
          title: "Subscriptions",
          amount: "$2.50",
          description: "Per subscriber monthly"
        },
        bits: {
          title: "Bits",
          amount: "$0.01",
          description: "Per bit donated"
        },
        ads: {
          title: "Advertising",
          amount: "$3.50",
          description: "CPM for ads"
        }
      }
    },
    de: {
      hero: {
        title: "Steigern Sie Ihre Stream-Reichweite",
        subtitle: "Erhöhen Sie Ihre Präsenz auf Twitch, YouTube, TikTok und Instagram mit unserer umfassenden Marketing-Lösung. Perfekt für aufstrebende Streamer, die ihre Sichtbarkeit steigern möchten."
      },
      cta: {
        start: "Jetzt starten",
        pricing: "Preise ansehen"
      },
      whyUs: {
        title: "Warum unser Service?",
        community: {
          title: "Community aufbauen",
          description: "Starten Sie den Aufbau Ihrer Community mit aktiven Zuschauern und engagierten Chat-Teilnehmern zu den wettbewerbsfähigsten Preisen am Markt."
        },
        chat: {
          title: "Aktive Chat-Umgebung",
          description: "Schaffen Sie eine lebendige Chat-Atmosphäre, die echte Zuschauer zur Teilnahme ermutigt und die Authentizität Ihres Streams verbessert."
        },
        visibility: {
          title: "Sichtbarkeit erhöhen",
          description: "Höhere Zuschauerzahlen verbessern Ihr Ranking im Twitch-Verzeichnis, besonders in Ihrer Sprachkategorie, und machen Sie besser auffindbar."
        },
        multiPlatform: {
          title: "Multi-Plattform Support",
          description: "Steigern Sie Ihre Präsenz auf Twitch, YouTube, TikTok und Instagram mit unseren umfassenden Lösungen."
        },
        pricing: {
          title: "Beste Preis-Leistung",
          description: "Wir bieten die kosteneffektivsten Pakete auf dem Markt mit unübertroffenen Funktionen und Flexibilität in jeder Preisklasse."
        },
        trust: {
          title: "Vertrauensaufbau",
          description: "Unser schrittweiser Ansatz zur Steigerung der Zuschauer- und Chatterzahlen hilft beim Aufbau von Vertrauen und Authentizität in Ihrem Kanal."
        }
      },
      bestResults: {
        title: "So erzielen Sie die besten Ergebnisse",
        friends: {
          title: "Echte Freunde einladen",
          description: "Beginnen Sie damit, Freunde zu Ihrem Stream einzuladen, auch wenn sie mit den Spielen nicht vertraut sind. Echte Interaktionen schaffen eine authentische Atmosphäre."
        },
        chat: {
          title: "Chat-Aktivität fördern",
          description: "Ermutigen Sie Ihre Freunde zur Teilnahme an Chat-Diskussionen. Auch einfache Kommentare helfen, eine ansprechende Umgebung zu schaffen, die organische Zuschauer anzieht."
        },
        combine: {
          title: "Mit unseren Services kombinieren",
          description: "Nutzen Sie unsere Pakete zusammen mit Zuschauern, um Ihr Wachstumspotenzial zu maximieren. Diese Kombination verbessert Ihre Konversionsrate mit organischen Zuschauern deutlich."
        }
      },
      revenue: {
        title: "Maximieren Sie Ihre Streaming-Einnahmen",
        subscriptions: {
          title: "Abonnements",
          amount: "$2.50",
          description: "Pro Abonnent monatlich"
        },
        bits: {
          title: "Bits",
          amount: "$0.01",
          description: "Pro gespendeten Bit"
        },
        ads: {
          title: "Werbung",
          amount: "$3.50",
          description: "CPM für Werbung"
        }
      }
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen pt-16">
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          {t.hero.title}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t.hero.subtitle}
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="gap-2">
              {t.cta.start} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline">
              {t.cta.pricing}
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">{t.whyUs.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BenefitCard
            icon={<Users className="h-8 w-8 text-primary" />}
            title={t.whyUs.community.title}
            description={t.whyUs.community.description}
          />
          <BenefitCard
            icon={<MessageCircle className="h-8 w-8 text-primary" />}
            title={t.whyUs.chat.title}
            description={t.whyUs.chat.description}
          />
          <BenefitCard
            icon={<TrendingUp className="h-8 w-8 text-primary" />}
            title={t.whyUs.visibility.title}
            description={t.whyUs.visibility.description}
          />
          <BenefitCard
            icon={<Trophy className="h-8 w-8 text-primary" />}
            title={t.whyUs.multiPlatform.title}
            description={t.whyUs.multiPlatform.description}
          />
          <BenefitCard
            icon={<Zap className="h-8 w-8 text-primary" />}
            title={t.whyUs.pricing.title}
            description={t.whyUs.pricing.description}
          />
          <BenefitCard
            icon={<Heart className="h-8 w-8 text-primary" />}
            title={t.whyUs.trust.title}
            description={t.whyUs.trust.description}
          />
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">{t.bestResults.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BestPracticeCard
            icon={<Users2 className="h-8 w-8 text-primary" />}
            title={t.bestResults.friends.title}
            description={t.bestResults.friends.description}
          />
          <BestPracticeCard
            icon={<MessagesSquare className="h-8 w-8 text-primary" />}
            title={t.bestResults.chat.title}
            description={t.bestResults.chat.description}
          />
          <BestPracticeCard
            icon={<Target className="h-8 w-8 text-primary" />}
            title={t.bestResults.combine.title}
            description={t.bestResults.combine.description}
          />
        </div>
        <div className="mt-12 text-center">
          <Link to="/register">
            <Button size="lg" className="gap-2">
              {t.cta.start} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-12">{t.revenue.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <RevenueCard
            title={t.revenue.subscriptions.title}
            amount={t.revenue.subscriptions.amount}
            description={t.revenue.subscriptions.description}
          />
          <RevenueCard
            title={t.revenue.bits.title}
            amount={t.revenue.bits.amount}
            description={t.revenue.bits.description}
          />
          <RevenueCard
            title={t.revenue.ads.title}
            amount={t.revenue.ads.amount}
            description={t.revenue.ads.description}
          />
        </div>
      </section>
    </div>
  );
};

const BestPracticeCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const BenefitCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const RevenueCard = ({ title, amount, description }: { title: string; amount: string; description: string }) => (
  <div className="p-6 rounded-lg bg-card border border-border">
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-3xl font-bold text-primary mb-2">{amount}</p>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Landing;