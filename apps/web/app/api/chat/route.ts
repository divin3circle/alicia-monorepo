import { NextResponse } from "next/server"

import { GEMINI_TEXT_MODEL, getGeminiClient } from "@/lib/ai/gemini"
import { buildChatSystemPrompt, type ChatStoryContext } from "@/lib/ai/prompts"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type ChatRequest = {
  message?: string
  history?: ChatMessage[]
  context?: ChatStoryContext
  mode?: "project-editor" | "general"
}

export const runtime = "nodejs"

function toConversationText(history: ChatMessage[]) {
  return history
    .slice(-12)
    .map((msg) => `${msg.role === "user" ? "User" : "Alicia"}: ${msg.content}`)
    .join("\n")
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID()

  try {
    const body = (await req.json()) as ChatRequest
    const message = body.message?.trim()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required", requestId },
        { status: 400 }
      )
    }

    const history = body.history ?? []

    console.info("[api/chat] request received", {
      requestId,
      model: GEMINI_TEXT_MODEL,
      messageLength: message.length,
      historyCount: history.length,
      pageNumber: body.context?.pageNumber,
    })

    const system = buildChatSystemPrompt(body.context ?? {})
    const insertModeInstruction =
      body.mode === "project-editor"
        ? `\n\nSpecial output rule for editor assist:\nIf the user explicitly asks you to generate or draft text for the current page, respond with ONLY the exact text to insert (no intro, no explanation, no bullet labels).\nFor all other requests, respond normally as Alicia.`
        : ""

    const prompt = `${system}${insertModeInstruction}\n\nConversation so far:\n${toConversationText(history)}\n\nUser: ${message}\nAlicia:`

    const ai = getGeminiClient()

    let streamResult: Awaited<
      ReturnType<typeof ai.models.generateContentStream>
    >
    try {
      streamResult = await ai.models.generateContentStream({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      })
    } catch (error) {
      console.error("[api/chat] stream init failed", {
        requestId,
        model: GEMINI_TEXT_MODEL,
        error,
      })
      const message =
        error instanceof Error ? error.message : "Failed to start chat stream"
      return NextResponse.json(
        {
          error: message,
          requestId,
        },
        { status: 500 }
      )
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of streamResult) {
            const text = chunk.text ?? ""
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
          console.info("[api/chat] stream complete", { requestId })
        } catch (error) {
          console.error("[api/chat] stream read failed", {
            requestId,
            error,
          })
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    })
  } catch (error) {
    console.error("[api/chat] request failed", {
      requestId,
      error,
    })
    const message =
      error instanceof Error ? error.message : "Failed to stream chat response"
    return NextResponse.json({ error: message, requestId }, { status: 500 })
  }
}
