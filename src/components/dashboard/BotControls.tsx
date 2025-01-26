import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@/lib/useUser"
import { AlertCircle } from "lucide-react"

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
  const [hasShownCertWarning, setHasShownCertWarning] = useState(false);

  const addViewer = async (viewerCount: number) => {
    try {
      if (!hasShownCertWarning) {
        toast({
          title: "Security Notice",
          description: "Please visit https://152.53.122.45:5000 directly in your browser, click 'Advanced' and accept the certificate before continuing.",
          duration: 10000,
          variant: "default",
        });
        setHasShownCertWarning(true);
      }

      console.log("Starting viewer addition request with details:");
      console.log({
        user_id: user?.id,
        twitch_url: streamUrl,
        viewer_count: viewerCount
      });
      
      const apiUrl = "https://152.53.122.45:5000/add_viewer";
      
      console.log("Making fetch request to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          twitch_url: streamUrl,
          viewer_count: viewerCount
        })
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response data:", data);

      // Check if the message contains an error, regardless of status
      if (data.message && (
        data.message.toLowerCase().includes('fehler') || 
        data.message.toLowerCase().includes('error') ||
        data.message.toLowerCase().includes('konnte nicht gestartet')
      )) {
        console.error("Server reported an error:", data.message);
        toast({
          title: "Warning",
          description: "The viewer bot encountered an issue. Server message: " + data.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: data.message || "Viewers added successfully!",
      });
      
      // Call onAdd even if there was an error to update UI
      onAdd(viewerCount);
    } catch (error) {
      console.error("Detailed error information:", {
        error,
        type: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      
      let errorMessage = "Failed to add viewers. ";
      if (error instanceof Error) {
        if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
          errorMessage = "Server connection failed. Please:\n" +
                        "1. Visit https://152.53.122.45:5000 directly\n" +
                        "2. Click 'Advanced' and 'Accept the Risk'\n" +
                        "3. Return here and try again\n" +
                        "If issues persist, contact support.";
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
    
    setIsOnCooldown(true);
    
    setTimeout(() => {
      setIsOnCooldown(false);
    }, 5000);
  };

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          {title}
          {!hasShownCertWarning && (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
        </CardTitle>
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