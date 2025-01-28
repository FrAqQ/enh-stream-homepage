import { ApiClient } from '@twurple/api';

const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID || '';
const clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET || '';

let apiClient: ApiClient | null = null;

export const initTwitchApi = async () => {
  if (!clientId || !clientSecret) {
    console.error('Twitch credentials not found');
    return null;
  }

  try {
    apiClient = new ApiClient({ clientId, clientSecret });
    return apiClient;
  } catch (error) {
    console.error('Error initializing Twitch API:', error);
    return null;
  }
};

export const getStreamViewerCount = async (channelName: string): Promise<number> => {
  if (!apiClient) {
    await initTwitchApi();
  }

  if (!apiClient) {
    console.error('Twitch API client not initialized');
    return 0;
  }

  try {
    const user = await apiClient.users.getUserByName(channelName);
    if (!user) {
      console.error('User not found');
      return 0;
    }

    const stream = await apiClient.streams.getStreamByUserId(user.id);
    return stream?.viewers ?? 0;
  } catch (error) {
    console.error('Error fetching viewer count:', error);
    return 0;
  }
}