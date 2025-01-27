import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/useUser";
import { handlePlanSelection } from "@/lib/subscription";

interface ViewerPricingCardProps {
  title: string;
  price: number;
  viewers: number;
  chatters: number;
  isPopular?: boolean;
  isFree?: boolean;
  priceId?: string;
  currentPlan: string;
}

export const ViewerPricingCard = ({
  title,
  price,
  viewers,
  chatters,
  isPopular,
  isFree,
  priceId,
  currentPlan,
}: ViewerPricingCardProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const isCurrentPlan = currentPlan === title;

  const handleSelectPlan = () => {
    handlePlanSelection({
      user,
      toast,
      isCurrentPlan,
      isFree,
      priceId,
      title,
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
      <p className="text-3xl font-bold mb-6">{isFree ? 'Free' : `€${price.toFixed(2)}`}</p>
      <ul className="space-y-2 mb-6">
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> {viewers} Viewers
        </li>
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> {chatters} Chatters
        </li>
        <li className="flex items-center gap-2">
          <span className="text-primary">✓</span> Duration: {isFree ? 'Forever' : '1 Month'}
        </li>
      </ul>
      <Button 
        className="w-full"
        onClick={handleSelectPlan}
        variant={isCurrentPlan ? "secondary" : "default"}
      >
        {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
      </Button>
    </Card>
  );
};