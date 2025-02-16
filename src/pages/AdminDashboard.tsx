import { useEffect, useState } from 'react';
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageCircle, Plus, Minus, Server, CheckCircle, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS, Endpoint, EndpointStatus, updateEndpoints } from "@/config/apiEndpoints";

interface Profile {
  id: string;
  email: string;
  plan: string;
  follower_plan: string;
  is_admin: boolean;
  created_at: string;
  last_sign_in_at?: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface ChatRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  completed_at?: string;
  completed_by?: string;
  profiles?: {
    email: string;
  };
}

interface EndpointWithStatus extends Endpoint {
  host: string;
  status: EndpointStatus;
}

const AVAILABLE_PLANS = [
  "Free",
  "Twitch Starter",
  "Twitch Basic",
  "Twitch Professional",
  "Twitch Expert",
  "Twitch Ultimate"
];

const FOLLOWER_PLANS = [
  "None",
  "Basic Followers",
  "Pro Followers",
  "Ultimate Followers"
];

const AdminDashboard = () => {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminProfiles, setAdminProfiles] = useState<Profile[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointWithStatus[]>(() => {
    return API_ENDPOINTS.map(host => ({
      host,
      status: {
        isOnline: false,
        lastChecked: new Date(),
        apiStatus: false,
        isSecure: false,
        pingStatus: false,
        systemMetrics: null
      }
    }));
  });
  const [newEndpoint, setNewEndpoint] = useState('');

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
        checkAdminStatus();
      })
      .subscribe();

    // Echtzeit-Updates für neue Nachrichten
    const messageChannel = supabase.channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_messages',
        },
        () => {
          if (selectedChat) {
            loadMessages(selectedChat);
          }
        }
      )
      .subscribe();

    // Echtzeit-Updates für Chat-Anfragen
    const chatRequestChannel = supabase.channel('chat-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_requests',
        },
        () => {
          loadChatRequests();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      messageChannel.unsubscribe();
      chatRequestChannel.unsubscribe();
    };
  }, [user, selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  const loadMessages = async (receiverId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('admin_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .or(`sender_id.eq.${receiverId},receiver_id.eq.${receiverId}`)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Fehler beim Laden der Nachrichten');
      return;
    }

    setMessages(data || []);
  };

  const loadChatRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_requests')
      .select(`
        *,
        profiles:user_id (
          email
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Fehler beim Laden der Chat-Anfragen');
      return;
    }

    setChatRequests(data || []);
  };

  const handleAddAdmin = async () => {
    try {
      const { data: userToUpdate } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', newAdminEmail)
        .single();

      if (!userToUpdate) {
        toast.error('Benutzer nicht gefunden');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('email', newAdminEmail);

      if (error) throw error;

      toast.success('Admin erfolgreich hinzugefügt');
      setNewAdminEmail('');
      
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

  const sendMessage = async () => {
    if (!user || !selectedChat || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('admin_messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: selectedChat,
            message: newMessage.trim()
          }
        ]);

      if (error) throw error;

      setNewMessage('');
      await loadMessages(selectedChat);
    } catch (error) {
      toast.error('Fehler beim Senden der Nachricht');
    }
  };

  const handleChatRequest = async (requestId: string, userId: string) => {
    try {
      await supabase
        .from('chat_requests')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user?.id
        })
        .eq('id', requestId);

      setSelectedChat(userId);
      loadChatRequests();
      toast.success('Chat-Anfrage angenommen');
    } catch (error) {
      toast.error('Fehler beim Bearbeiten der Chat-Anfrage');
    }
  };

  const handlePlanChange = async (userId: string, newPlan: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ plan: newPlan })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === userId ? { ...profile, plan: newPlan } : profile
      ));

      toast.success('Plan erfolgreich aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Plans');
    }
  };

  const handleFollowerPlanChange = async (userId: string, newPlan: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ follower_plan: newPlan })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === userId ? { ...profile, follower_plan: newPlan } : profile
      ));

      toast.success('Follower Plan erfolgreich aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Follower Plans');
    }
  };

  const handleAddEndpoint = () => {
    if (!newEndpoint.trim()) {
      toast.error('Bitte geben Sie einen Endpunkt ein');
      return;
    }

    if (endpoints.some(e => e.host === newEndpoint.trim())) {
      toast.error('Dieser Endpunkt existiert bereits');
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
          pingStatus: false,
          systemMetrics: null
        }
      };
      
      const updatedEndpoints = [...endpoints, newEndpointWithStatus];
      setEndpoints(updatedEndpoints);
      // Aktualisiere die API_ENDPOINTS
      updateEndpoints(updatedEndpoints.map(e => e.host));
      setNewEndpoint('');
      toast.success('Endpunkt erfolgreich hinzugefügt');
    } catch (error) {
      toast.error('Fehler beim Hinzufügen des Endpunkts');
    }
  };

  const handleRemoveEndpoint = (host: string) => {
    try {
      const updatedEndpoints = endpoints.filter(e => e.host !== host);
      if (updatedEndpoints.length === 0) {
        toast.error('Es muss mindestens ein Endpunkt vorhanden sein');
        return;
      }
      setEndpoints(updatedEndpoints);
      // Aktualisiere die API_ENDPOINTS
      updateEndpoints(updatedEndpoints.map(e => e.host));
      toast.success('Endpunkt erfolgreich entfernt');
    } catch (error) {
      toast.error('Fehler beim Entfernen des Endpunkts');
    }
  };

  useEffect(() => {
    const checkEndpointHealth = async (endpoint: EndpointWithStatus) => {
      try {
        const checkPing = async () => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            console.log(`Checking ping for ${endpoint.host}:5000...`);
            
            // Zuerst HTTPS versuchen
            try {
              const response = await fetch(`https://${endpoint.host}:5000/status`, {
                method: 'HEAD',
                mode: 'no-cors',
                signal: controller.signal,
                credentials: 'omit'
              });
              clearTimeout(timeoutId);
              console.log(`HTTPS ping successful for ${endpoint.host}:5000`);
              return true;
            } catch (error) {
              clearTimeout(timeoutId);
              console.log(`HTTPS ping failed for ${endpoint.host}:5000, trying HTTP...`);
              
              const httpController = new AbortController();
              const httpTimeoutId = setTimeout(() => httpController.abort(), 2000);
              
              try {
                await fetch(`http://${endpoint.host}:5000/status`, {
                  method: 'HEAD',
                  mode: 'no-cors',
                  signal: httpController.signal,
                  credentials: 'omit'
                });
                clearTimeout(httpTimeoutId);
                console.log(`HTTP ping successful for ${endpoint.host}:5000`);
                return true;
              } catch (httpError) {
                clearTimeout(httpTimeoutId);
                console.log(`HTTP ping failed for ${endpoint.host}:5000`, httpError);
                return false;
              }
            }
          } catch (error) {
            console.error(`Error during ping check for ${endpoint.host}:5000:`, error);
            return false;
          }
        };

        const pingResult = await checkPing();
        console.log(`Ping result for ${endpoint.host}:`, pingResult);
        
        // Systemmetriken abrufen, wenn der Server erreichbar ist
        let systemMetrics = null;
        if (pingResult) {
          try {
            const metricsResponse = await fetch(`https://${endpoint.host}:5000/metrics`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            if (metricsResponse.ok) {
              systemMetrics = await metricsResponse.json();
            }
          } catch (error) {
            console.error(`Failed to fetch metrics for ${endpoint.host}:5000:`, error);
          }
        }
        
        return {
          ...endpoint,
          status: {
            isOnline: pingResult,
            lastChecked: new Date(),
            apiStatus: pingResult,
            isSecure: true,
            pingStatus: pingResult,
            systemMetrics
          }
        };
      } catch (error) {
        console.error(`Error checking endpoint ${endpoint.host}:`, error);
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
      console.log("Aktuelle Endpunkte vor Update:", endpoints);
      const updatedEndpoints = await Promise.all(
        endpoints.map(async endpoint => checkEndpointHealth(endpoint))
      );
      console.log("Aktualisierte Endpunkte:", updatedEndpoints);
      setEndpoints(updatedEndpoints);
    };

    updateEndpointStatuses();
    const intervalId = setInterval(updateEndpointStatuses, 30000);

    return () => clearInterval(intervalId);
  }, []);

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
            <CardTitle>API Endpunkte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Neuer Endpunkt (z.B. example.server.de)"
                  value={newEndpoint}
                  onChange={(e) => setNewEndpoint(e.target.value)}
                />
                <Button onClick={handleAddEndpoint}>
                  <Plus className="w-4 h-4 mr-2" />
                  Hinzufügen
                </Button>
              </div>
              
              <div className="space-y-2">
                {endpoints.map((endpoint) => (
                  <div
                    key={endpoint.host}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      <span>{endpoint.host}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <div className="flex items-center gap-1">
                          {endpoint.status.apiStatus ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-xs ${endpoint.status.apiStatus ? 'text-green-500' : 'text-red-500'}`}>
                            Ping {endpoint.status.apiStatus ? 'OK' : 'Error'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {endpoint.status.apiStatus ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-green-500">API OK</span>
                              {!endpoint.status.isSecure && (
                                <span className="text-xs text-yellow-500">(Unsicher)</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-red-500">API Error</span>
                          )}
                        </div>

                        {endpoint.status.systemMetrics && (
                          <div className="flex items-center gap-4 ml-4">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">CPU:</span>
                              <span className={`text-xs ${
                                endpoint.status.systemMetrics.cpu > 80 
                                  ? 'text-red-500' 
                                  : endpoint.status.systemMetrics.cpu > 60 
                                  ? 'text-yellow-500' 
                                  : 'text-green-500'
                              }`}>
                                {endpoint.status.systemMetrics.cpu.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium">RAM:</span>
                              <span className={`text-xs ${
                                (endpoint.status.systemMetrics.memory.used / endpoint.status.systemMetrics.memory.total) * 100 > 80
                                  ? 'text-red-500'
                                  : (endpoint.status.systemMetrics.memory.used / endpoint.status.systemMetrics.memory.total) * 100 > 60
                                  ? 'text-yellow-500'
                                  : 'text-green-500'
                              }`}>
                                {((endpoint.status.systemMetrics.memory.used / endpoint.status.systemMetrics.memory.total) * 100).toFixed(1)}%
                              </span>
                              <span className="text-xs text-gray-500">
                                ({(endpoint.status.systemMetrics.memory.used / 1024).toFixed(1)} GB / {(endpoint.status.systemMetrics.memory.total / 1024).toFixed(1)} GB)
                              </span>
                            </div>
                          </div>
                        )}

                        <span className="text-xs text-gray-500">
                          Zuletzt geprüft: {endpoint.status.lastChecked.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveEndpoint(endpoint.host)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="md:col-span-1">
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
                      <th className="text-left p-2">Aktionen</th>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedChat(profile.id)}
                            disabled={profile.id === user?.id}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Chat
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>
                {selectedChat 
                  ? `Chat mit ${adminProfiles.find(p => p.id === selectedChat)?.email}`
                  : 'Chat'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedChat ? (
                <div className="flex flex-col h-[400px]">
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">
                            {message.message}
                          </p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nachricht eingeben..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage();
                        }
                      }}
                    />
                    <Button onClick={sendMessage}>Senden</Button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Wählen Sie einen Admin aus der Liste aus, um einen Chat zu starten
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chat-Anfragen</CardTitle>
          </CardHeader>
          <CardContent>
            {chatRequests.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Keine offenen Chat-Anfragen
              </p>
            ) : (
              <div className="space-y-4">
                {chatRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {request.profiles?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button onClick={() => handleChatRequest(request.id, request.user_id)}>
                      Chat öffnen
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benutzerübersicht und Plan-Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Stream Plan</th>
                    <th className="text-left p-2">Follower Plan</th>
                    <th className="text-left p-2">Admin Status</th>
                    <th className="text-left p-2">Erstellt am</th>
                    <th className="text-left p-2">Letzter Login</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="border-b">
                      <td className="p-2">{profile.email}</td>
                      <td className="p-2">
                        <Select
                          value={profile.plan}
                          onValueChange={(value) => handlePlanChange(profile.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Wähle einen Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_PLANS.map((plan) => (
                              <SelectItem key={plan} value={plan}>
                                {plan}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Select
                          value={profile.follower_plan}
                          onValueChange={(value) => handleFollowerPlanChange(profile.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Wähle einen Follower Plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {FOLLOWER_PLANS.map((plan) => (
                              <SelectItem key={plan} value={plan}>
                                {plan}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
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
                      <td className="p-2">
                        {profile.last_sign_in_at 
                          ? new Date(profile.last_sign_in_at).toLocaleDateString()
                          : 'Nie'}
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
