
interface ServerReservation {
  timestamp: number;
  ramReserved: number;
}

interface ServerMetrics {
  totalRam: number;
  usedRam: number;
  reservations: ServerReservation[];
}

const VIEWER_RAM_USAGE = 0.53; // GB pro Viewer
const RESERVATION_TIMEOUT = 5 * 60 * 1000; // 5 Minuten in Millisekunden

class ServerManager {
  private serverMetrics: Map<string, ServerMetrics> = new Map();

  updateServerMetrics(host: string, totalRam: number, usedRam: number) {
    const currentMetrics = this.serverMetrics.get(host) || {
      totalRam,
      usedRam,
      reservations: []
    };

    // Aktualisiere die Basis-Metriken
    currentMetrics.totalRam = totalRam;
    currentMetrics.usedRam = usedRam;

    // Entferne abgelaufene Reservierungen
    const now = Date.now();
    currentMetrics.reservations = currentMetrics.reservations.filter(
      res => now - res.timestamp < RESERVATION_TIMEOUT
    );

    this.serverMetrics.set(host, currentMetrics);
  }

  private calculateEffectiveRamUsage(metrics: ServerMetrics): number {
    const now = Date.now();
    const reservedRam = metrics.reservations
      .filter(res => now - res.timestamp < RESERVATION_TIMEOUT)
      .reduce((total, res) => total + res.ramReserved, 0);
    
    return metrics.usedRam + reservedRam;
  }

  canHandleViewers(host: string, viewerCount: number): boolean {
    const metrics = this.serverMetrics.get(host);
    if (!metrics) return false;

    const ramNeeded = viewerCount * VIEWER_RAM_USAGE;
    const effectiveRamUsage = this.calculateEffectiveRamUsage(metrics);
    const availableRam = metrics.totalRam - effectiveRamUsage;

    return availableRam >= ramNeeded;
  }

  reserveCapacity(host: string, viewerCount: number) {
    const metrics = this.serverMetrics.get(host);
    if (!metrics) return;

    const ramNeeded = viewerCount * VIEWER_RAM_USAGE;
    metrics.reservations.push({
      timestamp: Date.now(),
      ramReserved: ramNeeded
    });

    this.serverMetrics.set(host, metrics);
  }

  getBestServerForViewers(hosts: string[], viewerCount: number): string | null {
    let bestServer: string | null = null;
    let maxAvailableRam = -1;

    for (const host of hosts) {
      const metrics = this.serverMetrics.get(host);
      if (!metrics) continue;

      const effectiveRamUsage = this.calculateEffectiveRamUsage(metrics);
      const availableRam = metrics.totalRam - effectiveRamUsage;

      if (availableRam > maxAvailableRam && this.canHandleViewers(host, viewerCount)) {
        maxAvailableRam = availableRam;
        bestServer = host;
      }
    }

    return bestServer;
  }
}

export const serverManager = new ServerManager();
