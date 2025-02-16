
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

// Lade gespeicherte Endpunkte aus dem localStorage oder verwende leeres Array
let API_ENDPOINTS: string[] = JSON.parse(localStorage.getItem('apiEndpoints') || '[]');

let currentEndpointIndex = 0;

export const updateEndpoints = (newEndpoints: string[]) => {
  API_ENDPOINTS = newEndpoints;
  // Speichere die neuen Endpunkte im localStorage
  localStorage.setItem('apiEndpoints', JSON.stringify(newEndpoints));
  console.log("API endpoints updated:", API_ENDPOINTS);
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
