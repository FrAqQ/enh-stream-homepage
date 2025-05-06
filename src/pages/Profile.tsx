
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/useUser";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  // Daten aus dem User-Objekt laden, sobald es verfügbar ist
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      console.log("[Profile] User data loaded:", user.email);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    console.log("[Profile] Updating profile");
    
    try {
      const updates: any = {};

      if (email !== user?.email) {
        updates.email = email;
      }

      if (password) {
        if (password !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive"
          });
          return;
        }
        
        console.log("[Profile] Updating password");
        await supabase.auth.updateUser({ password });
      }

      // Falls E-Mail-Updates vorhanden sind
      if (Object.keys(updates).length > 0) {
        console.log("[Profile] Updating user data:", updates);
        const { error } = await supabase.auth.updateUser(updates);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("[Profile] Profile update error:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Profile could not be updated",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings Card */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Update */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Email</h2>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-2"
              />
            </div>

            {/* Password Update */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Password</h2>
              <div className="space-y-2">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="mb-2"
                />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="mb-2"
                />
              </div>
            </div>

            <Button onClick={handleUpdateProfile} type="button">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* User Information Card */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <h1 className="text-2xl font-bold">User Information</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-sm text-muted-foreground">{user?.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <div>
                <p className="text-sm font-medium">Current Plans</p>
                <p className="text-sm text-muted-foreground">
                  Stream Plan: {user?.user_metadata?.plan || "Free"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Follower Plan: {user?.user_metadata?.follower_plan || "None"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
