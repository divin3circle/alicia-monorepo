import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { Sparkles } from "lucide-react"

export default function AliciaAIPage() {
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
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Alicia AI</span>
          </nav>
        </header>

        <div className="flex flex-1 flex-col p-6 lg:p-8 max-w-6xl mx-auto w-full">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Alicia AI
            </h1>
            <p className="text-sm text-slate-500">
              Chat and collaborate with your personal AI storyteller.
            </p>
          </div>
          
          <div className="grid gap-6">
            <div className="min-h-[500px] rounded-[2rem] bg-slate-500/5 border border-slate-500/10 flex items-center justify-center p-12 text-center overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-purple-500" />
              <div className="max-w-md relative z-10">
                <div className="size-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="size-10 text-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">The Brain is Warming Up</h3>
                <p className="text-slate-500 leading-relaxed">Alicia is getting ready to help you craft amazing stories. Direct AI interaction will be available here soon.</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
