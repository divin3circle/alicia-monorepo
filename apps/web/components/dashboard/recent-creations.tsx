"use client"

import { Clock, ChevronDown } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

type StoryStatus = "Waiting Review" | "Being Edited" | "Revision" | "Approved"

interface Story {
  id: string
  title: string
  status: StoryStatus
  lastEdited: string
  author: string
  thumbnail: string
}

const statusConfig: Record<StoryStatus, { color: string; dot: string }> = {
  "Waiting Review": { color: "bg-pink-500/15 text-pink-600 dark:text-pink-400", dot: "bg-pink-500" },
  "Being Edited":   { color: "bg-blue-500/15 text-blue-600 dark:text-blue-400",   dot: "bg-blue-500" },
  "Revision":       { color: "bg-amber-500/15 text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  "Approved":       { color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
}

const sampleStories: Story[] = [
  {
    id: "1",
    title: "The Dragon Who Was Afraid of Loud Noises",
    status: "Waiting Review",
    lastEdited: "5 min ago",
    author: "Alex Kim",
    thumbnail: "from-purple-400 to-blue-500",
  },
  {
    id: "2",
    title: "Luna and the Secret Garden of Stars",
    status: "Being Edited",
    lastEdited: "20 min ago",
    author: "Jamie Lee",
    thumbnail: "from-emerald-400 to-teal-500",
  },
  {
    id: "3",
    title: "Captain Pepper's Ocean Adventure",
    status: "Revision",
    lastEdited: "1 hour ago",
    author: "Sam Rivera",
    thumbnail: "from-amber-400 to-orange-500",
  },
  {
    id: "4",
    title: "The Robot Who Learned to Dream",
    status: "Approved",
    lastEdited: "Yesterday",
    author: "Jordan Park",
    thumbnail: "from-pink-400 to-rose-500",
  },
  {
    id: "5",
    title: "Mia's Adventures in the Enchanted Library",
    status: "Being Edited",
    lastEdited: "2 hours ago",
    author: "Casey Chen",
    thumbnail: "from-violet-400 to-purple-500",
  },
  {
    id: "6",
    title: "The Tiny Seed That Wanted to Touch the Sky",
    status: "Approved",
    lastEdited: "3 days ago",
    author: "Dakota Mills",
    thumbnail: "from-green-400 to-emerald-500",
  },
]

function StoryCard({ story }: { story: Story }) {
  const { color, dot } = statusConfig[story.status]

  return (
    <div className="group rounded-2xl border border-slate-500/10 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md hover:border-slate-500/20 transition-all cursor-pointer">
      {/* Thumbnail */}
      <div className={cn("h-36 bg-gradient-to-br", story.thumbnail, "relative")}>
        <div className="absolute inset-0 bg-black/10" />
        {/* Status badge in corner */}
        <div className="absolute top-3 left-3">
          <span className={cn("flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm bg-white/90 dark:bg-slate-900/90", color)}>
            <span className={cn("size-1.5 rounded-full", dot)} />
            {story.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug mb-2 line-clamp-2">
          {story.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="size-3" />
          <span>Edited {story.lastEdited}</span>
          <span>·</span>
          <div className="size-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[8px] font-bold text-white">
            {story.author.charAt(0)}
          </div>
          <span>{story.author}</span>
        </div>
      </div>
    </div>
  )
}

export function RecentCreations() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Recent Creations</h2>
        <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          Last viewed by me <ChevronDown className="size-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  )
}
