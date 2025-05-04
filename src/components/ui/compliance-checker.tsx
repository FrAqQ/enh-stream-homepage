
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { securityService } from "@/lib/securityService";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/LanguageContext";
import { ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";

export function ComplianceChecker() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [viewerCount, setViewerCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [complianceResult, setComplianceResult] = useState<{
    compliant: boolean;
    risk: 'low' | 'medium' | 'high';
    recommendations: string[];
  } | null>(null);

  const handleCheckCompliance = () => {
    if (!viewerCount || !followerCount) {
      toast({
        title: language === 'en' ? "Missing values" : "Fehlende Werte",
        description: language === 'en' 
          ? "Please enter both viewer count and follower count" 
          : "Bitte geben Sie sowohl die Zuschauerzahl als auch die Followerzahl ein",
        variant: "destructive"
      });
      return;
    }

    const result = securityService.checkPlatformCompliance(viewerCount, followerCount);
    setComplianceResult(result);

    // Show toast based on result
    if (result.risk === 'high') {
      toast({
        title: language === 'en' ? "High risk detected" : "Hohes Risiko erkannt",
        description: language === 'en' 
          ? "Your current viewer configuration poses a high risk" 
          : "Ihre aktuelle Zuschauerkonfiguration stellt ein hohes Risiko dar",
        variant: "destructive"
      });
    } else if (result.risk === 'medium') {
      toast({
        title: language === 'en' ? "Medium risk detected" : "Mittleres Risiko erkannt",
        description: language === 'en' 
          ? "Consider adjusting your viewer configuration" 
          : "Erwägen Sie, Ihre Zuschauerkonfiguration anzupassen",
        variant: "warning"
      });
    } else {
      toast({
        title: language === 'en' ? "Low risk detected" : "Geringes Risiko erkannt",
        description: language === 'en' 
          ? "Your configuration appears to be safe" 
          : "Ihre Konfiguration scheint sicher zu sein"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">
          {language === 'en' ? "Platform Compliance Checker" : "Plattform-Compliance-Prüfer"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {language === 'en' 
            ? "Check if your viewer setup complies with platform guidelines" 
            : "Überprüfen Sie, ob Ihre Zuschauereinrichtung den Plattformrichtlinien entspricht"}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="viewerCount">
              {language === 'en' ? "Bot Viewer Count" : "Bot-Zuschauerzahl"}
            </Label>
            <Input 
              id="viewerCount"
              type="number" 
              value={viewerCount || ''}
              onChange={(e) => setViewerCount(parseInt(e.target.value) || 0)}
              placeholder={language === 'en' ? "Enter number of bots" : "Anzahl der Bots eingeben"}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="followerCount">
              {language === 'en' ? "Channel Follower Count" : "Kanal-Follower-Anzahl"}
            </Label>
            <Input 
              id="followerCount"
              type="number" 
              value={followerCount || ''}
              onChange={(e) => setFollowerCount(parseInt(e.target.value) || 0)}
              placeholder={language === 'en' ? "Enter follower count" : "Followerzahl eingeben"}
            />
          </div>
        </div>

        <Button onClick={handleCheckCompliance}>
          {language === 'en' ? "Check Compliance" : "Compliance prüfen"}
        </Button>

        {complianceResult && (
          <Alert variant={
            complianceResult.risk === 'high' ? "destructive" : 
            complianceResult.risk === 'medium' ? "warning" : 
            "default"
          }>
            {complianceResult.risk === 'low' && <ShieldCheck className="h-4 w-4" />}
            {complianceResult.risk === 'medium' && <AlertTriangle className="h-4 w-4" />}
            {complianceResult.risk === 'high' && <AlertOctagon className="h-4 w-4" />}
            
            <AlertTitle>
              {language === 'en' ? (
                complianceResult.compliant 
                  ? "Your setup is within guidelines" 
                  : "Warning: Non-compliant setup"
              ) : (
                complianceResult.compliant
                  ? "Ihre Einrichtung entspricht den Richtlinien"
                  : "Warnung: Nicht konforme Einrichtung"
              )}
            </AlertTitle>
            
            <AlertDescription className="mt-2">
              <div className="mb-2">
                {language === 'en' ? (
                  `Risk Level: ${complianceResult.risk === 'low' ? 'Low' : 
                    complianceResult.risk === 'medium' ? 'Medium' : 'High'}`
                ) : (
                  `Risikoniveau: ${complianceResult.risk === 'low' ? 'Niedrig' : 
                    complianceResult.risk === 'medium' ? 'Mittel' : 'Hoch'}`
                )}
              </div>
              
              {complianceResult.recommendations.length > 0 && (
                <div>
                  <div className="font-medium mb-1">
                    {language === 'en' ? "Recommendations:" : "Empfehlungen:"}
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {complianceResult.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
