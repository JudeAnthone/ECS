"use client"

import React from "react"

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

import { AppSidebar } from "@/shared/components/layout/dashboard/app-sidebar"

interface LayoutProps {
  children: React.ReactNode;
}

function toPageTitle(slug: string) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function Layout({ children }: LayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const role = (params?.role as string) || 'admin';
  const roleDisplayName = toPageTitle(role);

  const segments = pathname?.split('/').filter(Boolean) ?? [];
  const lastSegment = segments[segments.length - 1] ?? '';
  const pageName = lastSegment === role ? `${roleDisplayName} Dashboard` : toPageTitle(lastSegment);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center bg-red-400 text-white gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/${role}`}>
                    {roleDisplayName} Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
