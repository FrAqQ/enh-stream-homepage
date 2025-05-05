
import { useState, useEffect, useCallback, useRef, Dispatch, SetStateAction } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { databaseService } from './databaseService';
import { useToast } from '@/hooks/use-toast';

// Define types for the chatter statistics
export interface ChatterStats {
  enhanced_chatters: number;
  natural_chatters: number;
  total_chatters: number;
}

// Interface for profile data
export interface UserProfile {
  id: string;
  plan: string;
  subscription_status: string;
  viewers_active: number;
  chatters_active: number;
  viewer_limit: number;
  chatter_limit: number;
  is_admin?: boolean;
  [key: string]: any; // For any additional fields
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [chatterStats, setChatterStats] = useState<ChatterStats>({
    enhanced_chatters: 0,
    natural_chatters: 0,
    total_chatters: 0,
  });
  const { toast } = useToast();

  // DEBUG: Session-Tracking für Login-Button-Problem
  const [sessionTracking, setSessionTracking] = useState<{
    initialized: boolean;
    sessionChecks: number;
    lastStatus: string;
  }>({
    initialized: false,
    sessionChecks: 0,
    lastStatus: "Not checked yet"
  });

  // Fetch user profile from the database
  const fetchProfile = useCallback(async (userId: string) => {
    console.time('Profilabruf-Gesamt');
    try {
      const { data, error } = await databaseService.getProfile(userId);
      
      if (error) throw error;
      if (!data) throw new Error('Kein Profil gefunden');
      
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    } finally {
      console.timeEnd('Profilabruf-Gesamt');
    }
  }, []);

