import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StreamPreviewProps {
  streamUrl: string;
  setStreamUrl: (url: string) => void;
  handleSaveUrl: () => void;
  userData: {
    username: string;
    plan: string;
  };
}

const StreamPreview = ({ streamUrl, setStreamUrl, handleSaveUrl, userData }: StreamPreviewProps) => (
  <Card className="glass-morphism">
    <CardHeader>
      <CardTitle className="text-xl font-semibold flex items-center gap-2">
        <LinkIcon className="h-5 w-5" />
        Stream Settings
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Stream URL</label>
          <div className="flex gap-2">
            <Input 
              placeholder="Enter stream URL" 
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="bg-background/50"
            />
            <Button onClick={handleSaveUrl}>Save</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Username</label>
            <p className="text-sm text-muted-foreground">{userData.username}</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Plan</label>
            <p className="text-sm text-muted-foreground">{userData.plan}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default StreamPreview;