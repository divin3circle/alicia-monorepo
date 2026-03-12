"use client"

import { useRef, useState, type CSSProperties } from "react"
import Image from "next/image"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { Send, Sparkles } from "lucide-react"
import genAILogo from "@/images/genai.avif"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export default function AliciaAIPage() {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ]
    setInput("")
    setMessages(nextMessages)
    setLoading(true)
    setTimeout(scrollToBottom, 30)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages,
        }),
      })

      if (!response.ok || !response.body) {
        let details = ""
        try {
          const payload = await response.json()
          details = payload?.error
            ? ` (${payload.error}${payload.requestId ? ` | ${payload.requestId}` : ""})`
            : ""
          console.error("[ai/page] /api/chat error", payload)
        } catch {
          console.error("[ai/page] /api/chat error", {
            status: response.status,
            statusText: response.statusText,
          })
        }
        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content: `I hit a temporary issue and couldn't respond${details}. Please try again.`,
          },
        ])
        setLoading(false)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let reply = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        reply += decoder.decode(value, { stream: true })
        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content: reply,
          },
        ])
        setTimeout(scrollToBottom, 10)
      }
    } catch (error) {
      console.error("[ai/page] unexpected chat failure", error)
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "I couldn't reach the AI service right now. Please try again in a moment.",
        },
      ])
    } finally {
      setLoading(false)
      setTimeout(scrollToBottom, 30)
    }
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "17rem" } as CSSProperties}>
      <AppSidebar />
      <SidebarInset>
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
              Alicia AI
            </span>
          </nav>
        </header>

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 md:px-8 md:py-8">
          <div className="mb-6 flex items-center gap-3">
            <Image
              src={genAILogo}
              alt="Alicia"
              width={30}
              height={30}
              className="rounded-full"
            />
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Alicia
              </h1>
              <p className="text-xs text-slate-500">Your AI writing coach</p>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <ScrollArea className="flex-1 px-4 py-5 md:px-8">
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
                {messages.length === 0 && (
                  <div className="mt-10 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Sparkles className="h-7 w-7 text-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      How can Alicia help today?
                    </h2>
                    <p className="mt-2 max-w-lg text-sm text-slate-500">
                      Ask for story ideas, page rewrites, stronger dialogue, or
                      emotional pacing suggestions.
                    </p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex w-full",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        message.role === "user"
                          ? "bg-foreground text-background"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                      Alicia is thinking…
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>
            </ScrollArea>

            <div className="px-4 py-4 md:px-6">
              <div className="mx-auto flex w-full max-w-3xl items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Message Alicia..."
                  disabled={loading}
                  className="h-11 rounded-xl"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  size="icon"
                  className="h-11 w-11 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mx-auto mt-2 w-full max-w-3xl text-center text-[11px] text-slate-400">
                Alicia can make mistakes. Review important details.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
