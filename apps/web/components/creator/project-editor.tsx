"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, MessageCircle } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"

import {
  getProject,
  updatePage,
  type AiMessage,
  type StoryProject,
} from "@/lib/firestore"
import { PageNavigator } from "@/components/creator/page-navigator"
import { EditorArea } from "@/components/creator/editor-area"
import { AiChatPanel } from "@/components/creator/ai-chat-panel"
import { PageReview } from "@/components/creator/page-review"
import { VoiceSessionModal } from "@/components/creator/voice-session"

interface ProjectEditorProps {
  projectId: string
}

export function ProjectEditor({ projectId }: ProjectEditorProps) {
  const router = useRouter()
  const [project, setProject] = useState<StoryProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReview, setShowReview] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const [chatHistory, setChatHistory] = useState<AiMessage[]>([])

  const fetchProject = useCallback(async () => {
    const p = await getProject(projectId)
    if (p) {
      setProject(p)
      setCurrentPage(p.currentPage ?? 1)
      setChatHistory(p.chatHistory ?? [])
    }
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const handleInsertFromChat = useCallback(
    async (text: string) => {
      const clean = text.trim()
      if (!clean) return

      const current = (project?.pages ?? []).find(
        (p) => p.pageNumber === currentPage
      )

      const existingContent = current?.content ?? ""
      const nextContent = existingContent.trim()
        ? `${existingContent.trimEnd()}\n${clean}`
        : clean

      const wordCount = nextContent.trim()
        ? nextContent.trim().split(/\s+/).length
        : 0

      const nextStatus: "empty" | "draft" | "done" | "reviewed" =
        current?.status === "done" || current?.status === "reviewed"
          ? current.status
          : "draft"

      await updatePage(projectId, currentPage, {
        content: nextContent,
        status: nextStatus,
        wordCount,
      })

      setProject((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          pages: (prev.pages ?? []).map((p) =>
            p.pageNumber === currentPage
              ? {
                  ...p,
                  content: nextContent,
                  status: nextStatus,
                  wordCount,
                }
              : p
          ),
        }
      })
    },
    [currentPage, project, projectId]
  )

  if (loading) {
    return (
      <div className="flex min-h-screen animate-pulse items-center justify-center text-sm text-muted-foreground">
        Loading your story…
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const pages = project.pages ?? []
  const currentPageData = pages.find((p) => p.pageNumber === currentPage)

  const highestTouched = pages.reduce(
    (max, p) =>
      p.status !== "empty" && p.pageNumber > max ? p.pageNumber : max,
    0
  )
  const maxUnlockedPage = Math.min(highestTouched + 1, 12)

  /** Feedback review + voice coaching appear every 3rd page */
  const isMilestonePage = (page: number) => page % 3 === 0

  const handlePageDone = async () => {
    const refreshed = await getProject(projectId)
    if (refreshed) setProject(refreshed)

    if (isMilestonePage(currentPage)) {
      // Pages 3, 6, 9, 12 — show Gibbs review + optional voice
      setShowReview(true)
    } else {
      // All other pages — silently advance
      if (currentPage < 12) {
        setCurrentPage(currentPage + 1)
      }
    }
  }

  const handleReviewContinue = async () => {
    setShowReview(false)
    if (currentPage < 12) {
      setCurrentPage(currentPage + 1)
      const refreshed = await getProject(projectId)
      if (refreshed) setProject(refreshed)
    } else {
      // All 12 pages done — go to illustration generation
      router.push(`/creator/${projectId}/illustrations`)
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden px-2 py-2">
      <header className="z-30 flex h-14 shrink-0 items-center gap-3 px-4 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
        >
          <ChevronLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">{project.title}</h1>
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of 12
          </p>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 lg:hidden">
              <MessageCircle className="size-4" />
              Alicia
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[75dvh] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Chat with Alicia</SheetTitle>
            </SheetHeader>
            <AiChatPanel
              projectId={projectId}
              pageNumber={currentPage}
              history={chatHistory}
              enableInsertActions
              onInsertText={handleInsertFromChat}
              onAppendMessages={(msgs) =>
                setChatHistory((prev) => [...prev, ...msgs])
              }
              storyContext={{
                title: project.title,
                objective: project.objective,
                setting: project.setting,
                characters: project.characters,
                pages: pages
                  .filter(
                    (p) => p.status !== "empty" && p.pageNumber <= currentPage
                  )
                  .map((p) => ({
                    pageNumber: p.pageNumber,
                    content: p.content,
                  })),
                recentFeedback: (project.pageFeedback ?? [])
                  .slice(-3)
                  .map((f) => ({
                    pageNumber: f.pageNumber,
                    whatWentGreat: f.whatWentGreat,
                    tryNextTime: f.tryNextTime,
                  })),
              }}
            />
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <PageNavigator
          pages={pages}
          currentPage={currentPage}
          maxUnlockedPage={maxUnlockedPage}
          onPageSelect={setCurrentPage}
        />

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <EditorArea
            projectId={projectId}
            pageNumber={currentPage}
            initialContent={currentPageData?.content ?? ""}
            initialStatus={currentPageData?.status ?? "draft"}
            isMilestone={isMilestonePage(currentPage)}
            isLastPage={currentPage === 12}
            onDone={handlePageDone}
          />
        </main>
        <aside className="hidden w-[380px] shrink-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-card/60 lg:flex">
          <AiChatPanel
            projectId={projectId}
            pageNumber={currentPage}
            history={chatHistory}
            enableInsertActions
            onInsertText={handleInsertFromChat}
            onAppendMessages={(msgs) =>
              setChatHistory((prev) => [...prev, ...msgs])
            }
            storyContext={{
              title: project.title,
              objective: project.objective,
              setting: project.setting,
              characters: project.characters,
              pages: pages
                .filter(
                  (p) => p.status !== "empty" && p.pageNumber <= currentPage
                )
                .map((p) => ({ pageNumber: p.pageNumber, content: p.content })),
              recentFeedback: (project.pageFeedback ?? [])
                .slice(-3)
                .map((f) => ({
                  pageNumber: f.pageNumber,
                  whatWentGreat: f.whatWentGreat,
                  tryNextTime: f.tryNextTime,
                })),
            }}
          />
        </aside>
      </div>
      {showReview && (
        <PageReview
          projectId={projectId}
          pageNumber={currentPage}
          totalPages={12}
          pageContent={currentPageData?.content ?? ""}
          storyTitle={project.title}
          storyObjective={project.objective}
          storySetting={project.setting}
          onStartVoice={() => {
            setShowReview(false)
            setShowVoice(true)
          }}
          onContinue={handleReviewContinue}
        />
      )}

      {showVoice && (
        <VoiceSessionModal
          pageNumber={currentPage}
          storyContext={{
            title: project.title,
            objective: project.objective,
            setting: project.setting,
            characters: project.characters,
            pages: pages
              .filter(
                (p) => p.status !== "empty" && p.pageNumber <= currentPage
              )
              .map((p) => ({ pageNumber: p.pageNumber, content: p.content })),
            recentFeedback: (project.pageFeedback ?? []).slice(-3).map((f) => ({
              pageNumber: f.pageNumber,
              whatWentGreat: f.whatWentGreat,
              tryNextTime: f.tryNextTime,
            })),
          }}
          onEnd={() => {
            setShowVoice(false)
            setShowReview(true)
          }}
        />
      )}
    </div>
  )
}
