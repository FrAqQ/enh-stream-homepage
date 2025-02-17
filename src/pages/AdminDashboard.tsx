
import { useEffect, useState } from 'react';
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageCircle, Plus, Minus, Server, CheckCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS, EndpointStatus, updateEndpoints } from "@/config/apiEndpoints";

interface EndpointWithStatus {
  host: string;
  status: EndpointStatus;
}

const AdminDashboard = () => {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEndpoint, setNewEndpoint] = useState('');
  const [endpoints, setEndpoints] = useState<EndpointWithStatus[]>(() => {
    return API_ENDPOINTS.map(host => ({
      host: typeof host === 'string' ? host : host.host,
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
    const checkEndpointHealth = async (endpoint: EndpointWithStatus) => {
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
        console.log(`Ping result for ${endpoint.host}:`, pingResult);
        
        let systemMetrics = null;
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
            systemMetrics: systemMetrics || {
              cpu: 0,
              memory: {
                total: 0,
                used: 0,
                free: 0
              }
            }
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
      }
    };

    const updateEndpointStatuses = async () => {
      const updatedEndpoints = await Promise.all(
        endpoints.map(async endpoint => await checkEndpointHealth(endpoint))
      );
      setEndpoints(updatedEndpoints);
    };

    updateEndpointStatuses();
    const intervalId = setInterval(updateEndpointStatuses, 30000);

    return () => clearInterval(intervalId);
  }, [endpoints]);

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
      const newEndpointWithStatus: EndpointWithStatus = {
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
      
      const updatedEndpoints = [...endpoints, newEndpointWithStatus];
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
        {/* API Endpoints Card */}
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
