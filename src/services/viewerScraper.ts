export async function getViewerCount(channelUrl: string): Promise<number> {
  try {
    // Extract channel name from URL
    const channelName = channelUrl.split('/').pop() || '';
    console.log("Fetching viewer count for channel:", channelName);
    
    // Use corsproxy.io as CORS proxy
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://www.twitch.tv/${channelName}`)}`;
    
    const response = await fetch(proxyUrl);
    const html = await response.text();
    
    // Try to find the viewer count in the HTML
    const viewerMatch = html.match(/ScAnimatedNumber[^>]+>(\d+)</);
    if (viewerMatch && viewerMatch[1]) {
      const count = parseInt(viewerMatch[1], 10);
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