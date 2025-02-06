
import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StreamPreviewProps {
  twitchChannel: string
}

export function StreamPreview({ twitchChannel }: StreamPreviewProps) {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cleanup function for previous embed
    const cleanup = () => {
      if (embedRef.current) {
        embedRef.current.innerHTML = '';
      }
    };

    if (twitchChannel) {
      cleanup();
      const channelName = twitchChannel.split('/').pop() || '';
      console.log("Creating Twitch embed for channel:", channelName);

      // Create the iframe element
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.twitch.tv/?channel=${channelName}&parent=${window.location.hostname}`;
      iframe.height = "400";
      iframe.width = "100%";
      iframe.allowFullscreen = true;
      iframe.style.border = "none";
      
      // Add the iframe to the container
      if (embedRef.current) {
        embedRef.current.appendChild(iframe);
      }
    }

    return cleanup;
  }, [twitchChannel]);

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Stream Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full max-w-2xl mx-auto bg-black/20 rounded-lg overflow-hidden">
          <div ref={embedRef} className="w-full h-full min-h-[400px]" />
          <div className="mt-2 text-sm text-muted-foreground">
            <div>Current Channel: {twitchChannel || 'None'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
