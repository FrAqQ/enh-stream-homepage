import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "lucide-react"

interface StreamSettingsProps {
  streamUrl: string
  setStreamUrl: (url: string) => void
  handleSaveUrl: () => void
  userData: {
    username: string
    plan: string
    followerPlan: string
  }
}

export function StreamSettings({ streamUrl, setStreamUrl, handleSaveUrl, userData }: StreamSettingsProps) {
  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Link className="h-5 w-5" />
          Stream Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Stream URL</label>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter Twitch channel name or URL" 
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="bg-background/50"
              />
              <Button onClick={handleSaveUrl}>Save</Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Username</label>
              <p className="text-sm text-muted-foreground">{userData.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Plan</label>
              <p className="text-sm text-muted-foreground">{userData.plan}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Follower Plan</label>
              <p className="text-sm text-muted-foreground">{userData.followerPlan}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}