"use client"

import { useRef, useState } from "react"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { addChatMessage, type AiMessage } from "@/lib/firestore"
import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"
import genAILogo from "@/images/genai.avif"

interface AiChatPanelProps {
  projectId: string
  pageNumber: number
  /** Pre-loaded history filtered to this page (or all history). */
  history: AiMessage[]
  onAppendMessages: (msgs: AiMessage[]) => void
  /** Enables insertable generation actions (project editor only). */
  enableInsertActions?: boolean
  /** Inserts generated text into the current page editor. */
  onInsertText?: (text: string) => Promise<void> | void
  storyContext?: {
    title?: string
    objective?: string
    setting?: string
    characters?: Array<{ name: string; description: string }>
    pages?: Array<{ pageNumber: number; content: string }>
    recentFeedback?: Array<{
      pageNumber: number
      whatWentGreat: string
      tryNextTime: string
    }>
  }
}

export function AiChatPanel({
  projectId,
  pageNumber,
  history,
  onAppendMessages,
  enableInsertActions = false,
  onInsertText,
  storyContext,
}: AiChatPanelProps) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [streamingReply, setStreamingReply] = useState("")
  const [insertingText, setInsertingText] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const isInsertIntent = (text: string) => {
    const lower = text.toLowerCase()
    const asksGenerate =
      /(generate|write|draft|create|suggest|give me|come up with)/.test(lower)
    const asksPageText =
      /(sentence|line|paragraph|text|wording|for this page|for page)/.test(
        lower
      )
    return asksGenerate && asksPageText
  }

  const scrollToBottom = () =>
    endRef.current?.scrollIntoView({ behavior: "smooth" })

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    const shouldMarkInsertable = enableInsertActions && isInsertIntent(text)
    setInput("")
    setLoading(true)

    const userMsg: AiMessage = {
      role: "user",
      content: text,
      pageContext: pageNumber,
      createdAt: null,
    }

    onAppendMessages([userMsg])
    setTimeout(scrollToBottom, 50)

    await addChatMessage(projectId, {
      role: "user",
      content: text,
      pageContext: pageNumber,
    })

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: enableInsertActions ? "project-editor" : "general",
          // Send last 20 messages as conversation context (cost + latency)
          history: history
            .filter((msg) => msg.role === "user" || msg.role === "assistant")
            .slice(-20)
            .map((msg) => ({ role: msg.role, content: msg.content })),
          context: {
            pageNumber,
            ...storyContext,
          },
        }),
      })

      if (!response.ok || !response.body) {
        let details = ""
        try {
          const payload = await response.json()
          details = payload?.error
            ? ` (${payload.error}${payload.requestId ? ` | ${payload.requestId}` : ""})`
            : ""
          console.error("[ai-chat-panel] /api/chat error", payload)
        } catch {
          console.error("[ai-chat-panel] /api/chat error", {
            status: response.status,
            statusText: response.statusText,
          })
        }

        const errorMsg: AiMessage = {
          role: "assistant",
          content: `I hit a temporary issue and couldn't respond${details}. Please try again.`,
          pageContext: pageNumber,
          createdAt: null,
        }
        onAppendMessages([errorMsg])
        setLoading(false)
        setStreamingReply("")
        setTimeout(scrollToBottom, 50)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let aiText = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        aiText += chunk
        setStreamingReply(aiText)
        setTimeout(scrollToBottom, 10)
      }

      aiText = aiText.trim()

      if (!aiText) {
        setLoading(false)
        setStreamingReply("")
        return
      }

      const aiMsg: AiMessage = {
        role: "assistant",
        content: aiText,
        insertableText: shouldMarkInsertable ? aiText : undefined,
        pageContext: pageNumber,
        createdAt: null,
      }

      await addChatMessage(projectId, {
        role: "assistant",
        content: aiText,
        insertableText: shouldMarkInsertable ? aiText : undefined,
        pageContext: pageNumber,
      })

      onAppendMessages([aiMsg])
      setLoading(false)
      setStreamingReply("")
      setTimeout(scrollToBottom, 50)
    } catch (error) {
      const errorMsg: AiMessage = {
        role: "assistant",
        content:
          "I couldn't reach the AI service right now. Please try again in a moment.",
        pageContext: pageNumber,
        createdAt: null,
      }
      onAppendMessages([errorMsg])
      console.error("[ai-chat-panel] unexpected chat failure", error)
      setLoading(false)
      setStreamingReply("")
      setTimeout(scrollToBottom, 50)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <Image
          src={genAILogo}
          alt="Alicia"
          width={28}
          height={28}
          className="rounded-full"
        />
        <span className="text-sm font-semibold">Alicia — Writing Coach</span>
      </div>

      <ScrollArea className="flex-1 overflow-scroll px-4 py-3">
        <div className="flex flex-col gap-3">
          {history.length === 0 && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Hi! I&apos;m Alicia 👋 Ask me anything about your story.
            </p>
          )}
          {history.map((msg, i) => {
            const prevPage =
              i > 0 ? (history[i - 1]?.pageContext ?? null) : null
            const showPageBadge =
              msg.pageContext !== null && msg.pageContext !== prevPage && i > 0

            return (
              <div key={i}>
                {showPageBadge && (
                  <div className="my-2 flex items-center gap-2">
                    <div className="h-px flex-1 bg-border/50" />
                    <span className="text-[10px] text-muted-foreground">
                      Page {msg.pageContext}
                    </span>
                    <div className="h-px flex-1 bg-border/50" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "ml-auto bg-foreground text-background"
                      : "mr-auto bg-muted text-foreground"
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === "assistant" &&
                  msg.insertableText &&
                  enableInsertActions &&
                  onInsertText && (
                    <div className="mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={insertingText === msg.insertableText}
                        onClick={async () => {
                          const textToInsert = msg.insertableText
                          if (!textToInsert) return
                          setInsertingText(textToInsert)
                          try {
                            await onInsertText(textToInsert)
                          } finally {
                            setInsertingText(null)
                          }
                        }}
                      >
                        {insertingText === msg.insertableText
                          ? "Inserting…"
                          : "Insert into page"}
                      </Button>
                    </div>
                  )}
              </div>
            )
          })}
          {streamingReply && (
            <div className="mr-auto rounded-xl bg-muted px-3 py-2 text-sm text-foreground">
              {streamingReply}
            </div>
          )}
          {loading && (
            <div className="mr-auto animate-pulse rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
              Alicia is thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="flex items-center gap-2 border-t border-border/50 px-4 py-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask Alicia…"
          className="flex-1"
          disabled={loading}
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="bg-foreground text-background disabled:hidden"
        >
          Send
        </Button>
      </div>
    </div>
  )
}
