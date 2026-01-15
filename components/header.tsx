"use client";

import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export function Header() {
  const { user } = useAuth();
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "keycloak",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: "openid",
      },
    });
  };

  return (
    <header className="flex items-center justify-between p-4 px-6 w-full max-w-5xl mx-auto">
      <Link href="/">
        <h1 className="text-2xl text-foreground font-bold hover:scale-105 transition-transform duration-200">
          Portal
        </h1>
      </Link>
    </header>
  );
}
