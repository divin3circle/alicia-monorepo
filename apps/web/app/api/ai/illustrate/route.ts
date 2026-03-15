import { NextResponse } from "next/server"

import { GEMINI_IMAGE_MODEL, getGeminiClient } from "@/lib/ai/gemini"

type IllustrateRequest = {
  pageText?: string
  pageNumber?: number
  storyTitle?: string
}

function buildIllustrationPrompt(input: {
  pageText: string
  pageNumber: number
  storyTitle: string
}) {
  return [
    "Create a single children's storybook illustration.",
    "Style: whimsical, hand-painted 2D animation, soft watercolor textures, warm cinematic lighting, expressive characters, nature-rich backgrounds, inspired by classic Japanese fantasy animation aesthetics.",
    "Avoid logos, signatures, watermarks, and visible text in the image.",
    "Composition: clear focal subject, readable for children ages 6-12, emotionally gentle tone.",
    `Story title: ${input.storyTitle}`,
    `Page number: ${input.pageNumber}`,
    `Scene to illustrate: ${input.pageText}`,
  ].join("\n")
}

function extractImagePart(
  response: unknown
): { mimeType: string; data: string } | null {
  const candidates = (
    response as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }>
        }
      }>
    }
  )?.candidates

  const parts = (candidates ?? []).flatMap(
    (candidate) => candidate.content?.parts ?? []
  )
  const imagePart = parts.find(
    (part) =>
      part.inlineData?.data &&
      part.inlineData?.mimeType &&
      part.inlineData.mimeType.startsWith("image/")
  )

  if (imagePart?.inlineData?.data) {
    return {
      mimeType: imagePart.inlineData.mimeType ?? "image/png",
      data: imagePart.inlineData.data,
    }
  }

  const flatData = (response as { data?: string }).data
  if (flatData) {
    return { mimeType: "image/png", data: flatData }
  }

  return null
}

export const runtime = "nodejs"

export async function POST(req: Request) {
  const requestId = crypto.randomUUID()

  try {
    const body = (await req.json()) as IllustrateRequest

    const pageText = body.pageText?.trim()
    const pageNumber = body.pageNumber
    const storyTitle = body.storyTitle?.trim() || "Untitled Story"

    if (!pageText || !pageNumber) {
      return NextResponse.json(
        { error: "pageText and pageNumber are required", requestId },
        { status: 400 }
      )
    }

    console.info("[api/ai/illustrate] request received", {
      requestId,
      model: GEMINI_IMAGE_MODEL,
      pageNumber,
      textLength: pageText.length,
    })

    const ai = getGeminiClient()
    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: buildIllustrationPrompt({
        pageText,
        pageNumber,
        storyTitle,
      }),
      config: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: "4:3",
        },
      },
    })

    const image = extractImagePart(response)
    if (!image) {
      console.error("[api/ai/illustrate] no image returned", {
        requestId,
        model: GEMINI_IMAGE_MODEL,
      })
      return NextResponse.json(
        {
          error: "No image was returned by Gemini.",
          requestId,
        },
        { status: 502 }
      )
    }

    console.info("[api/ai/illustrate] image generated", {
      requestId,
      mimeType: image.mimeType,
      bytesBase64: image.data.length,
    })

    return NextResponse.json({
      imageUrl: `data:${image.mimeType};base64,${image.data}`,
      requestId,
    })
  } catch (error) {
    console.error("[api/ai/illustrate] generation failed", {
      requestId,
      error,
    })
    const message =
      error instanceof Error ? error.message : "Failed to generate illustration"
    return NextResponse.json({ error: message, requestId }, { status: 500 })
  }
}
