"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getProject, type StoryProject, type PageEntry } from "@/lib/firestore"
import { Button } from "@workspace/ui/components/button"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  Loader2,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getIllustratedPages(project: StoryProject): PageEntry[] {
  return project.pages.filter(
    (p) => p.imageUrl && (p.status === "done" || p.status === "reviewed")
  )
}

function getCoverImage(project: StoryProject): string {
  if (project.bannerUrl) return project.bannerUrl
  const first = getIllustratedPages(project)[0]
  if (first?.imageUrl) return first.imageUrl
  return `https://picsum.photos/seed/${encodeURIComponent(project.title ?? "book")}/800/500`
}

// ---------------------------------------------------------------------------
// Spread layout — two pages side-by-side (left=image, right=text)
// ---------------------------------------------------------------------------
function Spread({
  page,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  page: PageEntry
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-0 overflow-hidden rounded-3xl border bg-card shadow-2xl lg:flex-row">
      {/* Left — illustration */}
      <div className="relative aspect-4/3 min-h-64 bg-muted/30 lg:aspect-auto lg:w-1/2">
        {page.imageUrl ? (
          <Image
            src={page.imageUrl}
            alt={`Illustration for page ${page.pageNumber}`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <BookOpen className="h-12 w-12 opacity-20" />
          </div>
        )}
        {/* Page number chip */}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
          {page.pageNumber}
        </span>
      </div>

      {/* Right — text */}
      <div className="flex flex-col justify-between gap-6 p-8 lg:w-1/2 lg:p-10">
        <p className="font-serif text-base leading-relaxed text-foreground sm:text-lg">
          {page.content || (
            <span className="text-muted-foreground italic">
              (No text for this page)
            </span>
          )}
        </p>

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={!hasPrev}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>
          <Button
            variant={hasNext ? "default" : "outline"}
            size="sm"
            onClick={onNext}
            disabled={!hasNext}
            className="gap-1.5"
          >
            {hasNext ? (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              "The End ✨"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cover spread
// ---------------------------------------------------------------------------
function CoverSpread({
  project,
  onStart,
}: {
  project: StoryProject
  onStart: () => void
}) {
  const cover = getCoverImage(project)
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
      <div className="relative aspect-3/2 w-full overflow-hidden rounded-3xl border shadow-2xl">
        <Image
          src={cover}
          alt={`Cover of "${project.title}"`}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-8 text-white">
          <h1 className="text-3xl font-black tracking-tight drop-shadow-lg sm:text-4xl">
            {project.title}
          </h1>
          <p className="mt-2 text-sm text-white/80">
            by {project.userName ?? "Young Author"}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {project.objective}
        </p>
        <Button onClick={onStart} className="mt-1 gap-2" size="lg">
          <BookOpen className="h-4 w-4" /> Start Reading
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// End spread
// ---------------------------------------------------------------------------
function EndSpread({ project }: { project: StoryProject }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 py-12 text-center">
      <div className="text-5xl">🎉</div>
      <h2 className="text-3xl font-black tracking-tight">The End!</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        You&apos;ve finished reading <strong>{project.title}</strong> by{" "}
        {project.userName ?? "Young Author"}.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <Link href="/marketplace">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Marketplace
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function BookReaderPage() {
  const { bookId } = useParams<{ bookId: string }>()

  const [project, setProject] = useState<StoryProject | null>(null)
  const [pages, setPages] = useState<PageEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1) // -1 = cover, pages.length = end

  useEffect(() => {
    if (!bookId) return
    getProject(bookId).then((p) => {
      if (!p) return
      setProject(p)
      // All pages that have text (show those without images too for reading)
      const readable = p.pages.filter(
        (pg) => pg.status === "done" || pg.status === "reviewed"
      )
      setPages(readable)
    })
  }, [bookId])

  const goNext = useCallback(
    () => setCurrentIndex((i) => Math.min(i + 1, pages.length)),
    [pages.length]
  )
  const goPrev = useCallback(
    () => setCurrentIndex((i) => Math.max(i - 1, -1)),
    []
  )

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [goNext, goPrev])

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentPage = pages[currentIndex]
  const isEnd = currentIndex >= pages.length

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-background via-background to-primary/5">
      {/* Slim top bar */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link
            href="/marketplace"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Marketplace
          </Link>
          {currentIndex >= 0 && !isEnd && (
            <span className="text-xs text-muted-foreground tabular-nums">
              Page {currentIndex + 1} / {pages.length}
            </span>
          )}
        </div>
      </header>

      {/* Reader body */}
      <main className="flex flex-1 items-center px-6 py-10">
        <div className="w-full">
          {currentIndex === -1 ? (
            <CoverSpread project={project} onStart={() => setCurrentIndex(0)} />
          ) : isEnd ? (
            <EndSpread project={project} />
          ) : currentPage ? (
            <Spread
              page={currentPage}
              onPrev={goPrev}
              onNext={goNext}
              hasPrev={currentIndex > 0}
              hasNext={currentIndex < pages.length - 1}
            />
          ) : null}
        </div>
      </main>
    </div>
  )
}
