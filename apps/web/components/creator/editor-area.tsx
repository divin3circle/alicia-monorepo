"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { updatePage } from "@/lib/firestore"
import { cn } from "@workspace/ui/lib/utils"

interface EditorAreaProps {
  projectId: string
  pageNumber: number
  initialContent: string
  initialStatus: "empty" | "draft" | "done" | "reviewed"
  /** True when this page triggers the Gibbs review (pages 3, 6, 9, 12) */
  isMilestone?: boolean
  /** True when this is the very last page */
  isLastPage?: boolean
  onDone: () => void
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function EditorArea({
  projectId,
  pageNumber,
  initialContent,
  initialStatus,
  isMilestone = false,
  isLastPage = false,
  onDone,
}: EditorAreaProps) {
  const [content, setContent] = useState(initialContent)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle"
  )
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wordCount = countWords(content)

  // Reset local state whenever the page changes
  useEffect(() => {
    setContent(initialContent)
    setSaveState("idle")
  }, [pageNumber, initialContent])

  const persist = useCallback(
    async (text: string) => {
      setSaveState("saving")
      const wc = countWords(text)
      await updatePage(projectId, pageNumber, {
        content: text,
        status: text.trim() ? "draft" : "empty",
        wordCount: wc,
      })
      setSaveState("saved")
      setTimeout(() => setSaveState("idle"), 2000)
    },
    [projectId, pageNumber]
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setContent(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => persist(val), 1000)
  }

  const handleDone = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    await updatePage(projectId, pageNumber, {
      content,
      status: "done",
      wordCount: countWords(content),
    })
    onDone()
  }

  // Pages that have been submitted can still be edited (kids need to fix typos
  // and revise earlier content — locking them out is frustrating). The submit
  // button simply hides once a page has been moved forward.
  const isSubmitted = initialStatus === "done" || initialStatus === "reviewed"

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Page {pageNumber}{" "}
          <span className="text-sm font-normal text-muted-foreground">
            of 12
          </span>
        </h2>
        <span
          className={cn(
            "text-xs transition-opacity",
            saveState === "idle" && "opacity-0",
            saveState === "saving" && "text-muted-foreground opacity-70",
            saveState === "saved" && "text-emerald-500 opacity-100"
          )}
        >
          {saveState === "saving" ? "Saving…" : "Saved ✓"}
        </span>
      </div>

      {/* Textarea — always editable so kids can revise earlier pages */}
      <Textarea
        id={`page-editor-${pageNumber}`}
        value={content}
        onChange={handleChange}
        placeholder="Start writing your story here…"
        className="min-h-[260px] flex-1 resize-none text-base leading-relaxed focus-visible:ring-primary/40"
      />

      {/* Footer row */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-muted-foreground">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
        {/* Only show the advance button while the page hasn't been submitted */}
        {!isSubmitted && (
          <Button
            onClick={handleDone}
            disabled={!content.trim()}
            className="bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isLastPage
              ? "Finish Story 🎊"
              : isMilestone
                ? "Get Feedback ✨"
                : "Next Page →"}
          </Button>
        )}
      </div>
    </div>
  )
}
