"use client"
import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/Sidebar"

import Link from "next/link"
import { BarChart2, Users, Home, FileText, BookOpen, MessageSquare, Settings, ChevronDown, ChevronUp } from "lucide-react"
// Icon mapping for menu items
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Dashboard: Home,
  "User Management": Users,
  "Program Management": BookOpen,
  "Project List": BookOpen,
  "Project Recommendation": BookOpen,
  "Funds and Budget": FileText,
  "Analytics": BarChart2,
  "Reports": FileText,
  "Blog": MessageSquare,
  "Chatbot": Settings,
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
      { title: "Analytics", href: "/admin-analytics" },
      { title: "Reports", href: "/admin-report" },
      { title: "Blog", href: "/admin-blog" },
      { title: "Chatbot", href: "/admin-chatbot" },
    ],
  },
  "program-chair": {
    label: "Program Chair",
    items: [
      { title: "Dashboard", href: "/program-chair-dashboard" },
      { title: "Program Management", href: "/program-chair-program-management" },
      { title: "Project List", href: "/program-chair-project-list" },
      { title: "Funds and Budget", href: "/program-chair-funds-and-budget" },
      { title: "Analytics", href: "/program-chair-analytics" },
      { title: "Reports", href: "/program-chair-report" },
    ],
  },
  "project-head": {
    label: "Project Head",
    items: [
      { title: "Dashboard", href: "/project-head-dashboard" },
      { title: "Project Management", href: "/project-head-request-management" },
      { title: "Finance Request", href: "/project-head-finance-request" },

      { title: "Report Submission", href: "/project-head-report-submission" },
      { title: "Task Management", href: "/project-head-task-management" },
      { title: "Analytics", href: "/project-head-analytics" },
      { title: "Reports", href: "/project-head-report" },
    ],
  },
  staff: {
    label: "Staff",
    items: [
      { title: "Dashboard", href: "/staff-dashboard" },
      { title: "Project Tasks", href: "/staff-project-task" },
      { title: "Request a Project", href: "/staff-request-project" },
      { title: "Analytics", href: "/staff-project-analytics" },
      { title: "Reports", href: "/staff-report" },
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
    const [openGroups, setOpenGroups] = React.useState<{ [key: string]: boolean }>({});
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
      <SidebarGroupLabel>{navigation.label}</SidebarGroupLabel>
      <SidebarMenu>
        {navigation.items.map((item, idx) => {
          const itemPath = `/${role}${item.href}`;
          const isActive = usePathname() === itemPath;
          const Icon = iconMap[item.title] || Home;
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                size="lg"
                isActive={isActive}
                className={isActive ? "bg-white text-[#BA0021] font-bold border-l-2 border-[#BA0021] ring-2 ring-[#BA0021]" : "text-[#BA0021] bg-white hover:bg-slate-100 hover:text-[#BA0021]"}
                tabIndex={0}
                aria-label={item.title}
                role="menuitem"
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    window.location.href = itemPath;
                  }
                }}
              >
                <Link href={itemPath} className="flex items-center gap-2" aria-current={isActive ? "page" : undefined}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
