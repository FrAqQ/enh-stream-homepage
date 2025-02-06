
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

interface TwitchPlayer {
  new (elementId: string, options: {
    width: string | number
    height: number
    channel: string
    parent: string[]
    autoplay?: boolean
    muted?: boolean
  }): void
}

interface Window {
  Twitch?: {
    Embed: TwitchEmbed
    Player: TwitchPlayer
  }
}
