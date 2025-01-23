import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis } from "recharts";

interface ViewerAnalyticsProps {
  chartData: Array<{ time: string; viewers: number }>;
  onAddViewers: (count: number) => void;
  onAddChatters: (count: number) => void;
}

const ViewerAnalytics = ({ chartData, onAddViewers, onAddChatters }: ViewerAnalyticsProps) => (
  <Card className="glass-morphism">
    <CardHeader>
      <CardTitle className="text-xl font-semibold">Viewer Analytics</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="h-[240px]">
        <ChartContainer
          config={{
            viewers: {
              label: "Viewers",
              theme: {
                light: "#8B5CF6",
                dark: "#8B5CF6",
              },
            },
          }}
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="viewerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="viewers"
              stroke="#8B5CF6"
              fillOpacity={1}
              fill="url(#viewerGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Viewer Bot Controls</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onAddViewers(1)} variant="outline">+1 Viewer</Button>
            <Button onClick={() => onAddViewers(3)} variant="outline">+3 Viewers</Button>
            <Button onClick={() => onAddViewers(5)} variant="outline">+5 Viewers</Button>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Chatter Bot Controls</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onAddChatters(1)} variant="outline">+1 Chatter</Button>
            <Button onClick={() => onAddChatters(3)} variant="outline">+3 Chatters</Button>
            <Button onClick={() => onAddChatters(5)} variant="outline">+5 Chatters</Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ViewerAnalytics;