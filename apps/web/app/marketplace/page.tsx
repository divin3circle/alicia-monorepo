"use client"

import { useEffect, useState, type CSSProperties } from "react"
import Link from "next/link"
import Image from "next/image"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { Input } from "@workspace/ui/components/input"
import { getMarketplaceProjects, type StoryProject } from "@/lib/firestore"
import { cn } from "@workspace/ui/lib/utils"
import { BookOpen, Loader2, Search, Sparkles } from "lucide-react"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getCoverImage(project: StoryProject): string {
  if (project.bannerUrl) return project.bannerUrl
  const firstIllustrated = project.pages?.find((p) => p.imageUrl)
  if (firstIllustrated?.imageUrl) return firstIllustrated.imageUrl
  return `https://picsum.photos/seed/${encodeURIComponent(project.title ?? "book")}/640/400`
}

function getExcerpt(project: StoryProject): string {
  const firstPage = project.pages?.find(
    (p) => p.status === "done" || p.status === "reviewed"
  )
  if (!firstPage?.content) return project.objective ?? ""
  const text = firstPage.content
  return text.slice(0, 110) + (text.length > 110 ? "…" : "")
}

// ---------------------------------------------------------------------------
// Book Card
// ---------------------------------------------------------------------------
function BookCard({ project }: { project: StoryProject }) {
  const cover = getCoverImage(project)
  const excerpt = getExcerpt(project)
  const authorInitial = (project.userName ?? "A")[0]?.toUpperCase()

  return (
    <Link
      href={`/marketplace/${project.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm",
        "transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
      )}
    >
      {/* Cover */}
      <div className="relative aspect-3/2 overflow-hidden bg-muted/40">
        <Image
          src={cover}
          alt={`Cover of "${project.title}"`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          <BookOpen className="h-2.5 w-2.5" /> 12 pages
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h2 className="line-clamp-2 text-sm leading-snug font-semibold transition-colors group-hover:text-foreground">
          {project.title}
        </h2>
        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
          {excerpt}
        </p>
        <div className="flex items-center gap-2 pt-1">
          {project.userPhotoURL ? (
            <Image
              src={project.userPhotoURL}
              alt={project.userName ?? "Author"}
              width={18}
              height={18}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-foreground">
              {authorInitial}
            </div>
          )}
          <span className="truncate text-[11px] text-muted-foreground">
            {project.userName ?? "Young Author"}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MarketplacePage() {
  const [projects, setProjects] = useState<StoryProject[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    getMarketplaceProjects()
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [])

  const filtered = query.trim()
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          (p.userName ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : projects

  return (
    <SidebarProvider style={{ "--sidebar-width": "17rem" } as CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        {/* Top nav */}
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
              Marketplace
            </span>
          </nav>
        </header>

        {/* Content */}
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Marketplace
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Original illustrated stories crafted by young storytellers
              </p>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title or author…"
                className="h-9 rounded-full pl-9 text-xs"
              />
            </div>
          </div>

          {/* Grid / states */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-dashed py-24 text-center text-muted-foreground">
              {query ? (
                <>
                  <Search className="h-10 w-10 opacity-30" />
                  <p className="text-sm">
                    No stories match &ldquo;{query}&rdquo;
                  </p>
                </>
              ) : (
                <>
                  <Sparkles className="h-10 w-10 opacity-30" />
                  <p className="text-sm font-medium">
                    No published stories yet.
                  </p>
                  <p className="text-xs">Finish your book to be the first!</p>
                  <Link
                    href="/creator/new"
                    className="mt-1 text-sm font-semibold text-foreground hover:underline"
                  >
                    Start writing →
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <BookCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
