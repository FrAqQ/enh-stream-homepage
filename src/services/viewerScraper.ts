export async function getViewerCount(channelUrl: string): Promise<number> {
  try {
    const channelName = channelUrl.split('/').pop() || '';
    console.log("Fetching viewer count for channel:", channelName);
    
    // Verwende einen anderen CORS-Proxy
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(channelUrl)}`;
    console.log("Fetching from URL:", proxyUrl);
    
    const response = await fetch(proxyUrl);
    const html = await response.text();
    
    console.log("Received HTML response length:", html.length);
    
    // Verschiedene Möglichkeiten, die Viewer-Zahl zu finden
    const patterns = [
      /"viewersCount":(\d+)/, // JSON-Daten im Script-Tag
      /"channelViewerCount":(\d+)/, // Alternative JSON-Daten
      /"viewers":(\d+)/, // Einfache JSON-Daten
      /viewers:\s*(\d+)/, // JavaScript Variable
      /"viewerCount":(\d+)/, // Alternative JSON Format
      /<span[^>]*data-a-target="animated-channel-viewers-count"[^>]*>(\d+)<\/span>/, // Neues Twitch Format
      /<p[^>]*data-a-target="animated-channel-viewers-count"[^>]*>(\d+)<\/p>/, // Alternatives Format
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