export async function getChatterCount(channelUrl: string): Promise<number> {
  try {
    const channelName = channelUrl.split('/').pop() || '';
    console.log("Fetching chatter count for channel:", channelName);
    
    const gqlEndpoint = 'https://gql.twitch.tv/gql';
    const query = {
      operationName: 'ChattersQuery',
      query: `query ChattersQuery($channelLogin: String!, $minutes: Int!) {
        channel(name: $channelLogin) {
          chatters(timeRange: { minutes: $minutes }) {
            count
          }
        }
      }`,
      variables: {
        channelLogin: channelName,
        minutes: 10 // Nur Chatter der letzten 10 Minuten
      }
    };

    console.log("Sending GQL request for chatters:", channelName);
    
    const response = await fetch(gqlEndpoint, {
      method: 'POST',
      headers: {
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query)
    });

    const data = await response.json();
    console.log("GQL Chatter Response:", data);

    const chatterCount = data?.data?.channel?.chatters?.count || 0;
    console.log("Extracted chatter count (last 10 minutes):", chatterCount);
    
    return chatterCount;
  } catch (error) {
    console.error("Error fetching chatter count:", error);
    return 0;
  }
}