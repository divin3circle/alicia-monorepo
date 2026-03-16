import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { Bell } from "lucide-react"
import { RestrictedAccessGuard } from "@/components/auth/restricted-access-guard"

export default function NotificationsPage() {
  return (
    <RestrictedAccessGuard areaLabel="Notifications">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "17rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-500/10 px-4">
            <SidebarTrigger className="-ml-1 text-slate-400 hover:text-slate-900" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <nav className="flex items-center gap-1 text-xs text-slate-400">
              <span>Dashboard</span>
              <span>/</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Notifications
              </span>
            </nav>
          </header>

          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Notifications
              </h1>
              <p className="text-sm text-slate-500">
                Stay updated with your latest storytelling activities.
              </p>
            </div>

            <div className="space-y-4">
              <div className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                  <Bell className="size-5 text-amber-500" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                    Welcome to Alicia Dashboard
                  </p>
                  <p className="mb-2 text-xs text-slate-500">
                    You've successfully set up your workspace. Start creating
                    magical stories now!
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Just now
                  </p>
                </div>
              </div>

              <div className="p-12 text-center opacity-40">
                <p className="text-sm text-slate-500">End of notifications</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RestrictedAccessGuard>
  )
}
