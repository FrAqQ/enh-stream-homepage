
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
        // Stelle sicher, dass alle erforderlichen Felder vorhanden sind
        return parsed.map(endpoint => ({
          host: endpoint.host || "",
          url: endpoint.url || "",
          description: endpoint.description || "",
          status: {
            isOnline: endpoint.status?.isOnline || false,
            lastChecked: new Date(endpoint.status?.lastChecked || new Date()),
            apiStatus: endpoint.status?.apiStatus || false,
            isSecure: endpoint.status?.isSecure || false,
            pingStatus: endpoint.status?.pingStatus || false,
            systemMetrics: endpoint.status?.systemMetrics || undefined
          }
        }));
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
      pingStatus: true,
      systemMetrics: undefined
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
  // Stelle sicher, dass alle Endpunkte die erforderlichen Felder haben
  const validatedEndpoints = newEndpoints.map(endpoint => ({
    host: endpoint.host,
    url: endpoint.url,
    description: endpoint.description,
    status: {
      isOnline: endpoint.status?.isOnline || false,
      lastChecked: new Date(endpoint.status?.lastChecked || new Date()),
      apiStatus: endpoint.status?.apiStatus || false,
      isSecure: endpoint.status?.isSecure || false,
      pingStatus: endpoint.status?.pingStatus || false,
      systemMetrics: endpoint.status?.systemMetrics
    }
  }));
  
  API_ENDPOINTS = validatedEndpoints;
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
