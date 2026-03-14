"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, BookOpen, Plus } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { getUserProjects, type StoryProject } from "@/lib/firestore"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

const PLACEHOLDER_BANNER =
  "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/luxury-book-cover-for-kids-design-template-0183c75605e27e745ea2415db5d59b72_screen.jpg?ts=1692367693"

function pagesDone(project: StoryProject): number {
  const pages = project.pages ?? []
  const doneCount = pages.filter(
    (p) => p.status === "done" || p.status === "reviewed"
  ).length

  const highestTouched = pages.reduce((max, page) => {
    const hasText = Boolean(page.content?.trim())
    const touched = page.status !== "empty" || hasText
    return touched ? Math.max(max, page.pageNumber) : max
  }, 0)

  return Math.max(doneCount, highestTouched, project.currentPage - 1, 0)
}

function formatRelative(val: unknown): string {
  if (!val) return "Just now"
  let ms: number | null = null
  if (typeof val === "object" && val !== null && "toMillis" in val) {
    ms = (val as { toMillis: () => number }).toMillis()
  } else if (val instanceof Date) {
    ms = val.getTime()
  }
  if (!ms) return "Just now"
  const diff = Date.now() - ms
  if (diff < 60_000) return "Just now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

function StoryCard({
  project,
  onClick,
}: {
  project: StoryProject
  onClick: () => void
}) {
  const done = pagesDone(project)
  const pct = Math.round((done / 12) * 100)

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-500/10 bg-white transition-all hover:border-indigo-400/30 hover:shadow-md dark:bg-slate-900"
    >
      {/* Banner */}
      <div className="relative h-36 overflow-hidden">
        <Image
          src={project.bannerUrl ?? PLACEHOLDER_BANNER}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Progress pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
          <BookOpen className="size-3" />
          {done}/12 pages
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-sm leading-snug font-bold text-slate-900 dark:text-slate-100">
          {project.title}
        </h3>

        {/* Progress bar */}
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="size-3 shrink-0" />
          <span>Edited {formatRelative(project.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30">
        <BookOpen className="size-8 text-indigo-400" />
      </div>
      <div>
        <p className="font-bold text-slate-800 dark:text-slate-200">
          No stories yet
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Start your first adventure!
        </p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-2 text-sm font-semibold text-indigo-500 transition-colors hover:text-indigo-700"
      >
        <Plus className="size-4" />
        New Story
      </button>
    </div>
  )
}

export function RecentCreations() {
  const { user } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<StoryProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getUserProjects(user.uid)
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
          My Stories
        </h2>
        {projects.length > 0 && (
          <span className="text-xs text-slate-400">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
            projects.length === 0 && "block"
          )}
        >
          {projects.length === 0 ? (
            <EmptyState onNew={() => router.push("/creator/new")} />
          ) : (
            projects.map((p) => (
              <StoryCard
                key={p.id}
                project={p}
                onClick={() => router.push(`/creator/${p.id}`)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
