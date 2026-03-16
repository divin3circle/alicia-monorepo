"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Video,
  Sparkles,
  Bell,
  Settings,
  Library,
  Store,
  Hexagon,
  Plus,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { useAuth } from "@/lib/auth-context"
import { getUserProjects, type StoryProject } from "@/lib/firestore"

const data = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Creator Studio",
      url: "/creator",
      icon: Video,
    },
    {
      title: "Alicia AI",
      url: "/ai",
      icon: Sparkles,
    },
    {
      title: "Assets",
      url: "/assets",
      icon: Library,
    },
    {
      title: "Marketplace",
      url: "/marketplace",
      icon: Store,
    },
  ],
  secondary: [
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { user, signOut } = useAuth()
  const [projects, setProjects] = React.useState<StoryProject[]>([])

  React.useEffect(() => {
    if (!user) {
      setProjects([])
      return
    }

    getUserProjects(user.uid)
      .then((items) => setProjects(items.slice(0, 3)))
      .catch(() => setProjects([]))
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut()
      router.replace("/")
    } catch (error) {
      console.error("[AppSidebar] logout failed", error)
    }
  }

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                  <Hexagon className="size-5 fill-current" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Alicia
                  </span>
                  <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                    Premium AI
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link
                    href={item.url}
                    className="font-semibold text-slate-600 transition-colors hover:text-amber-600"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* My Projects Section */}
        <SidebarGroup className="mt-4 border-t border-slate-500/10 pt-6">
          <div className="mb-2 flex items-center px-2">
            {!isCollapsed ? (
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                My Projects
              </span>
            ) : (
              <Plus className="mx-auto size-4 text-slate-400" />
            )}
          </div>
          <SidebarMenu>
            {projects.map((project) => (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton asChild tooltip={project.title}>
                  <Link
                    href={`/creator/${project.id}`}
                    className="group/item text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <Library className="size-4 shrink-0 opacity-40 transition-opacity group-hover/item:opacity-100" />
                    <span className="truncate text-[13px]">
                      {project.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {!projects.length && !isCollapsed && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="No projects yet">
                  <Link
                    href="/creator/new"
                    className="text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <Library className="size-4 shrink-0 opacity-40" />
                    <span className="truncate text-[13px]">
                      No projects yet
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            {data.secondary.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link
                    href={item.url}
                    className="text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Log out" onClick={handleLogout}>
                <LogOut className="size-4" />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
