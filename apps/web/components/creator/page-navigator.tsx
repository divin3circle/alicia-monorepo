"use client";

import { Lock } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { PageEntry } from "@/lib/firestore";

interface PageNavigatorProps {
  pages: PageEntry[];
  currentPage: number;
  /** The furthest page the user is allowed to navigate to */
  maxUnlockedPage: number;
  onPageSelect: (page: number) => void;
}

const statusColors: Record<PageEntry["status"], string> = {
  empty: "bg-muted-foreground/30",
  draft: "bg-amber-400",
  done: "bg-indigo-400",
  reviewed: "bg-emerald-400",
};

export function PageNavigator({
  pages,
  currentPage,
  maxUnlockedPage,
  onPageSelect,
}: PageNavigatorProps) {
  return (
    <>
      {/* ───── Desktop: vertical list ───── */}
      <aside className="hidden lg:flex flex-col w-[200px] shrink-0 border-r border-border/50 bg-card/60 overflow-y-auto">
        <p className="px-3 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Pages
        </p>
        <ul className="flex flex-col gap-0.5 px-2 pb-4">
          {pages.map((p) => {
            const locked = p.pageNumber > maxUnlockedPage;
            return (
              <li key={p.pageNumber}>
                <button
                  onClick={() => !locked && onPageSelect(p.pageNumber)}
                  disabled={locked}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors",
                    locked
                      ? "opacity-40 cursor-not-allowed"
                      : currentPage === p.pageNumber
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-foreground"
                  )}
                >
                  {/* Status dot */}
                  <span
                    className={cn(
                      "size-2 rounded-full shrink-0",
                      locked ? "bg-muted-foreground/20" : statusColors[p.status]
                    )}
                  />
                  <span className="shrink-0 font-mono text-xs w-4">
                    {p.pageNumber}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {locked ? "" : p.content ? p.content.slice(0, 20) : "Empty"}
                  </span>
                  {locked && (
                    <Lock className="size-3 ml-auto text-muted-foreground/50" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* ───── Mobile: scrollable dot row ───── */}
      <div className="lg:hidden w-full flex items-center gap-2 overflow-x-auto px-4 py-2 border-b border-border/50 bg-card/60">
        {pages.map((p) => {
          const locked = p.pageNumber > maxUnlockedPage;
          return (
            <button
              key={p.pageNumber}
              onClick={() => !locked && onPageSelect(p.pageNumber)}
              disabled={locked}
              title={locked ? `Page ${p.pageNumber} (locked)` : `Page ${p.pageNumber}`}
              className={cn(
                "flex items-center justify-center size-7 rounded-full text-xs font-mono font-semibold shrink-0 transition-all",
                locked
                  ? "opacity-30 cursor-not-allowed bg-muted text-muted-foreground"
                  : currentPage === p.pageNumber
                    ? "ring-2 ring-primary bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
              )}
            >
              {locked ? <Lock className="size-3" /> : p.pageNumber}
            </button>
          );
        })}
      </div>
    </>
  );
}
