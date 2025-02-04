import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MessageCircle, TrendingUp, Trophy, Zap, Heart, Target, Users2, MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen pt-16">
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Steigern Sie Ihre Stream-Reichweite
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Erhöhen Sie Ihre Präsenz auf Twitch, YouTube, TikTok und Instagram mit unserer umfassenden Marketing-Lösung. Perfekt für aufstrebende Streamer, die ihre Sichtbarkeit steigern möchten.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Jetzt starten <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline">
              Preise ansehen
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Warum unser Service?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BenefitCard
            icon={<Users className="h-8 w-8 text-primary" />}
            title="Community aufbauen"
            description="Starten Sie den Aufbau Ihrer Community mit aktiven Zuschauern und engagierten Chat-Teilnehmern zu den wettbewerbsfähigsten Preisen am Markt."
          />
          <BenefitCard
            icon={<MessageCircle className="h-8 w-8 text-primary" />}
            title="Aktive Chat-Umgebung"
            description="Schaffen Sie eine lebendige Chat-Atmosphäre, die echte Zuschauer zur Teilnahme ermutigt und die Authentizität Ihres Streams verbessert."
          />
          <BenefitCard
            icon={<TrendingUp className="h-8 w-8 text-primary" />}
            title="Sichtbarkeit erhöhen"
            description="Höhere Zuschauerzahlen verbessern Ihr Ranking im Twitch-Verzeichnis, besonders in Ihrer Sprachkategorie, und machen Sie besser auffindbar."
          />
          <BenefitCard
            icon={<Trophy className="h-8 w-8 text-primary" />}
            title="Multi-Plattform Support"
            description="Steigern Sie Ihre Präsenz auf Twitch, YouTube, TikTok und Instagram mit unseren umfassenden Lösungen."
          />
          <BenefitCard
            icon={<Zap className="h-8 w-8 text-primary" />}
            title="Beste Preis-Leistung"
            description="Wir bieten die kosteneffektivsten Pakete auf dem Markt mit unübertroffenen Funktionen und Flexibilität in jeder Preisklasse."
          />
          <BenefitCard
            icon={<Heart className="h-8 w-8 text-primary" />}
            title="Vertrauensaufbau"
            description="Unser schrittweiser Ansatz zur Steigerung der Zuschauer- und Chatterzahlen hilft beim Aufbau von Vertrauen und Authentizität in Ihrem Kanal."
          />
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">So erzielen Sie die besten Ergebnisse</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BestPracticeCard
            icon={<Users2 className="h-8 w-8 text-primary" />}
            title="Echte Freunde einladen"
            description="Beginnen Sie damit, Freunde zu Ihrem Stream einzuladen, auch wenn sie mit den Spielen nicht vertraut sind. Echte Interaktionen schaffen eine authentische Atmosphäre."
          />
          <BestPracticeCard
            icon={<MessagesSquare className="h-8 w-8 text-primary" />}
            title="Chat-Aktivität fördern"
            description="Ermutigen Sie Ihre Freunde zur Teilnahme an Chat-Diskussionen. Auch einfache Kommentare helfen, eine ansprechende Umgebung zu schaffen, die organische Zuschauer anzieht."
          />
          <BestPracticeCard
            icon={<Target className="h-8 w-8 text-primary" />}
            title="Mit unseren Services kombinieren"
            description="Nutzen Sie unsere Pakete zusammen mit echten Zuschauern, um Ihr Wachstumspotenzial zu maximieren. Diese Kombination verbessert Ihre Konversionsrate mit organischen Zuschauern deutlich."
          />
        </div>
        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Höhere Zuschauerzahlen verbessern Ihre Sichtbarkeit in den Twitch-Rankings erheblich, besonders in Ihrer Sprachkategorie. Unser schrittweiser Wachstumsansatz gewährleistet eine authentische Kanalentwicklung bei gleichzeitig wettbewerbsfähigsten Preisen am Markt.
          </p>
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Starten Sie Ihr Kanalwachstum <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-12">Maximieren Sie Ihre Streaming-Einnahmen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <RevenueCard
            title="Abonnements"
            amount="$2.50"
            description="Pro Abonnent monatlich"
          />
          <RevenueCard
            title="Bits"
            amount="$0.01"
            description="Pro gespendeten Bit"
          />
          <RevenueCard
            title="Werbung"
            amount="$3.50"
            description="CPM für Werbung"
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