
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

// Initiale Endpunkte aus dem localStorage laden oder Standardwerte verwenden
const getInitialEndpoints = () => {
  const storedEndpoints = localStorage.getItem('apiEndpoints');
  if (storedEndpoints) {
    try {
      const endpoints = JSON.parse(storedEndpoints);
      // Überprüfe, ob die gespeicherten Endpunkte gültig sind
      if (Array.isArray(endpoints) && endpoints.length > 0) {
        return endpoints;
      }
    } catch (error) {
      console.error('Fehler beim Parsen der gespeicherten Endpunkte:', error);
    }
  }
  // Standardwerte, wenn keine gültigen Endpunkte im localStorage sind
  return ["srv-bot-001.enh.app"];
};

let API_ENDPOINTS: string[] = getInitialEndpoints();

let currentEndpointIndex = 0;

export const updateEndpoints = (newEndpoints: string[]) => {
  if (!Array.isArray(newEndpoints) || newEndpoints.length === 0) {
    console.error('Ungültige Endpunkte:', newEndpoints);
    return;
  }
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
