"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { ScrollArea } from '@/shared/components/ui/ScrollArea'
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
import ClientNow from '@/shared/components/ui/ClientNow'
import ActivityLogService from '@/shared/lib/activity-log-service';
import ProfileAvatar from '@/shared/components/ui/ProfileAvatar';

export default function Dashboard() {
  const humanizeRole = (role: string) =>
    role
      .split('_')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const normalizeLabel = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[_\-\s]+/g, ' ')
      .replace(/\s+/g, ' ');

  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    user: string;
    avatarUrl?: string;
    role: string;
    department: string;
    action: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    let mounted = true;

    const loadActivities = async () => {
      const activities = await ActivityLogService.getRecentActivitiesFromAPI(8);
      if (!mounted) return;

      setRecentActivity(
        activities.map((activity) => ({
          id: activity.id,
          user: activity.userName,
          avatarUrl: activity.userAvatarUrl,
          role: humanizeRole(activity.userRole),
          department: activity.userDepartment,
          action: activity.action,
          timestamp: ActivityLogService.formatActivityTimestamp(activity.timestamp),
        }))
      );
    };

    loadActivities();
    return () => {
      mounted = false;
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 mb-3">
              Administrator Workspace
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Monitor organization-wide operations, risk, and service health.</p>
          </div>
          <div className="text-sm text-slate-500">
            Last updated: <ClientNow />
          </div>
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="border border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">{metric.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${metric.variant === 'destructive' ? 'text-red-600' : metric.variant === 'warning' ? 'text-amber-600' : 'text-slate-500'}`} />
                </CardHeader>
                <CardContent>
                <div className="text-3xl font-bold text-slate-900">{metric.value}</div>
                <p className="text-xs text-slate-500 mt-1">{metric.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-1 border border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#BA0021]" />
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
                    <div key={issue.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 mb-1">{issue.content}</p>
                          <p className="text-xs text-slate-500">{issue.date}</p>
                        </div>
                        <Badge className={issue.severity === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' : issue.severity === 'high' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}>
                          {issue.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 border border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-600" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
              <CardDescription>
                Latest actions across all departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                        <ProfileAvatar
                          imageUrl={activity.avatarUrl}
                          fullName={activity.user}
                          className="h-8 w-8 border border-slate-300"
                          textClassName="text-[10px]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{activity.user}</p>
                          <p className="text-xs text-slate-500">{activity.role}</p>
                          {activity.department &&
                            normalizeLabel(activity.department) !== normalizeLabel(activity.role) &&
                            normalizeLabel(activity.department) !== normalizeLabel(activity.user) && (
                              <p className="text-xs text-slate-500 mb-1">{activity.department}</p>
                            )}
                          <p className="text-sm text-slate-700">{activity.action}</p>
                          <p className="text-xs text-slate-400 mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-sm text-slate-500">No recent activity yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}