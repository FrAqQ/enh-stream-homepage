
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [chatterStats, setChatterStats] = useState<ChatterStats>({
    enhanced_chatters: 0,
    natural_chatters: 0,
    total_chatters: 0,
  });
  const { toast } = useToast();
  const [sessionChecked, setSessionChecked] = useState(false);

  // Fetch user profile from the database
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('[useUser] Fetching profile for user:', userId);
      const { data, error } = await databaseService.getProfile(userId);
      
      if (error) throw error;
      if (!data) throw new Error('Kein Profil gefunden');
      
      return data;
    } catch (error) {
      console.error('[useUser] Error fetching profile:', error);
      throw error;
    }
  }, []);

  // Main user loading function
  const fetchUserProfile = useCallback(async () => {
    if (!sessionChecked) return;
    
    try {
      setIsLoading(true);
      setLoadError(null);
      
      // Create new abort controller for this request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Neue Anfrage gestartet');
      }
      abortControllerRef.current = new AbortController();
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[useUser] Session error:', error);
        throw error;
      }
      
      // Update user state
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser?.id) {
        try {
          const userProfile = await fetchProfile(currentUser.id);
          setProfile(userProfile);
        } catch (profileError) {
          console.warn("[useUser] Profile fetch failed:", profileError);
          
          // Only set error if request wasn't aborted
          if (!abortControllerRef.current?.signal.aborted) {
            setLoadError(profileError instanceof Error ? profileError : new Error('Unknown error'));
            setProfile(null);
          }
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      // Only set error if request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        console.error('[useUser] Error in fetchUserProfile:', error);
        setLoadError(error instanceof Error ? error : new Error('Unknown error'));
      }
    } finally {
      // Only update loading state if request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [fetchProfile, sessionChecked]);

  // Logout function
  const logout = useCallback(async () => {
    console.log("[useUser] Starting logout...");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("[useUser] Logout error:", error.message);
        return { success: false, error };
      }

      // Clear local state
      setUser(null);
      setProfile(null);
      setChatterStats({ enhanced_chatters: 0, total_chatters: 0, natural_chatters: 0 });
      
      // Clear cached data
      databaseService.clearCache();

      console.log("[useUser] Logout successful");
      return { success: true, error: null };
    } catch (error) {
      console.error("[useUser] Unexpected logout error:", error);
      return { success: false, error };
    }
  }, []);

  // Add the loadChatterStats function
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

  // Add the updateUserChatters function
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

  // Retry loading function
  const retryLoading = useCallback(() => {
    console.log("[useUser] Manual retry loading triggered");
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Effect to check session once on mount
  useEffect(() => {
    const checkSession = async () => {
      console.log("[useUser] Initial session check");
      try {
        const { data } = await supabase.auth.getSession();
        console.log("[useUser] Initial session result:", !!data.session);
        setSessionChecked(true);
      } catch (err) {
        console.error("[useUser] Initial session check error:", err);
        setSessionChecked(true); // Still mark as checked even on error
      }
    };
    
    checkSession();
  }, []);

  // Effect to load user profile after session check
  useEffect(() => {
    if (sessionChecked) {
      fetchUserProfile();
    }
  }, [sessionChecked, fetchUserProfile]);

  // Effect to set up auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useUser] Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
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
    setChatterStats,
    loadChatterStats,
    updateUserChatters,
  };
};
