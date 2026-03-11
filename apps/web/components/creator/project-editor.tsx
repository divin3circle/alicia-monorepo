"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";

import { getProject, type AiMessage, type StoryProject } from "@/lib/firestore";
import { PageNavigator } from "@/components/creator/page-navigator";
import { EditorArea } from "@/components/creator/editor-area";
import { AiChatPanel } from "@/components/creator/ai-chat-panel";
import { PageReview } from "@/components/creator/page-review";
import { VoiceSessionModal } from "@/components/creator/voice-session";

interface ProjectEditorProps {
  projectId: string;
}

export function ProjectEditor({ projectId }: ProjectEditorProps) {
  const router = useRouter();
  const [project, setProject] = useState<StoryProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [chatHistory, setChatHistory] = useState<AiMessage[]>([]);

  const fetchProject = useCallback(async () => {
    const p = await getProject(projectId);
    if (p) {
      setProject(p);
      setCurrentPage(p.currentPage ?? 1);
      setChatHistory(p.chatHistory ?? []);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground text-sm animate-pulse">
        Loading your story…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Project not found.</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const pages = project.pages ?? [];
  const currentPageData = pages.find((p) => p.pageNumber === currentPage);

  // The highest page the user has touched (draft / done / reviewed)
  const highestTouched = pages.reduce(
    (max, p) => (p.status !== "empty" && p.pageNumber > max ? p.pageNumber : max),
    0
  );
  // Allow navigating up to the next unwritten page (but not beyond)
  const maxUnlockedPage = Math.min(highestTouched + 1, 12);

  const handlePageDone = async () => {
    // Refresh project to get latest status
    const refreshed = await getProject(projectId);
    if (refreshed) setProject(refreshed);
    setShowReview(true);
  };

  const handleReviewContinue = async () => {
    setShowReview(false);
    if (currentPage < 12) {
      const next = currentPage + 1;
      setCurrentPage(next);
      const refreshed = await getProject(projectId);
      if (refreshed) setProject(refreshed);
    } else {
      router.push(`/dashboard`);
    }
  };

  const pageHistory = chatHistory.filter(
    (m) => m.pageContext === currentPage || m.pageContext === null
  );

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center gap-3 px-4 h-14 border-b border-border/50 shrink-0 bg-card/70 backdrop-blur-sm z-30">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
        >
          <ChevronLeft className="size-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-sm truncate">{project.title}</h1>
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
              history={pageHistory}
              onNewMessages={setChatHistory}
            />
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <PageNavigator
          pages={pages}
          currentPage={currentPage}
          maxUnlockedPage={maxUnlockedPage}
          onPageSelect={setCurrentPage}
        />

        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <EditorArea
            projectId={projectId}
            pageNumber={currentPage}
            initialContent={currentPageData?.content ?? ""}
            initialStatus={currentPageData?.status ?? "draft"}
            onDone={handlePageDone}
          />
        </main>
        <aside className="hidden lg:flex flex-col w-[320px] shrink-0 border-l border-border/50 bg-card/60">
          <AiChatPanel
            projectId={projectId}
            pageNumber={currentPage}
            history={pageHistory}
            onNewMessages={setChatHistory}
          />
        </aside>
      </div>
      {showReview && (
        <PageReview
          projectId={projectId}
          pageNumber={currentPage}
          totalPages={12}
          onStartVoice={() => {
            setShowReview(false);
            setShowVoice(true);
          }}
          onContinue={handleReviewContinue}
        />
      )}

      {showVoice && (
        <VoiceSessionModal
          pageNumber={currentPage}
          onEnd={() => {
            setShowVoice(false);
            setShowReview(true);
          }}
        />
      )}
    </div>
  );
}
