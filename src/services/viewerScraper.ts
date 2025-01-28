export async function getViewerCount(channelUrl: string): Promise<number> {
  try {
    const channelName = channelUrl.split('/').pop() || '';
    console.log("Fetching viewer count for channel:", channelName);
    
    // Direkte URL zur Twitch-Seite
    const twitchUrl = `https://www.twitch.tv/${channelName}`;
    console.log("Fetching from URL:", twitchUrl);
    
    // Verwende einen CORS-Proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(twitchUrl)}`;
    
    const response = await fetch(proxyUrl);
    const html = await response.text();
    
    console.log("Received HTML response length:", html.length);
    
    // Verschiedene Möglichkeiten, die Viewer-Zahl zu finden
    const patterns = [
      /"viewersCount":(\d+)/, // JSON-Daten im Script-Tag
      /aria-label="(\d+)\s+viewers"/, // Aria-Label
      /class="tw-animated-number[^"]*">(\d+)/, // Twitch Klasse
      /<p[^>]*>(\d+)\s+viewers<\/p>/, // Viewer Text
      /data-a-target="channel-viewer-count[^"]*">(\d+)/ // Data Attribute
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const count = parseInt(match[1], 10);
        console.log("Found viewer count using pattern:", pattern, "count:", count);
        return count;
      }
    }
    
    console.log("Could not find viewer count in HTML using any pattern");
    return 0;
    
  } catch (error) {
    console.error("Error fetching viewer count:", error);
    return 0;
  }
}