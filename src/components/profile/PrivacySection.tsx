
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PrivacyControls } from "@/components/ui/privacy-controls";
import { ComplianceChecker } from "@/components/ui/compliance-checker";
import { useLanguage } from "@/lib/LanguageContext";

export default function PrivacySection() {
  const { language } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {language === 'en' ? "Privacy & Compliance" : "Datenschutz & Compliance"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <PrivacyControls />
        <Separator className="my-6" />
        <ComplianceChecker />
      </CardContent>
    </Card>
  );
}
