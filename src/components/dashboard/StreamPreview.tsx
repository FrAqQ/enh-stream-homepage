import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StreamPreviewProps {
  twitchChannel: string
}

export function StreamPreview({ twitchChannel }: StreamPreviewProps) {
  const embedRef = useRef<HTMLDivElement>(null);
  const embedInstance = useRef<any>(null);

  useEffect(() => {
    // Cleanup function for previous embed
    const cleanup = () => {
      if (embedRef.current) {
        embedRef.current.innerHTML = '';
      }
      embedInstance.current = null;
    };

    if (twitchChannel && window.Twitch) {
      cleanup();
      const channelName = twitchChannel.split('/').pop() || '';
      console.log("Creating Twitch embed for channel:", channelName);

      try {
        embedInstance.current = new window.Twitch.Embed("twitch-embed", {
          width: "100%",
          height: "400",
          channel: channelName,
          layout: "video",
          autoplay: false,
          muted: true,
          theme: "dark",
          // Wichtig: parent muss die aktuelle Domain enthalten
          parent: [window.location.hostname]
        });

        embedInstance.current.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
          console.log("Twitch player is ready");
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
            <div>Current URL: {twitchChannel || 'None'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}