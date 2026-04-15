"use client"
import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/components/ui/Sidebar"

import Link from "next/link"
import { BarChart2, Users, Home, FileText, BookOpen, MessageSquare } from "lucide-react"
// Icon mapping for menu items
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Dashboard: Home,
  "User Management": Users,
  "Program Management": BookOpen,
  "Project Recommendation": BookOpen,
  "Funds and Budget": FileText,
  "Analytics": BarChart2,
  "Budget Management": FileText,
  "Reports": FileText,
  "Blog": MessageSquare,
  "Project Management": Users,
  "Finance Request": FileText,

  "Report Submission": FileText,
  "Task Management": MessageSquare,
  "Project Tasks": MessageSquare,
  "Browse Programs": BookOpen,
  "Request Form": FileText,
  "Request a Project": FileText,
};
import { useParams, usePathname } from "next/navigation"

interface NavItem {
  title: string;
  href: string;
}

interface RoleNavigation {
  [key: string]: {
    label: string;
    items: NavItem[];
  };
}

function normalizeRoleSlug(role?: string | null) {
  return (role || '').replace(/_/g, '-')
}

const roleNavigation: RoleNavigation = {
  admin: {
    label: "Administrator",
    items: [
      { title: "Dashboard", href: "/admin-dashboard" },
      { title: "User Management", href: "/admin-user-management" },
      { title: "Program Management", href: "/admin-program-management" },
      { title: "Budget Management", href: "/admin-budget-management" },
      { title: "Reports", href: "/admin-report" },
      { title: "Analytics", href: "/admin-analytics" },
    ],
  },
  "program-chair": {
    label: "Program Chair",
    items: [
      { title: "Dashboard", href: "/program-chair-dashboard" },
      { title: "Program Management", href: "/program-chair-program-management" },
      { title: "Budget Management", href: "/program-chair-budget-management" },
      { title: "Reports", href: "/program-chair-report" },
      { title: "Analytics", href: "/program-chair-analytics" },
    ],
  },
  "project-head": {
    label: "Project Head",
    items: [
      { title: "Dashboard", href: "/project-head-dashboard" },
      { title: "Project Management", href: "/project-head-request-management" },
      { title: "Budget Management", href: "/project-head-budget-management" },
      { title: "Reports", href: "/project-head-report" },
      { title: "Analytics", href: "/project-head-analytics" },
    ],
  },
  staff: {
    label: "Staff",
    items: [
      { title: "Dashboard", href: "/staff-dashboard" },
      { title: "Project Tasks", href: "/staff-project-task" },
      { title: "Request a Project", href: "/staff-request-project" },
      { title: "Reports", href: "/staff-report" },
      { title: "Analytics", href: "/staff-project-analytics" },
    ],
  },
  "public-user": {
    label: "Public User",
    items: [
      { title: "Dashboard", href: "/public-user-dashboard" },
      { title: "Browse Programs", href: "/public-user-project-list" },
      { title: "Request Form", href: "/public-user-request-form" },
    ],
  },
};

export function NavMain({ userRole }: { userRole?: string }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const params = useParams();
  const role = normalizeRoleSlug((params?.role as string) || userRole || '');

  if (!role || !roleNavigation[role]) {
    return null;
  }

  const navigation = roleNavigation[role];

  const pathname = useParams()?.role
    ? `/${useParams()?.role}${usePathname()?.replace(`/${useParams()?.role}`, "")}`
    : usePathname() || "";
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-slate-300">{navigation.label}</SidebarGroupLabel>
      <SidebarMenu>
        {navigation.items.map((item) => {
          const itemPath = `/${role}${item.href}`;
          const isActive = usePathname() === itemPath;
          const Icon = iconMap[item.title] || Home;
          const iconClassName = isCollapsed ? "w-6 h-6" : "w-5 h-5";
          
          let buttonClassName = "";
          if (isActive) {
            buttonClassName = "bg-[#202634] text-white font-semibold border border-[#BA0021]";
          } else {
            buttonClassName = "text-slate-200 bg-transparent hover:bg-[#1b2330] hover:text-white";
          }

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                size="lg"
                isActive={isActive}
                className={buttonClassName}
                tooltip={item.title}
                tabIndex={0}
                aria-label={item.title}
                role="menuitem"
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    window.location.href = itemPath;
                  }
                }}
              >
                <Link
                  href={itemPath}
                  className={isCollapsed ? "flex items-center justify-center" : "flex items-center gap-2"}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className={iconClassName} aria-hidden="true" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
