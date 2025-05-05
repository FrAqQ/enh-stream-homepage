
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
  chatters_active: number; // Neu hinzugefügt
  viewer_limit: number;  // Dies wird aus computed_viewer_limit in databaseService gemappt
  chatter_limit: number; // Neu hinzugefügt
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef(new AbortController());

  // Verbesserte Profilladefunktion ohne Fallbacks
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log(`Loading profile for user: ${userId}`);
      
      // Timeout nach 5 Sekunden (erhöht von vorherigen 3 Sekunden)
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout when retrieving profile')), 5000);
      });
      
      // Race zwischen tatsächlicher Anfrage und Timeout
      const result = await Promise.race([
        databaseService.getProfile(userId),
        timeoutPromise
      ]);
      
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
          const userProfile = await fetchProfile(currentUser.id);
          setProfile(userProfile);
        } catch (profileError) {
          console.error("Failed to load profile:", profileError);
          setLoadError(profileError instanceof Error ? profileError : new Error('Unknown error loading profile'));
          // Kein Fallback-Profil mehr setzen
          setProfile(null);
          
          // Fehler anzeigen
          toast({
            title: "Fehler beim Laden des Profils",
            description: profileError instanceof Error ? profileError.message : "Unbekannter Fehler",
            variant: "destructive"
          });
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

  // Neue Funktion zum Aktualisieren der Chatterzahl
  const updateUserChatters = useCallback(async (count: number) => {
    if (!user?.id || !profile) return false;
    
    try {
      // Lokalen State aktualisieren
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chatters_active: count
        };
      });
      
      // Datenbank aktualisieren
      const result = await databaseService.updateChattersActive(user.id, count);
      return result.success;
    } catch (error) {
      console.error('Error updating chatters:', error);
      return false;
    }
  }, [user?.id, profile]);

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

  return { 
    user, 
    profile, 
    isLoading, 
    loadError, 
    retryLoading,
    updateUserEnhancedViewers,
    updateUserChatters // Neue Funktion exportieren
  };
};
