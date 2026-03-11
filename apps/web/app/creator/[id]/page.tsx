"use client"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function NewProjectPage() {
    const params = useParams();
    const { id } = params;
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
       <div>
            <h1>Project Page: {id}</h1>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
