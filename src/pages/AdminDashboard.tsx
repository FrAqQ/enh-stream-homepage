
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Server } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { API_ENDPOINTS, updateEndpoints, type Endpoint, type EndpointStatus } from "@/config/apiEndpoints"

interface ServerStats {
  cpuUsage: number
  ramUsage: number
}

const AdminDashboard = () => {
  const [serverStats, setServerStats] = useState<ServerStats>({
    cpuUsage: 0,
    ramUsage: 0,
  })
  const [endpoints, setEndpoints] = useState<Endpoint[]>(API_ENDPOINTS)
  const [newEndpoint, setNewEndpoint] = useState<Omit<Endpoint, 'status'>>({
    host: "",
    url: "",
    description: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchServerStats()
    const intervalId = setInterval(fetchServerStats, 5000)

    return () => clearInterval(intervalId)
  }, [])

  const fetchServerStats = async () => {
    try {
      const response = await fetch("/api/serverStats")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setServerStats(data)
    } catch (error: any) {
      console.error("Failed to fetch server stats:", error)
      toast({
        title: "Error",
        description: `Failed to fetch server stats: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleEndpointChange = (
    index: number,
    field: keyof Omit<Endpoint, 'status'>,
    value: string
  ) => {
    const newEndpoints = [...endpoints]
    newEndpoints[index][field] = value
    setEndpoints(newEndpoints)
  }

  const handleAddEndpoint = () => {
    if (!newEndpoint.url || !newEndpoint.host || !newEndpoint.description) {
      toast({
        title: "Error",
        description: "Host, URL and Description cannot be empty",
        variant: "destructive",
      })
      return
    }

    const newEndpointWithStatus: Endpoint = {
      ...newEndpoint,
      status: {
        isOnline: true,
        lastChecked: new Date(),
        apiStatus: true,
        isSecure: true,
        pingStatus: true
      }
    }

    setEndpoints([...endpoints, newEndpointWithStatus])
    setNewEndpoint({ host: "", url: "", description: "" })
  }

  const handleRemoveEndpoint = (index: number) => {
    const newEndpoints = [...endpoints]
    newEndpoints.splice(index, 1)
    setEndpoints(newEndpoints)
  }

  const handleSaveEndpoints = async () => {
    setIsLoading(true)
    try {
      await updateEndpoints(endpoints)
      toast({
        title: "Success",
        description: "Endpoints saved successfully!",
      })
    } catch (error: any) {
      console.error("Failed to save endpoints:", error)
      toast({
        title: "Error",
        description: `Failed to save endpoints: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 pt-20">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid gap-6">
        {/* Server Monitoring Card */}
        <Card>
          <CardHeader>
            <CardTitle>Server Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {endpoints.map((endpoint) => (
                <Card key={endpoint.host} className="bg-secondary/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      {endpoint.host}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Status Indicator */}
                      <div className="flex items-center gap-2">
                        {endpoint.status.apiStatus ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${endpoint.status.apiStatus ? 'text-green-500' : 'text-red-500'}`}>
                          {endpoint.status.apiStatus ? 'Online' : 'Offline'}
                        </span>
                      </div>

                      {/* CPU Usage */}
                      {endpoint.status.systemMetrics && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">CPU Usage</span>
                            <span className={`text-sm ${
                              endpoint.status.systemMetrics.cpu > 80 
                                ? 'text-red-500' 
                                : endpoint.status.systemMetrics.cpu > 60 
                                ? 'text-yellow-500' 
                                : 'text-green-500'
                            }`}>
                              {endpoint.status.systemMetrics.cpu.toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={endpoint.status.systemMetrics.cpu} 
                            className={`h-2 ${
                              endpoint.status.systemMetrics.cpu > 80 
                                ? 'bg-red-200' 
                                : endpoint.status.systemMetrics.cpu > 60 
                                ? 'bg-yellow-200' 
                                : 'bg-green-200'
                            }`}
                          />
                        </div>
                      )}

                      {/* RAM Usage */}
                      {endpoint.status.systemMetrics && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">RAM Usage</span>
                            <span className={`text-sm ${
                              (endpoint.status.systemMetrics.memory.used / endpoint.status.systemMetrics.memory.total) * 100 > 80
                                ? 'text-red-500'
                                : (endpoint.status.systemMetrics.memory.used / endpoint.status.systemMetrics.memory.total) * 100 > 60
                                ? 'text-yellow-500'
                                : 'text-green-500'
                            }`}>
                              {((endpoint.status.systemMetrics.memory.used / endpoint.status.systemMetrics.memory.total) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={(endpoint.status.systemMetrics.memory.used / endpoint.status.systemMetrics.memory.total) * 100}
                            className={`h-2 ${
                              (endpoint.status.systemMetrics.memory.used / endpoint.status.systemMetrics.memory.total) * 100 > 80
                                ? 'bg-red-200'
                                : (endpoint.status.systemMetrics.memory.used / endpoint.status.systemMetrics.memory.total) * 100 > 60
                                ? 'bg-yellow-200'
                                : 'bg-green-200'
                            }`}
                          />
                          <div className="text-xs text-muted-foreground">
                            {(endpoint.status.systemMetrics.memory.used / 1024).toFixed(1)} GB / {(endpoint.status.systemMetrics.memory.total / 1024).toFixed(1)} GB
                          </div>
                        </div>
                      )}

                      {/* Last Checked Time */}
                      <div className="text-xs text-muted-foreground mt-2">
                        Zuletzt aktualisiert: {new Date(endpoint.status.lastChecked).toLocaleTimeString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 border rounded-md p-2"
                >
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Host"
                      value={endpoint.host}
                      onChange={(e) =>
                        handleEndpointChange(index, "host", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="URL"
                      value={endpoint.url}
                      onChange={(e) =>
                        handleEndpointChange(index, "url", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Description"
                      value={endpoint.description}
                      onChange={(e) =>
                        handleEndpointChange(index, "description", e.target.value)
                      }
                    />
                  </div>
                  {endpoint.status.apiStatus ? (
                    <CheckCircle className="text-green-500 h-5 w-5" />
                  ) : (
                    <XCircle className="text-red-500 h-5 w-5" />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveEndpoint(index)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Add New Endpoint Form */}
              <div className="flex items-center space-x-2 border rounded-md p-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="New Host"
                    value={newEndpoint.host}
                    onChange={(e) =>
                      setNewEndpoint({ ...newEndpoint, host: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="New URL"
                    value={newEndpoint.url}
                    onChange={(e) =>
                      setNewEndpoint({ ...newEndpoint, url: e.target.value })
                    }
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="New Description"
                    value={newEndpoint.description}
                    onChange={(e) =>
                      setNewEndpoint({
                        ...newEndpoint,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <Button variant="secondary" onClick={handleAddEndpoint}>
                  Add Endpoint
                </Button>
              </div>

              {/* Save Button */}
              <Button
                className="w-full"
                onClick={handleSaveEndpoints}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Endpoints"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
