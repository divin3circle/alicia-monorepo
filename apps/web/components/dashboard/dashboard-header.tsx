"use client"

import { Sparkles, Search, Settings, Bell } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

interface DashboardHeaderProps {
  userName?: string
  photoURL?: string | null
  storiesSaved?: number
  showUpgradePlan?: boolean
}

export function DashboardHeader({
  userName = "Creator",
  photoURL,
  storiesSaved = 12,
  showUpgradePlan = true,
}: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex items-start justify-between">
      {/* Left: Greeting */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Hi {userName}, Welcome back 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          You&apos;ve crafted{" "}
          <span className="font-bold text-amber-500">
            {storiesSaved} stories
          </span>{" "}
          with Alicia AI so far!
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {showUpgradePlan ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-amber-500/30 font-semibold text-amber-600 hover:bg-amber-500/10"
          >
            <Sparkles className="size-3.5" />
            Upgrade Plan
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-slate-500 hover:text-slate-900"
        >
          <Search className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-slate-500 hover:text-slate-900"
        >
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-amber-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-slate-500 hover:text-slate-900"
        >
          <Settings className="size-4" />
        </Button>
        {photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoURL}
            alt={userName}
            referrerPolicy="no-referrer"
            className="size-8 rounded-full object-cover shadow-md ring-2 ring-amber-500/30"
          />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-white shadow-md shadow-amber-500/25">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}
