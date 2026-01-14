"use client";

import { clearSupabaseCookies } from "@/lib/clear-cookies";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  const refreshUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    // Initialize session - only called once on mount
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);

          // Check if it's a rate limit error
          if (error.message.includes("429") || error.message.includes("rate")) {
            console.warn("⚠️ Rate limit detected - waiting before retry...");
            // Don't clear cookies immediately on rate limit
            return;
          }

          // If it's a corrupted session error or UTF-8 error, clear cookies
          if (
            error.message.includes("Invalid") ||
            error.message.includes("corrupt") ||
            error.message.includes("malformed") ||
            error.message.includes("UTF-8") ||
            error.message.includes("utf-8")
          ) {
            console.log(
              "🧹 Clearing corrupted cookies (including UTF-8 errors)..."
            );
            clearSupabaseCookies();
          }
        }

        if (mounted) {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);

        // Handle UTF-8 errors by clearing cookies
        if (
          error instanceof Error &&
          (error.message.includes("UTF-8") || error.message.includes("utf-8"))
        ) {
          console.log("🧹 Clearing cookies due to UTF-8 error...");
          clearSupabaseCookies();
        }

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔐 Auth state changed:", event);

      if (event === "TOKEN_REFRESHED") {
        console.log("✅ Token refreshed successfully");
      }

      if (event === "SIGNED_OUT") {
        console.log("👋 User signed out - clearing cookies");
        clearSupabaseCookies();
      }

      if (event === "SIGNED_IN") {
        console.log("👋 User signed in");
      }

      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
