"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/Avatar"
// import DropdownMenu components, but we'll use a custom dropdown for profile

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
import { Bell, X, Settings, LogOut } from "lucide-react"

import { AppSidebar } from "@/shared/components/layout/dashboard/app-sidebar"

interface LayoutProps {
  children: React.ReactNode;
}

function normalizeRoleSlug(role?: string | null) {
  return (role || '').replace(/_/g, '-')
}

function toPageTitle(slug: string) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

import LogoutModal from '@/shared/components/ui/LogoutModal'

function UserProfileHeader() {
  const [user, setUser] = useState<any>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const router = useRouter();
  useEffect(() => {
    setUser(AuthService.getUser())
    // Click-away handler for notifications and profile
    const handleClick = (e: MouseEvent) => {
      if (notifOpen) {
        const dropdown = document.getElementById("notif-dropdown");
        if (dropdown && !dropdown.contains(e.target as Node)) {
          setNotifOpen(false);
        }
      }
      if (profileOpen) {
        const profileDropdown = document.getElementById("profile-dropdown");
        if (profileDropdown && !profileDropdown.contains(e.target as Node)) {
          setProfileOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen, profileOpen])
  if (!user) return null
  const handleLogout = () => {
    setShowLogout(true);
    setProfileOpen(false);
  }
  const confirmLogout = () => {
    AuthService.logout();
  }
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
        <div id="notif-dropdown" className="absolute top-10 -left-56 z-50 w-64 bg-white rounded-lg shadow-lg border border-slate-200 p-4 animate-fade-in">
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
      {/* Avatar with custom dropdown */}
      <button
        className="ml-4 focus:outline-none"
        onClick={() => setProfileOpen((open) => !open)}
        aria-label="Profile"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt="Profile"
            className="rounded-full w-10 h-10 object-cover border border-white"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white text-[#BA0021] font-bold flex items-center justify-center text-lg border border-white">
            {user.first_name?.[0]?.toUpperCase()}{user.last_name?.[0]?.toUpperCase()}
          </div>
        )}
      </button>
      {profileOpen && (
        <div id="profile-dropdown" className="absolute top-12 right-0 z-50 min-w-[260px] max-w-[90vw] rounded-xl shadow-2xl border border-slate-200 bg-white animate-fade-in" style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)' }}>
          <div className="flex items-center gap-3 px-4 py-3 text-left text-sm bg-[#BA0021]/5 rounded-t-xl relative">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="h-9 w-9 rounded-full border border-[#BA0021] object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-[#BA0021] text-white font-bold flex items-center justify-center border border-[#BA0021]">
                {user.first_name?.[0]?.toUpperCase()}{user.last_name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-[#BA0021]">{user.first_name} {user.last_name}</span>
              <span className="truncate text-xs text-slate-500">{user.email}</span>
              <span className="truncate text-xs text-[#BA0021] font-bold mt-1">{user.role?.replace('_', ' ').toUpperCase()}</span>
            </div>
            <button onClick={() => setProfileOpen(false)} className="absolute top-2 right-2 p-1 rounded hover:bg-slate-200" aria-label="Close profile dropdown">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div className="py-1">
            <button
              className="w-full flex items-center px-4 py-2 font-medium text-left text-[#BA0021] hover:bg-[#BA0021]/10"
              onClick={() => {
                setProfileOpen(false);
                const roleSlug = normalizeRoleSlug(user.role)
                router.push(`/${roleSlug}/settings`);
              }}
            >
              <Settings className="mr-2 text-[#BA0021]" />
              Settings
            </button>
            <hr className="my-1 border-slate-100" />
              <button
                className="w-full flex items-center px-4 py-2 text-red-600 font-medium hover:bg-red-50 text-left"
                onClick={handleLogout}
              >
                <LogOut className="mr-2" />
                Log out
              </button>
          </div>
        </div>
      )}

      <LogoutModal open={showLogout} onOpenChange={setShowLogout} onConfirm={confirmLogout} />
    </div>
  )
}

import Link from "next/link"

export default function Layout({ children }: LayoutProps) {
  const params = useParams()
  const pathname = usePathname()
  const role = normalizeRoleSlug((params?.role as string) || 'admin')
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
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <span className="text-lg font-semibold tracking-wide text-white select-none" style={{ letterSpacing: '0.04em' }}>
                EARIST EXTENSION SERVICE
              </span>
              <span className="mx-4 h-6 border-l border-white/50"></span>
              {/* Navigation Links */}
              <nav className="flex items-center gap-2">
                <Link href="/" className="text-white hover:underline font-medium">Home</Link>
                <span className="mx-1 text-white/70">&bull;</span>
                <Link href={`/${role}/${role}-dashboard`} className="text-white hover:underline font-medium">Dashboard</Link>
              </nav>
            </div>
            <UserProfileHeader />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
