import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/lib/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound, User, UserPlus, UserMinus, Users, UsersRound, Mail, IdCard, List } from "lucide-react";

const AI_AVATAR_OPTIONS = [
  { icon: UserRound, label: "Modern" },
  { icon: User, label: "Classic" },
  { icon: UserPlus, label: "Friendly" },
  { icon: UserMinus, label: "Minimal" },
  { icon: Users, label: "Social" },
  { icon: UsersRound, label: "Rounded" },
];

const Profile = () => {
  const { user } = useUser();
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("UserRound");
  const { toast } = useToast();

  const handleUpdateProfile = async () => {
    try {
      const updates = {
        email: email !== user?.email ? email : undefined,
        avatar_style: selectedAvatar,
      };

      if (password) {
        await supabase.auth.updateUser({ password });
      }

      if (updates.email || updates.avatar_style) {
        const { error } = await supabase.auth.updateUser({
          email: updates.email,
          data: { avatar_style: updates.avatar_style },
        });

        if (error) throw error;
      }

      toast({
        title: "Erfolg",
        description: "Profil wurde erfolgreich aktualisiert",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Profil konnte nicht aktualisiert werden",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings Card */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <h1 className="text-2xl font-bold">Profil Einstellungen</h1>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Selection */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Avatar</h2>
              <div className="grid grid-cols-3 gap-4">
                {AI_AVATAR_OPTIONS.map(({ icon: Icon, label }) => (
                  <Button
                    key={label}
                    variant={selectedAvatar === label ? "default" : "outline"}
                    className="flex flex-col items-center p-4 h-auto gap-2"
                    onClick={() => setSelectedAvatar(label)}
                  >
                    <Icon className="h-8 w-8" />
                    <span className="text-sm">{label}</span>
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
              <h2 className="text-lg font-semibold mb-2">Passwort</h2>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Neues Passwort eingeben"
                className="mb-2"
              />
            </div>

            <Button onClick={handleUpdateProfile}>
              Änderungen speichern
            </Button>
          </CardContent>
        </Card>

        {/* User Information Card */}
        <Card className="bg-card/50 backdrop-blur">
          <CardHeader>
            <h1 className="text-2xl font-bold">Benutzer Informationen</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <IdCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Benutzer ID</p>
                <p className="text-sm text-muted-foreground">{user?.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
              <List className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Aktuelle Pläne</p>
                <p className="text-sm text-muted-foreground">
                  Stream Plan: {user?.user_metadata?.plan || "Kostenlos"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Follower Plan: {user?.user_metadata?.follower_plan || "Keiner"}
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