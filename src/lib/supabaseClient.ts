
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qdxpxqdewqrbvlsajeeo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeHB4cWRld3FyYnZsc2FqZWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NzM0MDMsImV4cCI6MjA1MzI0OTQwM30.-wnDf1hMWOow3O1kbcTfC3mw59h-5SsmdFGhp5bKgUE';

// DEBUG: Stelle sicher, dass wir localStorage verwenden und Sitzungen persistieren
console.log('[DEBUG] Supabase Client wird initialisiert mit localStorage');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage, // Explizit localStorage nutzen statt Cookies
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// DEBUG: Überprüfen, ob der Client korrekt initialisiert wurde
console.log('[DEBUG] Supabase Client initialisiert:', !!supabase);

// Expose a helper for testing
export const checkSupabaseAuth = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    return { 
      hasSession: !!data.session,
      error: error ? error.message : null,
      storageType: 'localStorage'
    };
  } catch (e) {
    return { 
      hasSession: false, 
      error: e instanceof Error ? e.message : 'Unknown error',
      storageType: 'localStorage'
    };
  }
};
