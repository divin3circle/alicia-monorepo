import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { NewProjectForm } from "@/components/creator/new-project-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function NewProjectPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "17rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b border-slate-500/10">
          <SidebarTrigger className="-ml-1 text-slate-400 hover:text-slate-900" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <nav className="flex items-center gap-1 text-xs text-slate-400">
            <Link href="/creator" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Creator Studio
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">New Project</span>
          </nav>
        </header>

        {/* Body */}
        <div className="flex flex-1 flex-col p-6 lg:p-8">
          {/* Page heading */}
          <div className="mb-8 max-w-2xl mx-auto w-full">
            <Link
              href="/creator"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mb-4"
            >
              <ChevronLeft className="size-3.5" />
              Back to Creator Studio
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              New Story Project
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Tell us about your story — we&apos;ll use it to build your book.
            </p>
          </div>
          <NewProjectForm />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
