export async function getViewerCount(channelUrl: string): Promise<number> {
  try {
    console.log("Fetching viewer count for:", channelUrl);
    const response = await fetch(channelUrl);
    const html = await response.text();
    
    // Suche nach dem Viewer-Count Element
    const viewerMatch = html.match(/<span class="ScAnimatedNumber-sc-[^"]+">(\d+)<\/span>/);
    
    if (viewerMatch && viewerMatch[1]) {
      const viewerCount = parseInt(viewerMatch[1], 10);
      console.log("Found viewer count:", viewerCount);
      return viewerCount;
    }
    
    console.log("No viewer count found in HTML");
    return 0;
  } catch (error) {
    console.error("Error fetching viewer count:", error);
    return 0;
  }
}