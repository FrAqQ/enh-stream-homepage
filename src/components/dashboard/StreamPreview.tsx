import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StreamPreviewProps {
  twitchChannel: string
  isScriptLoaded: boolean
  createEmbed: (channelName: string) => void
}

export function StreamPreview({ twitchChannel }: StreamPreviewProps) {
  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Stream Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full max-w-2xl mx-auto bg-black/20 rounded-lg overflow-hidden">
          {twitchChannel && (
            <iframe
              src={twitchChannel}
              className="w-full h-full min-h-[400px]"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          )}
          <div className="mt-2 text-sm text-muted-foreground">
            <div>Current URL: {twitchChannel || 'None'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}