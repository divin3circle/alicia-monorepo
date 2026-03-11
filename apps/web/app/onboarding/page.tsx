"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile } from "@/lib/firestore";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return; // wait for Firebase Auth to resolve

    // Not logged in — send back to login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Check whether this user already completed onboarding
    getUserProfile(user.uid).then((profile) => {
      if (profile?.onboarded) {
        // Already onboarded → skip straight to the dashboard
        router.replace("/dashboard");
      } else {
        // Not yet onboarded → show the wizard
        setChecking(false);
      }
    });
  }, [user, authLoading, router]);

  // Show a centered spinner while we're resolving auth + Firestore
  if (authLoading || checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0c0a09]">
        <div className="flex flex-col items-center gap-4 text-amber-500/60">
          <Loader2 className="size-10 animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest">
            Summoning your adventure…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0a09] relative overflow-hidden flex items-center justify-center py-20">
      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full">
        <OnboardingFlow />
      </div>
    </main>
  );
}