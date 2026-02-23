"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/Sidebar"

import Link from "next/link"
import { useParams } from "next/navigation"

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

const roleNavigation: RoleNavigation = {
  admin: {
    label: "Administrator",
    items: [
      { title: "Dashboard", href: "/admin-dashboard" },
      { title: "User Management", href: "/admin-user-management" },
      { title: "Project Management", href: "/admin-project-management" },
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
      { title: "Project List", href: "/program-chair-project-list" },
      { title: "Project Recommendation", href: "/program-chair-project-recommendation" },
      { title: "Funds and Budget", href: "/program-chair-funds-and-budget" },
      { title: "Analytics", href: "/program-chair-analytics" },
    ],
  },
  "project-head": {
    label: "Project Head",
    items: [
      { title: "Dashboard", href: "/project-head-dashboard" },
      { title: "Finance Request", href: "/project-head-finance-request" },
      { title: "Project Proposal", href: "/project-head-project-proposal" },
      { title: "Report Submission", href: "/project-head-report-submission" },
      { title: "Task Management", href: "/project-head-task-management" },
      { title: "Analytics", href: "/project-head-analytics" },
    ],
  },
  staff: {
    label: "Staff",
    items: [
      { title: "Dashboard", href: "/staff-dashboard" },
      { title: "Project Tasks", href: "/staff-project-task" },
      { title: "Analytics", href: "/staff-project-analytics" },
    ],
  },
  "public-user": {
    label: "Public User",
    items: [
      { title: "Dashboard", href: "/public-user-dashboard" },
      { title: "Project List", href: "/public-user-project-list" },
      { title: "Request Form", href: "/public-user-request-form" },
    ],
  },
};

export function NavMain({ userRole }: { userRole?: string }) {
  const params = useParams();
  const role = params?.role as string || userRole;

  if (!role || !roleNavigation[role]) {
    return null;
  }

  const navigation = roleNavigation[role];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{navigation.label}</SidebarGroupLabel>
      <SidebarMenu>
        {navigation.items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild size="lg">
              <Link href={`/${role}${item.href}`}>
                {item.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
