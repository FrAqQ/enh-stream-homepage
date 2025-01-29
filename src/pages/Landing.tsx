import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MessageCircle, TrendingUp, Trophy, Zap, Heart, Target, Users2, MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen pt-16">
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Enhance Your Streaming Experience
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Boost your Twitch presence with our comprehensive viewer and chat bot solution. Perfect for growing streamers looking to make their mark.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline">
              View Pricing
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Service?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BenefitCard
            icon={<Users className="h-8 w-8 text-primary" />}
            title="Grow Your Community"
            description="Start building your community with active viewers and engaging chat participants."
          />
          <BenefitCard
            icon={<MessageCircle className="h-8 w-8 text-primary" />}
            title="Active Chat Environment"
            description="Create a lively chat atmosphere that encourages real viewers to participate."
          />
          <BenefitCard
            icon={<TrendingUp className="h-8 w-8 text-primary" />}
            title="Increase Visibility"
            description="Boost your channel's visibility in Twitch's directory and attract organic growth."
          />
          <BenefitCard
            icon={<Trophy className="h-8 w-8 text-primary" />}
            title="Reach Partner Status"
            description="Achieve Twitch Partner status faster with consistent viewer numbers."
          />
          <BenefitCard
            icon={<Zap className="h-8 w-8 text-primary" />}
            title="Boost Engagement"
            description="Higher viewer counts lead to more real user interaction and community growth."
          />
          <BenefitCard
            icon={<Heart className="h-8 w-8 text-primary" />}
            title="Support Small Streamers"
            description="Perfect solution for new streamers looking to establish their presence."
          />
        </div>
      </section>

      {/* Best Practices Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How to Get the Best Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BestPracticeCard
            icon={<Users2 className="h-8 w-8 text-primary" />}
            title="Invite Real Friends"
            description="Start by inviting friends to your stream, even if they're not familiar with the games you play. Real interactions create an authentic atmosphere."
          />
          <BestPracticeCard
            icon={<MessagesSquare className="h-8 w-8 text-primary" />}
            title="Encourage Chat Activity"
            description="Guide your friends to participate in chat discussions. Even basic comments help create an engaging environment that attracts organic viewers."
          />
          <BestPracticeCard
            icon={<Target className="h-8 w-8 text-primary" />}
            title="Combine with Our Services"
            description="Use our packages alongside real viewers to maximize your growth potential. This combination significantly improves your conversion rate with organic viewers."
          />
        </div>
        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            While our services work great on their own, combining them with real viewers who actively participate in chat creates the most natural growth environment. This strategy helps attract and retain organic viewers more effectively, accelerating your path to success.
          </p>
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Start Growing Your Channel <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-12">Maximize Your Streaming Revenue</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <RevenueCard
            title="Subscriptions"
            amount="$2.50"
            description="Per subscriber monthly"
          />
          <RevenueCard
            title="Bits"
            amount="$0.01"
            description="Per bit donated"
          />
          <RevenueCard
            title="Ads"
            amount="$3.50"
            description="CPM for ads"
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
