
import { useEffect, useState } from 'react';
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
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    const { data, error } = await databaseService.getProfile(userId);
    
    if (error) {
      toast({
        title: "Error loading profile",
        description: "We couldn't load your profile information",
        variant: "destructive"
      });
      return null;
    }
    
    return data;
  };

  useEffect(() => {
    // Get initial session
    const initUser = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          toast({
            title: "Authentication Error",
            description: "There was a problem with your session",
            variant: "destructive"
          });
          
          // If there's an error with the session, clear it
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
        } else {
          console.log("Session data:", session);
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          
          if (currentUser?.id) {
            const userProfile = await fetchProfile(currentUser.id);
            setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
        toast({
          title: "System Error",
          description: "There was a problem loading your data",
          variant: "destructive"
        });
        
        // On error, clear the session
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    initUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        // Clear any cached data
        databaseService.clearCache();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        
        if (session?.user?.id) {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, isLoading };
};
