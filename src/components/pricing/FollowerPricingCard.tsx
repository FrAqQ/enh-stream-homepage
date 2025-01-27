import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/useUser";
import { handleFollowerPlanSelection } from "@/lib/subscription";

interface FollowerPricingCardProps {
  title: string;
  price: number;
  followers: number;
  duration: string;
  isPopular?: boolean;
  priceId?: string;
}

export const FollowerPricingCard = ({
  title,
  price,
  followers,
  duration,
  isPopular,
  priceId,
}: FollowerPricingCardProps) => {
  const { user } = useUser();
  const { toast } = useToast();

  const handleSelectPlan = () => {
    handleFollowerPlanSelection({
      user,
      toast,
      priceId,
    });
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