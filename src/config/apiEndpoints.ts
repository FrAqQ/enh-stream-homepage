
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
  url: string;
  description: string;
  status: EndpointStatus;
}

// Hole gespeicherte Endpunkte aus dem localStorage oder verwende den Standardwert
const getInitialEndpoints = (): Endpoint[] => {
  const savedEndpoints = localStorage.getItem('apiEndpoints');
  if (savedEndpoints) {
    try {
      const parsed = JSON.parse(savedEndpoints);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error('Fehler beim Parsen der gespeicherten Endpunkte:', e);
    }
  }
  return [{
    host: "srv-bot-001.enh.app",
    url: "https://srv-bot-001.enh.app",
    description: "Hauptserver",
    status: {
      isOnline: true,
      lastChecked: new Date(),
      apiStatus: true,
      isSecure: true,
      pingStatus: true
    }
  }];
};

let API_ENDPOINTS: Endpoint[] = getInitialEndpoints();

let currentEndpointIndex = 0;

export const updateEndpoints = (newEndpoints: Endpoint[]) => {
  if (!Array.isArray(newEndpoints) || newEndpoints.length === 0) {
    console.error('Ungültige Endpunkte:', newEndpoints);
    return;
  }
  API_ENDPOINTS = [...newEndpoints];
  localStorage.setItem('apiEndpoints', JSON.stringify(API_ENDPOINTS));
  console.log("API endpoints updated:", API_ENDPOINTS);
};

export const getNextEndpoint = () => {
  const endpoint = API_ENDPOINTS[currentEndpointIndex];
  currentEndpointIndex = (currentEndpointIndex + 1) % API_ENDPOINTS.length;
  console.log("Getting next endpoint:", endpoint, "Index:", currentEndpointIndex);
  return endpoint;
};

export { API_ENDPOINTS };
