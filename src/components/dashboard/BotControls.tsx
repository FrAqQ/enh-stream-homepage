import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/lib/useUser"

interface BotControlsProps {
  title: string
  onAdd: (count: number) => void
  type: "viewer" | "chatter"
  streamUrl: string
}

export function BotControls({ title, onAdd, type, streamUrl }: BotControlsProps) {
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const addViewer = async (viewerCount: number) => {
    try {
      console.log("Adding viewers:", viewerCount);
      console.log("Stream URL:", streamUrl);
      console.log("User ID:", user?.id);

      const response = await fetch("http://localhost:5000/add_viewer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: user?.id,
          twitch_url: streamUrl,
          viewer_count: viewerCount
        })
      });

      const data = await response.json();
      console.log("API Response:", data);

      toast({
        title: "Success",
        description: data.message || "Viewers added successfully!",
      });
    } catch (error) {
      console.error("Error adding viewers:", error);
      toast({
        title: "Error",
        description: "Failed to add viewers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleButtonClick = async (count: number) => {
    if (isOnCooldown) {
      toast({
        title: "Cooldown Active",
        description: "Please wait 5 seconds before adding more bots.",
        variant: "destructive",
      });
      return;
    }

    if (type === "viewer") {
      await addViewer(count);
    }
    
    onAdd(count);
    setIsOnCooldown(true);
    
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
              disabled={isOnCooldown || !streamUrl}
            >
              +1 {type}
            </Button>
            <Button 
              onClick={() => handleButtonClick(3)} 
              variant="outline"
              disabled={isOnCooldown || !streamUrl}
            >
              +3 {type}s
            </Button>
            <Button 
              onClick={() => handleButtonClick(5)} 
              variant="outline"
              disabled={isOnCooldown || !streamUrl}
            >
              +5 {type}s
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => handleButtonClick(-1)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isOnCooldown || !streamUrl}
            >
              -1 {type}
            </Button>
            <Button 
              onClick={() => handleButtonClick(-3)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isOnCooldown || !streamUrl}
            >
              -3 {type}s
            </Button>
            <Button 
              onClick={() => handleButtonClick(-5)} 
              variant="outline" 
              className="text-red-500 hover:text-red-600"
              disabled={isOnCooldown || !streamUrl}
            >
              -5 {type}s
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}