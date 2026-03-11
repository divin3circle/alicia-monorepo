import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { Library } from "lucide-react"

export default function AssetsPage() {
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
            <span className="text-slate-700 dark:text-slate-300 font-medium">Assets</span>
          </nav>
        </header>

        <div className="flex flex-1 flex-col p-6 lg:p-8 max-w-6xl mx-auto w-full">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Assets Library
            </h1>
            <p className="text-sm text-slate-500">
              Your collection of characters, worlds, and media.
            </p>
          </div>
          
          <div className="grid gap-6">
            <div className="bg-slate-500/5 rounded-3xl p-8 border border-slate-500/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="size-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                  <Library className="size-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Library is Empty</h3>
                  <p className="text-sm text-slate-500">Create your first project to populate your asset library.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-slate-200 dark:border-slate-800" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
