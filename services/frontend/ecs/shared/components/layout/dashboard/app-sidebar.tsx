"use client"

import * as React from "react"
import {
  Command,
  Search,
  Settings,
} from "lucide-react"

import { NavMain } from "@/shared/components/layout/dashboard/nav-main"
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

  // Projects nav removed for all users per request

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
                <div className="flex items-center gap-3">
                  {/* User profile picture or styled initials */}
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="rounded-full w-8 h-8 object-cover shadow border border-slate-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 via-blue-100 to-slate-50 text-blue-900 font-bold flex items-center justify-center text-base shadow border border-slate-200">
                      {user ? `${(user.first_name?.[0] || '').toUpperCase()}${(user.last_name?.[0] || '').toUpperCase()}` : 'U'}
                    </div>
                  )}
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user ? `${user.first_name} ${user.last_name}` : 'User'}</span>
                    <span className="truncate text-xs">{user?.role?.replace('_', ' ').toUpperCase() || 'Role'}{user?.section ? ` • ${user.section}` : ''}</span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain userRole={role || user?.role} />
        {/* Projects section removed */}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
