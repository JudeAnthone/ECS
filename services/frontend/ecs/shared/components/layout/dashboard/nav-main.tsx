"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/Sidebar"

import Link from "next/link"

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Administrator</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/admin-dashboard">
             Admin - Dashboard
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/admin-user-management">
             Admin - User Management
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/admin-project-management">
             Admin - Project Management
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/admin-analytics">
             Admin - Analytics
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/admin-report">
             Admin - Report
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/admin-blog">
             Admin - Blog
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/admin-chatbot">
             Admin - Chatbot
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarGroupLabel>Project Chair</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/project-chair-dashboard">
             Project Chair - Dashboard
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/project-chair-project-list">
             Project Chair - Project List
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/project-chair-project-recommendation">
              Project Chair - Project Recommendation
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/project-chair-funds-budget">
              Project Chair - Funds and Budget
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/project-chair-analytics">
             Project Chair - Analytics
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarGroupLabel>Project Head</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/project-head-dashboard">
             Project Head - Dashboard
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/project-head-finance-request">
             Project Head - Finance Request
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/project-head-project-proposal">
             Project Head - Project Proposal
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/project-head-report-submission">
             Project Head - Report Submission
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/project-head-task-management">
             Project Head - Task Management
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/project-head-analytics">
             Project Head - Analytics
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
       <SidebarGroupLabel>Authorized Personnel</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/authorized-personnel-dashboard">
              Staff - Dashboard
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/authorized-personnel-project-task">
              Staff - Project Task
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/authorized-personnel-project-analytics">
              Staff - Project Analytics
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

      </SidebarMenu>
      <SidebarGroupLabel>Public User</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/public-user-project-list">
              Public User - Project List
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="/public-user-request-form">
              Public User - Request Form
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
