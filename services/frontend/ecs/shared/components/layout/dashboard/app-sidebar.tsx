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
import { AuthService } from "@/shared/lib/auth-service"
import { useParams } from "next/navigation"

import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<any>(null);
  const params = useParams();
  const role = params?.role as string;

  React.useEffect(() => {
    const currentUser = AuthService.getUser();
    setUser(currentUser);
  }, []);

  const navSecondary = [
    {
      title: "Search",
      url: `/${role || user?.role || 'admin'}`,
      icon: Search,
    },
    {
      title: "Settings", 
      url: `/${role || user?.role || 'admin'}/settings`,
      icon: Settings,
    },
  ];

  const projects = [
    {
      name: "Environmental Awareness",
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
  ];

  const userData = {
    name: user ? `${user.first_name} ${user.last_name}` : "User",
    email: user?.email || "user@example.com",
    avatar: user?.avatar_url || "",
  };

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
                  <span className="truncate font-medium">{user?.role?.replace('_', ' ').toUpperCase() || 'Role'}</span>
                  <span className="truncate text-xs">{user?.section || 'Department'}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain userRole={role || user?.role} />
        {(role || user?.role) !== 'public-user' && (
          <NavProjects projects={projects} />
        )}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
