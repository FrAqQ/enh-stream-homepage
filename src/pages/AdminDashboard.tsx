
import { useEffect, useState } from 'react';
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Cpu, HardDrive, MessageCircle, Plus, Minus, Server } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS, Endpoint, EndpointStatus, updateEndpoints } from "@/config/apiEndpoints";

const AdminDashboard = () => {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEndpoint, setNewEndpoint] = useState('');
  const [endpoints, setEndpoints] = useState<Endpoint[]>(() => {
    return API_ENDPOINTS.map(host => ({
      host,
      status: {
        isOnline: false,
        lastChecked: new Date(),
        apiStatus: false,
        isSecure: false,
        pingStatus: false,
        systemMetrics: {
          cpu: 0,
          memory: {
            total: 0,
            used: 0,
            free: 0
          }
        }
      }
    }));
  });

  useEffect(() => {
    const checkEndpointHealth = async (endpoint: Endpoint) => {
      try {
        const checkPing = async () => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            console.log(`Checking ping for ${endpoint.host}:5000...`);
            
            try {
              const response = await fetch(`https://${endpoint.host}:5000/status`, {
                method: 'GET',
                mode: 'no-cors',
                signal: controller.signal,
                credentials: 'omit'
              });
              clearTimeout(timeoutId);
              console.log(`HTTPS ping successful for ${endpoint.host}:5000`);
              return true;
            } catch (error) {
              clearTimeout(timeoutId);
              console.log(`HTTPS ping failed for ${endpoint.host}:5000`, error);
              return false;
            }
          } catch (error) {
            console.error(`Error during ping check for ${endpoint.host}:5000:`, error);
            return false;
          }
        };

        const pingResult = await checkPing();
        
        let systemMetrics = endpoint.status.systemMetrics;
        if (pingResult) {
          try {
            const metricsResponse = await fetch(`https://${endpoint.host}:5000/metrics`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'omit'
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
        return endpoint;
      }
    };

    const updateEndpointStatuses = async () => {
      try {
        const updatedEndpoints = await Promise.all(
          endpoints.map(endpoint => checkEndpointHealth(endpoint))
        );
        setEndpoints(updatedEndpoints);
      } catch (error) {
        console.error('Error updating endpoint statuses:', error);
      }
    };

    updateEndpointStatuses();
    const intervalId = setInterval(updateEndpointStatuses, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      setIsAdmin(profile?.is_admin || false);
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

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
      const newEndpointObj: Endpoint = {
        host: newEndpoint.trim(),
        status: {
          isOnline: false,
          lastChecked: new Date(),
          apiStatus: false,
          isSecure: false,
          pingStatus: false,
          systemMetrics: {
            cpu: 0,
            memory: {
              total: 0,
              used: 0,
              free: 0
            }
          }
        }
      };
      
      const updatedEndpoints = [...endpoints, newEndpointObj];
      setEndpoints(updatedEndpoints);
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
      updateEndpoints(updatedEndpoints.map(e => e.host));
      toast.success('Endpunkt erfolgreich entfernt');
    } catch (error) {
      toast.error('Fehler beim Entfernen des Endpunkts');
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
        {/* Monitoring Card */}
        <Card>
          <CardHeader>
            <CardTitle>Server Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {endpoints.map((endpoint) => (
                <div key={endpoint.host} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Server className="w-5 h-5" />
                      <span className="font-medium">{endpoint.host}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      endpoint.status.isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {endpoint.status.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  {/* CPU Usage */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-4 h-4" />
                        <span className="text-sm">CPU</span>
                      </div>
                      <span className="text-sm font-medium">
                        {endpoint.status.systemMetrics.cpu.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={endpoint.status.systemMetrics.cpu} 
                      className="h-2"
                    />
                  </div>

                  {/* RAM Usage */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="w-4 h-4" />
                        <span className="text-sm">RAM</span>
                      </div>
                      <span className="text-sm font-medium">
                        {((endpoint.status.systemMetrics.memory.used / endpoint.status.systemMetrics.memory.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(endpoint.status.systemMetrics.memory.used / endpoint.status.systemMetrics.memory.total) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      {(endpoint.status.systemMetrics.memory.used / 1024).toFixed(1)} GB / 
                      {(endpoint.status.systemMetrics.memory.total / 1024).toFixed(1)} GB
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    Zuletzt aktualisiert: {new Date(endpoint.status.lastChecked).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints Management Card */}
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
      </div>
    </div>
  );
};

export default AdminDashboard;
