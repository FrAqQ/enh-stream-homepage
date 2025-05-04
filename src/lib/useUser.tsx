
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

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

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, plan, subscription_status, viewers_active')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // Get the viewer limit based on the plan
      const viewerLimit = data.plan ? 
        (data.subscription_status === 'active' ? 
          (data.plan.includes('Ultimate') ? 1000 :
           data.plan.includes('Expert') ? 300 :
           data.plan.includes('Professional') ? 200 :
           data.plan.includes('Basic') ? 50 :
           data.plan.includes('Starter') ? 25 : 4) : 4) : 4;

      return {
        ...data,
        viewer_limit: viewerLimit
      };
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    const initUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
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
