"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Video,
  Sparkles,
  Bell,
  Settings,
  Library,
  Store,
  Hexagon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

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
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                  <Hexagon className="size-5 fill-current" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">Alicia</span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Premium AI</span>
                </div>
              </a>
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
                  <a href={item.url} className="font-semibold text-slate-600 hover:text-amber-600 transition-colors">
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        
        {/* Secondary Navigation */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            {data.secondary.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url} className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
