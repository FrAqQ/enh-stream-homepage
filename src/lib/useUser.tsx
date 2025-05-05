
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

  // Profile loading method with abort capability
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log(`Loading profile for user: ${userId}`);
      // Use signal for abortable requests
      const signal = abortControllerRef.current.signal;
      
      // Timeout for this specific request
      const fetchTimeout = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout when retrieving profile')), 4000);
      });
      
      // Race between the actual request and the timeout
      const result = await Promise.race([
        databaseService.getProfile(userId),
        fetchTimeout
      ]);
      
      if (!result) {
        throw new Error('Profile could not be loaded');
      }
      
      console.log('Profile loaded successfully:', result.data);
      return result.data;
    } catch (error) {
      console.error('Error loading profile:', error);
      if (error instanceof Error) {
        // Only throw if it wasn't an abort
        if (error.name !== 'AbortError') {
          setLoadError(error);
        }
      } else {
        setLoadError(new Error('Unknown error'));
      }
      toast({
        title: "Error loading profile",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Main loading function with additional error handling
  const fetchUserProfile = useCallback(async () => {
    try {
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      
      setIsLoading(true);
      console.log('Loading user session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        toast({
          title: "Authentication error",
          description: "There was a problem with your session",
          variant: "destructive"
        });
        
        // Sign out when session error occurs
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setLoadError(error);
        setIsLoading(false); // Important: End status
        return false;
      }
      
      console.log("Session data:", session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser?.id) {
        const userProfile = await fetchProfile(currentUser.id);
        
        if (!userProfile) {
          // On null, try once more with default profile
          console.log("Creating default profile since none could be loaded");
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
      
      // In all cases end loading
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error loading session:', error);
      setLoadError(error instanceof Error ? error : new Error('Unknown error'));
      toast({
        title: "System error",
        description: "There was a problem loading your data",
        variant: "destructive"
      });
      
      // Delete session and reset status in case of error
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Error signing out:', signOutError);
      }
      
      setUser(null);
      setProfile(null);
      setIsLoading(false); // Important: Always end loading status
      return false;
    }
  }, [fetchProfile, toast]);

  // Function to cancel current loading and restart
  const handleRetry = useCallback(() => {
    console.log("Restarting profile loading...");
    
    // Cancel current requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Delete timer
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    // Reset error
    setLoadError(null);
    
    // Reload
    retryRef.current += 1;
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Timeout for loading process
  useEffect(() => {
    // Only set timeout if still loading
    if (isLoading) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.error('Profile loading exceeded timeout');
        toast({
          title: "Loading error",
          description: "Loading your profile is taking unusually long. We're trying again.",
          variant: "destructive"
        });
        
        // Retry or abort
        if (retryRef.current < maxRetries) {
          handleRetry();
        } else {
          setIsLoading(false);
          setLoadError(new Error("Timeout loading profile"));
          toast({
            title: "Profile loading failed",
            description: "Please reload the page or contact support.",
            variant: "destructive"
          });
          
          // Set default profile after too many errors
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
      }, 5000); // 5 seconds timeout
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, toast, handleRetry, user]);

  // Function to update enhanced viewer count in the database
  const updateUserEnhancedViewers = useCallback(async (count: number) => {
    if (!user?.id || !profile) return false;
    
    try {
      // First update local state
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          viewers_active: count
        };
      });
      
      // Then update in database
      const result = await databaseService.updateViewersActive(user.id, count);
      return result.success;
    } catch (error) {
      console.error('Error updating enhanced viewers:', error);
      return false;
    }
  }, [user?.id, profile]);

  useEffect(() => {
    // Initial user loading
    fetchUserProfile();

    // Listen for authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Authentication status changed:", event, session?.user?.id);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        // Clear cached data
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
      // Abort requests on unmount
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
    retryLoading: handleRetry,
    updateUserEnhancedViewers
  };
};
