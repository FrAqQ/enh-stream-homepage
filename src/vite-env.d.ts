/// <reference types="vite/client" />

interface TwitchEmbed {
  VIDEO_READY: string
  new (elementId: string, options: {
    width: string | number
    height: string | number
    channel: string
    layout?: string
    autoplay?: boolean
    muted?: boolean
    theme?: string
    parent: string[]
  }): {
    addEventListener: (event: string, callback: () => void) => void
  }
}

interface Window {
  Twitch?: {
    Embed: TwitchEmbed
  }
}