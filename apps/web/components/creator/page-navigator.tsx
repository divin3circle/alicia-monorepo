"use client"

import { Lock } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import type { PageEntry } from "@/lib/firestore"

interface PageNavigatorProps {
  pages: PageEntry[]
  currentPage: number
  /** The furthest page the user is allowed to navigate to */
  maxUnlockedPage: number
  onPageSelect: (page: number) => void
}

const statusColors: Record<PageEntry["status"], string> = {
  empty: "bg-muted-foreground/30",
  draft: "bg-amber-400",
  done: "bg-indigo-400",
  reviewed: "bg-emerald-400",
}

export function PageNavigator({
  pages,
  currentPage,
  maxUnlockedPage,
  onPageSelect,
}: PageNavigatorProps) {
  return (
    <>
      {/* ───── Desktop: vertical list ───── */}
      <aside className="hidden w-[200px] shrink-0 flex-col overflow-y-auto rounded-xl border border-border/50 bg-white/10 lg:flex">
        <p className="px-3 pt-4 pb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Pages
        </p>
        <ul className="flex flex-col gap-0.5 px-2 pb-4">
          {pages.map((p) => {
            const locked = p.pageNumber > maxUnlockedPage
            return (
              <li key={p.pageNumber}>
                <button
                  onClick={() => !locked && onPageSelect(p.pageNumber)}
                  disabled={locked}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    locked
                      ? "cursor-not-allowed opacity-40"
                      : currentPage === p.pageNumber
                        ? "bg-primary/10 font-medium text-foreground"
                        : "text-foreground hover:bg-muted"
                  )}
                >
                  {/* Status dot */}
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      locked ? "bg-muted-foreground/20" : statusColors[p.status]
                    )}
                  />
                  <span className="w-4 shrink-0 font-mono text-xs">
                    {p.pageNumber}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {locked ? "" : p.content ? p.content.slice(0, 20) : "Empty"}
                  </span>
                  {locked && (
                    <Lock className="ml-auto size-3 text-muted-foreground/50" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      {/* ───── Mobile: scrollable dot row ───── */}
      <div className="flex w-full items-center gap-2 overflow-x-auto border-b border-border/50 bg-card/60 px-4 py-2 lg:hidden">
        {pages.map((p) => {
          const locked = p.pageNumber > maxUnlockedPage
          return (
            <button
              key={p.pageNumber}
              onClick={() => !locked && onPageSelect(p.pageNumber)}
              disabled={locked}
              title={
                locked
                  ? `Page ${p.pageNumber} (locked)`
                  : `Page ${p.pageNumber}`
              }
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold transition-all",
                locked
                  ? "cursor-not-allowed bg-muted text-muted-foreground opacity-30"
                  : currentPage === p.pageNumber
                    ? "text-foreground-foreground bg-primary ring-2 ring-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
            >
              {locked ? <Lock className="size-3" /> : p.pageNumber}
            </button>
          )
        })}
      </div>
    </>
  )
}
