
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/LanguageContext"

interface StreamSettingsProps {
  streamUrl: string
  setStreamUrl: (url: string) => void
  handleSaveUrl: () => void
  userData: {
    email: string
    plan: string
    followerPlan: string
    subscriptionStatus: string
  }
}

export function StreamSettings({
  streamUrl,
  setStreamUrl,
  handleSaveUrl,
  userData
}: StreamSettingsProps) {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Stream Settings",
      urlPlaceholder: "Enter your Twitch stream URL",
      saveButton: "Save URL",
      username: "Email:",
      plan: "Stream Plan:",
      followerPlan: "Follower Plan:",
    },
    de: {
      title: "Stream-Einstellungen",
      urlPlaceholder: "Gib deine Twitch-Stream-URL ein",
      saveButton: "URL speichern",
      username: "E-Mail:",
      plan: "Stream-Plan:",
      followerPlan: "Follower-Plan:",
    }
  };

  const t = translations[language];

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col space-y-2">
          <Input
            type="url"
            placeholder={t.urlPlaceholder}
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            className="bg-background/50"
          />
          <Button onClick={handleSaveUrl} className="w-full">
            {t.saveButton}
          </Button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.username}</span>
            <span className="font-medium">{userData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.plan}</span>
            <span className="font-medium">{userData.plan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t.followerPlan}</span>
            <span className="font-medium">{userData.followerPlan}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
