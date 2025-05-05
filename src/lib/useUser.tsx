
import { useState, useEffect, useCallback, useRef } from 'react';
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
      
      console.log('Loading user session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        throw error;
      }
      
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser?.id) {
        try {
          console.log('Erster Versuch: Profil laden');
          // Performance-Messung
          console.time('Profilabruf-Gesamt');
          const userProfile = await fetchProfile(currentUser.id);
          console.timeEnd('Profilabruf-Gesamt');
          setProfile(userProfile);
        } catch (profileError) {
          console.warn("1. Versuch fehlgeschlagen, versuche erneut...");
          
          // Prüfen, ob die Anfrage abgebrochen wurde
          if (abortControllerRef.current.signal.aborted) {
            console.log('Anfrage wurde abgebrochen, breche Retry ab');
            return;
          }
          
          try {
            // Automatischer zweiter Versuch nach kurzer Pause
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('Zweiter Versuch: Profil laden');
            
            const retryProfile = await fetchProfile(currentUser.id);
            setProfile(retryProfile);
            console.log('Zweiter Versuch erfolgreich!');
          } catch (retryError) {
            // Nur Fehler setzen, wenn die Anfrage nicht abgebrochen wurde
            if (!abortControllerRef.current.signal.aborted) {
              console.error("2. Versuch fehlgeschlagen:", retryError);
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
      if (!abortControllerRef.current.signal.aborted) {
        console.error('Error in fetchUserProfile:', error);
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
      if (!abortControllerRef.current.signal.aborted) {
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

  // Retry loading function for the LoadingOverlay component
  const retryLoading = useCallback(() => {
    console.log("Manual retry loading triggered");
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Effect to load user on mount and set up auth state listener
  useEffect(() => {
    // Load user profile immediately
    fetchUserProfile();

    // Set up subscription to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN') {
          fetchUserProfile();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setChatterStats({ enhanced_chatters: 0, total_chatters: 0, natural_chatters: 0 });
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  return {
    user,
    profile,
    isLoading,
    loadError,
    retryLoading,
    logout,
    chatterStats,
    setChatterStats
  };
};

// Export for use in other components
export type { UserProfile };
