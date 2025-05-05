import { supabase } from './supabaseClient';
import { useToast } from "@/hooks/use-toast";

/**
 * Optimierte Datenbankdienste mit Caching und Fehlerbehandlung
 */
export const databaseService = {
  // Cache für häufig abgerufene Daten
  cache: new Map<string, { data: any, timestamp: number }>(),
  cacheTTL: 60000, // 1 Minute Cache-Lebensdauer

  /**
   * Profildaten mit Caching-Unterstützung abrufen
   */
  async getProfile(userId: string) {
    const cacheKey = `profile-${userId}`;
    const cachedData = this.cache.get(cacheKey);
    
    // Zwischengespeicherte Daten zurückgeben, falls gültig
    if (cachedData && (Date.now() - cachedData.timestamp < this.cacheTTL)) {
      console.log("Verwende zwischengespeicherte Profildaten");
      return { data: cachedData.data, error: null, source: 'cache' };
    }

    try {
      console.log(`Hole Profildaten für Benutzer: ${userId}`);
      
      // STRATEGIE 1: Zuerst sicherstellen, dass das Profil überhaupt existiert
      // mit minimalen, garantiert existierenden Feldern
      let profileExists = false;
      try {
        const { data: basicProfile, error: basicError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();
          
        profileExists = !basicError && !!basicProfile;
      } catch (basicError) {
        console.warn("Fehler bei Profilprüfung:", basicError);
        // Wir gehen weiter und versuchen trotzdem, ein Profil zu erstellen
      }
      
      // STRATEGIE 2: Grundfelder abrufen, ohne viewers_active
      // Vorsichtiges Abrufen von Grundfeldern, die existieren sollten
      const { data: baseData, error: baseError } = await supabase
        .from('profiles')
        .select('id, plan, subscription_status')
        .eq('id', userId)
        .single();

      if (baseError) {
        console.error("Fehler beim Abrufen von Grundfeldern:", baseError);
        
        // Wenn das Profil nicht existiert, erstellen wir es neu
        if (!profileExists || baseError.message.includes('not found') || baseError.code === 'PGRST116') {
          console.log("Profil existiert nicht, erstelle ein neues");
          
          try {
            // Einfaches Profil erstellen
            const { data: createData, error: createError } = await supabase
              .from('profiles')
              .insert([{ 
                id: userId, 
                plan: 'Free', 
                subscription_status: 'inactive',
                viewers_active: 0
              }])
              .select();
              
            if (createError) {
              console.error("Fehler beim Erstellen des Profils:", createError);
              throw createError;
            }
            
            // Wenn Erstellung erfolgreich, neues Profil verwenden
            if (createData && createData.length > 0) {
              const newProfile = {
                ...createData[0],
                viewer_limit: this.calculateViewerLimit(createData[0].plan, createData[0].subscription_status)
              };
              
              this.cache.set(cacheKey, {
                data: newProfile,
                timestamp: Date.now()
              });
              
              return { data: newProfile, error: null, source: 'created' };
            }
          } catch (createError) {
            console.error("Fehler bei der Profilerstellung:", createError);
          }
        }
        
        // Standardwerte als Fallback verwenden
        const defaultProfile = {
          id: userId,
          plan: 'Free',
          subscription_status: 'inactive',
          viewers_active: 0,
          viewer_limit: 4
        };
        
        this.cache.set(cacheKey, {
          data: defaultProfile,
          timestamp: Date.now()
        });
        
        return { data: defaultProfile, error: null, source: 'default' };
      }
      
      // STRATEGIE 3: Wenn Grundfelder erfolgreich, viewers_active separat abrufen
      let viewersActive = 0;
      try {
        const { data: viewersData, error: viewersError } = await supabase
          .from('profiles')
          .select('viewers_active')
          .eq('id', userId)
          .single();
          
        if (!viewersError && viewersData) {
          viewersActive = viewersData.viewers_active || 0;
        } else {
          console.log("viewers_active nicht verfügbar oder konnte nicht abgerufen werden");
          
          // Versuchen, viewers_active durch Update auf 0 zu erstellen
          try {
            await supabase
              .from('profiles')
              .update({ viewers_active: 0 })
              .eq('id', userId);
          } catch (updateError) {
            console.warn("Konnte viewers_active nicht aktualisieren:", updateError);
          }
        }
      } catch (viewersError) {
        console.warn("Nicht kritischer Fehler beim Abrufen von viewers_active:", viewersError);
        // Wir setzen den Standardwert weiterhin auf 0
      }
      
      // Vollständiges Profil zusammenstellen
      const profileData = {
        ...baseData,
        viewers_active: viewersActive,
        viewer_limit: this.calculateViewerLimit(baseData.plan, baseData.subscription_status)
      };

      // Cache aktualisieren
      this.cache.set(cacheKey, {
        data: profileData,
        timestamp: Date.now()
      });

      return { data: profileData, error: null, source: 'database' };
    } catch (error: any) {
      console.error("Fehler beim Abrufen des Profils:", error);
      
      // Standardprofil als letzten Ausweg verwenden
      const defaultProfile = {
        id: userId,
        plan: 'Free',
        subscription_status: 'inactive',
        viewers_active: 0,
        viewer_limit: 4
      };
      
      // Cache mit Standardprofil aktualisieren
      this.cache.set(cacheKey, {
        data: defaultProfile,
        timestamp: Date.now() 
      });
      
      return { data: defaultProfile, error, source: 'error-fallback' };
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
   * Dies behandelt den Fall, dass die Spalte möglicherweise noch nicht existiert
   */
  async updateViewersActive(userId: string, count: number) {
    try {
      // Zuerst prüfen, ob die Spalte existiert, indem das Profil abgerufen wird
      const { data: profile, error: getError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (getError && !getError.message.includes('does not exist')) {
        throw getError;
      }
      
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
      
      // Mehrere Aktualisierungsversuche mit verschiedenen Fehlerbehandlungen
      try {
        // Versuch 1: Standard-Update
        const { data, error } = await supabase
          .from('profiles')
          .update({ viewers_active: count })
          .eq('id', userId)
          .select();

        if (!error) {
          console.log("Aktive Zuschauer erfolgreich aktualisiert");
          return { success: true, data };
        }
        
        // Wenn die Spalte nicht existiert, versuchen wir sie zu erstellen
        if (error.message && error.message.includes('does not exist')) {
          console.log("viewers_active existiert nicht, versuche die Spalte zu erstellen");
          
          try {
            // Versuch, die Spalte hinzuzufügen
            const { error: alterError } = await supabase.rpc(
              'execute_sql', 
              { sql_query: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS viewers_active INTEGER DEFAULT 0;' }
            );
            
            if (!alterError) {
              // Nach dem Erstellen der Spalte erneut aktualisieren
              const { data: updatedData, error: updateError } = await supabase
                .from('profiles')
                .update({ viewers_active: count })
                .eq('id', userId)
                .select();
                
              if (!updateError) {
                return { success: true, data: updatedData };
              }
            }
          } catch (alterError) {
            console.warn("Konnte die viewers_active Spalte nicht erstellen:", alterError);
          }
        }
        
        // Wenn wir hier ankommen, konnten wir nicht aktualisieren, aber Cache wurde aktualisiert
        console.warn("Konnte viewers_active in der Datenbank nicht aktualisieren, aber Cache wurde aktualisiert");
        return { success: true, data: null, cacheOnly: true };
      } catch (updateError) {
        console.warn("Konnte viewers_active in der Datenbank nicht aktualisieren, aber Cache wurde aktualisiert:", updateError);
        // Dies gilt als "weicher" Erfolg, da der Cache aktualisiert wurde
        return { success: true, data: null, cacheOnly: true };
      }
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
