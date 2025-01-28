export async function getViewerCount(channelUrl: string): Promise<number> {
  try {
    const channelName = channelUrl.split('/').pop() || '';
    console.log("Fetching viewer count for channel:", channelName);
    
    // Verwende die Twitch GQL API
    const gqlEndpoint = 'https://gql.twitch.tv/gql';
    const query = {
      operationName: 'StreamMetadata',
      query: `query StreamMetadata($channelLogin: String!) {
        user(login: $channelLogin) {
          stream {
            viewersCount
          }
        }
      }`,
      variables: {
        channelLogin: channelName
      }
    };

    console.log("Sending GQL request for channel:", channelName);
    
    const response = await fetch(gqlEndpoint, {
      method: 'POST',
      headers: {
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query)
    });

    const data = await response.json();
    console.log("GQL Response:", data);

    const viewerCount = data?.data?.user?.stream?.viewersCount || 0;
    console.log("Extracted viewer count:", viewerCount);
    
    return viewerCount;
  } catch (error) {
    console.error("Error fetching viewer count:", error);
    return 0;
  }
}