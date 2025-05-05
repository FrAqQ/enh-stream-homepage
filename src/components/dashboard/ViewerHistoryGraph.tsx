
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";
import { OnboardingTooltip } from "@/components/ui/onboarding-tooltip";

interface ViewerHistoryProps {
  viewerData: {
    time: string;
    botViewers: number;
    actualViewers: number;
    total: number;
  }[];
}

const ViewerHistoryGraph = ({ viewerData }: ViewerHistoryProps) => {
  return (
    <OnboardingTooltip
      id="viewer-history-graph"
      content={{
        en: "This graph shows your viewer history over time, including both natural viewers and enhanced viewers.",
        de: "Diese Grafik zeigt die Entwicklung deiner Zuschauerzahlen über Zeit, einschließlich natürlicher und verstärkter Zuschauer."
      }}
      position="top"
    >
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Viewer History (24h)
          </CardTitle>
          <CardDescription>
            Track your stream's viewer activity over the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={viewerData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="actualViewers" 
                  stroke="#8884d8" 
                  name="Natural Viewers" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="botViewers" 
                  stroke="#82ca9d" 
                  name="Enhanced Viewers" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#ff7300" 
                  name="Total Viewers" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </OnboardingTooltip>
  );
};

export default ViewerHistoryGraph;
