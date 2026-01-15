"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { PORTALS } from "@/portals";
import Link from "next/link";

export function Footer() {
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

  // Get common services from PORTALS
  const commonPortals = PORTALS.filter((portal) => portal.isCommon);

  // Extract service name from URL for internal services
  const getServiceName = (href: string) => {
    try {
      const url = new URL(href);
      const hostname = url.hostname;
      if (
        hostname.includes("winlab.tw") ||
        hostname.includes("winfra.cs.nycu.edu.tw")
      ) {
        return hostname.split(".")[0];
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <header className="fixed bottom-0 left-0 right-0 z-20 bg-transparent backdrop-blur-lg border-t">
      <div className="flex items-center justify-between p-4 px-6 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          {commonPortals.map((portal) => {
            const serviceName = getServiceName(portal.href);
            const href = serviceName ? `/?service=${serviceName}` : portal.href;
            const displayName = portal.tags[0] || portal.name;

            return (
              <Link
                key={portal.name}
                href={href}
                className="text-xl text-foreground font-bold hover:scale-105 transition-transform duration-200"
              >
                {displayName}
              </Link>
            );
          })}
        </div>
        {user ? (
          <Link
            href="/"
            className="transition-all hover:opacity-80 hover:scale-105 duration-200 hover:cursor-pointer"
            aria-label="Profile"
          >
            <Avatar>
              {user.user_metadata?.avatar_url ? (
                <AvatarImage
                  src={user.user_metadata.avatar_url}
                  alt={user.email || "N/A"}
                />
              ) : null}
              <AvatarFallback>
                {user.user_metadata?.full_name
                  ? user.user_metadata.full_name.charAt(0).toUpperCase()
                  : ""}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <button
            onClick={handleLogin}
            className="cursor-pointer transition-all hover:opacity-80 hover:scale-105 duration-200"
            aria-label="Login"
          >
            <Avatar>
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          </button>
        )}
      </div>
    </header>
  );
}
