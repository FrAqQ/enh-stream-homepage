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
      // Show certificate warning only once
      if (!hasShownCertWarning) {
        toast({
          title: "Security Notice",
          description: "This application is using a self-signed certificate. The connection is encrypted but not validated by a trusted authority.",
          duration: 6000,
          variant: "default", // Changed from "warning" to "default"
        });
        setHasShownCertWarning(true);
      }

      console.log("Starting viewer addition request:");
      console.log("- Viewer count:", viewerCount);
      console.log("- Stream URL:", streamUrl);
      console.log("- User ID:", user?.id);
      
      const apiUrl = "https://152.53.122.45:5000/add_viewer";
      
      console.log("Making fetch request to:", apiUrl);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        mode: "cors",
        credentials: "omit",
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

      toast({
        title: "Success",
        description: data.message || "Viewers added successfully!",
      });
    } catch (error) {
      console.error("Detailed error information:", {
        error,
        type: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      
      let errorMessage = "Failed to add viewers. ";
      if (error instanceof Error) {
        if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
          errorMessage += "Server connection failed. Please check:\n" +
                         "1. The server is running at https://152.53.122.45:5000\n" +
                         "2. Accept the self-signed certificate by visiting the API URL directly\n" +
                         "3. The server is accessible from your network\n" +
                         "4. Try opening your browser's developer tools (F12) to see detailed errors\n" +
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
    
    onAdd(count);
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