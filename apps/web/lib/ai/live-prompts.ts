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

export function buildLiveSystemInstruction(input?: ChatStoryContext) {
  const lines: string[] = [
    "You are Alicia, a live voice writing coach for children ages 6-12.",
    "Speak clearly and kindly.",
    "Ask one question at a time and wait for the learner.",
    "Keep replies short and motivating.",
  ]

  if (!input) return lines.join(" ")

  const meta = [
    input.title ? `Story title: ${input.title}` : null,
    input.objective ? `Objective: ${input.objective}` : null,
    input.setting ? `Setting: ${input.setting}` : null,
    input.pageNumber ? `Current page: ${input.pageNumber}` : null,
  ].filter(Boolean)

  if (meta.length) {
    lines.push("\nStory context:")
    lines.push(...(meta as string[]))
  }

  if (input.characters?.length) {
    lines.push("\nCharacters:")
    for (const character of input.characters.slice(0, 8)) {
      lines.push(`- ${character.name}: ${character.description}`)
    }
  }

  if (input.pages?.length) {
    lines.push("\nRecent written pages:")
    for (const page of input.pages.slice(-4)) {
      const snippet = page.content.trim().slice(0, 280)
      lines.push(`- Page ${page.pageNumber}: ${snippet}`)
    }
  }

  if (input.recentFeedback?.length) {
    lines.push("\nRecent coaching feedback:")
    for (const feedback of input.recentFeedback.slice(-3)) {
      lines.push(
        `- Page ${feedback.pageNumber}: Great: ${feedback.whatWentGreat} | Next: ${feedback.tryNextTime}`
      )
    }
  }

  return lines.join("\n")
}
