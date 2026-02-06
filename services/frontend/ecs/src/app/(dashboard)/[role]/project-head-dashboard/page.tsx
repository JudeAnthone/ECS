"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { ScrollArea } from '@/shared/components/ui/ScrollArea'
import { Button } from '@/shared/components/ui/Button';
import { 
  TrendingUp,
  Clock,
  Timer,
  Folder,
  CheckSquare,
  Plus
} from 'lucide-react';

export default function PerformanceDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Implement user authentication module',
      dateGiven: '2026-01-20',
      timeGiven: '09:30 AM',
      assignedTo: 'Sarah Chen',
      status: 'In Progress'
    },
    {
      id: 2,
      title: 'Code review for payment gateway integration',
      dateGiven: '2026-01-22',
      timeGiven: '02:15 PM',
      assignedTo: 'David Kim',
      status: 'Completed'
    },
    {
      id: 3,
      title: 'Update API documentation',
      dateGiven: '2026-01-23',
      timeGiven: '11:00 AM',
      assignedTo: 'Emily Watson',
      status: 'In Progress'
    },
    {
      id: 4,
      title: 'Fix bug in user dashboard',
      dateGiven: '2026-01-24',
      timeGiven: '10:45 AM',
      assignedTo: 'Marcus Rodriguez',
      status: 'Pending'
    },
    {
      id: 5,
      title: 'Design database schema for new feature',
      dateGiven: '2026-01-25',
      timeGiven: '03:30 PM',
      assignedTo: 'James Foster',
      status: 'In Progress'
    },
    {
      id: 6,
      title: 'Write unit tests for authentication',
      dateGiven: '2026-01-26',
      timeGiven: '01:20 PM',
      assignedTo: 'Sarah Chen',
      status: 'Pending'
    },
    {
      id: 7,
      title: 'Optimize database queries',
      dateGiven: '2026-01-27',
      timeGiven: '09:00 AM',
      assignedTo: 'David Kim',
      status: 'In Progress'
    },
    {
      id: 8,
      title: 'Review pull request #345',
      dateGiven: '2026-01-27',
      timeGiven: '04:15 PM',
      assignedTo: 'Lisa Anderson',
      status: 'Pending'
    }
  ]);

  // Performance metrics
  const performanceMetrics = [
    {
      title: 'Activity Completion Rate',
      value: '87.5%',
      icon: TrendingUp,
      description: 'Projects completed on time',
      trend: '+5.2% from last month',
    },
    {
      title: 'On-time Service Delivery Rate',
      value: '92.3%',
      icon: Clock,
      description: 'Services delivered by deadline',
      trend: '+3.8% from last month',
    },
    {
      title: 'Average Response Time',
      value: '2.4 hrs',
      icon: Timer,
      description: 'Average time to respond to requests',
      trend: '-0.6 hrs from last month',
    }
  ];

  const projects = [
    {
      id: 1,
      title: 'Customer Portal Redesign',
      date: '2026-01-15',
      owner: 'Sarah Chen'
    },
    {
      id: 2,
      title: 'API Integration v3.0',
      date: '2026-01-18',
      owner: 'David Kim'
    },
    {
      id: 3,
      title: 'Mobile App Enhancement',
      date: '2026-01-20',
      owner: 'Emily Watson'
    },
    {
      id: 4,
      title: 'Security Audit 2026',
      date: '2026-01-22',
      owner: 'James Foster'
    },
    {
      id: 5,
      title: 'Data Migration Project',
      date: '2026-01-24',
      owner: 'Marcus Rodriguez'
    },
    {
      id: 6,
      title: 'Payment Gateway Upgrade',
      date: '2026-01-25',
      owner: 'Lisa Anderson'
    },
    {
      id: 7,
      title: 'Email Automation System',
      date: '2026-01-26',
      owner: 'Robert Taylor'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Blocked':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleAddTask = () => {
    console.log('Add new task clicked');
    // Add your logic to open a modal or form to add a new task
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
            <p className="text-gray-500 mt-1">Track your performance metrics and manage tasks</p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Upper Part - 3 Performance Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performanceMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {metric.description}
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    {metric.trend}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lower Part - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 " />
                <CardTitle>Project List</CardTitle>
              </div>
              <CardDescription>
                All projects assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[450px] pr-4">
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div 
                      key={project.id} 
                      className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(project.date).toLocaleDateString()}</span>
                            </div>
                            <span>•</span>
                            <span>{project.owner}</span>
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded-full  flex items-center justify-center text-white font-semibold text-xs shrink-0">
                          {project.owner.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Task Status List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 " />
                  <CardTitle>Task Status</CardTitle>
                </div>
              </div>
              <CardDescription>
                Tasks you&apos;ve assigned to team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add Task Button */}
              <Button 
                onClick={handleAddTask}
                className="w-full mb-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>

              <ScrollArea className="h-[380px] pr-4">
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-sm font-medium text-gray-900 flex-1">
                          {task.title}
                        </h3>
                        <Badge className={`${getStatusColor(task.status)} border`}>
                          {task.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            {task.assignedTo.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-700">{task.assignedTo}</span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(task.dateGiven).toLocaleDateString()} • {task.timeGiven}</span>
                            </div>
                          </div>
                        </div>
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