
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LucideIcon } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"

interface ProgressCardProps {
  title: string
  icon: LucideIcon
  current: number
  total: number
  timeLabels: string[]
}

export function ProgressCard({ title: originalTitle, icon: Icon, current, total, timeLabels }: ProgressCardProps) {
  const { language } = useLanguage()
  const progress = (current / total) * 100

  const getLocalizedTitle = (title: string) => {
    const titles: { [key: string]: { [key: string]: string } } = {
      "Daily Follower Progress": {
        en: "Daily Follower Progress",
        de: "Täglicher Follower-Fortschritt"
      },
      "Monthly Follower Progress": {
        en: "Monthly Follower Progress",
        de: "Monatlicher Follower-Fortschritt"
      }
    }
    return titles[title]?.[language] || title
  }

  const getLocalizedText = () => {
    if (language === 'de') {
      return "Follower"
    }
    return "Followers"
  }

  const title = getLocalizedTitle(originalTitle)

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{title}</span>
            <span className="text-sm font-medium">{current}/{total} {getLocalizedText()}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {timeLabels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
