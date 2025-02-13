
import { useEffect, useState } from "react";
import { useUser } from "@/lib/useUser";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";

const Navbar = () => {
  const { user } = useUser();
  const { language } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      setIsAdmin(profile?.is_admin || false);
    };

    checkAdminStatus();
  }, [user]);

  const translations = {
    en: {
      dashboard: "Dashboard",
      admin: "Admin Dashboard",
      pricing: "Pricing",
      login: "Login",
      register: "Register",
      profile: "Profile",
      logout: "Logout"
    },
    de: {
      dashboard: "Dashboard",
      admin: "Admin Dashboard",
      pricing: "Preise",
      login: "Anmelden",
      register: "Registrieren",
      profile: "Profil",
      logout: "Abmelden"
    }
  };

  const t = translations[language];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          Enhance Stream
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-foreground/80 hover:text-foreground">
            {t.dashboard}
          </Link>
          
          {isAdmin && (
            <Link to="/admin" className="text-foreground/80 hover:text-foreground">
              {t.admin}
            </Link>
          )}
          
          <Link to="/pricing" className="text-foreground/80 hover:text-foreground">
            {t.pricing}
          </Link>

          <LanguageSwitcher />
          
          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost">{t.login}</Button>
              </Link>
              <Link to="/register">
                <Button>{t.register}</Button>
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata.avatar_url} />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">{t.profile}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                  {t.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
