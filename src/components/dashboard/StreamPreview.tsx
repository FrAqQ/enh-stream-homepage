
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

    if (twitchChannel && window.Twitch) {
      cleanup();
      const channelName = twitchChannel.split('/').pop() || '';
      console.log("Creating Twitch embed for channel:", channelName);

      // Get the current hostname without www prefix
      const hostname = window.location.hostname.replace('www.', '');
      
      // Define parent domains array
      const parentDomains = ['localhost', '127.0.0.1', hostname];
      
      console.log("Using parent domains:", parentDomains);

      try {
        new window.Twitch.Player("twitch-embed", {
          width: "100%",
          height: 400,
          channel: channelName,
          parent: parentDomains,
          autoplay: false,
          muted: true,
        });
      } catch (error) {
        console.error("Error creating Twitch embed:", error);
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
          <div ref={embedRef} id="twitch-embed" className="w-full h-full min-h-[400px]" />
          <div className="mt-2 text-sm text-muted-foreground">
            <div>Current Channel: {twitchChannel || 'None'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
