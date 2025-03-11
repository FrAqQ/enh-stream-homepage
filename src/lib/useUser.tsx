
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';
import { PLAN_VIEWER_LIMITS, PLAN_CHATTER_LIMITS } from './constants';

export interface UserProfileData {
  plan: string;
  follower_plan: string;
  subscription_status: string;
  current_period_end: string | null;
  is_admin: boolean;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);

  const fetchProfileData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan, follower_plan, subscription_status, current_period_end, is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const initUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          await supabase.auth.signOut();
          setUser(null);
          setProfileData(null);
        } else {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const profile = await fetchProfileData(session.user.id);
            setProfileData(profile);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
        await supabase.auth.signOut();
        setUser(null);
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };

    initUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfileData(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profile = await fetchProfileData(session.user.id);
          setProfileData(profile);
        }
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Ensuring consistent function signatures with required parameters
  const getViewerLimit = (plan?: string, userData?: UserProfileData | null) => {
    const userPlan = plan || userData?.plan || profileData?.plan || 'Free';
    return PLAN_VIEWER_LIMITS[userPlan as keyof typeof PLAN_VIEWER_LIMITS] || PLAN_VIEWER_LIMITS.Free;
  };

  const getChatterLimit = (plan?: string, userData?: UserProfileData | null) => {
    const userPlan = plan || userData?.plan || profileData?.plan || 'Free';
    return PLAN_CHATTER_LIMITS[userPlan as keyof typeof PLAN_CHATTER_LIMITS] || PLAN_CHATTER_LIMITS.Free;
  };

  return { 
    user, 
    isLoading, 
    profileData, 
    getViewerLimit, 
    getChatterLimit 
  };
};
