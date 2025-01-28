interface Chatter {
  timestamp: number;
  count: number;
}

let chattersHistory: Chatter[] = [];

export async function getChatterCount(channelUrl: string): Promise<number> {
  try {
    if (!channelUrl) {
      console.log("No channel URL provided");
      return 0;
    }

    const channelName = channelUrl.split('/').pop() || '';
    console.log("Fetching chatter count for channel:", channelName);
    
    const gqlEndpoint = 'https://gql.twitch.tv/gql';
    const query = {
      operationName: 'ChattersQuery',
      query: `query ChattersQuery($channelLogin: String!) {
        channel(name: $channelLogin) {
          chatters {
            count
          }
        }
      }`,
      variables: {
        channelLogin: channelName
      }
    };

    console.log("Sending GQL request with payload:", {
      endpoint: gqlEndpoint,
      channelName,
      operationName: query.operationName
    });
    
    const response = await fetch(gqlEndpoint, {
      method: 'POST',
      headers: {
        'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      console.error("GQL request failed:", {
        status: response.status,
        statusText: response.statusText
      });
      return 0;
    }

    const data = await response.json();
    console.log("GQL Chatter Response:", data);

    const currentCount = data?.data?.channel?.chatters?.count || 0;
    
    // Current time in milliseconds
    const now = Date.now();
    
    // Add new measurement to history
    chattersHistory.push({
      timestamp: now,
      count: currentCount
    });
    
    // Limit history to last 10 minutes
    const tenMinutesAgo = now - (10 * 60 * 1000);
    chattersHistory = chattersHistory.filter(entry => entry.timestamp > tenMinutesAgo);
    
    // Calculate average of last 10 minutes
    const recentChatters = chattersHistory.length > 0
      ? Math.round(chattersHistory.reduce((sum, entry) => sum + entry.count, 0) / chattersHistory.length)
      : currentCount;
    
    console.log("Chatter history (last 10 minutes):", chattersHistory);
    console.log("Average chatter count (last 10 minutes):", recentChatters);
    
    return recentChatters;
  } catch (error) {
    console.error("Detailed error fetching chatter count:", {
      error,
      type: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return 0;
  }
}