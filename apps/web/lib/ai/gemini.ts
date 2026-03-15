import "server-only"

import { GoogleGenAI } from "@google/genai"

export const GEMINI_TEXT_MODEL =
  process.env.GEMINI_TEXT_MODEL ?? "gemini-2.5-flash"

export const GEMINI_LIVE_MODEL =
  process.env.GEMINI_LIVE_MODEL ??
  "gemini-2.5-flash-native-audio-preview-12-2025"

export const GEMINI_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image"

function requireGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Set it in apps/web/.env")
  }
  return apiKey
}

export function getGeminiClient(options?: { apiVersion?: string }) {
  const apiKey = requireGeminiApiKey()

  if (options?.apiVersion) {
    return new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: options.apiVersion },
    })
  }

  return new GoogleGenAI({ apiKey })
}
