"use client"

import * as React from "react"

import { NavMain } from "@/shared/components/layout/dashboard/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/shared/components/ui/Sidebar"
import { AuthService } from "@/shared/lib/auth-service"
import { useParams } from "next/navigation"

function normalizeRoleSlug(role?: string | null) {
  return (role || '').replace(/_/g, '-')
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<any>(null);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  React.useEffect(() => {
    setUser(AuthService.getUser());
    const handleUserUpdated = () => setUser(AuthService.getUser());
    window.addEventListener("ecs:user-updated", handleUserUpdated);
    return () => window.removeEventListener("ecs:user-updated", handleUserUpdated);
  }, []);

  const params = useParams();
  const role = normalizeRoleSlug(params?.role as string);

  const sidebarClass = "bg-[#15181f] text-slate-100 shadow-lg border-r border-[#2a303b] [&_[data-sidebar=sidebar-inner]]:bg-[#15181f] [&_[data-sidebar=content]]:bg-[#15181f]";

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      {...props}
      className={sidebarClass}
    >
      <SidebarHeader className="bg-[#15181f] border-b border-[#2a303b]">
        <a href="/" tabIndex={0} aria-label="Go to homepage" className={`flex items-center justify-center bg-[#15181f] ${isCollapsed ? "py-3" : "py-6"}`}>
          {isCollapsed ? (
            <img
              src="/earist-logo.png"
              alt="EARIST Logo"
              className="h-auto w-full max-h-12 max-w-12 object-contain cursor-pointer"
            />
          ) : (
            <img
              src="/earist-banner.png"
              alt="EARIST Logo and Title"
              className="w-full max-w-2xl cursor-pointer"
              style={{ display: "block", width: "100%", height: "auto" }}
            />
          )}
        </a>
      </SidebarHeader>
      <SidebarContent>
        <NavMain userRole={role || normalizeRoleSlug(user?.role)} />
        {/* Projects section removed */}
          {/* NavSecondary removed as it is no longer used */}
      </SidebarContent>
    </Sidebar>
  )
}
