
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { securityService, DataExportType } from "@/lib/securityService";
import { useUser } from "@/lib/useUser";
import { useToast } from "@/hooks/use-toast";
import { LoadingOverlay } from "./loading-overlay";
import { useLanguage } from "@/lib/LanguageContext";

export function PrivacyControls() {
  const { user } = useUser();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState<DataExportType>({
    profile: true,
    activityLogs: true,
    settings: true
  });

  const handleExportData = async () => {
    if (!user) {
      toast({
        title: language === 'en' ? "Not authenticated" : "Nicht authentifiziert",
        description: language === 'en' ? "Please login to export your data" : "Bitte melden Sie sich an, um Ihre Daten zu exportieren",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await securityService.exportUserData(user.id, exportOptions);
      
      if (result.success) {
        toast({
          title: language === 'en' ? "Data exported" : "Daten exportiert",
          description: language === 'en' ? "Your data has been exported successfully" : "Ihre Daten wurden erfolgreich exportiert"
        });
      } else {
        toast({
          title: language === 'en' ? "Export failed" : "Export fehlgeschlagen",
          description: language === 'en' ? "There was a problem exporting your data" : "Beim Exportieren Ihrer Daten ist ein Problem aufgetreten",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error in data export:", error);
      toast({
        title: language === 'en' ? "Export failed" : "Export fehlgeschlagen",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      toast({
        title: language === 'en' ? "Not authenticated" : "Nicht authentifiziert",
        description: language === 'en' ? "Please login to delete your account" : "Bitte melden Sie sich an, um Ihr Konto zu löschen",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await securityService.deleteUserData(user.id);
      
      if (result.success) {
        toast({
          title: language === 'en' ? "Account deleted" : "Konto gelöscht",
          description: language === 'en' ? "Your account has been deleted successfully" : "Ihr Konto wurde erfolgreich gelöscht"
        });
        // Redirect to home page or handle post-deletion flow
      } else {
        toast({
          title: language === 'en' ? "Deletion failed" : "Löschung fehlgeschlagen",
          description: language === 'en' ? "There was a problem deleting your account" : "Beim Löschen Ihres Kontos ist ein Problem aufgetreten",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error in account deletion:", error);
      toast({
        title: language === 'en' ? "Deletion failed" : "Löschung fehlgeschlagen",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExportOption = (option: keyof DataExportType) => {
    setExportOptions({
      ...exportOptions,
      [option]: !exportOptions[option]
    });
  };

  return (
    <LoadingOverlay isLoading={isLoading}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">
            {language === 'en' ? "Data Privacy Controls" : "Datenschutzeinstellungen"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'en' 
              ? "Manage your personal data and privacy preferences" 
              : "Verwalten Sie Ihre persönlichen Daten und Datenschutzeinstellungen"}
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              {language === 'en' ? "Export My Data" : "Meine Daten exportieren"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === 'en' ? "Export Your Data" : "Exportieren Sie Ihre Daten"}
              </DialogTitle>
              <DialogDescription>
                {language === 'en' 
                  ? "Select what data you would like to export" 
                  : "Wählen Sie aus, welche Daten Sie exportieren möchten"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="profile" 
                  checked={exportOptions.profile} 
                  onCheckedChange={() => toggleExportOption('profile')} 
                />
                <Label htmlFor="profile">
                  {language === 'en' ? "Profile Information" : "Profilinformationen"}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="activity" 
                  checked={exportOptions.activityLogs} 
                  onCheckedChange={() => toggleExportOption('activityLogs')} 
                />
                <Label htmlFor="activity">
                  {language === 'en' ? "Activity Logs" : "Aktivitätsprotokolle"}
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="settings" 
                  checked={exportOptions.settings} 
                  onCheckedChange={() => toggleExportOption('settings')} 
                />
                <Label htmlFor="settings">
                  {language === 'en' ? "Settings and Preferences" : "Einstellungen und Präferenzen"}
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleExportData}>
                {language === 'en' ? "Download Data" : "Daten herunterladen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              {language === 'en' ? "Delete My Account" : "Mein Konto löschen"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {language === 'en' ? "Are you absolutely sure?" : "Sind Sie absolut sicher?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {language === 'en' 
                  ? "This action cannot be undone. This will permanently delete your account and remove all your data from our servers."
                  : "Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird Ihr Konto dauerhaft gelöscht und alle Ihre Daten werden von unseren Servern entfernt."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {language === 'en' ? "Cancel" : "Abbrechen"}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount}>
                {language === 'en' ? "Delete Account" : "Konto löschen"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </LoadingOverlay>
  );
}
