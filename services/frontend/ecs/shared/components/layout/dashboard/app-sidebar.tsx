"use client"

import * as React from "react"
import {
  Command,
  Search,
  Settings,
} from "lucide-react"

import { NavMain } from "@/shared/components/layout/dashboard/nav-main"
import { NavProjects } from "@/shared/components/layout/dashboard/nav-projects"
import { NavSecondary } from "@/shared/components/layout/dashboard/nav-secondary"
import { NavUser } from "@/shared/components/layout/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/Sidebar"

import Link from "next/link"

const data = {
  user: {
    name: "Zoro",
    email: "m@example.com",
    avatar: "",
  },
  navSecondary: [
    {
      title: "Search",
      url: "/", /**Must show the current route after refresh*/
      icon: Search,
    },
    {
      title: "Settings",
      url: "/settings", /**Mush show base on the current user active this is for general usage but different api to avoid confusion*/
      icon: Settings,
    },
  ],
  projects: [ /**DEMO ONLY*/
    {
      name: "Enviromental Awareness",
      url: "#",
    },
    {
      name: "Educational Outreach",
      url: "#",
    },
    {
      name: "Health Care Improvement",
      url: "#",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Position</span>
                  <span className="truncate text-xs">Department Position</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain/>
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
