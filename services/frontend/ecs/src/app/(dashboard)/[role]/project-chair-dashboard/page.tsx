"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { ScrollArea } from '@/shared/components/ui/ScrollArea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select'
import { 
  AlertTriangle,
  PhilippinePeso,
  Activity,
  Users,
  Calendar,
  Filter
} from 'lucide-react';

export default function ExecutiveDashboard() {
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Critical Analytics Data
  const analyticsData = {
    overdueProjects: {
      total: 12,
      percentage: 18.5,
      byDepartment: [
        { name: 'Engineering', count: 5 },
        { name: 'Marketing', count: 3 },
        { name: 'Research', count: 4 }
      ]
    },
    budgetUtilization: {
      allocated: 2500000,
      spent: 1850000,
      remaining: 650000,
      utilizationRate: 74,
      overBudgetProjects: 3
    },
    projectHealth: {
      onTrack: 52,
      atRisk: 28,
      delayed: 20
    },
    taskLoad: {
      byDepartment: [
        { name: 'Engineering', tasks: 145, users: 12, avgPerUser: 12.1 },
        { name: 'Marketing', tasks: 89, users: 8, avgPerUser: 11.1 },
        { name: 'Research', tasks: 67, users: 6, avgPerUser: 11.2 },
        { name: 'Operations', tasks: 123, users: 10, avgPerUser: 12.3 }
      ],
      overloadedUsers: 5
    },
    upcomingDeadlines: {
      within7Days: 8,
      within14Days: 15,
      within30Days: 24,
      urgent: 3
    }
  };

  // Project List Data
  const projects = [
    {
      id: 1,
      name: 'Digital Transformation Initiative',
      department: 'Engineering',
      section: 'Software Development',
      assignedTo: 'Sarah Chen',
      status: 'Ongoing',
      dateAssigned: '2025-12-01',
      deadline: '2026-02-28',
      budgetAllocated: 150000,
      budgetUsed: 125000,
      priority: 'High'
    },
    {
      id: 2,
      name: 'Customer Experience Enhancement',
      department: 'Marketing',
      section: 'Customer Relations',
      assignedTo: 'David Kim',
      status: 'Delayed',
      dateAssigned: '2025-11-15',
      deadline: '2026-01-31',
      budgetAllocated: 80000,
      budgetUsed: 85000,
      priority: 'Critical'
    },
    {
      id: 3,
      name: 'AI Research Integration',
      department: 'Research',
      section: 'Innovation Lab',
      assignedTo: 'Emily Watson',
      status: 'Ongoing',
      dateAssigned: '2026-01-05',
      deadline: '2026-03-15',
      budgetAllocated: 200000,
      budgetUsed: 95000,
      priority: 'High'
    },
    {
      id: 4,
      name: 'Infrastructure Modernization',
      department: 'Operations',
      section: 'IT Infrastructure',
      assignedTo: 'Marcus Rodriguez',
      status: 'Ongoing',
      dateAssigned: '2025-12-10',
      deadline: '2026-02-15',
      budgetAllocated: 180000,
      budgetUsed: 142000,
      priority: 'High'
    },
    {
      id: 5,
      name: 'Market Expansion Strategy',
      department: 'Marketing',
      section: 'Business Development',
      assignedTo: 'Lisa Anderson',
      status: 'Pending',
      dateAssigned: '2026-01-20',
      deadline: '2026-04-01',
      budgetAllocated: 120000,
      budgetUsed: 15000,
      priority: 'Medium'
    },
    {
      id: 6,
      name: 'Security Compliance Audit',
      department: 'Operations',
      section: 'Security',
      assignedTo: 'James Foster',
      status: 'Delayed',
      dateAssigned: '2025-11-20',
      deadline: '2026-01-30',
      budgetAllocated: 95000,
      budgetUsed: 92000,
      priority: 'Critical'
    },
    {
      id: 7,
      name: 'Product Line Extension',
      department: 'Engineering',
      section: 'Product Development',
      assignedTo: 'Robert Taylor',
      status: 'Ongoing',
      dateAssigned: '2025-12-15',
      deadline: '2026-03-01',
      budgetAllocated: 175000,
      budgetUsed: 98000,
      priority: 'High'
    },
    {
      id: 8,
      name: 'Employee Training Program',
      department: 'Operations',
      section: 'Human Resources',
      assignedTo: 'Patricia Martinez',
      status: 'Completed',
      dateAssigned: '2025-11-01',
      deadline: '2026-01-15',
      budgetAllocated: 65000,
      budgetUsed: 62000,
      priority: 'Medium'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Delayed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-600 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-white';
      case 'Low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateBudgetPercentage = (used: number, allocated: number) => {
    return Math.round((used / allocated) * 100);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredProjects = selectedDepartment === 'all' 
    ? projects 
    : projects.filter(p => p.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
        
        .glow-card {
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        
        .glow-red {
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .glow-green {
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        
        .glow-amber {
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .stat-number {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
        }
        
        .critical-badge {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .7;
          }
        }
      `}</style>

      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold text-slate-900 mb-2 tracking-tight">
              Executive Command Center
            </h1>
            <p className="text-slate-600 text-lg">Extension Services Management Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">LIVE STATUS</p>
            <p className="text-slate-900">{new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Top Section - Critical Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* 1. Overdue Projects & Tasks Rate */}
          <Card className="bg-white ">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-6 w-6 " />
              </div>
              <CardTitle className="text-slate-900 text-lg mt-3">Overdue Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-5xl font-bold  mb-1">{analyticsData.overdueProjects.total}</div>
                  <p className=" text-sm font-medium">{analyticsData.overdueProjects.percentage}% of total projects</p>
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-200">
                  {analyticsData.overdueProjects.byDepartment.map((dept, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-slate-600">{dept.name}</span>
                      <span className=" font-semibold">{dept.count} overdue</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Budget Utilization */}
          <Card className="bg-white ">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <PhilippinePeso className="h-6 w-6 " />
              </div>
              <CardTitle className="text-slate-900 text-lg mt-3">Budget Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold mb-1">
                    {analyticsData.budgetUtilization.utilizationRate}%
                  </div>
                  <p className="text-slate-600 text-sm">Utilization Rate</p>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Allocated</span>
                    <span className="text-slate-900 font-semibold mono">{formatCurrency(analyticsData.budgetUtilization.allocated)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Spent</span>
                    <span className=" font-semibold mono">{formatCurrency(analyticsData.budgetUtilization.spent)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Remaining</span>
                    <span className="font-semibold mono">{formatCurrency(analyticsData.budgetUtilization.remaining)}</span>
                  </div>
                  {analyticsData.budgetUtilization.overBudgetProjects > 0 && (
                    <Badge className="w-full bg-red-600 text-white justify-center mt-2">
                      {analyticsData.budgetUtilization.overBudgetProjects} Projects Over Budget
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Project Health Status */}
          <Card className="bg-white border-slate-200 ">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Activity className="h-6 w-6 " />

              </div>
              <CardTitle className="text-slate-900 text-lg mt-3">Project Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">On Track</span>
                    <span className="text-emerald-600 font-bold text-lg">{analyticsData.projectHealth.onTrack}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${analyticsData.projectHealth.onTrack}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">At Risk</span>
                    <span className="text-amber-600 font-bold text-lg">{analyticsData.projectHealth.atRisk}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${analyticsData.projectHealth.atRisk}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Delayed</span>
                    <span className="text-red-600 font-bold text-lg">{analyticsData.projectHealth.delayed}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${analyticsData.projectHealth.delayed}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Task Load Distribution */}
          <Card className="bg-white ">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Users className="h-6 w-6 " />
              </div>
              <CardTitle className="text-slate-900 text-lg mt-3">Task Load</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.taskLoad.overloadedUsers > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2">
                    <p className="text-amber-700 text-xs font-semibold">
                      {analyticsData.taskLoad.overloadedUsers} Users Overloaded
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  {analyticsData.taskLoad.byDepartment.slice(0, 4).map((dept, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-slate-900 text-xs font-medium">{dept.name}</p>
                        <p className="text-slate-500 text-xs">{dept.users} users</p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-600 font-bold text-sm mono">{dept.tasks}</p>
                        <p className="text-slate-500 text-xs">{dept.avgPerUser.toFixed(1)}/user</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Upcoming Deadlines */}
          <Card className="bg-white border-violet-200 glow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Calendar className="h-6 w-6 " />
              </div>
              <CardTitle className="text-slate-900 text-lg mt-3">Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className=" border  rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Next 7 days</span>
                    <span className="text-red-600 font-bold text-2xl">{analyticsData.upcomingDeadlines.within7Days}</span>
                  </div>
                </div>
                <div className=" border  rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Next 14 days</span>
                    <span className="text-amber-600 font-bold text-2xl">{analyticsData.upcomingDeadlines.within14Days}</span>
                  </div>
                </div>
                <div className=" border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className=" text-sm font-medium">Next 30 days</span>
                    <span className="text-blue-600 font-bold text-2xl">{analyticsData.upcomingDeadlines.within30Days}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Project List */}
        <Card className="bg-white border-slate-200 glow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 text-2xl mb-2">Project Portfolio Overview</CardTitle>
                <CardDescription className="text-slate-600">
                  Comprehensive view of all extension service projects by department
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-slate-500" />
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[200px] bg-white border-slate-300 text-slate-900">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all" className="text-slate-900">All Departments</SelectItem>
                    <SelectItem value="Engineering" className="text-slate-900">Engineering</SelectItem>
                    <SelectItem value="Marketing" className="text-slate-900">Marketing</SelectItem>
                    <SelectItem value="Research" className="text-slate-900">Research</SelectItem>
                    <SelectItem value="Operations" className="text-slate-900">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {filteredProjects.map((project) => {
                  const budgetPercentage = calculateBudgetPercentage(project.budgetUsed, project.budgetAllocated);
                  const daysUntilDeadline = getDaysUntilDeadline(project.deadline);
                  const isOverBudget = project.budgetUsed > project.budgetAllocated;
                  
                  return (
                    <Card key={project.id} className="bg-white border-slate-200 hover:border-blue-400 transition-all hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header Row */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-slate-900 text-lg font-bold mb-2">{project.name}</h3>
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge className={`${getStatusColor(project.status)} border font-medium`}>
                                  {project.status}
                                </Badge>
                                <Badge className={`${getPriorityColor(project.priority)} font-semibold`}>
                                  {project.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                            {/* Department & Section */}
                            <div>
                              <p className="text-slate-500 text-xs mb-1">Department / Section</p>
                              <p className="text-slate-900 font-semibold">{project.department}</p>
                              <p className="text-slate-600 text-sm">{project.section}</p>
                            </div>

                            {/* Assigned To */}
                            <div>
                              <p className="text-slate-500 text-xs mb-1">Assigned To</p>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                                  {project.assignedTo.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-slate-900 font-medium">{project.assignedTo}</span>
                              </div>
                            </div>

                            {/* Dates */}
                            <div>
                              <p className="text-slate-500 text-xs mb-1">Timeline</p>
                              <div className="space-y-1">
                                <p className="text-slate-700 text-sm mono">
                                  <span className="text-slate-500">Assigned:</span> {new Date(project.dateAssigned).toLocaleDateString()}
                                </p>
                                <p className="text-slate-900 text-sm font-semibold mono">
                                  <span className="text-slate-500 font-normal">Deadline:</span> {new Date(project.deadline).toLocaleDateString()}
                                </p>
                                {daysUntilDeadline < 7 && daysUntilDeadline >= 0 && (
                                  <Badge className="bg-red-600 text-white text-xs">
                                    {daysUntilDeadline} days left
                                  </Badge>
                                )}
                                {daysUntilDeadline < 0 && (
                                  <Badge className="bg-red-700 text-white text-xs critical-badge">
                                    {Math.abs(daysUntilDeadline)} days overdue
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Budget */}
                            <div>
                              <p className="text-slate-500 text-xs mb-1">Budget Status</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm mono">
                                  <span className="text-slate-600">Allocated:</span>
                                  <span className="text-slate-900 font-semibold">{formatCurrency(project.budgetAllocated)}</span>
                                </div>
                                <div className="flex justify-between text-sm mono">
                                  <span className="text-slate-600">Used:</span>
                                  <span className={isOverBudget ? "text-red-600 font-semibold" : "text-blue-600 font-semibold"}>
                                    {formatCurrency(project.budgetUsed)}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all ${
                                      isOverBudget ? 'bg-red-500' : 
                                      budgetPercentage > 80 ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                                  />
                                </div>
                                <p className={`text-xs font-semibold ${
                                  isOverBudget ? 'text-red-600' :
                                  budgetPercentage > 80 ? 'text-amber-600' : 'text-blue-600'
                                }`}>
                                  {budgetPercentage}% utilized
                                  {isOverBudget && " - OVER BUDGET"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}