interface Chatter {
  timestamp: number;
  count: number;
}

let chattersHistory: Chatter[] = [];

export async function getChatterCount(channelUrl: string): Promise<number> {
  try {
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

    const currentCount = data?.data?.channel?.chatters?.count || 0;
    
    // Aktuelle Zeit in Millisekunden
    const now = Date.now();
    
    // Neue Messung zur Historie hinzufügen
    chattersHistory.push({
      timestamp: now,
      count: currentCount
    });
    
    // Historie auf die letzten 10 Minuten beschränken
    const tenMinutesAgo = now - (10 * 60 * 1000);
    chattersHistory = chattersHistory.filter(entry => entry.timestamp > tenMinutesAgo);
    
    // Durchschnitt der letzten 10 Minuten berechnen
    const recentChatters = chattersHistory.length > 0
      ? Math.round(chattersHistory.reduce((sum, entry) => sum + entry.count, 0) / chattersHistory.length)
      : currentCount;
    
    console.log("Chatter history (last 10 minutes):", chattersHistory);
    console.log("Average chatter count (last 10 minutes):", recentChatters);
    
    return recentChatters;
  } catch (error) {
    console.error("Error fetching chatter count:", error);
    return 0;
  }
}