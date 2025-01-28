export async function getViewerCount(channelUrl: string): Promise<number> {
  try {
    console.log("Fetching viewer count for:", channelUrl);
    const response = await fetch(channelUrl, {
      mode: 'no-cors',
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // With no-cors mode, we can't access response.text()
    // We'll need to use a proxy or backend service to fetch this data
    console.log("Response status:", response.status, "type:", response.type);
    
    // For now, return a placeholder value since we can't access the response
    return 0;
  } catch (error) {
    console.error("Error fetching viewer count:", error);
    return 0;
  }
}