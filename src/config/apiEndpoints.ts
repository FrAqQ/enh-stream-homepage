
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

// Hole gespeicherte Endpunkte aus dem localStorage oder verwende den Standardwert
const getInitialEndpoints = (): Endpoint[] => {
  const savedEndpoints = localStorage.getItem('apiEndpoints');
  if (savedEndpoints) {
    try {
      const parsed = JSON.parse(savedEndpoints);
      if (Array.isArray(parsed)) {
        // Konvertiere die gespeicherten Daten zurück in das richtige Format
        return parsed.map(endpoint => ({
          host: endpoint.host,
          status: {
            isOnline: endpoint.status?.isOnline || false,
            lastChecked: new Date(endpoint.status?.lastChecked || new Date()),
            apiStatus: endpoint.status?.apiStatus || false,
            isSecure: endpoint.status?.isSecure || false,
            pingStatus: endpoint.status?.pingStatus || false,
            systemMetrics: endpoint.status?.systemMetrics || {
              cpu: 0,
              memory: {
                total: 0,
                used: 0,
                free: 0
              }
            }
          }
        }));
      }
    } catch (e) {
      console.error('Fehler beim Parsen der gespeicherten Endpunkte:', e);
    }
  }
  // Standardwert, wenn keine Endpunkte gespeichert sind
  return [{
    host: "srv-bot-001.enh.app",
    status: {
      isOnline: false,
      lastChecked: new Date(),
      apiStatus: false,
      isSecure: false,
      pingStatus: false,
      systemMetrics: {
        cpu: 0,
        memory: {
          total: 0,
          used: 0,
          free: 0
        }
      }
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
  
  // Speichere die vollständigen Endpoint-Objekte
  API_ENDPOINTS = newEndpoints;
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
