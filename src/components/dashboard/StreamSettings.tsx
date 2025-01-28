import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings2 } from "lucide-react"

interface UserData {
  username: string;
  plan: string;
  followerPlan: string;
  subscriptionStatus: string;
  email: string; // Added email as it's being used
}

interface StreamSettingsProps {
  streamUrl: string;
  setStreamUrl: (url: string) => void;
  handleSaveUrl: () => void;
  userData: UserData;
}

export function StreamSettings({ streamUrl, setStreamUrl, handleSaveUrl, userData }: StreamSettingsProps) {
  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Stream Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="stream-url" className="text-sm font-medium">
              Stream URL
            </label>
            <Input
              id="stream-url"
              placeholder="Enter your Twitch stream URL"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveUrl} className="w-full">
            Save Settings
          </Button>
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Account Information</h3>
            <div className="space-y-1 text-sm">
              <p>Username: {userData.username}</p>
              <p>Current Plan: {userData.plan}</p>
              <p>Subscription Status: {userData.subscriptionStatus}</p>
              <p>Follower Plan: {userData.followerPlan}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}