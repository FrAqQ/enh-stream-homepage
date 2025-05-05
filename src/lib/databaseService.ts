
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
   * Mit automatischer Profil-Erstellung falls nicht vorhanden
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
      
      // Prüfen, ob bereits ein Profil für den Benutzer existiert
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      // Wenn kein Profil existiert, erstelle ein Standard-Profil
      if (!existingProfile) {
        console.warn("Profil nicht vorhanden, lege Standard-Profil an...");
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            plan: 'Free',
            subscription_status: 'inactive',
            viewers_active: 0,
            chatters_active: 0
          });

        if (insertError) {
          console.error("Fehler beim Anlegen des Profils:", insertError);
          return { data: null, error: insertError };
        }

        console.log("Standard-Profil erfolgreich erstellt.");
      }
      
      // Jetzt von der View profiles_with_limit laden (immer NACH der Profilprüfung)
      const { data, error } = await supabase
        .from('profiles_with_limit')
        .select('id, plan, subscription_status, viewers_active, chatters_active, computed_viewer_limit, chatter_limit')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Fehler beim Abrufen aus View:", error);
        return { data: null, error };
      }
      
      if (!data) {
        throw new Error("Kein Profil gefunden");
      }
      
      // Erstelle das komplette Profil mit dem berechneten Limit aus der View
      const completeProfile = {
        ...data,
        viewer_limit: data.computed_viewer_limit,  // Wir behalten den Namen viewer_limit für Abwärtskompatibilität
        viewers_active: data.viewers_active || 0,
        chatters_active: data.chatters_active || 0
      };
      
      // Cache aktualisieren
      this.cache.set(cacheKey, {
        data: completeProfile,
        timestamp: Date.now()
      });

      return { data: completeProfile, error: null };
    } catch (error) {
      console.error("Unbekannter Fehler in getProfile:", error);
      return { data: null, error };
    }
  },

  // Diese Methode ist jetzt überflüssig, da das Limit in der View berechnet wird
  // Wir behalten sie für den Fall, dass wir sie woanders noch brauchen
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
      // Hier aktualisieren wir immer noch die profiles Tabelle, nicht die View
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
   * Aktive Chatterzahl aktualisieren
   */
  async updateChattersActive(userId: string, count: number) {
    try {
      // Cache aktualisieren, unabhängig vom Datenbankstatus
      const cacheKey = `profile-${userId}`;
      if (this.cache.has(cacheKey)) {
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
          this.cache.set(cacheKey, {
            data: { ...cachedData.data, chatters_active: count },
            timestamp: Date.now()
          });
        }
      }
      
      // Datenbank aktualisieren
      // Hier aktualisieren wir die profiles Tabelle, nicht die View
      const { data, error } = await supabase
        .from('profiles')
        .update({ chatters_active: count })
        .eq('id', userId);

      if (error) {
        console.error("Fehler beim Aktualisieren der aktiven Chatter:", error);
        return { success: false, error };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error("Fehler in updateChattersActive:", error);
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
