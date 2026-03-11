import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { Bell } from "lucide-react"

export default function NotificationsPage() {
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
            <span className="text-slate-700 dark:text-slate-300 font-medium">Notifications</span>
          </nav>
        </header>

        <div className="flex flex-1 flex-col p-6 lg:p-8 max-w-6xl mx-auto w-full">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Notifications
            </h1>
            <p className="text-sm text-slate-500">
              Stay updated with your latest storytelling activities.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
              <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Bell className="size-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Welcome to Alicia Dashboard</p>
                <p className="text-xs text-slate-500 mb-2">You've successfully set up your workspace. Start creating magical stories now!</p>
                <p className="text-[10px] uppercase font-bold text-slate-400">Just now</p>
              </div>
            </div>
            
            <div className="p-12 text-center opacity-40">
              <p className="text-sm text-slate-500">End of notifications</p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
