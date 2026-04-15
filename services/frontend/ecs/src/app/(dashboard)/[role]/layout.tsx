"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Separator } from "@/shared/components/ui/Separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/Sidebar"
import { AuthService } from "@/shared/lib/auth-service"
import type { UserDTO } from "@/shared/lib/auth-service"
import { Bell, X, Settings, LogOut, ChevronDown } from "lucide-react"
import { useNotifications } from "@/shared/hooks/use-notifications"
import type { NotificationItem } from "@/shared/lib/notification-service"
import { resolveNotificationTarget } from "@/shared/lib/notification-routing"
import { AppSidebar } from "@/shared/components/layout/dashboard/app-sidebar"
import LogoutModal from "@/shared/components/ui/LogoutModal"
import ProfileAvatar from "@/shared/components/ui/ProfileAvatar"
import RoleChatbotLauncher from "@/shared/components/ui/RoleChatbotLauncher"

interface LayoutProps {
  children: React.ReactNode;
}

function normalizeRoleSlug(role?: string | null) {
  return (role || "").replace(/_/g, "-")
}

function UserProfileHeader() {
  const [user, setUser] = useState<UserDTO | null>(null)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [showLogout, setShowLogout] = useState(false)
  const [nowTs, setNowTs] = useState(() => Date.now())
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, deleteNotification, refresh } = useNotifications()
  const router = useRouter()
  const notifBtnRef = React.useRef<HTMLButtonElement>(null)
  const notifDropdownRef = React.useRef<HTMLDivElement>(null)
  const profileBtnRef = React.useRef<HTMLButtonElement>(null)
  const profileDropdownRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUser(AuthService.getUser())
    const handleUserUpdated = () => setUser(AuthService.getUser())
    window.addEventListener("ecs:user-updated", handleUserUpdated)
    window.sessionStorage.removeItem('ecs-login-redirecting')
    return () => window.removeEventListener("ecs:user-updated", handleUserUpdated)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifOpen) {
        if (notifDropdownRef.current && notifBtnRef.current &&
            !notifDropdownRef.current.contains(e.target as Node) &&
            !notifBtnRef.current.contains(e.target as Node)) {
          setNotifOpen(false)
        }
      }
      if (profileOpen) {
        if (profileDropdownRef.current && profileBtnRef.current &&
            !profileDropdownRef.current.contains(e.target as Node) &&
            !profileBtnRef.current.contains(e.target as Node)) {
          setProfileOpen(false)
        }
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [notifOpen, profileOpen])

  useEffect(() => {
    const interval = window.setInterval(() => setNowTs(Date.now()), 60000)
    return () => window.clearInterval(interval)
  }, [])

  if (!user) return null

  const handleLogout = () => {
    setShowLogout(true)
    setProfileOpen(false)
  }

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.is_read) {
      await markAsRead(item.id)
    }

    const roleSlug = normalizeRoleSlug(user.role)
    const target = resolveNotificationTarget(roleSlug, item)
    if (target) {
      setNotifOpen(false)
      router.push(target)
    }
  }

  const confirmLogout = () => {
    AuthService.logout()
  }

  const formatRelativeTime = (isoDate?: string) => {
    if (!isoDate) return ""
    const date = new Date(isoDate).getTime()
    const diffMs = nowTs - date
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return "just now"
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    const diffDay = Math.floor(diffHr / 24)
    return `${diffDay}d ago`
  }

  return (
    <div className="flex items-center gap-3 relative">
      <button
        ref={notifBtnRef}
        className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
        onClick={() => {
          const next = !notifOpen
          setNotifOpen(next)
          if (next) refresh()
        }}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {notifOpen && (
        <div ref={notifDropdownRef} className="absolute top-10 -left-64 z-50 w-80 bg-white rounded-lg shadow-lg border border-slate-200 p-3 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-[#BA0021] text-lg">Notifications</div>
            <div className="flex items-center gap-2">
              <button onClick={markAllAsRead} className="text-xs text-slate-600 hover:text-slate-900">Mark all read</button>
              <button onClick={() => setNotifOpen(false)} className="p-1 rounded hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
          {loading ? (
            <div className="text-slate-500 text-sm py-4 text-center">Loading notifications...</div>
          ) : error ? (
            <div className="text-red-600 text-sm py-4">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-slate-500 text-sm py-4 text-center">No notifications yet.</div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    void handleNotificationClick(item)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      void handleNotificationClick(item)
                    }
                  }}
                  className={`w-full text-left rounded-md border px-3 py-2 transition-colors cursor-pointer ${item.is_read ? "bg-white border-slate-200" : "bg-red-50 border-red-100"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.title}</p>
                    <div className="flex items-center gap-1">
                      {!item.is_read && <span className="mt-1 h-2 w-2 rounded-full bg-red-600" />}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          void deleteNotification(item.id)
                        }}
                        className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Delete notification"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{item.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{formatRelativeTime(item.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col items-start justify-center leading-tight">
        <span className="text-white font-semibold text-base">{user.first_name} {user.last_name}</span>
        <span className="text-white/85 text-sm">{user.department || user.role?.replace("_", " ").toUpperCase()}</span>
      </div>

      <button
        ref={profileBtnRef}
        className="ml-2 inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-visible rounded-full bg-white p-[2px] focus:outline-none relative"
        onClick={() => setProfileOpen((open) => !open)}
        aria-label="Profile"
      >
        <ProfileAvatar
          imageUrl={user.avatar_url}
          firstName={user.first_name}
          lastName={user.last_name}
          alt="Profile"
          className="h-full w-full"
          textClassName="text-sm"
        />
        <ChevronDown className="absolute bottom-0 right-0 w-5 h-5 bg-[#BA0021] rounded-full text-white border-2 border-white flex items-center justify-center" style={{transform: 'translate(2px, 2px)'}} />
      </button>

      {profileOpen && (
        <div ref={profileDropdownRef} className="absolute top-12 right-0 z-50 min-w-[260px] max-w-[90vw] rounded-xl shadow-2xl border border-slate-200 bg-white animate-fade-in" style={{ boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)" }}>
          <div className="flex items-center gap-3 px-4 py-3 text-left text-sm bg-[#BA0021]/5 rounded-t-xl relative">
            <ProfileAvatar
              imageUrl={user.avatar_url}
              firstName={user.first_name}
              lastName={user.last_name}
              alt="Profile"
              className="h-9 w-9 border border-[#BA0021]"
              textClassName="text-xs"
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-[#BA0021]">{user.first_name} {user.last_name}</span>
              <span className="truncate text-xs text-slate-500">{user.email}</span>
              <span className="truncate text-xs text-[#BA0021] font-bold mt-1">{user.role?.replace("_", " ").toUpperCase()}</span>
            </div>
            <button onClick={() => setProfileOpen(false)} className="absolute top-2 right-2 p-1 rounded hover:bg-slate-200" aria-label="Close profile dropdown">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div className="py-1">
            <button
              className="w-full flex items-center px-4 py-2 font-medium text-left text-[#BA0021] hover:bg-[#BA0021]/10"
              onClick={() => {
                setProfileOpen(false)
                const roleSlug = normalizeRoleSlug(user.role)
                router.push(`/${roleSlug}/settings`)
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

export default function Layout({ children }: LayoutProps) {
  const params = useParams()
  const role = normalizeRoleSlug((params?.role as string) || "admin")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="md:peer-data-[variant=inset]:mt-0">
        <header className="flex h-16 shrink-0 items-center text-white" style={{ backgroundColor: "#BA0021", color: "#fff" }}>
          <div className="flex items-center justify-between w-full px-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <div className="flex flex-col leading-none select-none">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  EARIST EXTENSION SERVICES
                </span>
                <span className="text-[10px] font-medium text-white/80 tracking-wide">
                  Eulogio "Amang" Rodriguez Institute of Science and Technology
                </span>
              </div>
              <span className="mx-4 h-6 border-l border-white/50"></span>
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
        <RoleChatbotLauncher roleSlug={role} />
      </SidebarInset>
    </SidebarProvider>
  )
}
