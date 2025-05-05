
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
  const abortControllerRef = useRef(new AbortController());

  // Profillademethode mit Abbruchmöglichkeit
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log(`Lade Profil für Benutzer: ${userId}`);
      // Verwende Signal für abbrechbare Anfragen
      const signal = abortControllerRef.current.signal;
      
      // Timeout für diese spezifische Anfrage setzen
      const fetchTimeout = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Zeitüberschreitung beim Abrufen des Profils')), 4000);
      });
      
      // Race zwischen der tatsächlichen Anfrage und dem Timeout
      const result = await Promise.race([
        databaseService.getProfile(userId),
        fetchTimeout
      ]);
      
      if (!result) {
        throw new Error('Profil konnte nicht geladen werden');
      }
      
      console.log('Profil erfolgreich geladen:', result.data);
      return result.data;
    } catch (error) {
      console.error('Fehler beim Laden des Profils:', error);
      if (error instanceof Error) {
        // Nur neu werfen, wenn es kein Abbruch war
        if (error.name !== 'AbortError') {
          setLoadError(error);
        }
      } else {
        setLoadError(new Error('Unbekannter Fehler'));
      }
      toast({
        title: "Fehler beim Laden des Profils",
        description: error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Haupt-Ladefunktion mit zusätzlicher Fehlerbehandlung
  const fetchUserProfile = useCallback(async () => {
    try {
      // Neuen AbortController erstellen für diese Anfrage
      abortControllerRef.current = new AbortController();
      
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
        setIsLoading(false); // Wichtig: Status beenden
        return false;
      }
      
      console.log("Sitzungsdaten:", session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser?.id) {
        const userProfile = await fetchProfile(currentUser.id);
        
        if (!userProfile) {
          // Bei null noch einen zweiten Versuch mit Standardprofil
          console.log("Erstelle Standardprofil, da keins geladen werden konnte");
          const defaultProfile = {
            id: currentUser.id,
            plan: 'Free',
            subscription_status: 'inactive',
            viewers_active: 0,
            viewer_limit: 4
          };
          setProfile(defaultProfile);
        } else {
          setProfile(userProfile);
        }
      }
      
      // In allen Fällen Ladevorgang beenden
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Fehler beim Laden der Sitzung:', error);
      setLoadError(error instanceof Error ? error : new Error('Unbekannter Fehler'));
      toast({
        title: "Systemfehler",
        description: "Es gab ein Problem beim Laden deiner Daten",
        variant: "destructive"
      });
      
      // Bei Fehler Sitzung löschen und Status zurücksetzen
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Fehler beim Abmelden:', signOutError);
      }
      
      setUser(null);
      setProfile(null);
      setIsLoading(false); // Wichtig: Immer Loading-Status beenden
      return false;
    }
  }, [fetchProfile, toast]);

  // Funktion zum Abbrechen des aktuellen Ladevorgangs und Neustart
  const handleRetry = useCallback(() => {
    console.log("Starte Profilladen neu...");
    
    // Aktuelle Anfragen abbrechen
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Timer löschen
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    // Fehler zurücksetzen
    setLoadError(null);
    
    // Neu laden
    retryRef.current += 1;
    fetchUserProfile();
  }, [fetchUserProfile]);

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
          handleRetry();
        } else {
          setIsLoading(false);
          setLoadError(new Error("Timeout beim Laden des Profils"));
          toast({
            title: "Profilladung fehlgeschlagen",
            description: "Bitte lade die Seite neu oder kontaktiere den Support.",
            variant: "destructive"
          });
          
          // Standardprofil bei zu vielen Fehlern setzen
          if (user?.id) {
            const defaultProfile = {
              id: user.id,
              plan: 'Free',
              subscription_status: 'inactive',
              viewers_active: 0,
              viewer_limit: 4
            };
            setProfile(defaultProfile);
          }
        }
      }, 5000); // 5 Sekunden Timeout
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, toast, handleRetry, user]);

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
      // Anfragen beim Unmount abbrechen
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProfile, fetchUserProfile]);

  return { user, profile, isLoading, loadError, retryLoading: handleRetry };
};
