import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { ScrollArea } from '@/shared/components/ui/ScrollArea'
import { Alert, AlertDescription } from '@/shared/components/ui/Alert'
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  UserX,
  Bell,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  // Sample data - replace with your actual data source
  const metrics = [
    {
      title: 'Pending Requests',
      value: '24',
      icon: Clock,
      trend: '+3 from yesterday',
      variant: 'warning' as const
    },
    {
      title: 'Scheduled Events',
      value: '18',
      icon: Calendar,
      trend: '5 this week',
      variant: 'default' as const
    },
    {
      title: 'Active Services',
      value: '142',
      icon: CheckCircle2,
      trend: '98% uptime',
      variant: 'success' as const
    },
    {
      title: 'SLA Near-Breach',
      value: '7',
      icon: AlertTriangle,
      trend: '2 critical',
      variant: 'destructive' as const
    },
    {
      title: 'At-Risk Services',
      value: '5',
      icon: XCircle,
      trend: 'Requires attention',
      variant: 'destructive' as const
    },
    {
      title: 'Unassigned Requests',
      value: '12',
      icon: UserX,
      trend: '+4 new today',
      variant: 'warning' as const
    }
  ];

  const urgentIssues = [
    {
      id: 1,
      content: 'Database server experiencing high CPU usage (>95%) - immediate action required',
      date: '2026-01-27',
      severity: 'critical'
    },
    {
      id: 2,
      content: 'Payment gateway integration failing for multiple transactions',
      date: '2026-01-27',
      severity: 'high'
    },
    {
      id: 3,
      content: 'Customer portal login issues reported by 15+ users',
      date: '2026-01-27',
      severity: 'high'
    },
    {
      id: 4,
      content: 'Backup system failed to complete last night - data integrity check needed',
      date: '2026-01-26',
      severity: 'medium'
    },
    {
      id: 5,
      content: 'Email notifications delayed by 2+ hours for approval workflows',
      date: '2026-01-26',
      severity: 'medium'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'Sarah Chen',
      department: 'IT Operations',
      action: 'Resolved ticket #4521 - Network connectivity issue',
      timestamp: '5 minutes ago'
    },
    {
      id: 2,
      user: 'Marcus Rodriguez',
      department: 'Customer Support',
      action: 'Assigned 3 new support tickets to team members',
      timestamp: '12 minutes ago'
    },
    {
      id: 3,
      user: 'Emily Watson',
      department: 'HR',
      action: 'Approved leave request for John Smith',
      timestamp: '28 minutes ago'
    },
    {
      id: 4,
      user: 'David Kim',
      department: 'Engineering',
      action: 'Deployed hotfix to production environment',
      timestamp: '45 minutes ago'
    },
    {
      id: 5,
      user: 'Lisa Anderson',
      department: 'Finance',
      action: 'Processed invoice batch #INV-2026-127',
      timestamp: '1 hour ago'
    },
    {
      id: 6,
      user: 'James Foster',
      department: 'IT Security',
      action: 'Completed security audit for Q1 2026',
      timestamp: '1 hour ago'
    },
    {
      id: 7,
      user: 'Patricia Martinez',
      department: 'Sales',
      action: 'Updated CRM with 5 new client records',
      timestamp: '2 hours ago'
    },
    {
      id: 8,
      user: 'Robert Taylor',
      department: 'Operations',
      action: 'Scheduled maintenance window for server upgrades',
      timestamp: '2 hours ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor your organization&apos;s key metrics and activities</p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Upper Half - Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.trend}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Urgent Issues & Reports</CardTitle>
              </div>
              <CardDescription>
                Critical items requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {urgentIssues.map((issue) => (
                    <Alert key={issue.id}>
                      <AlertDescription>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {issue.content}
                            </p>
                            <p className="text-xs text-gray-500">{issue.date}</p>
                          </div>
                          <Badge variant="destructive">
                            {issue.severity}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
              <CardDescription>
                Latest actions across all departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="h-8 w-8 rounded-full bg-linear-to-br from-yellow-300 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">
                          {activity.department}
                        </p>
                        <p className="text-sm text-gray-700">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}