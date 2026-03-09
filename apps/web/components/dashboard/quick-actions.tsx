"use client"

import { Sparkles, FolderPlus, PenLine } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

const actions = [
  {
    icon: Sparkles,
    title: "Generate Story",
    description: "Create a personalized story with AI in seconds",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    hoverBorder: "hover:border-purple-500/40",
  },
  {
    icon: FolderPlus,
    title: "Create Project",
    description: "Start a new story collection or series",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    hoverBorder: "hover:border-amber-500/40",
  },
  {
    icon: PenLine,
    title: "Write Manually",
    description: "Put your imagination to words directly",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/40",
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {actions.map((action) => (
        <button
          key={action.title}
          className={cn(
            "flex items-center gap-4 p-4 rounded-2xl border-2 bg-white dark:bg-slate-900 text-left transition-all hover:shadow-sm cursor-pointer",
            action.border,
            action.hoverBorder
          )}
        >
          <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", action.bg)}>
            <action.icon className={cn("size-5", action.color)} />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{action.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{action.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
