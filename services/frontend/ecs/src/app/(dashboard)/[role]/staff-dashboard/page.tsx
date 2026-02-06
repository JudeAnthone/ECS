"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { ScrollArea } from '@/shared/components/ui/ScrollArea'
import { Alert, AlertDescription } from '@/shared/components/ui/Alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/DropdownMenu'
import { Button } from '@/shared/components/ui/Button'
import { 
  CheckCircle2, 
  Bell,
  Folder,
  MoreVertical,
  Check,
  Trash2
} from 'lucide-react';

export default function PersonnelDashboard() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Customer Portal Redesign',
      department: 'UI/UX Design',
      status: 'In Progress',
      progress: 75,
      deadline: '2026-02-15',
      assignees: ['Sarah Chen', 'Marcus Rodriguez']
    },
    {
      id: 2,
      name: 'API Integration v3.0',
      department: 'Engineering',
      status: 'In Progress',
      progress: 60,
      deadline: '2026-02-28',
      assignees: ['David Kim', 'Emily Watson']
    },
    {
      id: 3,
      name: 'Q1 Marketing Campaign',
      department: 'Marketing',
      status: 'Planning',
      progress: 30,
      deadline: '2026-03-01',
      assignees: ['Lisa Anderson', 'James Foster']
    },
    {
      id: 4,
      name: 'Security Audit 2026',
      department: 'IT Security',
      status: 'Review',
      progress: 90,
      deadline: '2026-01-31',
      assignees: ['Robert Taylor', 'Patricia Martinez']
    },
    {
      id: 5,
      name: 'Mobile App Enhancement',
      department: 'Development',
      status: 'In Progress',
      progress: 45,
      deadline: '2026-03-15',
      assignees: ['John Smith', 'Sarah Chen']
    },
    {
      id: 6,
      name: 'Data Migration Project',
      department: 'IT Operations',
      status: 'Planning',
      progress: 20,
      deadline: '2026-04-01',
      assignees: ['Marcus Rodriguez', 'David Kim']
    }
  ]);

  // Top 6 Priority Tasks
  const priorityTasks = [
    {
      title: 'Task #1',
      count: 'Update the client onboarding documents to reflect new compliance requirements.',
      icon: CheckCircle2,
      priority: 'high',
      dueToday: true
    },
    {
      title: 'Task #2',
      count: 'Submit the quarterly financial report to the finance department for review.',
      icon: CheckCircle2,
      priority: 'critical',
      dueToday: true
    },
    {
      title: 'Task #3',
      count: 'Finalize the design mockups for the upcoming mobile app update.',
      icon: CheckCircle2,
      priority: 'medium',
      dueToday: false
    },
    {
      title: 'Task #4',
      count: 'Prepare presentation slides for the annual stakeholder meeting.',
      icon: CheckCircle2,
      priority: 'high',
      dueToday: true
    },
    {
      title: 'Task #5',
      count: 'Conduct user testing sessions for the new feature rollout.',
      icon: CheckCircle2,
      priority: 'high',
      dueToday: false
    },
    {
      title: 'Task #6',
      count: 'Analyze clients feedback data to identify areas for improvement.',
      icon: CheckCircle2,
      priority: 'medium',
      dueToday: false
    }
  ];

  const newChanges = [
    {
      id: 1,
      content: 'Updated deployment pipeline to include automated security scans',
      date: '2026-01-27',
      author: 'DevOps Team',
      type: ''
    },
    {
      id: 2,
      content: 'New API endpoints added for user preference management',
      date: '2026-01-27',
      author: 'Backend Team',
      type: 'Feature'
    },
    {
      id: 3,
      content: 'Database indexing optimized for faster query performance',
      date: '2026-01-27',
      author: 'Database Team',
      type: 'Optimization'
    },
    {
      id: 4,
      content: 'UI components updated to match new design system guidelines',
      date: '2026-01-26',
      author: 'Frontend Team',
      type: 'Design'
    },
    {
      id: 5,
      content: 'Authentication flow enhanced with two-factor authentication',
      date: '2026-01-26',
      author: 'Security Team',
      type: 'Security'
    }
  ];


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Planning':
        return 'bg-purple-100 text-purple-700';
      case 'Review':
        return 'bg-amber-100 text-amber-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

/** Add the accept logic here */
  const handleAccept = (projectId: number) => {
    console.log('Accepted project:', projectId);

  };

/** Add the delete logic here */
  const handleDelete = (projectId: number) => {
    setProjects(projects.filter(p => p.id !== projectId));
    console.log('Deleted project:', projectId);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workspace</h1>
            <p className="text-gray-500 mt-1">Manage your tasks, changes, and projects</p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {priorityTasks.map((task, index) => {
            const Icon = task.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {task.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">{task.count}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={task.priority === 'critical' ? 'destructive' : 'outline'} className="text-xs">
                      {task.priority}
                    </Badge>
                    {task.dueToday && (
                      <span className="text-xs text-gray-500">Due today</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lower Half - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Changes List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                <CardTitle>New Changes</CardTitle>
              </div>
              <CardDescription>
                Recent updates and modifications across projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {newChanges.map((change) => (
                    <Alert key={change.id} className="border-l-4 border-l-blue-500">
                      <AlertDescription>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {change.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-xs text-gray-500">{change.date}</p>
                              <span className="text-xs text-gray-400">•</span>
                              <p className="text-xs text-gray-500">{change.author}</p>
                            </div>
                          </div>
                          <Badge variant="default">
                            {change.type}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Project List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-purple-500" />
                <CardTitle>Project List</CardTitle>
              </div>
              <CardDescription>
                All active projects and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {project.name}
                            </h3>
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-gray-500 mb-3">
                            {project.department}
                          </p>
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">Progress</span>
                              <span className="text-xs font-medium text-gray-900">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Assignees */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">Team:</span>
                            <div className="flex -space-x-2">
                              {project.assignees.map((assignee, idx) => (
                                <div
                                  key={idx}
                                  className="h-6 w-6 rounded-full  flex items-center justify-center text-white font-semibold text-xs border-2 border-white"
                                  title={assignee}
                                >
                                  {assignee.split(' ').map(n => n[0]).join('')}
                                </div>
                              ))}
                            </div>
                          </div>

                          <p className="text-xs text-gray-500">
                            Deadline: {new Date(project.deadline).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Action Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleAccept(project.id)}
                              className="cursor-pointer"
                            >
                            {/**Why is report here? for reporting if ever the project is finished or any other reason incase 
                             * of needed updates for the project by higher ups this report will be included for the 
                             * higher ups report that the staff is part with. When the staff reports it will be cited 
                             * including the date and time of the report for future reference.
                             */}
                              <Check className="mr-2 h-4 w-4 text-green-600" />
                              <span>Report</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(project.id)}
                              className="cursor-pointer text-red-600"
                            >
                            {/**Remove is use when the project is already not included to the staff*/}
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Remove</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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