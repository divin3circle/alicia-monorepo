"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile } from "@/lib/firestore";

interface ProfileGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side routing guard for authenticated, onboarded users.
 *
 * Behaviour:
 *  - If auth is still loading → render a centered spinner.
 *  - If user is NOT signed in → redirect to `/login`.
 *  - If user IS signed in but hasn't completed onboarding → redirect to `/onboarding`.
 *  - If user IS signed in AND onboarded → render children.
 */
export function ProfileGuard({ children }: ProfileGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    async function checkProfile() {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (!profile || !profile.onboarded) {
          router.replace("/onboarding");
        }
      } catch (err) {
        console.error("[ProfileGuard] Failed to fetch user profile:", err);
        // On read error, be permissive — let the user in rather than loop-redirecting
      } finally {
        setChecking(false);
      }
    }

    checkProfile();
  }, [user, authLoading, router]);

  if (authLoading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-amber-500" />
          <p className="text-sm text-muted-foreground font-medium tracking-wide">
            Loading your world…
          </p>
        </div>
      </div>
    );
  }

  // Only render children if user & profile checks passed
  if (!user) return null;

  return <>{children}</>;
}
