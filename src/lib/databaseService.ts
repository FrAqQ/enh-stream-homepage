
import { supabase } from './supabaseClient';

/**
 * Optimierte Datenbankdienste mit Caching und Fehlerbehandlung
 */
export const databaseService = {
  // Cache für häufig abgerufene Daten
  cache: new Map<string, { data: any, timestamp: number }>(),
  cacheTTL: 60000, // 1 Minute Cache-Lebensdauer

  /**
   * Profildaten mit Caching-Unterstützung abrufen - optimiert für schnelle Antwortzeiten
   */
  async getProfile(userId: string) {
    const cacheKey = `profile-${userId}`;
    const cachedData = this.cache.get(cacheKey);
    
    // Zwischengespeicherte Daten zurückgeben, falls gültig
    if (cachedData && (Date.now() - cachedData.timestamp < this.cacheTTL)) {
      console.log("Verwende zwischengespeicherte Profildaten");
      return { data: cachedData.data, error: null };
    }

    try {
      console.log(`Hole Profildaten für Benutzer: ${userId}`);
      
      // VEREINFACHTER ANSATZ: Ein einziger direkter Aufruf ohne komplexe Logik
      const { data, error } = await supabase
        .from('profiles')
        .select('id, plan, subscription_status, viewers_active')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Fehler beim Abrufen des Profils:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Kein Profil gefunden");
      }
      
      // Wenn wir ein Profil erfolgreich laden konnten
      const completeProfile = {
        ...data,
        viewer_limit: this.calculateViewerLimit(data.plan, data.subscription_status),
        viewers_active: data.viewers_active || 0
      };
      
      // Cache aktualisieren
      this.cache.set(cacheKey, {
        data: completeProfile,
        timestamp: Date.now()
      });

      return { data: completeProfile, error: null };
    } catch (error) {
      console.error("Fehler beim Abrufen des Profils:", error);
      return { data: null, error };
    }
  },

  /**
   * Zuschauerlimit auf Basis von Plan und Status berechnen
   */
  calculateViewerLimit(plan: string | null | undefined, status: string | null | undefined) {
    if (!plan) return 4;
    
    if (status !== 'active') return 4;
    
    if (plan.includes('Ultimate')) return 1000;
    if (plan.includes('Expert')) return 300;
    if (plan.includes('Professional')) return 200;
    if (plan.includes('Basic')) return 50;
    if (plan.includes('Starter')) return 25;
    
    return 4; // Standardlimit
  },

  /**
   * Aktive Zuschauerzahl aktualisieren
   */
  async updateViewersActive(userId: string, count: number) {
    try {
      // Cache aktualisieren, unabhängig vom Datenbankstatus
      const cacheKey = `profile-${userId}`;
      if (this.cache.has(cacheKey)) {
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
          this.cache.set(cacheKey, {
            data: { ...cachedData.data, viewers_active: count },
            timestamp: Date.now()
          });
        }
      }
      
      // Datenbank aktualisieren
      const { data, error } = await supabase
        .from('profiles')
        .update({ viewers_active: count })
        .eq('id', userId);

      if (error) {
        console.error("Fehler beim Aktualisieren der aktiven Zuschauer:", error);
        return { success: false, error };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error("Fehler in updateViewersActive:", error);
      return { success: false, error };
    }
  },

  /**
   * Cache oder einen bestimmten Cache-Eintrag löschen
   */
  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
};
