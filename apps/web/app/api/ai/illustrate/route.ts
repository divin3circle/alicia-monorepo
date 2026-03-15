import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"

import { GEMINI_IMAGE_MODEL, getGeminiClient } from "@/lib/ai/gemini"
import { getAdminStorage } from "@/lib/firebase-admin"

type IllustrateRequest = {
  projectId?: string
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

function sanitizeForPath(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

async function uploadImageToStorage(input: {
  projectId: string
  pageNumber: number
  mimeType: string
  base64Data: string
}) {
  const storage = getAdminStorage()
  const bucket = storage.bucket()
  const extension = input.mimeType.split("/")[1] || "png"
  const filePath = `projects/${input.projectId}/illustrations/page-${input.pageNumber}-${randomUUID()}.${extension}`
  const file = bucket.file(filePath)
  const downloadToken = randomUUID()

  const bytes = Buffer.from(input.base64Data, "base64")
  await file.save(bytes, {
    contentType: input.mimeType,
    metadata: {
      cacheControl: "public, max-age=31536000, immutable",
      metadata: {
        firebaseStorageDownloadTokens: downloadToken,
      },
    },
    resumable: false,
  })

  const encodedPath = encodeURIComponent(filePath)
  const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`

  return downloadUrl
}

export async function POST(req: Request) {
  const requestId = randomUUID()

  try {
    const body = (await req.json()) as IllustrateRequest

    const projectId = body.projectId?.trim()
    const pageText = body.pageText?.trim()
    const pageNumber = body.pageNumber
    const storyTitle = body.storyTitle?.trim() || "Untitled Story"

    if (!projectId || !pageText || !pageNumber) {
      return NextResponse.json(
        {
          error: "projectId, pageText and pageNumber are required",
          requestId,
        },
        { status: 400 }
      )
    }

    console.info("[api/ai/illustrate] request received", {
      requestId,
      model: GEMINI_IMAGE_MODEL,
      pageNumber,
      textLength: pageText.length,
      projectId,
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

    const storageProjectId = sanitizeForPath(projectId)
    const imageUrl = await uploadImageToStorage({
      projectId: storageProjectId,
      pageNumber,
      mimeType: image.mimeType,
      base64Data: image.data,
    })

    console.info("[api/ai/illustrate] image uploaded", {
      requestId,
      projectId: storageProjectId,
      pageNumber,
    })

    return NextResponse.json({
      imageUrl,
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
