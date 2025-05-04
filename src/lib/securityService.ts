
import { supabase } from './supabaseClient';
import { useToast } from "@/hooks/use-toast";

export interface DataExportType {
  profile?: boolean;
  activityLogs?: boolean;
  settings?: boolean;
}

export const securityService = {
  /**
   * Export user data in compliance with GDPR
   */
  async exportUserData(userId: string, dataTypes: DataExportType = { profile: true, activityLogs: true, settings: true }) {
    try {
      const exportData: Record<string, any> = {};
      
      if (dataTypes.profile) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        exportData.profile = profileData;
      }
      
      // Add other data types as needed
      // This is a placeholder for actual implementation
      if (dataTypes.activityLogs) {
        exportData.activityLogs = [];
      }
      
      if (dataTypes.settings) {
        exportData.settings = {};
      }
      
      // Generate download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error("Error exporting user data:", error);
      return { success: false, error };
    }
  },
  
  /**
   * Delete user data in compliance with GDPR right to be forgotten
   */
  async deleteUserData(userId: string): Promise<{ success: boolean, error?: any }> {
    try {
      // First delete related profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) throw profileError;
      
      // Then delete the user account
      const { error: userError } = await supabase.auth.admin.deleteUser(userId);
      
      if (userError) throw userError;
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting user data:", error);
      return { success: false, error };
    }
  },
  
  /**
   * Check compliance with Twitch ToS
   */
  checkPlatformCompliance(viewerCount: number, channelFollowers: number): { 
    compliant: boolean, 
    risk: 'low' | 'medium' | 'high',
    recommendations: string[]
  } {
    // This is a simplified algorithm to determine compliance risk
    // In a real system, this would be more sophisticated
    const viewerRatio = viewerCount / (channelFollowers || 1);
    
    if (viewerRatio > 0.7) {
      return {
        compliant: false,
        risk: 'high',
        recommendations: [
          "Reduce viewer bot count to less than 50% of your follower count",
          "Increase organic engagement through social media",
          "Build follower base before increasing viewer count"
        ]
      };
    } else if (viewerRatio > 0.4) {
      return {
        compliant: true,
        risk: 'medium',
        recommendations: [
          "Consider reducing viewer bot count for long-term safety",
          "Focus on organic growth strategies"
        ]
      };
    } else {
      return {
        compliant: true,
        risk: 'low',
        recommendations: []
      };
    }
  }
};
