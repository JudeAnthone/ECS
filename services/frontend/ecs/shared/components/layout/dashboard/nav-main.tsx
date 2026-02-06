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
            <Link href="#">
             Admin - Dashboard
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Admin - User Management
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Admin - Project Management
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Admin - Analytics
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Admin - Report
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Admin - Blog
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Admin - Chatbot
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarGroupLabel>Project Chair</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Project Chair - Dashboard
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Project Chair - Project List
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
              Project Chair - Project Recommendation
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
              Project Chair - Funds and Budget
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Project Chair - Analytics
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarGroupLabel>Project Head</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Project Head - Dashboard
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Project Head - Finance Request
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Project Head - Project Proposal
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Project Head - Report Submission
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Project Head - Task Management
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
             Project Head - Analytics
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
       <SidebarGroupLabel>Authorized Personnel</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
              Staff - Dashboard
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
              Staff - Project Task
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
              Staff - Project Analytics
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

      </SidebarMenu>
      <SidebarGroupLabel>Public User</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
              Public User - Project List
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href="#">
              Public User - Request Form
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
