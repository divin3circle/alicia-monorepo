import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { Settings, User, Bell, Palette, Shield } from "lucide-react"
import { RestrictedAccessGuard } from "@/components/auth/restricted-access-guard"

export default function SettingsPage() {
  return (
    <RestrictedAccessGuard areaLabel="Settings">
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
                Settings
              </span>
            </nav>
          </header>

          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Settings
              </h1>
              <p className="text-sm text-slate-500">
                Manage your account and preferences.
              </p>
            </div>

            <div className="space-y-1">
              {[
                {
                  icon: User,
                  label: "Profile Information",
                  desc: "Update your name, email and avatar",
                },
                {
                  icon: Palette,
                  label: "Appearance",
                  desc: "Customize how Alicia looks on your screen",
                },
                {
                  icon: Bell,
                  label: "Notifications",
                  desc: "Configure your alert preferences",
                },
                {
                  icon: Shield,
                  label: "Privacy & Security",
                  desc: "Manage your data and security settings",
                },
              ].map((item) => (
                <button
                  key={item.label}
                  className="group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-white dark:bg-slate-800 dark:group-hover:bg-slate-700">
                    <item.icon className="size-5 text-slate-500 transition-colors group-hover:text-amber-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RestrictedAccessGuard>
  )
}
