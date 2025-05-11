import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MessageCircle, TrendingUp, Trophy, Zap, Heart, Target, Users2, MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/LanguageContext";
import { useEffect } from "react";

const Landing = () => {
  const { language } = useLanguage();
  
  // Debugging-Log hinzufügen
  useEffect(() => {
    console.log("Landing component rendered", { language });
  }, [language]);

  const translations = {
    en: {
      hero: {
        title: "Enhance Your Stream Visibility",
        subtitle: "Boost your presence on Twitch, YouTube, TikTok and Instagram with our comprehensive marketing solution. Perfect for content creators looking to increase their reach."
      },
      cta: {
        start: "Get Started",
        pricing: "View Pricing"
      },
      whyUs: {
        title: "Why Choose Our Service?",
        community: {
          title: "Enhance Visibility",
          description: "Start building your presence with our marketing solutions at competitive market prices."
        },
        chat: {
          title: "Active Environment",
          description: "Create a vibrant atmosphere that enhances your stream's engagement metrics."
        },
        visibility: {
          title: "Improved Discoverability",
          description: "Higher engagement metrics improve your ranking in platform directories, making your content more discoverable."
        },
        multiPlatform: {
          title: "Multi-Platform Support",
          description: "Boost your presence on Twitch, YouTube, TikTok and Instagram with our comprehensive solutions."
        },
        pricing: {
          title: "Best Value",
          description: "We offer the most cost-effective marketing packages with unmatched features and flexibility in every price tier."
        },
        trust: {
          title: "Strategic Growth",
          description: "Our gradual approach to increasing engagement helps build sustainable growth for your channel."
        }
      },
      bestResults: {
        title: "How to Achieve the Best Results",
        friends: {
          title: "Community Engagement",
          description: "Start by engaging with your community. Active participation creates an authentic atmosphere."
        },
        chat: {
          title: "Encourage Activity",
          description: "Foster discussions in your community. Even simple interactions help create an engaging environment."
        },
        combine: {
          title: "Marketing Strategy",
          description: "Use our marketing packages to maximize your growth potential. Our solutions are designed to improve your platform metrics effectively."
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
        title: "Verbessern Sie Ihre Stream-Sichtbarkeit",
        subtitle: "Steigern Sie Ihre Präsenz auf Twitch, YouTube, TikTok und Instagram mit unserer umfassenden Marketing-Lösung. Perfekt für Content Creator, die ihre Reichweite erhöhen möchten."
      },
      cta: {
        start: "Jetzt starten",
        pricing: "Preise ansehen"
      },
      whyUs: {
        title: "Warum unser Service?",
        community: {
          title: "Sichtbarkeit steigern",
          description: "Starten Sie die Steigerung Ihrer Präsenz mit unseren Marketing-Lösungen zu wettbewerbsfähigen Marktpreisen."
        },
        chat: {
          title: "Aktive Umgebung",
          description: "Schaffen Sie eine lebendige Atmosphäre, die Ihre Stream-Metriken verbessert."
        },
        visibility: {
          title: "Bessere Auffindbarkeit",
          description: "Höhere Engagement-Metriken verbessern Ihr Ranking in Plattform-Verzeichnissen und machen Sie besser auffindbar."
        },
        multiPlatform: {
          title: "Multi-Plattform Support",
          description: "Steigern Sie Ihre Präsenz auf Twitch, YouTube, TikTok und Instagram mit unseren umfassenden Lösungen."
        },
        pricing: {
          title: "Beste Preis-Leistung",
          description: "Wir bieten die kosteneffektivsten Marketing-Pakete mit unübertroffenen Funktionen und Flexibilität in jeder Preisklasse."
        },
        trust: {
          title: "Strategisches Wachstum",
          description: "Unser schrittweiser Ansatz zur Steigerung des Engagements unterstützt nachhaltiges Wachstum Ihres Kanals."
        }
      },
      bestResults: {
        title: "So erzielen Sie die besten Ergebnisse",
        friends: {
          title: "Community Engagement",
          description: "Beginnen Sie damit, mit Ihrer Community zu interagieren. Aktive Teilnahme schafft eine authentische Atmosphäre."
        },
        chat: {
          title: "Aktivität fördern",
          description: "Fördern Sie Diskussionen in Ihrer Community. Auch einfache Interaktionen helfen, eine ansprechende Umgebung zu schaffen."
        },
        combine: {
          title: "Marketing-Strategie",
          description: "Nutzen Sie unsere Marketing-Pakete, um Ihr Wachstumspotenzial zu maximieren. Unsere Lösungen sind darauf ausgelegt, Ihre Plattform-Metriken effektiv zu verbessern."
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
              {language === 'en' ? "Get Started" : "Jetzt starten"} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline">
              {language === 'en' ? "View Pricing" : "Preise ansehen"}
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
