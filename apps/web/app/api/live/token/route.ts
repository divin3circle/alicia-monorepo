import { NextResponse } from "next/server"

import { GEMINI_LIVE_MODEL, getGeminiClient } from "@/lib/ai/gemini"
import { buildLiveSystemInstruction } from "@/lib/ai/prompts"

export const runtime = "nodejs"

type EphemeralTokenResult = {
  name?: string
  expireTime?: string
  newSessionExpireTime?: string
}

export async function POST() {
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
      return NextResponse.json(
        {
          error: "Live token provisioning is unavailable in current SDK client",
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
            responseModalities: ["AUDIO"],
            temperature: 0.7,
            systemInstruction: buildLiveSystemInstruction(),
          },
        },
      },
    })

    if (!token?.name) {
      return NextResponse.json(
        { error: "Gemini did not return an ephemeral token" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      token: token.name,
      model: GEMINI_LIVE_MODEL,
      expireTime: token.expireTime,
      newSessionExpireTime: token.newSessionExpireTime,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create live token"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
