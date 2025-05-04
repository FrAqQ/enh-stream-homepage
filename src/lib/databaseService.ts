
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
      // Get viewer limit based on the plan
      const { data, error } = await supabase
        .from('profiles')
        .select('id, plan, subscription_status, viewers_active')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Calculate viewer limit based on plan and status
      const viewerLimit = data.plan ? 
        (data.subscription_status === 'active' ? 
          (data.plan.includes('Ultimate') ? 1000 :
           data.plan.includes('Expert') ? 300 :
           data.plan.includes('Professional') ? 200 :
           data.plan.includes('Basic') ? 50 :
           data.plan.includes('Starter') ? 25 : 4) : 4) : 4;

      const profileData = {
        ...data,
        viewer_limit: viewerLimit
      };

      // Update cache
      this.cache.set(cacheKey, {
        data: profileData,
        timestamp: Date.now()
      });

      return { data: profileData, error: null, source: 'database' };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return { data: null, error, source: null };
    }
  },

  /**
   * Update viewers active count
   */
  async updateViewersActive(userId: string, count: number) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ viewers_active: count })
        .eq('id', userId)
        .select();

      if (error) throw error;
      
      // Update cache if it exists
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

      return { success: true, data };
    } catch (error) {
      console.error("Error updating viewers active:", error);
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
