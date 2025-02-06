
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StreamPreviewProps {
  twitchChannel: string
}

export function StreamPreview({ twitchChannel }: StreamPreviewProps) {
  const channelName = twitchChannel.split('/').pop() || '';

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Stream Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full max-w-2xl mx-auto bg-black/20 rounded-lg overflow-hidden">
          <iframe 
            src={`https://player.twitch.tv/?channel=${channelName}&parent=gpteng.co`}
            frameBorder="0"
            allowFullScreen={true}
            scrolling="no"
            className="w-full h-full min-h-[400px]"
          />
          <div className="mt-2 text-sm text-muted-foreground">
            <div>Current Channel: {twitchChannel || 'None'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
