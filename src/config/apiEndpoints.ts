
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

const getInitialEndpoints = (): string[] => {
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
  return [
    "v220250171253310506.hotsrv.de",
    "v2202501252999311567.powersrv.de",
    "v2202502252999313946.bestsrv.de"
  ];
};

let API_ENDPOINTS: string[] = getInitialEndpoints();

export const updateEndpoints = (newEndpoints: string[]) => {
  if (!Array.isArray(newEndpoints) || newEndpoints.length === 0) {
    console.error('Ungültige Endpunkte:', newEndpoints);
    return;
  }
  API_ENDPOINTS = [...newEndpoints];
  localStorage.setItem('apiEndpoints', JSON.stringify(API_ENDPOINTS));
  console.log("API endpoints updated:", API_ENDPOINTS);
};

export const getNextEndpoint = () => {
  // Diese Funktion wird zwar noch zurückgegeben, jedoch nicht mehr für die Round-Robin-Auswahl verwendet
  // Sie bleibt für Kompatibilitätszwecke erhalten
  return API_ENDPOINTS[0];
};

export { API_ENDPOINTS };
