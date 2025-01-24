import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface StreamPreviewProps {
  twitchChannel: string
  isScriptLoaded: boolean
  createEmbed: (channelName: string) => void
}

export function StreamPreview({ twitchChannel, isScriptLoaded, createEmbed }: StreamPreviewProps) {
  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Stream Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full max-w-2xl mx-auto bg-black/20 rounded-lg overflow-hidden">
          <div id="twitch-embed" className="w-full h-full min-h-[400px]"></div>
          <div className="mt-2 text-sm text-muted-foreground">
            <div>Current channel: {twitchChannel || 'None'}</div>
            <div>Domain: {window.location.hostname || 'localhost'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}