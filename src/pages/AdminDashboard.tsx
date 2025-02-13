
import { useEffect, useState } from 'react';
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Profile {
  id: string;
  email: string;
  plan: string;
  follower_plan: string;
  is_admin: boolean;
  created_at: string;
  last_sign_in_at?: string;
}

const AdminDashboard = () => {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminProfiles, setAdminProfiles] = useState<Profile[]>([]);

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
        setAdminProfiles(allProfiles?.filter(p => p.is_admin) || []);
      }
      
      setLoading(false);
    };

    checkAdminStatus();

    // Echtzeit-Updates für Online-Status
    const channel = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        // Aktualisiere die Profile-Liste
        checkAdminStatus();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const handleAddAdmin = async () => {
    try {
      // Überprüfe, ob die E-Mail existiert
      const { data: userToUpdate } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', newAdminEmail)
        .single();

      if (!userToUpdate) {
        toast.error('Benutzer nicht gefunden');
        return;
      }

      // Aktualisiere den Admin-Status
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('email', newAdminEmail);

      if (error) throw error;

      toast.success('Admin erfolgreich hinzugefügt');
      setNewAdminEmail('');
      
      // Aktualisiere die Profile-Liste
      const { data: updatedProfiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      setProfiles(updatedProfiles || []);
      setAdminProfiles(updatedProfiles?.filter(p => p.is_admin) || []);
    } catch (error) {
      toast.error('Fehler beim Hinzufügen des Admins');
    }
  };

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
        {/* Admin-Hinzufügen-Formular */}
        <Card>
          <CardHeader>
            <CardTitle>Admin hinzufügen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="E-Mail des neuen Admins"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
              <Button onClick={handleAddAdmin}>Als Admin hinzufügen</Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin-Liste */}
        <Card>
          <CardHeader>
            <CardTitle>Admin-Liste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Letzte Anmeldung</th>
                  </tr>
                </thead>
                <tbody>
                  {adminProfiles.map((profile) => (
                    <tr key={profile.id} className="border-b">
                      <td className="p-2">{profile.email}</td>
                      <td className="p-2">
                        {profile.last_sign_in_at && 
                         new Date(profile.last_sign_in_at).getTime() > Date.now() - 5 * 60 * 1000 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Offline
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        {profile.last_sign_in_at ? 
                          new Date(profile.last_sign_in_at).toLocaleString() : 
                          'Noch nie'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Allgemeine Benutzerübersicht */}
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
