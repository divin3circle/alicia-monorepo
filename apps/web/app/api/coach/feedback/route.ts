import { NextResponse } from "next/server"

import { GEMINI_TEXT_MODEL, getGeminiClient } from "@/lib/ai/gemini"
import { buildCoachSystemPrompt, buildFeedbackPrompt } from "@/lib/ai/prompts"

type FeedbackRequest = {
  title?: string
  objective?: string
  setting?: string
  pageNumber?: number
  pageContent?: string
}

type FeedbackResponse = {
  whatYouWrote: string
  whatWentGreat: string
  tryNextTime: string
  skills: string[]
}

export const runtime = "nodejs"

function parseJson(text: string): FeedbackResponse {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")

  const parsed = JSON.parse(cleaned) as Partial<FeedbackResponse>

  return {
    whatYouWrote:
      parsed.whatYouWrote ??
      "You built a clear moment in your story and moved the scene forward.",
    whatWentGreat:
      parsed.whatWentGreat ??
      "Your writing has strong imagery and a clear character voice.",
    tryNextTime:
      parsed.tryNextTime ??
      "Add one extra sensory detail and one feeling word in the next part.",
    skills: parsed.skills?.filter((skill) => typeof skill === "string") ?? [
      "Story voice",
      "Character detail",
      "Scene clarity",
    ],
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as FeedbackRequest

    if (!body.pageContent?.trim()) {
      return NextResponse.json(
        { error: "pageContent is required" },
        { status: 400 }
      )
    }

    const system = buildCoachSystemPrompt()
    const prompt = buildFeedbackPrompt({
      title: body.title ?? "Untitled story",
      objective: body.objective ?? "",
      setting: body.setting ?? "",
      pageNumber: body.pageNumber ?? 1,
      pageContent: body.pageContent,
    })

    const ai = getGeminiClient()
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: system,
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    })

    const text = response.text ?? "{}"
    return NextResponse.json(parseJson(text))
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate feedback"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
