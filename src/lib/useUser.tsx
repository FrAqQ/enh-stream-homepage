
import { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';
import { databaseService } from './databaseService';
import { useToast } from "@/hooks/use-toast";

export interface UserProfile {
  id: string;
  plan: string;
  subscription_status: string;
  viewers_active: number;
  viewer_limit: number;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const { toast } = useToast();
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRetries = 2;
  const retryRef = useRef(0);

  // Timeout für Ladeprozess
  useEffect(() => {
    // Nur Timeout setzen, wenn noch geladen wird
    if (isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.error('Profilladung hat das Timeout überschritten');
        toast({
          title: "Ladefehler",
          description: "Das Laden deines Profils dauert ungewöhnlich lange. Wir versuchen es erneut.",
          variant: "destructive"
        });
        
        // Erneuter Versuch oder Abbruch
        if (retryRef.current < maxRetries) {
          retryRef.current += 1;
          fetchUserProfile();
        } else {
          setIsLoading(false);
          setLoadError(new Error("Timeout beim Laden des Profils"));
          toast({
            title: "Profilladung fehlgeschlagen",
            description: "Bitte lade die Seite neu oder kontaktiere den Support.",
            variant: "destructive"
          });
        }
      }, 5000); // 5 Sekunden Timeout
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, toast]);

  const fetchProfile = async (userId: string) => {
    try {
      console.log(`Lade Profil für Benutzer: ${userId}`);
      const { data, error } = await databaseService.getProfile(userId);
      
      if (error) {
        console.error('Fehler beim Laden des Profils:', error);
        toast({
          title: "Fehler beim Laden des Profils",
          description: "Wir konnten deine Profilinformationen nicht laden",
          variant: "destructive"
        });
        setLoadError(error);
        return null;
      }
      
      console.log('Profil erfolgreich geladen:', data);
      return data;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Laden des Profils:', error);
      setLoadError(error instanceof Error ? error : new Error('Unbekannter Fehler'));
      toast({
        title: "Fehler beim Laden des Profils",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive"
      });
      return null;
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      console.log('Lade Benutzersitzung...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Sitzungsfehler:', error);
        toast({
          title: "Authentifizierungsfehler",
          description: "Es gab ein Problem mit deiner Sitzung",
          variant: "destructive"
        });
        
        // Bei Sitzungsfehler abmelden
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setLoadError(error);
      } else {
        console.log("Sitzungsdaten:", session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser?.id) {
          const userProfile = await fetchProfile(currentUser.id);
          setProfile(userProfile);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Sitzung:', error);
      setLoadError(error instanceof Error ? error : new Error('Unbekannter Fehler'));
      toast({
        title: "Systemfehler",
        description: "Es gab ein Problem beim Laden deiner Daten",
        variant: "destructive"
      });
      
      // Bei Fehler Sitzung löschen
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initiale Benutzerladung
    fetchUserProfile();

    // Auf Authentifizierungsänderungen hören
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Authentifizierungsstatus geändert:", event, session?.user?.id);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        // Zwischengespeicherte Daten löschen
        databaseService.clearCache();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        
        if (session?.user?.id) {
          setIsLoading(true);
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
          setIsLoading(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  return { user, profile, isLoading, loadError };
};
