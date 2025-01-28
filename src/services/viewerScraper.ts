export async function getViewerCount(channelUrl: string): Promise<number> {
  try {
    // Extract channel name from URL
    const channelName = channelUrl.split('/').pop() || '';
    console.log("Fetching viewer count for channel:", channelName);
    
    // Use corsproxy.io as CORS proxy
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://www.twitch.tv/${channelName}`)}`;
    
    const response = await fetch(proxyUrl);
    const html = await response.text();
    
    console.log("Searching for ScAnimatedNumber class in HTML...");
    
    // Suche nach dem spezifischen Klassennamen und der Zahl direkt danach
    const pattern = /ScAnimatedNumber-sc-[a-zA-Z0-9]+-[0-9]+[^>]+>(\d+)</;
    const match = html.match(pattern);
    
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      console.log("Found viewer count:", count);
      return count;
    }
    
    console.log("Could not find viewer count with ScAnimatedNumber pattern");
    return 0;
    
  } catch (error) {
    console.error("Error fetching viewer count:", error);
    return 0;
  }
}