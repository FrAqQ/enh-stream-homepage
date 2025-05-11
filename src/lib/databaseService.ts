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
    
    // 1. Cache verwenden, falls gültig
    if (cachedData && (Date.now() - cachedData.timestamp < this.cacheTTL)) {
      console.log("[Cache] Verwende zwischengespeicherte Profildaten");
      return { data: cachedData.data, error: null };
    }

    try {
      console.log(`[DB] Profildaten abrufen für user: ${userId}`);

      // 2. Existenz prüfen
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (profileCheckError) {
        console.error("Fehler bei Existenzprüfung:", profileCheckError);
        return { data: null, error: profileCheckError };
      }

      // 3. Falls nicht vorhanden, neues Standardprofil anlegen
      if (!existingProfile) {
        console.warn("[DB] Profil nicht vorhanden – lege Standardprofil an...");

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            plan: 'Free',
            subscription_status: 'inactive',
            viewers_active: 0,
            chatters_active: 0,
            is_admin: false  // Explizit is_admin auf false setzen für neue Profile
          });

        if (insertError) {
          console.error("Fehler beim Anlegen des Profils:", insertError);
          return { data: null, error: insertError };
        }

        // 4. Wartezeit, damit die View nach Insert verfügbar ist
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      // 5. Versuche direkt aus der profiles Tabelle zu laden, falls die View nicht funktioniert
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, plan, subscription_status, viewers_active, chatters_active, is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("Fehler beim Abrufen des Profils:", profileError);
        return { data: null, error: profileError };
      }

      if (!profileData) {
        console.error("Profil konnte nicht gefunden werden nach dem Anlegen");
        return { data: null, error: new Error("Profil nicht gefunden") };
      }

      try {
        // 6. Versuche dennoch die View für die berechneten Limits zu nutzen
        const { data: viewData } = await supabase
          .from('profiles_with_limit')
          .select('computed_viewer_limit, chatter_limit')
          .eq('id', userId)
          .maybeSingle();

        // 7. Zusammenführen & Rückgabe
        const completeProfile = {
          ...profileData,
          viewer_limit: viewData?.computed_viewer_limit ?? this.calculateViewerLimit(profileData.plan, profileData.subscription_status),
          chatter_limit: viewData?.chatter_limit ?? 1,
          is_admin: profileData.is_admin ?? false // Sicherstellen, dass is_admin einen Standardwert hat
        };

        // In Cache speichern
        this.cache.set(cacheKey, {
          data: completeProfile,
          timestamp: Date.now()
        });

        return { data: completeProfile, error: null };
      } catch (viewError) {
        // Bei View-Fehler nutzen wir berechnete Werte
        console.warn("Fehler beim Abrufen der View, verwende berechnete Limits:", viewError);
        
        const completeProfile = {
          ...profileData,
          viewer_limit: this.calculateViewerLimit(profileData.plan, profileData.subscription_status),
          chatter_limit: 1,
          is_admin: profileData.is_admin ?? false
        };

        // In Cache speichern
        this.cache.set(cacheKey, {
          data: completeProfile,
          timestamp: Date.now()
        });

        return { data: completeProfile, error: null };
      }
    } catch (unknownError) {
      console.error("Unbekannter Fehler in getProfile:", unknownError);
      return { data: null, error: unknownError };
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
   * Holt die erweiterten Chatter-Daten aus der chatter_history_last24h View
   * Teilt in natürliche und hinzugefügte Chatter auf
   */
  async getChatterStats(userId: string, streamUrl: string) {
    try {
      // Von der View chatter_history_last24h laden
      const { data, error } = await supabase
        .from('chatter_history_last24h')
        .select('enhanced_chatters, total_chatters, natural_chatters')
        .eq('user_id', userId)
        .eq('stream_url', streamUrl)
        .maybeSingle();

      if (error) {
        console.error("Fehler beim Abrufen der Chatter-Statistiken:", error);
        return { 
          data: { enhanced_chatters: 0, total_chatters: 0, natural_chatters: 0 }, 
          error 
        };
      }
      
      // Wenn keine Daten gefunden wurden, gib Standardwerte zurück
      if (!data) {
        return { 
          data: { enhanced_chatters: 0, total_chatters: 0, natural_chatters: 0 }, 
          error: null 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Unbekannter Fehler in getChatterStats:", error);
      return { 
        data: { enhanced_chatters: 0, total_chatters: 0, natural_chatters: 0 }, 
        error 
      };
    }
  },

  /**
   * Hinzufügen eines neuen Chatters zur chatter_sessions Tabelle
   */
  async addChatters(userId: string, streamUrl: string, count: number) {
    try {
      // Verwende die neue RPC-Funktion zum Hochzählen
      for (let i = 0; i < count; i++) {
        const { error } = await supabase.rpc('increment_chatter_count', {
          user_id: userId,
          stream_url: streamUrl
        });
        
        if (error) {
          console.error("Fehler beim Hinzufügen eines Chatters:", error);
          return { success: false, error };
        }
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Fehler in addChatters:", error);
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
