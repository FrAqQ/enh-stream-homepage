import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Smile, Laugh, Heart, Star, Music, Coffee, Pizza, Ghost, Bot, Rainbow } from "lucide-react";

const EMOTE_OPTIONS = [
  { icon: Smile, label: "Happy" },
  { icon: Laugh, label: "Laugh" },
  { icon: Heart, label: "Love" },
  { icon: Star, label: "Star" },
  { icon: Music, label: "Music" },
  { icon: Coffee, label: "Coffee" },
  { icon: Pizza, label: "Pizza" },
  { icon: Ghost, label: "Ghost" },
  { icon: Bot, label: "Bot" },
  { icon: Rainbow, label: "Rainbow" },
];

const Profile = () => {
  const { user } = useUser();
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedEmote, setSelectedEmote] = useState<string>(
    user?.user_metadata?.emote || EMOTE_OPTIONS[Math.floor(Math.random() * EMOTE_OPTIONS.length)].label
  );
  const { toast } = useToast();

  useEffect(() => {
    // Set initial emote for new users
    if (user && !user.user_metadata?.emote) {
      const randomEmote = EMOTE_OPTIONS[Math.floor(Math.random() * EMOTE_OPTIONS.length)].label;
      handleUpdateProfile({ emoteOnly: true, newEmote: randomEmote });
    }
  }, [user]);

  const handleUpdateProfile = async ({ emoteOnly = false, newEmote = selectedEmote }) => {
    try {
      const updates: any = {
        data: { emote: newEmote },
      };

      if (!emoteOnly) {
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
          await supabase.auth.updateUser({ password });
        }
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Profile could not be updated",
      });
    }
  };

  // Find the icon component for the selected emote
  const SelectedIcon = EMOTE_OPTIONS.find(e => e.label === selectedEmote)?.icon || Smile;

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings Card */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Emote Selection */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Select Emote</h2>
              <div className="grid grid-cols-5 gap-4">
                {EMOTE_OPTIONS.map(({ icon: Icon, label }) => (
                  <Button
                    key={label}
                    variant={selectedEmote === label ? "default" : "outline"}
                    className="flex flex-col items-center p-4 h-auto gap-2"
                    onClick={() => {
                      setSelectedEmote(label);
                      handleUpdateProfile({ emoteOnly: true, newEmote: label });
                    }}
                  >
                    <Icon className="h-8 w-8" />
                    <span className="text-xs">{label}</span>
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

            <Button onClick={() => handleUpdateProfile({})}>
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
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  <SelectedIcon className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Current Emote</p>
                <p className="text-sm text-muted-foreground">{selectedEmote}</p>
              </div>
            </div>

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