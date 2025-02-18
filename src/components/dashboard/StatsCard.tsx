
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  icon: LucideIcon
  subtitle?: string
  limit?: number
  showLimit?: boolean
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  subtitle, 
  limit, 
  showLimit = false 
}: StatsCardProps) {
  return (
    <Card className="glass-morphism">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}{showLimit && limit !== undefined && `/${limit}`}
        </div>
        {change && <p className="text-xs text-muted-foreground">{change}</p>}
      </CardContent>
    </Card>
  )
}
