
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MessageCircle, TrendingUp, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/lib/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();

  const translations = {
    en: {
      meta: {
        title: "Viewer Boost Galaxy - Enhance Your Stream Visibility",
        description: "Boost your presence on Twitch, YouTube, TikTok and Instagram with our comprehensive marketing solution. Perfect for content creators looking to increase their reach."
      },
      hero: {
        title: "Enhance Your Stream Visibility",
        subtitle: "Boost your presence on Twitch, YouTube, TikTok and Instagram with our comprehensive marketing solution."
      },
      features: {
        title: "Why Choose Our Service?",
        items: [
          {
            icon: <Users className="h-8 w-8 text-primary" />,
            title: "Enhanced Visibility",
            description: "Start building your presence with our marketing solutions at competitive market prices."
          },
          {
            icon: <MessageCircle className="h-8 w-8 text-primary" />,
            title: "Active Environment",
            description: "Create a vibrant atmosphere that enhances your stream's engagement metrics."
          },
          {
            icon: <TrendingUp className="h-8 w-8 text-primary" />,
            title: "Improved Discoverability",
            description: "Higher engagement metrics improve your ranking in platform directories."
          },
          {
            icon: <Trophy className="h-8 w-8 text-primary" />,
            title: "Multi-Platform Support",
            description: "Boost your presence across all major streaming and social media platforms."
          }
        ]
      },
      cta: {
        main: "Get Started",
        secondary: "Learn More"
      }
    },
    de: {
      meta: {
        title: "Viewer Boost Galaxy - Verbessere Deine Stream-Sichtbarkeit",
        description: "Steigere Deine Präsenz auf Twitch, YouTube, TikTok und Instagram mit unserer umfassenden Marketing-Lösung. Perfekt für Content Creator, die ihre Reichweite erhöhen möchten."
      },
      hero: {
        title: "Verbessere Deine Stream-Sichtbarkeit",
        subtitle: "Steigere Deine Präsenz auf Twitch, YouTube, TikTok und Instagram mit unserer umfassenden Marketing-Lösung."
      },
      features: {
        title: "Warum Unser Service?",
        items: [
          {
            icon: <Users className="h-8 w-8 text-primary" />,
            title: "Erhöhte Sichtbarkeit",
            description: "Beginne mit dem Aufbau Deiner Präsenz durch unsere Marketinglösungen zu wettbewerbsfähigen Preisen."
          },
          {
            icon: <MessageCircle className="h-8 w-8 text-primary" />,
            title: "Aktive Umgebung",
            description: "Schaffe eine lebendige Atmosphäre, die die Engagement-Metriken Deines Streams verbessert."
          },
          {
            icon: <TrendingUp className="h-8 w-8 text-primary" />,
            title: "Verbesserte Auffindbarkeit",
            description: "Höhere Engagement-Metriken verbessern Dein Ranking in Plattform-Verzeichnissen."
          },
          {
            icon: <Trophy className="h-8 w-8 text-primary" />,
            title: "Multi-Plattform Support",
            description: "Steigere Deine Präsenz auf allen wichtigen Streaming- und Social-Media-Plattformen."
          }
        ]
      },
      cta: {
        main: "Jetzt Starten",
        secondary: "Mehr Erfahren"
      }
    }
  };

  const t = translations[language];

  return (
    <>
      <Helmet>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <meta property="og:title" content={t.meta.title} />
        <meta property="og:description" content={t.meta.description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.meta.title} />
        <meta name="twitter:description" content={t.meta.description} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent" 
                role="heading" aria-level={1}>
              {t.hero.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size={isMobile ? "default" : "lg"} className="gap-2 w-full sm:w-auto">
                  {t.cta.main} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size={isMobile ? "default" : "lg"} variant="outline" className="w-full sm:w-auto">
                  {t.cta.secondary}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 bg-card/50 rounded-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" role="heading" aria-level={2}>
            {t.features.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.features.items.map((feature, index) => (
              <div key={index} className="bg-card rounded-lg p-6 hover:shadow-lg transition-shadow duration-300 border border-border">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="max-w-3xl mx-auto glass-morphism p-8 rounded-lg">
            <h2 className="text-2xl md:text-3xl font-bold mb-4" role="heading" aria-level={2}>
              {language === 'en' ? 'Ready to grow your audience?' : 'Bereit, deine Zuschauerzahl zu steigern?'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'en' 
                ? 'Join thousands of content creators who have boosted their visibility.'
                : 'Schließe dich Tausenden von Content-Erstellern an, die ihre Sichtbarkeit gesteigert haben.'}
            </p>
            <Link to="/register">
              <Button size={isMobile ? "default" : "lg"} className="gap-2">
                {t.cta.main} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
