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

      // Convert HTTP to HTTPS if needed
      const apiUrl = "http://152.53.122.45:5000/add_viewer".replace('http://', 'https://');
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          twitch_url: streamUrl,
          viewer_count: viewerCount
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      toast({
        title: "Success",
        description: data.message || "Viewers added successfully!",
      });
    } catch (error) {
      console.error("Error adding viewers:", error);
      
      let errorMessage = "Failed to add viewers. ";
      if (error instanceof Error) {
        if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
          errorMessage += "The viewer server appears to be offline or not accessible via HTTPS. Please contact support.";
        } else {
          errorMessage += error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
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