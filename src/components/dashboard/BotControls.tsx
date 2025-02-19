
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface BotControlsProps {
  title: string
  onAdd: (count: number) => void
  onRemove: (count: number) => void  // Hinzugefügt
  type: "viewer" | "chatter"
  streamUrl: string
  maxCount?: number
  currentCount?: number
}

export function BotControls({ 
  title, 
  onAdd, 
  onRemove, 
  type, 
  streamUrl,
  maxCount,
  currentCount = 0
}: BotControlsProps) {
  const [count, setCount] = useState(1)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = async () => {
    if (!streamUrl) {
      toast({
        title: "Error",
        description: "Please set a stream URL first",
        variant: "destructive"
      })
      return
    }

    if (maxCount && currentCount + count > maxCount) {
      toast({
        title: "Error",
        description: `Cannot add more ${type}s. Maximum limit of ${maxCount} would be exceeded.`,
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const endpoint = type === "viewer" ? "/add_viewer" : "/add_chatter"
      const response = await fetch(`https://v2202502252999313946.bestsrv.de:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          twitch_url: streamUrl,
          viewer_count: count
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      onAdd(count)
      toast({
        title: "Success",
        description: `${type === "viewer" ? "Viewers" : "Chatters"} wurden hinzugefügt`,
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: `Failed to add ${type}s`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!streamUrl) {
      toast({
        title: "Error",
        description: "Please set a stream URL first",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const endpoint = type === "viewer" ? "/remove_viewer" : "/remove_chatter"
      const response = await fetch(`https://v2202502252999313946.bestsrv.de:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          twitch_url: streamUrl,
          viewer_count: count
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      onRemove(count)
      toast({
        title: "Success",
        description: `${type === "viewer" ? "Viewers" : "Chatters"} wurden entfernt`,
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: `Failed to remove ${type}s`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title}
          {maxCount && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({currentCount}/{maxCount})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Input
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24"
          />
          <Button 
            onClick={handleAdd}
            disabled={isLoading || (maxCount ? currentCount >= maxCount : false)}
          >
            Add
          </Button>
          <Button 
            onClick={handleRemove}
            disabled={isLoading}
            variant="destructive"
          >
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
