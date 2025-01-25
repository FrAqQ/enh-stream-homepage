import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface BotControlsProps {
  title: string
  onAdd: (count: number) => void
  type: "viewer" | "chatter"
}

export function BotControls({ title, onAdd, type }: BotControlsProps) {
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const { toast } = useToast();

  const handleButtonClick = (count: number) => {
    if (isOnCooldown) {
      toast({
        title: "Cooldown Active",
        description: "Please wait 5 seconds before adding more bots.",
        variant: "destructive",
      });
      return;
    }

    onAdd(count);
    setIsOnCooldown(true);
    
    // Start cooldown timer
    setTimeout(() => {
      setIsOnCooldown(false);
    }, 5000);
  };

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => handleButtonClick(1)} 
              variant="outline"
              disabled={isOnCooldown}
            >
              +1 {type}
            </Button>
            <Button 
              onClick={() => handleButtonClick(3)} 
              variant="outline"
              disabled={isOnCooldown}
            >
              +3 {type}s
            </Button>
            <Button 
              onClick={() => handleButtonClick(5)} 
              variant="outline"
              disabled={isOnCooldown}
            >
              +5 {type}s
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => handleButtonClick(-1)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isOnCooldown}
            >
              -1 {type}
            </Button>
            <Button 
              onClick={() => handleButtonClick(-3)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isOnCooldown}
            >
              -3 {type}s
            </Button>
            <Button 
              onClick={() => handleButtonClick(-5)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isOnCooldown}
            >
              -5 {type}s
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}