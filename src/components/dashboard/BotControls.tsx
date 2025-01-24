import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BotControlsProps {
  title: string
  onAdd: (count: number) => void
  type: "viewer" | "chatter"
}

export function BotControls({ title, onAdd, type }: BotControlsProps) {
  return (
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onAdd(1)} variant="outline">+1 {type}</Button>
            <Button onClick={() => onAdd(3)} variant="outline">+3 {type}s</Button>
            <Button onClick={() => onAdd(5)} variant="outline">+5 {type}s</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}