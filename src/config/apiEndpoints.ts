
export interface SystemMetrics {
  cpu: number;
  memory: {
    total: number;
    used: number;
    free: number;
  };
}

export interface EndpointStatus {
  isOnline: boolean;
  lastChecked: Date;
  apiStatus: boolean;
  isSecure: boolean;
  pingStatus: boolean;
  systemMetrics?: SystemMetrics;
}

export interface Endpoint {
  host: string;
  status: EndpointStatus;
}

let API_ENDPOINTS: string[] = [];

let currentEndpointIndex = 0;

export const updateEndpoints = async (newEndpoints: string[]) => {
  try {
    const response = await fetch('/api/update-endpoints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoints: newEndpoints })
    });

    if (!response.ok) {
      throw new Error('Failed to update endpoints file');
    }

    API_ENDPOINTS = newEndpoints;
    console.log("API endpoints updated:", API_ENDPOINTS);
  } catch (error) {
    console.error("Error updating endpoints:", error);
    throw error;
  }
};

export const getNextEndpoint = () => {
  if (API_ENDPOINTS.length === 0) {
    throw new Error('No endpoints configured');
  }
  const endpoint = API_ENDPOINTS[currentEndpointIndex];
  currentEndpointIndex = (currentEndpointIndex + 1) % API_ENDPOINTS.length;
  console.log("Getting next endpoint:", endpoint, "Index:", currentEndpointIndex);
  return endpoint;
};

export { API_ENDPOINTS };
