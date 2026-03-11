import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { Store } from "lucide-react"

export default function MarketplacePage() {
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
            <span className="text-slate-700 dark:text-slate-300 font-medium">Marketplace</span>
          </nav>
        </header>

        <div className="flex flex-1 flex-col p-6 lg:p-8 max-w-6xl mx-auto w-full">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Marketplace
            </h1>
            <p className="text-sm text-slate-500">
              Discover and share amazing AI-generated stories.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="size-20 rounded-[1.5rem] bg-white dark:bg-slate-900 flex items-center justify-center shadow-xl mb-8 border border-purple-500/20">
              <Store className="size-10 text-purple-500" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-slate-100 mb-4 uppercase">Coming Very Soon</h2>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
              We're building a marketplace where creators can showcase their best work and discover new storytelling inspirations.
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
