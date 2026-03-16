"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Lock } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

import { useAuth } from "@/lib/auth-context"
import { getUserProfile } from "@/lib/firestore"

interface RestrictedAccessGuardProps {
  children: React.ReactNode
  areaLabel?: string
}

type GuardState = "checking" | "allowed" | "blocked"

export function RestrictedAccessGuard({
  children,
  areaLabel = "this section",
}: RestrictedAccessGuardProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [guardState, setGuardState] = useState<GuardState>("checking")

  useEffect(() => {
    if (authLoading) return

    async function checkAccess() {
      if (!user) {
        router.replace("/login")
        return
      }

      try {
        const profile = await getUserProfile(user.uid)

        if (!profile?.onboarded) {
          router.replace("/onboarding")
          return
        }

        if (profile.freeTrial) {
          setGuardState("allowed")
          return
        }

        setGuardState("blocked")
      } catch (error) {
        console.error("[RestrictedAccessGuard] Failed to check profile", error)
        setGuardState("blocked")
      }
    }

    void checkAccess()
  }, [authLoading, router, user])

  if (authLoading || guardState === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium">Checking access…</p>
        </div>
      </div>
    )
  }

  if (guardState === "blocked") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10">
            <Lock className="size-7 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Access Restricted
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {areaLabel} is currently available only for approved reviewers in
            this build.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            You can still browse the Marketplace and use your Dashboard.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button
              asChild
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <Link href="/marketplace">Open Marketplace</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
