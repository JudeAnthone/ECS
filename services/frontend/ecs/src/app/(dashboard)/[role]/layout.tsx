"use client"

import React, { useEffect, useState } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/Breadcrumb"
import { Separator } from "@/shared/components/ui/Separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/Sidebar"
import { useParams, usePathname } from "next/navigation"
import { AuthService } from "@/shared/lib/auth-service"
import { Bell, X } from "lucide-react"

import { AppSidebar } from "@/shared/components/layout/dashboard/app-sidebar"

interface LayoutProps {
  children: React.ReactNode;
}

function toPageTitle(slug: string) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function UserProfileHeader() {
  const [user, setUser] = useState<any>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  useEffect(() => {
    setUser(AuthService.getUser())
    // Click-away handler
    const handleClick = (e: MouseEvent) => {
      if (notifOpen) {
        const dropdown = document.getElementById("notif-dropdown");
        if (dropdown && !dropdown.contains(e.target as Node)) {
          setNotifOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen])
  if (!user) return null
  return (
    <div className="flex items-center gap-4 relative">
      {/* Bell icon (clickable) */}
      <button
        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
        onClick={() => setNotifOpen((open) => !open)}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white" />
      </button>
      {/* Notification dropdown */}
      {notifOpen && (
        <div id="notif-dropdown" className="absolute top-10 left-0 z-50 w-64 bg-white rounded-lg shadow-lg border border-slate-200 p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-[#BA0021] text-lg">Notifications</div>
            <button onClick={() => setNotifOpen(false)} className="p-1 rounded hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div className="text-slate-700 text-sm">TO BE DEVELOPED</div>
        </div>
      )}
      {/* Username at top */}
      <div className="flex flex-col items-start">
        <span className="text-white font-semibold text-sm mb-0.5">{user.first_name} {user.last_name}</span>
        <span className="text-white/80 text-xs mt-0.5">{user.department || user.role?.replace('_', ' ').toUpperCase()}</span>
      </div>
      {/* Avatar right */}
      {user.avatar_url ? (
        <img src={user.avatar_url} alt="Profile" className="rounded-full w-10 h-10 object-cover border border-white ml-4" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-white text-[#BA0021] font-bold flex items-center justify-center text-lg border border-white ml-4">
          {user.first_name?.[0]?.toUpperCase()}{user.last_name?.[0]?.toUpperCase()}
        </div>
      )}
    </div>
  )
}

export default function Layout({ children }: LayoutProps) {
  const params = useParams()
  const pathname = usePathname()
  const role = (params?.role as string) || 'admin'
  const roleDisplayName = toPageTitle(role)

  const segments = pathname?.split('/').filter(Boolean) ?? []
  const lastSegment = segments[segments.length - 1] ?? ''
  const pageName = lastSegment === role ? `${roleDisplayName} Dashboard` : toPageTitle(lastSegment)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 text-white" style={{ backgroundColor: '#BA0021', color: '#fff' }}>
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <span className="text-lg font-semibold tracking-wide text-white select-none" style={{ letterSpacing: '0.04em' }}>
                EARIST EXTENSION SERVICE
              </span>
            </div>
            {/* User profile at right */}
            <UserProfileHeader />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
