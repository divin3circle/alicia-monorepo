"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { HeroStepper } from "@/components/dashboard/hero-stepper"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentCreations } from "@/components/dashboard/recent-creations"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { useAuth } from "@/lib/auth-context"
import { ProfileGuard } from "@/components/auth/profile-guard"
import { getUserProfile } from "@/lib/firestore"

export default function Page() {
  const { user } = useAuth()
  const [showUpgradePlan, setShowUpgradePlan] = React.useState(false)

  React.useEffect(() => {
    if (!user) {
      setShowUpgradePlan(false)
      return
    }

    getUserProfile(user.uid)
      .then((profile) => {
        setShowUpgradePlan(!Boolean(profile?.freeTrial))
      })
      .catch(() => {
        setShowUpgradePlan(false)
      })
  }, [user])

  return (
    <ProfileGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "17rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-500/10 px-4">
            <SidebarTrigger className="-ml-1 text-slate-400 hover:text-slate-900" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <nav className="flex items-center gap-1 text-xs text-slate-400">
              <span>Dashboard</span>
              <span>/</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Home
              </span>
            </nav>
          </header>

          {/* Main Content */}
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-6 lg:p-8">
            <DashboardHeader
              userName={
                user?.displayName ?? user?.email?.split("@")[0] ?? "Creator"
              }
              photoURL={user?.photoURL}
              storiesSaved={12}
              showUpgradePlan={showUpgradePlan}
            />
            <HeroStepper />
            <QuickActions />
            <RecentCreations />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProfileGuard>
  )
}
