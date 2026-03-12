import "server-only"

export function buildCoachSystemPrompt() {
  return [
    "You are Alicia, a warm children's writing coach for ages 6-12.",
    "Tone: encouraging, simple language, specific, never harsh.",
    "Format feedback into three parts: whatYouWrote, whatWentGreat, tryNextTime.",
    "Return practical next-step advice for the next paragraph/page.",
  ].join(" ")
}

export function buildFeedbackPrompt(input: {
  title: string
  objective: string
  setting: string
  pageNumber: number
  pageContent: string
}) {
  return `Story title: ${input.title}\nObjective: ${input.objective}\nSetting: ${input.setting}\nPage number: ${input.pageNumber}\n\nPage content:\n${input.pageContent}\n\nReturn STRICT JSON with shape:\n{\n  "whatYouWrote": string,\n  "whatWentGreat": string,\n  "tryNextTime": string,\n  "skills": string[]\n}\n\nRules:\n- Keep each field concise and child-friendly.\n- 2-4 short sentences per text field.\n- skills should be 3-5 short tags.`
}

export interface ChatStoryContext {
  title?: string
  objective?: string
  setting?: string
  pageNumber?: number
  characters?: Array<{ name: string; description: string }>
  /** Non-empty pages written so far (up to and including current page). */
  pages?: Array<{ pageNumber: number; content: string }>
  /** Most recent coaching feedback entries (last 3). */
  recentFeedback?: Array<{
    pageNumber: number
    whatWentGreat: string
    tryNextTime: string
  }>
}

export function buildChatSystemPrompt(input: ChatStoryContext) {
  const lines: string[] = [
    "You are Alicia, a children's writing coach for ages 6-12.",
    "Be encouraging, concrete, and brief.",
    "Prefer actionable edits and examples over generic praise.",
    "Keep responses around 3-8 sentences unless user asks for more.",
  ]

  const meta = [
    input.title ? `Title: ${input.title}` : null,
    input.objective ? `Objective: ${input.objective}` : null,
    input.setting ? `Setting: ${input.setting}` : null,
  ].filter(Boolean)
  if (meta.length) {
    lines.push("\n--- STORY ---")
    lines.push(...(meta as string[]))
  }

  if (input.characters?.length) {
    lines.push("\n--- CHARACTERS ---")
    for (const c of input.characters) {
      lines.push(`- ${c.name}: ${c.description}`)
    }
  }

  if (input.pages?.length) {
    lines.push("\n--- PAGES WRITTEN SO FAR ---")
    for (const p of input.pages) {
      const label =
        p.pageNumber === input.pageNumber
          ? `Page ${p.pageNumber} (current - child is actively editing this):`
          : `Page ${p.pageNumber}:`
      lines.push(label)
      lines.push(p.content)
    }
  }

  if (input.recentFeedback?.length) {
    lines.push("\n--- COACHING FEEDBACK SO FAR ---")
    for (const f of input.recentFeedback) {
      lines.push(`Page ${f.pageNumber} feedback:`)
      lines.push(`  What went great: ${f.whatWentGreat}`)
      lines.push(`  Try next time: ${f.tryNextTime}`)
    }
  }

  if (input.pageNumber) {
    lines.push("\n--- NOW ---")
    lines.push(`Child is currently working on page ${input.pageNumber}.`)
  }

  return lines.join("\n")
}

export function buildLiveSystemInstruction() {
  return [
    "You are Alicia, a live voice writing coach for children ages 6-12.",
    "Speak clearly and kindly.",
    "Ask one question at a time and wait for the learner.",
    "Keep replies short and motivating.",
  ].join(" ")
}
