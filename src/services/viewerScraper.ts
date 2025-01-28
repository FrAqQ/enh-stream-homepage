export async function getViewerCount(channelUrl: string): Promise<number> {
  try {
    const channelName = channelUrl.split('/').pop() || '';
    console.log("Fetching viewer count for channel:", channelName);
    
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://www.twitch.tv/${channelName}`)}`;
    
    const response = await fetch(proxyUrl);
    const html = await response.text();
    
    console.log("Searching for viewer count after ScAnimatedNumber class...");
    
    // Suche nach der ScAnimatedNumber-Klasse und nimm die Zahl direkt nach dem schließenden >
    const pattern = /class="ScAnimatedNumber-sc-[^"]*"[^>]*>([0-9]+)/;
    const match = html.match(pattern);
    
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      console.log("Found viewer count:", count);
      return count;
    }
    
    console.log("Could not find viewer count in HTML");
    return 0;
    
  } catch (error) {
    console.error("Error fetching viewer count:", error);
    return 0;
  }
}