  // Direkte Session-Prüfung für Debugging
  const checkSession = useCallback(async () => {
    try {
      console.log('[DEBUG] Manuelle Session-Prüfung...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      setSessionTracking(prev => ({
        initialized: true,
        sessionChecks: prev.sessionChecks + 1,
        lastStatus: session ? 'Aktiv' : error ? 'Fehler: ' + error.message : 'Keine aktive Session'
      }));
      
      console.log('[DEBUG] Session-Status:', session ? 'Aktiv' : 'Inaktiv', error ? `(Fehler: ${error.message})` : '');
      return session;
    } catch (e) {
      console.error('[DEBUG] Session-Prüfung fehlgeschlagen:', e);
      setSessionTracking(prev => ({
        ...prev,
        sessionChecks: prev.sessionChecks + 1,
        lastStatus: 'Fehler bei Prüfung: ' + (e instanceof Error ? e.message : String(e))
      }));
      return null;
    }
  }, []);

  // Komplett überarbeitete Hauptladefunktion mit verbesserter Fehlerbehandlung
  const fetchUserProfile = useCallback(async () => {
    // Schutzbedingung: Verhindere doppelte Aufrufe während des Ladevorgangs
    if (isLoading) return;
    
    try {
      // Aktuelle Anfragen abbrechen, falls vorhanden
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Neue Anfrage gestartet');
      }
      
      // Neuen AbortController erstellen
      abortControllerRef.current = new AbortController();
      
      // Status zurücksetzen
      setIsLoading(true);
      setLoadError(null);
      
      console.log('[DEBUG] Loading user session with localStorage auth...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[DEBUG] Session error:', error);
        throw error;
      }
      
      console.log('[DEBUG] Session geladen:', session?.user ? 'Benutzer vorhanden' : 'Kein Benutzer');
      console.log('[DEBUG] Session-Objekt:', JSON.stringify(session?.user?.app_metadata || {}, null, 2));
      
      // Wichtig: User-State aktualisieren
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Session-Tracking aktualisieren
      setSessionTracking(prev => ({
        initialized: true,
        sessionChecks: prev.sessionChecks + 1,
        lastStatus: currentUser ? 'Benutzer aktiv' : 'Kein Benutzer'
      }));
      
      if (currentUser?.id) {
        try {
          console.log('[DEBUG] Erster Versuch: Profil laden');
          // Performance-Messung
          console.time('Profilabruf-Gesamt');
          const userProfile = await fetchProfile(currentUser.id);
          console.timeEnd('Profilabruf-Gesamt');
          setProfile(userProfile);
        } catch (profileError) {
          console.warn("[DEBUG] 1. Versuch fehlgeschlagen, versuche erneut...");
          
          // Prüfen, ob die Anfrage abgebrochen wurde
          if (abortControllerRef.current?.signal.aborted) {
            console.log('[DEBUG] Anfrage wurde abgebrochen, breche Retry ab');
            return;
          }
          
          try {
            // Automatischer zweiter Versuch nach kurzer Pause
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('[DEBUG] Zweiter Versuch: Profil laden');
            
            const retryProfile = await fetchProfile(currentUser.id);
            setProfile(retryProfile);
            console.log('[DEBUG] Zweiter Versuch erfolgreich!');
          } catch (retryError) {
            // Nur Fehler setzen, wenn die Anfrage nicht abgebrochen wurde
            if (!abortControllerRef.current?.signal.aborted) {
              console.error("[DEBUG] 2. Versuch fehlgeschlagen:", retryError);
              setLoadError(retryError instanceof Error ? retryError : new Error('Unknown error loading profile'));
              setProfile(null);
              
              // Fehler anzeigen
              toast({
                title: "Fehler beim Laden des Profils",
                description: retryError instanceof Error ? retryError.message : "Unbekannter Fehler",
                variant: "destructive"
              });
            }
          }
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      // Nur Fehler setzen, wenn die Anfrage nicht abgebrochen wurde
      if (!abortControllerRef.current?.signal.aborted) {
        console.error('[DEBUG] Error in fetchUserProfile:', error);
        setLoadError(error instanceof Error ? error : new Error('Unknown error loading profile'));
        
        // Bei Session-Fehlern automatisch abmelden
        if (error instanceof Error && error.message.includes('session')) {
          await supabase.auth.signOut().catch(e => console.error('Error signing out:', e));
          setUser(null);
          setProfile(null);
          
          toast({
            title: "Sitzungsfehler",
            description: "Bitte melden Sie sich erneut an",
            variant: "destructive"
          });
        }
      }
    } finally {
      // Ladezustand nur zurücksetzen, wenn die Anfrage nicht abgebrochen wurde
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [fetchProfile, toast, isLoading]);

  // Improved logout function with better error handling and state reset
  const logout = useCallback(async () => {
    console.log("[Auth] Starte Logout...");

    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("[Auth] Supabase Logout-Fehler:", error.message);
        return { success: false, error };
      }

      // Clear local state
      setUser(null);
      setProfile(null);
      setChatterStats({ enhanced_chatters: 0, total_chatters: 0, natural_chatters: 0 });
      
      // Clear any cached profile data
      databaseService.clearCache();
      
      // Remove any persistent tokens
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-qdxpxqdewqrbvlsajeeo-auth-token');

      console.log("[Auth] Logout erfolgreich. Zustand zurückgesetzt.");
      
      // Return success status
      return { success: true, error: null };
    } catch (error) {
      console.error("[Auth] Unerwarteter Fehler beim Logout:", error);
      return { success: false, error };
    }
  }, []);

  // Add the missing loadChatterStats function
  const loadChatterStats = useCallback(async (streamUrl: string) => {
    if (!user?.id || !streamUrl) return false;
    
    try {
      console.log("Loading chatter stats for:", streamUrl);
      
      const { data, error } = await supabase
        .from('chatter_stats')
        .select('enhanced_chatters, natural_chatters, total_chatters')
        .eq('user_id', user.id)
        .eq('stream_url', streamUrl)
        .single();
      
      if (error) {
        console.warn("Error loading chatter stats:", error);
        // If no record exists, create one
        if (error.code === 'PGRST116') {
          await supabase.from('chatter_stats').insert([{
            user_id: user.id,
            stream_url: streamUrl,
            enhanced_chatters: 0,
            natural_chatters: 0,
            total_chatters: 0
          }]);
          
          setChatterStats({
            enhanced_chatters: 0,
            natural_chatters: 0,
            total_chatters: 0
          });
        }
        return false;
      }
      
      if (data) {
        setChatterStats({
          enhanced_chatters: data.enhanced_chatters || 0,
          natural_chatters: data.natural_chatters || 0,
          total_chatters: data.total_chatters || 0
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error in loadChatterStats:", error);
      return false;
    }
  }, [user?.id]);

  // Add the missing updateUserChatters function
  const updateUserChatters = useCallback(async (streamUrl: string, chattersToAdd: number) => {
    if (!user?.id || !streamUrl) return false;
    
    try {
      // First, get current stats
      const { data: currentStats, error: statsError } = await supabase
        .from('chatter_stats')
        .select('enhanced_chatters, natural_chatters, total_chatters')
        .eq('user_id', user.id)
        .eq('stream_url', streamUrl)
        .single();
      
      if (statsError) {
        console.error("Error getting current chatter stats:", statsError);
        return false;
      }
      
      // Calculate new values
      const newEnhancedChatters = (currentStats?.enhanced_chatters || 0) + chattersToAdd;
      const newTotalChatters = (currentStats?.natural_chatters || 0) + newEnhancedChatters;
      
      // Update the database
      const { error: updateError } = await supabase
        .from('chatter_stats')
        .upsert({
          user_id: user.id,
          stream_url: streamUrl,
          enhanced_chatters: newEnhancedChatters,
          natural_chatters: currentStats?.natural_chatters || 0,
          total_chatters: newTotalChatters,
          updated_at: new Date().toISOString()
        });
      
      if (updateError) {
        console.error("Error updating chatter stats:", updateError);
        return false;
      }
      
      // Update local state
      setChatterStats({
        enhanced_chatters: newEnhancedChatters,
        natural_chatters: currentStats?.natural_chatters || 0,
        total_chatters: newTotalChatters
      });
      
      return true;
    } catch (error) {
      console.error("Error in updateUserChatters:", error);
      return false;
    }
  }, [user?.id]);

  // Retry loading function for the LoadingOverlay component
  const retryLoading = useCallback(() => {
    console.log("[DEBUG] Manual retry loading triggered");
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Manual session check function for debugging
  const debugSession = useCallback(async () => {
    console.log("[DEBUG] Manual session check...");
    await checkSession();
  }, [checkSession]);

  // Effect to load user on mount and set up auth state listener
  useEffect(() => {
    console.log("[DEBUG] useUser Hook initialisiert");
    
    // DEBUG: Setze localStorage-Einträge für aktive Sitzungen
    const localStorageItems = Object.keys(localStorage)
      .filter(key => key.includes('supabase') || key.includes('auth'))
      .reduce((obj, key) => {
        return { ...obj, [key]: localStorage.getItem(key) ? "Vorhanden" : "Nicht vorhanden" };
      }, {});
    
    console.log("[DEBUG] localStorage Status:", localStorageItems);
    
    // Load user profile immediately
    fetchUserProfile();

    // Set up subscription to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[DEBUG] Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN') {
          fetchUserProfile();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setChatterStats({ enhanced_chatters: 0, total_chatters: 0, natural_chatters: 0 });
          console.log('[DEBUG] Nutzer abgemeldet - States zurückgesetzt');
        }
      }
    );

    // DEBUG: Regelmäßiger Session-Check
    const sessionCheckInterval = setInterval(() => {
      checkSession();
    }, 10000); // Alle 10 Sekunden prüfen

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, [fetchUserProfile, checkSession]);

  return {
    user,
    profile,
    isLoading,
    loadError,
    retryLoading,
    logout,
    chatterStats,
    setChatterStats,
    loadChatterStats,
    updateUserChatters,
    debugSession, // Neue Funktion für Debug-Zwecke
    sessionTracking, // Neuer State für Debug-Zwecke
  };
};
