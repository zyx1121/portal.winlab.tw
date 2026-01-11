import { LogoutButton } from "@/components/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const getInitials = (email?: string) => {
    if (!email) return "?";
    const parts = email.split("@");
    if (parts[0]) {
      return parts[0].charAt(0).toUpperCase();
    }
    return "?";
  };

  return (
    <div className="flex flex-col gap-3 p-3 max-w-3xl mx-auto">
      <div className="flex flex-col items-center gap-6 p-6 bg-background/50 backdrop-blur-lg rounded-lg border">
        <Avatar className="size-24">
          {user.user_metadata?.avatar_url ? (
            <AvatarImage
              src={user.user_metadata.avatar_url}
              alt={user.email || "User"}
            />
          ) : null}
          <AvatarFallback className="text-2xl">
            {user.user_metadata?.full_name
              ? user.user_metadata.full_name.charAt(0).toUpperCase()
              : user.email
              ? getInitials(user.email)
              : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">
            {user.user_metadata?.full_name || "User"}
          </h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="w-full pt-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
