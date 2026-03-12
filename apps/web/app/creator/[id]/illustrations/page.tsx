"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  getProject,
  markProjectIllustrated,
  savePageIllustration,
  publishProject,
  type StoryProject,
  type PageEntry,
} from "@/lib/firestore"
import { cn } from "@workspace/ui/lib/utils"
import {
  Sparkles,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Globe,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Placeholder: replace with real Gemini Imagen API call. Returns a data URL or
// hosted URL. This stub uses a deterministic placeholder so the UI works E2E.
// ---------------------------------------------------------------------------
async function generateIllustration(
  pageText: string,
  pageNumber: number,
  storyTitle: string
): Promise<string> {
  // TODO: replace with actual API route POST /api/ai/illustrate
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800))
  const seed = encodeURIComponent(
    `${storyTitle}-page-${pageNumber}-${pageText.slice(0, 24)}`
  )
  return `https://picsum.photos/seed/${seed}/640/480`
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type IllustrationState = "idle" | "generating" | "done" | "error"

interface PageIllustration {
  page: PageEntry
  imageUrl: string | null
  state: IllustrationState
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function IllustrationsPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const router = useRouter()

  const [project, setProject] = useState<StoryProject | null>(null)
  const [illustrations, setIllustrations] = useState<PageIllustration[]>([])
  const [globalState, setGlobalState] = useState<
    "idle" | "generating" | "done"
  >("idle")
  const [publishing, setPublishing] = useState(false)
  const [selectedPage, setSelectedPage] = useState<number>(1)

  // Load project on mount
  useEffect(() => {
    if (!projectId) return
    getProject(projectId).then((p) => {
      if (!p) return
      setProject(p)
      const donePages = p.pages.filter(
        (pg) => pg.status === "done" || pg.status === "reviewed"
      )
      setIllustrations(
        donePages.map((pg) => ({
          page: pg,
          imageUrl: pg.imageUrl ?? null,
          state: pg.imageUrl ? "done" : "idle",
        }))
      )
      const firstDonePage = donePages.at(0)
      if (firstDonePage) setSelectedPage(firstDonePage.pageNumber)
    })
  }, [projectId])

  // Generate a single page illustration
  const generateOne = useCallback(
    async (pageNumber: number) => {
      if (!project) return
      setIllustrations((prev) =>
        prev.map((il) =>
          il.page.pageNumber === pageNumber
            ? { ...il, state: "generating" }
            : il
        )
      )
      try {
        const url = await generateIllustration(
          illustrations.find((il) => il.page.pageNumber === pageNumber)?.page
            .content ?? "",
          pageNumber,
          project.title
        )
        await savePageIllustration(projectId, pageNumber, url)
        setIllustrations((prev) =>
          prev.map((il) =>
            il.page.pageNumber === pageNumber
              ? { ...il, imageUrl: url, state: "done" }
              : il
          )
        )
      } catch {
        setIllustrations((prev) =>
          prev.map((il) =>
            il.page.pageNumber === pageNumber ? { ...il, state: "error" } : il
          )
        )
      }
    },
    [project, illustrations, projectId]
  )

  // Generate all pages sequentially
  const generateAll = async () => {
    if (illustrations.length === 0) return
    setGlobalState("generating")
    for (const il of illustrations) {
      if (il.state !== "done") {
        await generateOne(il.page.pageNumber)
      }
    }
    await markProjectIllustrated(projectId)
    setGlobalState("done")
  }

  const allDone =
    illustrations.length > 0 && illustrations.every((il) => il.state === "done")
  const doneCount = illustrations.filter((il) => il.state === "done").length
  const lastIllustrationPage = illustrations.at(-1)?.page.pageNumber ?? 0

  const handlePublish = async () => {
    if (!projectId) return
    setPublishing(true)
    await publishProject(projectId)
    router.push(`/marketplace/${projectId}`)
  }

  const selectedIllustration = illustrations.find(
    (il) => il.page.pageNumber === selectedPage
  )

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <h1 className="line-clamp-1 text-base leading-tight font-semibold">
                {project.title}
              </h1>
              <p className="text-xs text-muted-foreground">
                Illustration Studio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {doneCount} / {illustrations.length} illustrated
            </span>
            {!allDone ? (
              <Button
                onClick={generateAll}
                disabled={globalState === "generating"}
                className="gap-2"
              >
                {globalState === "generating" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {globalState === "generating" ? "Generating…" : "Generate All"}
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                disabled={publishing}
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {publishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                {publishing ? "Publishing…" : "Publish to Marketplace"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-6 py-8">
        {/* Sidebar — page list */}
        <aside className="flex w-52 shrink-0 flex-col gap-2">
          <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Pages
          </p>
          {illustrations.map((il) => (
            <button
              key={il.page.pageNumber}
              onClick={() => setSelectedPage(il.page.pageNumber)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all",
                selectedPage === il.page.pageNumber
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="w-6 text-center font-mono text-xs">
                {il.page.pageNumber}
              </span>
              {il.state === "done" && (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              )}
              {il.state === "generating" && (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
              )}
              {il.state === "idle" && (
                <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
              )}
              {il.state === "error" && (
                <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-destructive/30" />
              )}
              <span className="truncate">Page {il.page.pageNumber}</span>
            </button>
          ))}
        </aside>

        {/* Main area — preview */}
        <main className="min-w-0 flex-1">
          {selectedIllustration && (
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              {/* Illustration canvas */}
              <div className="relative flex aspect-4/3 items-center justify-center bg-muted/30">
                {selectedIllustration.state === "generating" ? (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Sparkles className="h-10 w-10 animate-pulse text-primary" />
                    <p className="text-sm font-medium">
                      Imagining your illustration…
                    </p>
                  </div>
                ) : selectedIllustration.imageUrl ? (
                  <Image
                    src={selectedIllustration.imageUrl}
                    alt={`Illustration for page ${selectedIllustration.page.pageNumber}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <BookOpen className="h-10 w-10 opacity-30" />
                    <p className="text-sm">No illustration yet</p>
                  </div>
                )}

                {/* Status badge overlay */}
                {selectedIllustration.state === "done" && (
                  <Badge className="absolute top-3 right-3 gap-1 border-0 bg-emerald-500/90 text-white">
                    <CheckCircle2 className="h-3 w-3" />
                    Done
                  </Badge>
                )}
              </div>

              {/* Page text + actions */}
              <div className="border-t p-5">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                    Page {selectedIllustration.page.pageNumber}
                  </h2>
                  <div className="flex shrink-0 gap-2">
                    {selectedIllustration.state !== "generating" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          generateOne(selectedIllustration.page.pageNumber)
                        }
                        className="h-8 gap-1.5 text-xs"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        {selectedIllustration.imageUrl
                          ? "Regenerate"
                          : "Generate"}
                      </Button>
                    )}
                    {/* Navigate to next page */}
                    {selectedPage < lastIllustrationPage && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedPage((p) => p + 1)}
                        className="h-8 gap-1 text-xs"
                      >
                        Next <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="line-clamp-4 text-sm leading-relaxed text-foreground/80">
                  {selectedIllustration.page.content || (
                    <span className="text-muted-foreground italic">
                      No text on this page
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
