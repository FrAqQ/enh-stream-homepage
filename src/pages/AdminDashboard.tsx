import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Server } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { API_ENDPOINTS, updateEndpoints, type Endpoint } from "@/config/apiEndpoints"

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
  const [newEndpoint, setNewEndpoint] = useState({ url: "", description: "" })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchServerStats()
    const intervalId = setInterval(fetchServerStats, 5000) // alle 5 Sekunden aktualisieren

    return () => clearInterval(intervalId) // Aufräumen bei Unmount
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
    field: "url" | "description",
    value: string
  ) => {
    const newEndpoints = [...endpoints]
    newEndpoints[index][field] = value
    setEndpoints(newEndpoints)
  }

  const handleAddEndpoint = () => {
    if (!newEndpoint.url || !newEndpoint.description) {
      toast({
        title: "Error",
        description: "URL and Description cannot be empty",
        variant: "destructive",
      })
      return
    }

    setEndpoints([...endpoints, { ...newEndpoint, status: "online" }])
    setNewEndpoint({ url: "", description: "" }) // Reset the new endpoint form
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
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Server Status Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Server className="h-5 w-5" />
            Server Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* CPU Usage */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">
                  {serverStats.cpuUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={serverStats.cpuUsage} />
            </div>

            {/* RAM Usage */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">RAM Usage</span>
                <span className="text-sm text-muted-foreground">
                  {serverStats.ramUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={serverStats.ramUsage} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">API Endpoints Management</CardTitle>
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
                {endpoint.status === "online" ? (
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
  )
}

export default AdminDashboard
