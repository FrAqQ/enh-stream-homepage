import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';
import { databaseService } from './databaseService';
import { useToast } from "@/hooks/use-toast";

export interface UserProfile {
  id: string;
  plan: string;
  subscription_status: string;
  viewers_active: number;
  chatters_active: number;
  viewer_limit: number;
  chatter_limit: number;
}

export interface ChatterStats {
  enhanced_chatters: number;
  total_chatters: number;
  natural_chatters: number;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [chatterStats, setChatterStats] = useState<ChatterStats>({
    enhanced_chatters: 0,
    total_chatters: 0,
    natural_chatters: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef(new AbortController());

  // Verbesserte Profilladefunktion ohne Fallbacks
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log(`Loading profile for user: ${userId}`);
      
      // Erhöhter Timeout auf 10 Sekunden (direkte Promise, ohne Race)
      const result = await databaseService.getProfile(userId);
      
      if (!result || !result.data) {
        throw new Error('Profile could not be loaded');
      }
      
      console.log('Profile loaded successfully:', result.data);
      return result.data;
    } catch (error) {
      console.error('Error loading profile:', error);
      throw error; // Fehler weitergeben statt unterdrücken
    }
  }, []);

  // Funktion zum Laden der Chatter-Statistiken
  const fetchChatterStats = useCallback(async (userId: string, streamUrl: string) => {
    if (!streamUrl) return;
    
    try {
      const { data, error } = await databaseService.getChatterStats(userId, streamUrl);
      if (error) {
        console.error('Error loading chatter stats:', error);
        return;
      }
      
      setChatterStats(data);
    } catch (error) {
      console.error('Error in fetchChatterStats:', error);
    }
  }, []);

  // Hauptladefunktion mit verbesserter Fehlerbehandlung
  const fetchUserProfile = useCallback(async () => {
    try {
      abortControllerRef.current = new AbortController();
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
          const userProfile = await fetchProfile(currentUser.id);
          setProfile(userProfile);
        } catch (profileError) {
          console.warn("1. Versuch fehlgeschlagen, versuche erneut...");
          
          try {
            // Automatischer zweiter Versuch nach kurzer Pause
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('Zweiter Versuch: Profil laden');
            
            const retryProfile = await fetchProfile(currentUser.id);
            setProfile(retryProfile);
            console.log('Zweiter Versuch erfolgreich!');
          } catch (retryError) {
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
      } else {
        setProfile(null);
      }
    } catch (error) {
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
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile, toast]);

  // Funktion zum Neuladen bei Fehlern
  const retryLoading = useCallback(() => {
    console.log("Retrying profile loading...");
    
    // Aktuelle Anfragen abbrechen
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Fehler zurücksetzen
    setLoadError(null);
    
    // Neu laden
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Funktion zum Aktualisieren der Zuschauerzahl
  const updateUserEnhancedViewers = useCallback(async (count: number) => {
    if (!user?.id || !profile) return false;
    
    try {
      // Lokalen State aktualisieren
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          viewers_active: count
        };
      });
      
      // Datenbank aktualisieren
      const result = await databaseService.updateViewersActive(user.id, count);
      return result.success;
    } catch (error) {
      console.error('Error updating viewers:', error);
      return false;
    }
  }, [user?.id, profile]);

  // Funktion zum Aktualisieren der Chatterzahl und Chatter-Statistiken
  const updateUserChatters = useCallback(async (streamUrl: string, count: number) => {
    if (!user?.id || !profile || !streamUrl) return false;
    
    try {
      // Neue Chatter zur Datenbank hinzufügen
      const result = await databaseService.addChatters(user.id, streamUrl, count);
      if (!result.success) {
        return false;
      }
      
      // Chatter-Statistiken neu laden
      await fetchChatterStats(user.id, streamUrl);
      
      return true;
    } catch (error) {
      console.error('Error updating chatters:', error);
      return false;
    }
  }, [user?.id, profile, fetchChatterStats]);

  // Initiales Laden und Auth-Listener
  useEffect(() => {
    fetchUserProfile();

    // Auth-Änderungen überwachen
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Authentication status changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        databaseService.clearCache();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        
        if (session?.user?.id) {
          try {
            const userProfile = await fetchProfile(session.user.id);
            setProfile(userProfile);
          } catch (profileError) {
            console.error("Failed to load profile on auth change:", profileError);
            setLoadError(profileError instanceof Error ? profileError : new Error('Unknown error loading profile'));
            setProfile(null);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProfile, fetchUserProfile]);

  // Funktion zum Laden von Chatter-Statistiken für einen bestimmten Stream
  const loadChatterStats = useCallback((streamUrl: string) => {
    if (user?.id && streamUrl) {
      fetchChatterStats(user.id, streamUrl);
    }
  }, [user?.id, fetchChatterStats]);

  return { 
    user, 
    profile, 
    isLoading, 
    loadError, 
    retryLoading,
    updateUserEnhancedViewers,
    updateUserChatters,
    chatterStats,
    loadChatterStats
  };
};
