"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { 
  FileText, 
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Building2,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PublicUserDashboard() {
  const params = useParams();
  const role = params?.role as string;

  // Mock data for dashboard
  const stats = {
    myRequests: 3,
    approvedRequests: 1,
    pendingRequests: 2,
    availableProjects: 12
  };

  const recentActivity = [
    {
      id: 1,
      action: "Project request submitted",
      project: "Community Garden Initiative",
      status: "pending",
      date: "2026-02-20"
    },
    {
      id: 2,
      action: "Request approved",
      project: "Digital Literacy Program",
      status: "approved",
      date: "2026-02-18"
    },
    {
      id: 3,
      action: "New project available",
      project: "Environmental Awareness Campaign",
      status: "available",
      date: "2026-02-15"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'available':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'available':
        return <Eye className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Public User Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's an overview of your project requests and available opportunities.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href={`/${role}/public-user-request-form`}>
                <FileText className="mr-2 h-4 w-4" />
                Submit New Request
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${role}/public-user-project-list`}>
                <Eye className="mr-2 h-4 w-4" />
                Browse Projects
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Requests</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.myRequests}</div>
              <p className="text-xs text-gray-600 mt-1">Total submitted</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedRequests}</div>
              <p className="text-xs text-gray-600 mt-1">Requests approved</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
              <p className="text-xs text-gray-600 mt-1">Under review</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Projects</CardTitle>
              <Building2 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.availableProjects}</div>
              <p className="text-xs text-gray-600 mt-1">Public projects</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest interactions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.project}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/${role}/public-user-request-form`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Submit New Request
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/${role}/public-user-project-list`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View All Projects
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/${role}/settings`}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Information Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Welcome to the Extension Community System</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800">
              As a public user, you can browse available projects, submit project requests, and track the status 
              of your submissions. Our team reviews all requests to ensure they align with our community goals 
              and available resources.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}