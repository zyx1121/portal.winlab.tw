"use client";

import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

interface MousePosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
  userInitial: string;
  timestamp: number;
}

interface CursorData {
  userId: string;
  userName: string;
  userInitial: string;
  x: number;
  y: number;
}

export function MouseTracker() {
  const { user } = useAuth();
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createClient();
  const lastSentRef = useRef<number>(0);
  const throttleMs = 50;
  const cleanupTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (!user) {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      setCursors(new Map());
      return;
    }

    const channel = supabase.channel("mouse-positions", {
      config: {
        broadcast: { self: true },
      },
    });

    channel.on("broadcast", { event: "mouse-move" }, (payload) => {
      const data = payload.payload as MousePosition;

      if (data.userId === user.id) return;

      setCursors((prev) => {
        const newCursors = new Map(prev);
        newCursors.set(data.userId, {
          userId: data.userId,
          userName: data.userName,
          userInitial: data.userInitial,
          x: data.x,
          y: data.y,
        });
        return newCursors;
      });

      const existingTimeout = cleanupTimeoutsRef.current.get(data.userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(() => {
        setCursors((prev) => {
          const newCursors = new Map(prev);
          newCursors.delete(data.userId);
          return newCursors;
        });
        cleanupTimeoutsRef.current.delete(data.userId);
      }, 2000);

      cleanupTimeoutsRef.current.set(data.userId, timeout);
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("Subscribed to mouse positions");
      }
    });

    channelRef.current = channel;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSentRef.current < throttleMs) return;

      lastSentRef.current = now;

      const userName =
        user.user_metadata?.full_name || user.email?.split("@")[0] || "N/A";
      const userInitial = userName.charAt(0).toUpperCase();

      const mouseData: MousePosition = {
        x: e.clientX,
        y: e.clientY,
        userId: user.id,
        userName,
        userInitial,
        timestamp: now,
      };

      channel.send({
        type: "broadcast",
        event: "mouse-move",
        payload: mouseData,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      channel.unsubscribe();

      cleanupTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      cleanupTimeoutsRef.current.clear();
    };
  }, [user, supabase]);

  if (!user) return null;

  return (
    <>
      {Array.from(cursors.values()).map((cursor) => {
        return (
          <div
            key={cursor.userId}
            className="pointer-events-none fixed z-50 transition-all duration-75 ease-out"
            style={{
              left: `${cursor.x + 4}px`,
              top: `${cursor.y + 4}px`,
            }}
          >
            <div className="flex items-center gap-2 rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground shadow-lg border border-border whitespace-nowrap">
              {cursor.userName}
            </div>
          </div>
        );
      })}
    </>
  );
}
