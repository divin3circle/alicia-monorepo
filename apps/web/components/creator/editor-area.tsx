"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { updatePage } from "@/lib/firestore";
import { cn } from "@workspace/ui/lib/utils";

interface EditorAreaProps {
  projectId: string;
  pageNumber: number;
  initialContent: string;
  initialStatus: "empty" | "draft" | "done" | "reviewed";
  onDone: () => void;
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function EditorArea({
  projectId,
  pageNumber,
  initialContent,
  initialStatus,
  onDone,
}: EditorAreaProps) {
  const [content, setContent] = useState(initialContent);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordCount = countWords(content);

  // Reset local state whenever the page changes
  useEffect(() => {
    setContent(initialContent);
    setSaveState("idle");
  }, [pageNumber, initialContent]);

  const persist = useCallback(
    async (text: string) => {
      setSaveState("saving");
      const wc = countWords(text);
      await updatePage(projectId, pageNumber, {
        content: text,
        status: text.trim() ? "draft" : "empty",
        wordCount: wc,
      });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    },
    [projectId, pageNumber]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => persist(val), 1000);
  };

  const handleDone = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await updatePage(projectId, pageNumber, {
      content,
      status: "done",
      wordCount: countWords(content),
    });
    onDone();
  };

  const isDone = initialStatus === "done" || initialStatus === "reviewed";

  return (
    <div className="flex flex-col flex-1 min-h-0 p-4 gap-4">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Page {pageNumber}{" "}
          <span className="text-muted-foreground font-normal text-sm">
            of 12
          </span>
        </h2>
        <span
          className={cn(
            "text-xs transition-opacity",
            saveState === "idle" && "opacity-0",
            saveState === "saving" && "opacity-70 text-muted-foreground",
            saveState === "saved" && "opacity-100 text-emerald-500"
          )}
        >
          {saveState === "saving" ? "Saving…" : "Saved ✓"}
        </span>
      </div>

      {/* Textarea */}
      <Textarea
        id={`page-editor-${pageNumber}`}
        value={content}
        onChange={handleChange}
        disabled={isDone}
        placeholder="Start writing your story here…"
        className="flex-1 resize-none text-base leading-relaxed min-h-[260px] focus-visible:ring-primary/40"
      />

      {/* Footer row */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-muted-foreground">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
        <Button
          onClick={handleDone}
          disabled={isDone || !content.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
        >
          I&apos;m Done with This Page →
        </Button>
      </div>
    </div>
  );
}
