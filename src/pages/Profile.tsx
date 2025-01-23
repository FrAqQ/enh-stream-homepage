import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/lib/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AVATAR_OPTIONS = [
  "/placeholder.svg",
  // Add more avatar URLs here
];

const Profile = () => {
  const { user } = useUser();
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.user_metadata?.avatar_url || AVATAR_OPTIONS[0]);
  const { toast } = useToast();

  const handleUpdateProfile = async () => {
    try {
      const updates = {
        email: email !== user?.email ? email : undefined,
        avatar_url: selectedAvatar,
      };

      if (password) {
        await supabase.auth.updateUser({ password });
      }

      if (updates.email || updates.avatar_url) {
        const { error } = await supabase.auth.updateUser({
          email: updates.email,
          data: { avatar_url: updates.avatar_url },
        });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <Card className="max-w-2xl mx-auto p-6 bg-card/50 backdrop-blur">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
        
        <div className="space-y-6">
          {/* Avatar Selection */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Avatar</h2>
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={selectedAvatar} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex gap-2">
              {AVATAR_OPTIONS.map((avatar) => (
                <Button
                  key={avatar}
                  variant={selectedAvatar === avatar ? "default" : "outline"}
                  className="p-1"
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  <img src={avatar} alt="avatar option" className="w-8 h-8 rounded-full" />
                </Button>
              ))}
            </div>
          </div>

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
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="mb-2"
            />
          </div>

          {/* Current Plan */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Current Plan</h2>
            <p className="text-muted-foreground">
              {user?.user_metadata?.plan || "Free Plan"}
            </p>
          </div>

          <Button onClick={handleUpdateProfile}>
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;