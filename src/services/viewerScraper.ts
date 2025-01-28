export async function getViewerCount(channelUrl: string): Promise<number> {
  try {
    const channelName = channelUrl.split('/').pop() || '';
    console.log("Fetching viewer count for channel:", channelName);
    
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://www.twitch.tv/${channelName}`)}`;
    
    const response = await fetch(proxyUrl);
    const html = await response.text();
    
    // Neue Regex die nach der ScAnimatedNumber Klasse sucht und die Zahl direkt danach extrahiert
    const pattern = /class="ScAnimatedNumber[^"]*">(\d+)/;
    const match = html.match(pattern);
    
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      console.log("Found viewer count in HTML:", count);
      return count;
    }
    
    console.log("Could not find viewer count in HTML");
    return 0;
    
  } catch (error) {
    console.error("Error fetching viewer count:", error);
    return 0;
  }
}