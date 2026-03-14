import { NextResponse } from "next/server"

import { GEMINI_LIVE_MODEL, getGeminiClient } from "@/lib/ai/gemini"
import {
  buildLiveSystemInstruction,
  type ChatStoryContext,
} from "@/lib/ai/prompts"

export const runtime = "nodejs"

type EphemeralTokenResult = {
  name?: string
  expireTime?: string
  newSessionExpireTime?: string
}

type LiveTokenRequest = {
  context?: ChatStoryContext
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID()
  const startedAt = Date.now()

  let body: LiveTokenRequest = {}
  try {
    body = (await req.json()) as LiveTokenRequest
  } catch {
    body = {}
  }

  console.info("[api/live/token] request received", {
    requestId,
    model: GEMINI_LIVE_MODEL,
  })

  try {
    const ai = getGeminiClient({ apiVersion: "v1alpha" }) as unknown as {
      authTokens?: {
        create: (payload: unknown) => Promise<EphemeralTokenResult>
      }
      auth_tokens?: {
        create: (payload: unknown) => Promise<EphemeralTokenResult>
      }
    }

    const authApi = ai.authTokens ?? ai.auth_tokens
    if (!authApi?.create) {
      console.error("[api/live/token] auth token API unavailable", {
        requestId,
      })
      return NextResponse.json(
        {
          error: "Live token provisioning is unavailable in current SDK client",
          requestId,
        },
        { status: 500 }
      )
    }

    const now = Date.now()
    const expireTime = new Date(now + 30 * 60 * 1000).toISOString()
    const newSessionExpireTime = new Date(now + 60 * 1000).toISOString()

    const token = await authApi.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime,
        liveConnectConstraints: {
          model: GEMINI_LIVE_MODEL,
          config: {
            responseModalities: ["AUDIO", "TEXT"],
            temperature: 0.7,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: buildLiveSystemInstruction(body.context),
          },
        },
      },
    })

    if (!token?.name) {
      console.error("[api/live/token] token missing in provider response", {
        requestId,
      })
      return NextResponse.json(
        { error: "Gemini did not return an ephemeral token", requestId },
        { status: 500 }
      )
    }

    console.info("[api/live/token] token issued", {
      requestId,
      model: GEMINI_LIVE_MODEL,
      durationMs: Date.now() - startedAt,
      expireTime: token.expireTime,
      newSessionExpireTime: token.newSessionExpireTime,
      mode: "token_issued (client is responsible for live websocket audio streaming)",
    })

    return NextResponse.json({
      token: token.name,
      model: GEMINI_LIVE_MODEL,
      expireTime: token.expireTime,
      newSessionExpireTime: token.newSessionExpireTime,
      requestId,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create live token"
    console.error("[api/live/token] request failed", {
      requestId,
      durationMs: Date.now() - startedAt,
      error,
    })
    return NextResponse.json({ error: message, requestId }, { status: 500 })
  }
}
