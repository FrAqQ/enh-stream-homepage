
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
