"use client";

import { LogoutButton } from "@/components/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { PORTALS } from "@/portals";
import { Loader2, SquareArrowOutUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

// Extract common services from PORTALS
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

const COMMON_SERVICES = PORTALS.filter((p) => p.isCommon)
  .map((p) => getServiceName(p.href))
  .filter((name): name is string => name !== null);

function HomeContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const serviceName = searchParams.get("service");
  const [loadedServices, setLoadedServices] = useState<Set<string>>(new Set());
  const iframeRefs = useRef<Map<string, HTMLIFrameElement>>(new Map());
  const supabase = createClient();

  // Auto login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      supabase.auth.signInWithOAuth({
        provider: "keycloak",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          scopes: "openid",
        },
      });
    }
  }, [loading, user, supabase]);

  // Preload common services on mount
  useEffect(() => {
    COMMON_SERVICES.forEach((svc) => {
      setLoadedServices((prev) => new Set(prev).add(svc));
    });
  }, []);

  const handleLoad = (svc: string) => {
    setLoadedServices((prev) => new Set(prev).add(svc));
  };

  // Determine if portals list should be visible
  const showPortalsList = !serviceName || serviceName === "portal";

  return (
    <>
      {/* Portals list - always rendered, shown/hidden based on service */}
      <div
        className={`flex flex-col gap-4 p-4 max-w-5xl justify-center h-full mx-auto transition-opacity duration-300 ${
          showPortalsList
            ? "opacity-100 pointer-events-auto relative z-0"
            : "opacity-0 pointer-events-none relative z-0"
        }`}
      >
        <div className="flex flex-col items-center gap-6 p-6 bg-background/50 backdrop-blur-lg rounded-lg border">
          <Avatar className="size-24">
            {user?.user_metadata?.avatar_url ? (
              <AvatarImage
                src={user.user_metadata.avatar_url}
                alt={user.email || "N/A"}
              />
            ) : null}
            <AvatarFallback className="text-2xl">
              {user?.user_metadata?.full_name
                ? user.user_metadata.full_name.charAt(0).toUpperCase()
                : "N/A"}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">
              {user?.user_metadata?.full_name || "N/A"}
            </h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <div className="w-full pt-2">
            <LogoutButton />
          </div>
        </div>
        {PORTALS.filter((portal) => !portal.isCommon).map((portal) => {
          return (
            <Link href={portal.href} key={portal.name} target="_blank">
              <Item
                key={portal.name}
                variant="outline"
                className="cursor-pointer bg-background/50 backdrop-blur-lg hover:bg-background/70 hover:scale-101 transition-all duration-200"
              >
                <ItemMedia>
                  <Image
                    src={portal.icon}
                    alt={portal.name}
                    width={48}
                    height={48}
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="font-bold">{portal.name}</ItemTitle>
                  <ItemDescription className="flex flex-wrap gap-1">
                    {portal.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="rounded-full"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <SquareArrowOutUpRight className="size-4 mx-4" />
                </ItemActions>
              </Item>
            </Link>
          );
        })}
      </div>

      {/* Iframe layer - always rendered, shown/hidden based on service */}
      {/* Only show iframe for common services */}
      <div
        className={`fixed inset-0 top-0 h-dvh transition-opacity duration-300 ${
          serviceName &&
          serviceName !== "portal" &&
          COMMON_SERVICES.includes(serviceName)
            ? "opacity-100 pointer-events-auto z-0"
            : "opacity-0 pointer-events-none z-0"
        }`}
      >
        {/* Common services iframes */}
        {COMMON_SERVICES.map((svc) => {
          const isActive = svc === serviceName;

          return (
            <div
              key={svc}
              className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                isActive
                  ? "opacity-100 pointer-events-auto z-10"
                  : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <iframe
                ref={(el) => {
                  if (el) iframeRefs.current.set(svc, el);
                }}
                src={`https://${svc}.winlab.tw`}
                className="w-full h-full border-0 bg-transparent"
                title={svc}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => handleLoad(svc)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-dvh">
          <Loader2 className="size-4 animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
