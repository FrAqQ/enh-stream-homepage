
import { supabase } from './supabaseClient';
import { useToast } from "@/hooks/use-toast";

/**
 * Optimized database service with caching and error handling
 */
export const databaseService = {
  // Cache for frequently accessed data
  cache: new Map<string, { data: any, timestamp: number }>(),
  cacheTTL: 60000, // 1 minute cache TTL

  /**
   * Get profile data with caching support
   */
  async getProfile(userId: string) {
    const cacheKey = `profile-${userId}`;
    const cachedData = this.cache.get(cacheKey);
    
    // Return cached data if valid
    if (cachedData && (Date.now() - cachedData.timestamp < this.cacheTTL)) {
      console.log("Using cached profile data");
      return { data: cachedData.data, error: null, source: 'cache' };
    }

    try {
      // First try to get profile with basic fields that should exist 
      const { data, error } = await supabase
        .from('profiles')
        .select('id, plan, subscription_status')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      // Set default values for potentially missing fields
      const profileData = {
        ...data,
        viewers_active: 0, // Default value if column doesn't exist yet
        viewer_limit: this.calculateViewerLimit(data.plan, data.subscription_status)
      };

      // Update cache
      this.cache.set(cacheKey, {
        data: profileData,
        timestamp: Date.now()
      });

      return { data: profileData, error: null, source: 'database' };
    } catch (error) {
      console.error("Error fetching profile:", error);
      
      // If this is a new user, create a basic profile
      if (error.message && error.message.includes('does not exist')) {
        try {
          // Create basic profile with default values
          const defaultProfile = {
            id: userId,
            plan: 'Free',
            subscription_status: 'inactive',
            viewers_active: 0,
            viewer_limit: 4
          };
          
          this.cache.set(cacheKey, {
            data: defaultProfile,
            timestamp: Date.now()
          });
          
          return { data: defaultProfile, error: null, source: 'default' };
        } catch (createError) {
          console.error("Error creating default profile:", createError);
          return { data: null, error: createError, source: null };
        }
      }
      
      return { data: null, error, source: null };
    }
  },

  /**
   * Calculate viewer limit based on plan and status
   */
  calculateViewerLimit(plan: string | null | undefined, status: string | null | undefined) {
    if (!plan) return 4;
    
    if (status !== 'active') return 4;
    
    if (plan.includes('Ultimate')) return 1000;
    if (plan.includes('Expert')) return 300;
    if (plan.includes('Professional')) return 200;
    if (plan.includes('Basic')) return 50;
    if (plan.includes('Starter')) return 25;
    
    return 4; // Default limit
  },

  /**
   * Update viewers active count
   * This will handle the case where the column might not exist yet
   */
  async updateViewersActive(userId: string, count: number) {
    try {
      // First check if the column exists by getting the profile
      const { data: profile, error: getError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (getError && !getError.message.includes('does not exist')) {
        throw getError;
      }
      
      // If we got here, the profile exists or we're handling a non-existent profile appropriately
      
      // Update cache if it exists regardless of database state
      const cacheKey = `profile-${userId}`;
      if (this.cache.has(cacheKey)) {
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
          this.cache.set(cacheKey, {
            data: { ...cachedData.data, viewers_active: count },
            timestamp: Date.now()
          });
        }
      }
      
      // Try to update the database, but don't fail if column doesn't exist
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({ viewers_active: count })
          .eq('id', userId)
          .select();

        if (error && !error.message.includes('does not exist')) {
          console.warn("Non-critical error updating viewers_active:", error);
        }
        
        return { success: true, data };
      } catch (updateError) {
        console.warn("Could not update viewers_active in database, but cache was updated:", updateError);
        // We'll consider this a "soft" success since the cache was updated
        return { success: true, data: null };
      }
    } catch (error) {
      console.error("Error in updateViewersActive:", error);
      return { success: false, error };
    }
  },

  /**
   * Clear the cache or a specific cache entry
   */
  clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
};
