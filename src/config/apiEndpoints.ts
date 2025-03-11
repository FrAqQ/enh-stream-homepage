
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

export interface UserViewerDistribution {
  userId: string;
  streamUrl: string;
  serverAllocations: {
    [serverHost: string]: number;
  };
}

// In-memory storage für die Zuweisung von Viewern zu Servern pro Benutzer
const viewerDistributions: UserViewerDistribution[] = [];

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

// Neue Funktionen zur Verwaltung der Viewer-Verteilung
export const addViewerAllocation = (userId: string, streamUrl: string, serverHost: string, count: number) => {
  let distribution = viewerDistributions.find(d => d.userId === userId && d.streamUrl === streamUrl);
  
  if (!distribution) {
    distribution = {
      userId,
      streamUrl,
      serverAllocations: {}
    };
    viewerDistributions.push(distribution);
  }
  
  // Aktuelle Anzahl für diesen Server (oder 0, falls noch nicht existiert)
  const currentCount = distribution.serverAllocations[serverHost] || 0;
  distribution.serverAllocations[serverHost] = currentCount + count;
  
  console.log(`Updated viewer allocation for user ${userId}, stream ${streamUrl}, server ${serverHost}: ${distribution.serverAllocations[serverHost]} viewers`);
};

export const getViewerAllocationsForUser = (userId: string, streamUrl: string): {[serverHost: string]: number} => {
  const distribution = viewerDistributions.find(d => d.userId === userId && d.streamUrl === streamUrl);
  return distribution?.serverAllocations || {};
};

export const getServersWithViewers = (userId: string, streamUrl: string): string[] => {
  const allocations = getViewerAllocationsForUser(userId, streamUrl);
  return Object.keys(allocations).filter(server => allocations[server] > 0);
};

export const removeViewerAllocation = (userId: string, streamUrl: string, serverHost: string, count: number) => {
  const distribution = viewerDistributions.find(d => d.userId === userId && d.streamUrl === streamUrl);
  
  if (!distribution) {
    console.warn(`No distribution found for user ${userId} and stream ${streamUrl}`);
    return;
  }
  
  const currentCount = distribution.serverAllocations[serverHost] || 0;
  const newCount = Math.max(0, currentCount - count);
  distribution.serverAllocations[serverHost] = newCount;
  
  console.log(`Updated viewer allocation after removal for server ${serverHost}: ${newCount} viewers remaining`);
};

export const removeAllViewerAllocations = (userId: string, streamUrl: string) => {
  const index = viewerDistributions.findIndex(d => d.userId === userId && d.streamUrl === streamUrl);
  
  if (index !== -1) {
    viewerDistributions.splice(index, 1);
    console.log(`Removed all viewer allocations for user ${userId} and stream ${streamUrl}`);
  }
};

export { API_ENDPOINTS };
