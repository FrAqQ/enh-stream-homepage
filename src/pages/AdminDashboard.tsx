
import { useEffect, useState } from 'react';
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate } from "react-router-dom";

interface Profile {
  id: string;
  email: string;
  plan: string;
  follower_plan: string;
  is_admin: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      setIsAdmin(profile?.is_admin || false);
      
      if (profile?.is_admin) {
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        setProfiles(allProfiles || []);
      }
      
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  if (loading) {
    return <div className="container mx-auto px-4 pt-20">Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto px-4 pt-20">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Benutzerübersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Plan</th>
                    <th className="text-left p-2">Follower Plan</th>
                    <th className="text-left p-2">Admin Status</th>
                    <th className="text-left p-2">Erstellt am</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="border-b">
                      <td className="p-2">{profile.email}</td>
                      <td className="p-2">{profile.plan}</td>
                      <td className="p-2">{profile.follower_plan}</td>
                      <td className="p-2">
                        {profile.is_admin ? (
                          <span className="text-green-500">Admin</span>
                        ) : (
                          <span className="text-gray-500">User</span>
                        )}
                      </td>
                      <td className="p-2">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
