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

function normalizeRoleSlug(role?: string | null) {
  return (role || '').replace(/_/g, '-')
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<any>(null);
  React.useEffect(() => {
    setUser(AuthService.getUser());
  }, []);
  const userData = {
    name: user ? `${user.first_name} ${user.last_name}` : "",
    email: user?.email || "",
    avatar: user?.avatar_url || "",
  };
  const params = useParams();
  const role = normalizeRoleSlug(params?.role as string);
  return (
    <Sidebar
      variant="inset"
      {...props}
      className="bg-gradient-to-b from-white via-slate-50 to-slate-200 shadow-lg border-r border-slate-300"
    >
      <SidebarHeader>
        <div className="flex justify-center py-8">
          <a href="/" tabIndex={0} aria-label="Go to homepage">
            <img src="/earist-banner.png" alt="EARIST Logo and Title" className="w-full max-w-2xl cursor-pointer" style={{ display: 'block', width: '100%', height: 'auto' }} />
          </a>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain userRole={role || normalizeRoleSlug(user?.role)} />
        {/* Projects section removed */}
          {/* NavSecondary removed as it is no longer used */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
