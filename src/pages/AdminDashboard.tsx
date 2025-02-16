import { useState, useEffect } from "react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_ENDPOINTS, updateEndpoints } from "@/config/apiEndpoints";

interface Profile {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

interface EndpointWithStatus {
  host: string;
  status: {
    isOnline: boolean;
    lastChecked: Date;
    apiStatus: boolean;
    isSecure: boolean;
    pingStatus: boolean;
    systemMetrics: any;
  };
}

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

interface ChatRequest {
  id: string;
  user_email: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminProfiles, setAdminProfiles] = useState<Profile[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  
  const savedEndpoints = JSON.parse(localStorage.getItem('apiEndpoints') || '[]');
  const [endpoints, setEndpoints] = useState<EndpointWithStatus[]>(
    savedEndpoints.map((host: string) => ({
      host,
      status: {
        isOnline: false,
        lastChecked: new Date(),
        apiStatus: false,
        isSecure: false,
        pingStatus: false,
        systemMetrics: null
      }
    }))
  );
  const [newEndpoint, setNewEndpoint] = useState('');

  useEffect(() => {
    checkAdminStatus();
    fetchProfiles();
    fetchAdminProfiles();
    fetchChatRequests();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setIsAdmin(profile?.is_admin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setLoading(false);
    }
  };

  const fetchAdminProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminProfiles(data || []);
    } catch (error) {
      console.error('Error fetching admin profiles:', error);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('email', newAdminEmail)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        toast({
          title: "Success",
          description: "Admin rights granted successfully",
        });
        setNewAdminEmail('');
        fetchAdminProfiles();
      } else {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      toast({
        title: "Error",
        description: "Failed to grant admin rights",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('email', email);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin rights removed successfully",
      });
      fetchAdminProfiles();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast({
        title: "Error",
        description: "Failed to remove admin rights",
        variant: "destructive",
      });
    }
  };

  const handleAddEndpoint = () => {
    if (!newEndpoint.trim()) {
      toast({
        title: "Error",
        description: "Bitte geben Sie einen Endpunkt ein",
        variant: "destructive",
      });
      return;
    }

    if (endpoints.some(e => e.host === newEndpoint.trim())) {
      toast({
        title: "Error",
        description: "Dieser Endpunkt existiert bereits",
        variant: "destructive",
      });
      return;
    }

    try {
      const newEndpointWithStatus: EndpointWithStatus = {
        host: newEndpoint.trim(),
        status: {
          isOnline: false,
          lastChecked: new Date(),
          apiStatus: false,
          isSecure: false,
          pingStatus: false
        }
      };
      
      const updatedEndpoints = [...endpoints, newEndpointWithStatus];
      updateEndpoints(updatedEndpoints.map(e => e.host));
      setEndpoints(updatedEndpoints);
      setNewEndpoint('');
      toast({
        title: "Success",
        description: "Endpunkt erfolgreich hinzugefügt",
      });
    } catch (error) {
      console.error('Error adding endpoint:', error);
      toast({
        title: "Error",
        description: "Fehler beim Hinzufügen des Endpunkts",
        variant: "destructive",
      });
    }
  };

  const handleRemoveEndpoint = (host: string) => {
    try {
      const updatedEndpoints = endpoints.filter(e => e.host !== host);
      if (updatedEndpoints.length === 0) {
        toast({
          title: "Error",
          description: "Es muss mindestens ein Endpunkt vorhanden sein",
          variant: "destructive",
        });
        return;
      }
      updateEndpoints(updatedEndpoints.map(e => e.host));
      setEndpoints(updatedEndpoints);
      toast({
        title: "Success",
        description: "Endpunkt erfolgreich entfernt",
      });
    } catch (error) {
      console.error('Error removing endpoint:', error);
      toast({
        title: "Error",
        description: "Fehler beim Entfernen des Endpunkts",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'apiEndpoints') {
        const newEndpoints = JSON.parse(e.newValue || '[]');
        setEndpoints(newEndpoints.map((host: string) => ({
          host,
          status: {
            isOnline: false,
            lastChecked: new Date(),
            apiStatus: false,
            isSecure: false,
            pingStatus: false,
            systemMetrics: null
          }
        })));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const checkEndpointHealth = async (endpoint: EndpointWithStatus) => {
      try {
        console.log(`Prüfe Gesundheit von Endpunkt: ${endpoint.host}`);
        const response = await fetch(`https://${endpoint.host}:5000/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });
        
        console.log(`Health-Check Response für ${endpoint.host}:`, response.status);
        
        let data = { 
          status: 'ok', 
          ping: 0,
          metrics: null
        };
        
        try {
          const responseData = await response.json();
          data = { ...data, ...responseData };
        } catch (e) {
          console.log(`Keine JSON-Antwort von ${endpoint.host}, aber Server antwortet`);
        }
        
        return {
          ...endpoint,
          status: {
            isOnline: true,
            lastChecked: new Date(),
            apiStatus: response.status === 200,
            isSecure: true,
            pingStatus: true,
            systemMetrics: data.metrics
          }
        };
      } catch (error) {
        console.error(`Fehler beim Health-Check für ${endpoint.host}:`, error);
        return {
          ...endpoint,
          status: {
            isOnline: false,
            lastChecked: new Date(),
            apiStatus: false,
            isSecure: false,
            pingStatus: false,
            systemMetrics: null
          }
        };
      }
    };

    const updateEndpointStatuses = async () => {
      console.log("Starte Gesundheitsprüfung für alle Endpunkte");
      const updatedEndpoints = await Promise.all(
        endpoints.map(endpoint => checkEndpointHealth(endpoint))
      );
      console.log("Aktualisierte Endpunkt-Status:", updatedEndpoints);
      setEndpoints(updatedEndpoints);
    };

    const interval = setInterval(updateEndpointStatuses, 30000);
    updateEndpointStatuses(); // Initial check

    return () => clearInterval(interval);
  }, [endpoints]);

  const fetchChatRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChatRequests(data || []);
    } catch (error) {
      console.error('Error fetching chat requests:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">Access denied. Admin rights required.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Endpoint</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter endpoint host"
                  value={newEndpoint}
                  onChange={(e) => setNewEndpoint(e.target.value)}
                />
                <Button onClick={handleAddEndpoint}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Endpoint
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Managed Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {endpoints.map((endpoint) => (
                    <div key={endpoint.host} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <p className="font-medium">{endpoint.host}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${endpoint.status.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {endpoint.status.isOnline ? 'Online' : 'Offline'}
                          </span>
                          {endpoint.status.isOnline && (
                            <>
                              <span className={`px-2 py-1 rounded text-xs ${endpoint.status.apiStatus ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                API: {endpoint.status.apiStatus ? 'OK' : 'Warning'}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${endpoint.status.isSecure ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {endpoint.status.isSecure ? 'Secure' : 'Insecure'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleRemoveEndpoint(endpoint.host)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter email address"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
                <Button onClick={handleAddAdmin}>Add Admin</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {adminProfiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded">
                      <span>{profile.email}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAdmin(profile.email)}
                      >
                        Remove Admin
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <p className="font-medium">{profile.email}</p>
                        <p className="text-sm text-gray-500">
                          Joined: {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded ${profile.is_admin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {profile.is_admin ? 'Admin' : 'User'}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {chatRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{request.user_email}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          request.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
