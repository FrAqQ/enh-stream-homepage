import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PricingCard = ({ 
  title, 
  price, 
  viewers, 
  chatters, 
  paymentLink,
  isPopular 
}: { 
  title: string;
  price: number;
  viewers: number;
  chatters: number;
  paymentLink: string;
  isPopular?: boolean;
}) => {
  const handleSelectPlan = () => {
    window.location.href = paymentLink;
  };

  return (
    <Card className={`p-6 relative ${isPopular ? 'border-primary' : 'bg-card/50 backdrop-blur'}`}>
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded-full text-xs">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-6">€{price.toFixed(2)}</p>
      <ul className="space-y-2 mb-6">
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> {viewers} Viewers
        </li>
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> {chatters} Chatters
        </li>
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> Duration: 1 Month
        </li>
      </ul>
      <Button 
        className="w-full"
        onClick={handleSelectPlan}
      >
        Select Plan
      </Button>
    </Card>
  );
};

const FollowerPricingCard = ({ 
  title, 
  price, 
  followers,
  duration,
  paymentLink,
  isPopular 
}: { 
  title: string;
  price: number;
  followers: number;
  duration: string;
  paymentLink: string;
  isPopular?: boolean;
}) => {
  const handleSelectPlan = () => {
    window.location.href = paymentLink;
  };

  return (
    <Card className={`p-6 relative ${isPopular ? 'border-primary' : 'bg-card/50 backdrop-blur'}`}>
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded-full text-xs">
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-6">€{price.toFixed(2)}</p>
      <ul className="space-y-2 mb-6">
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> {followers} Followers/day
        </li>
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> Duration: {duration}
        </li>
      </ul>
      <Button 
        className="w-full"
        onClick={handleSelectPlan}
      >
        Select Plan
      </Button>
    </Card>
  );
};

const Pricing = () => {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-center mb-4">Viewer & Chatter Plans</h1>
      <p className="text-muted-foreground text-center mb-12">Choose the perfect plan for your streaming needs</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-20">
        <PricingCard 
          title="Starter" 
          price={9.99} 
          viewers={15} 
          chatters={5} 
          paymentLink="https://buy.stripe.com/test_14k14L3YLd2n22Y289"
        />
        <PricingCard 
          title="Basic" 
          price={17.99} 
          viewers={35} 
          chatters={10} 
          paymentLink="https://buy.stripe.com/test_14k14L3YLd2n22Y289"
        />
        <PricingCard 
          title="Professional" 
          price={49.99} 
          viewers={100} 
          chatters={30} 
          paymentLink="https://buy.stripe.com/test_14k14L3YLd2n22Y289"
          isPopular 
        />
        <PricingCard 
          title="Expert" 
          price={129.99} 
          viewers={300} 
          chatters={90} 
          paymentLink="https://buy.stripe.com/test_14k14L3YLd2n22Y289"
        />
        <PricingCard 
          title="Ultimate" 
          price={219.99} 
          viewers={600} 
          chatters={200} 
          paymentLink="https://buy.stripe.com/test_14k14L3YLd2n22Y289"
        />
      </div>

      <h2 className="text-4xl font-bold text-center mb-4">Follower Plans</h2>
      <p className="text-muted-foreground text-center mb-12">Boost your follower count with our targeted plans</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <FollowerPricingCard 
          title="Starter" 
          price={9.99} 
          followers={100} 
          duration="1 Week"
          paymentLink="https://buy.stripe.com/test_14k14L3YLd2n22Y289"
        />
        <FollowerPricingCard 
          title="Basic" 
          price={29.99} 
          followers={100} 
          duration="1 Month"
          paymentLink="https://buy.stripe.com/test_14k14L3YLd2n22Y289"
        />
        <FollowerPricingCard 
          title="Professional" 
          price={99.99} 
          followers={250} 
          duration="2 Months"
          paymentLink="https://buy.stripe.com/test_14k14L3YLd2n22Y289"
          isPopular 
        />
        <FollowerPricingCard 
          title="Expert" 
          price={179.99} 
          followers={500} 
          duration="2 Months"
          paymentLink="https://buy.stripe.com/test_14k14L3YLd2n22Y289"
        />
        <FollowerPricingCard 
          title="Ultimate" 
          price={399.99} 
          followers={1000} 
          duration="2 Months"
          paymentLink="https://buy.stripe.com/test_14k14L3YLd2n22Y289"
        />
      </div>
    </div>
  );
};

export default Pricing;