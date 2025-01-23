import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon } from "lucide-react";

interface StreamPreviewProps {
  streamUrl: string;
  onStreamUrlChange: (url: string) => void;
  onSaveUrl: () => void;
  userData: {
    username: string;
    plan: string;
  };
}

export const StreamPreview = ({
  streamUrl,
  onStreamUrlChange,
  onSaveUrl,
  userData,
}: StreamPreviewProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="glass-morphism">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Stream Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full max-w-2xl mx-auto bg-black/20 rounded-lg overflow-hidden">
            {streamUrl ? (
              <iframe
                src={streamUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No stream URL configured
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                  onChange={(e) => onStreamUrlChange(e.target.value)}
                  className="bg-background/50"
                />
                <Button onClick={onSaveUrl}>Save</Button>
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
    </div>
  );
};