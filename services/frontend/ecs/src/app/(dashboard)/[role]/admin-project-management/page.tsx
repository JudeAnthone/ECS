"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/Table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/DropdownMenu';
import { 
  FolderKanban,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Archive,
  PlayCircle,
  CheckCircle,
  Plus
} from 'lucide-react';

export default function ProjectManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Sample project data
  const [projects, setProjects] = useState([
    {
      id: 'PRJ001',
      name: 'Digital Transformation Initiative',
      department: 'Engineering',
      section: 'Software Development',
      assignedTo: 'Sarah Chen',
      status: 'Ongoing',
      priority: 'High',
      dateAssigned: '2025-12-01',
      deadline: '2026-02-28',
      budgetAllocated: 150000,
      budgetUsed: 125000,
      progress: 75,
      description: 'Modernizing legacy systems and implementing cloud infrastructure'
    },
    {
      id: 'PRJ002',
      name: 'Customer Experience Enhancement',
      department: 'Marketing',
      section: 'Customer Relations',
      assignedTo: 'David Kim',
      status: 'Delayed',
      priority: 'Critical',
      dateAssigned: '2025-11-15',
      deadline: '2026-01-31',
      budgetAllocated: 80000,
      budgetUsed: 85000,
      progress: 60,
      description: 'Redesigning customer touchpoints and support channels'
    },
    {
      id: 'PRJ003',
      name: 'AI Research Integration',
      department: 'Research',
      section: 'Innovation Lab',
      assignedTo: 'Emily Watson',
      status: 'Ongoing',
      priority: 'High',
      dateAssigned: '2026-01-05',
      deadline: '2026-03-15',
      budgetAllocated: 200000,
      budgetUsed: 95000,
      progress: 45,
      description: 'Integrating AI capabilities into core product offerings'
    },
    {
      id: 'PRJ004',
      name: 'Infrastructure Modernization',
      department: 'Operations',
      section: 'IT Infrastructure',
      assignedTo: 'Marcus Rodriguez',
      status: 'Ongoing',
      priority: 'High',
      dateAssigned: '2025-12-10',
      deadline: '2026-02-15',
      budgetAllocated: 180000,
      budgetUsed: 142000,
      progress: 80,
      description: 'Upgrading servers and network infrastructure'
    },
    {
      id: 'PRJ005',
      name: 'Market Expansion Strategy',
      department: 'Marketing',
      section: 'Business Development',
      assignedTo: 'Lisa Anderson',
      status: 'Pending',
      priority: 'Medium',
      dateAssigned: '2026-01-20',
      deadline: '2026-04-01',
      budgetAllocated: 120000,
      budgetUsed: 15000,
      progress: 10,
      description: 'Expanding into new geographic markets'
    },
    {
      id: 'PRJ006',
      name: 'Security Compliance Audit',
      department: 'Operations',
      section: 'Security',
      assignedTo: 'James Foster',
      status: 'Delayed',
      priority: 'Critical',
      dateAssigned: '2025-11-20',
      deadline: '2026-01-30',
      budgetAllocated: 95000,
      budgetUsed: 92000,
      progress: 85,
      description: 'Comprehensive security audit and compliance review'
    },
    {
      id: 'PRJ007',
      name: 'Product Line Extension',
      department: 'Engineering',
      section: 'Product Development',
      assignedTo: 'Robert Taylor',
      status: 'Ongoing',
      priority: 'High',
      dateAssigned: '2025-12-15',
      deadline: '2026-03-01',
      budgetAllocated: 175000,
      budgetUsed: 98000,
      progress: 55,
      description: 'Developing new product features and variants'
    },
    {
      id: 'PRJ008',
      name: 'Employee Training Program',
      department: 'Operations',
      section: 'Human Resources',
      assignedTo: 'Patricia Martinez',
      status: 'Completed',
      priority: 'Medium',
      dateAssigned: '2025-11-01',
      deadline: '2026-01-15',
      budgetAllocated: 65000,
      budgetUsed: 62000,
      progress: 100,
      description: 'Company-wide skills development and training initiative'
    },
    {
      id: 'PRJ009',
      name: 'Data Analytics Platform',
      department: 'Research',
      section: 'Data Science',
      assignedTo: 'Michelle Lee',
      status: 'Ongoing',
      priority: 'High',
      dateAssigned: '2026-01-10',
      deadline: '2026-03-20',
      budgetAllocated: 160000,
      budgetUsed: 78000,
      progress: 50,
      description: 'Building comprehensive analytics and reporting platform'
    },
    {
      id: 'PRJ010',
      name: 'Mobile App Development',
      department: 'Engineering',
      section: 'Mobile Development',
      assignedTo: 'John Smith',
      status: 'Pending',
      priority: 'Medium',
      dateAssigned: '2026-01-25',
      deadline: '2026-04-15',
      budgetAllocated: 140000,
      budgetUsed: 12000,
      progress: 5,
      description: 'Native mobile applications for iOS and Android'
    }
  ]);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || 
      project.department === selectedDepartment;
    
    const matchesStatus = selectedStatus === 'all' || 
      project.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Ongoing':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Delayed':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
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
      currency: 'PHP',
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

  const handleView = (projectId: string) => {
    console.log('View project:', projectId);
  };

  const handleEdit = (projectId: string) => {
    console.log('Edit project:', projectId);
  };

  const handleDelete = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    console.log('Deleted project:', projectId);
  };

  const handleArchive = (projectId: string) => {
    console.log('Archive project:', projectId);
  };

  const handleStartProject = (projectId: string) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, status: 'Ongoing' } : p
    ));
    console.log('Started project:', projectId);
  };

  const handleCompleteProject = (projectId: string) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, status: 'Completed', progress: 100 } : p
    ));
    console.log('Completed project:', projectId);
  };

  // Get unique departments and statuses
  const departments = Array.from(new Set(projects.map(p => p.department))).sort();
  const statuses = ['Pending', 'Ongoing', 'Delayed', 'Completed'];

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
        
        .table-row-hover:hover {
          background-color: rgba(59, 130, 246, 0.05);
          transition: all 0.2s ease;
        }
      `}</style>

      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Project Management
            </h1>
            <p className="text-slate-600 text-lg">Manage all projects, timelines, and budgets</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
            <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
              <FolderKanban className="h-4 w-4 mr-2" />
              {filteredProjects.length} Projects
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900 text-2xl mb-2">Project Directory</CardTitle>
                <CardDescription className="text-slate-600">
                  Search and filter projects by department, status, or project ID
                </CardDescription>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by ID, project name, or assigned user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-slate-900"
                />
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[180px] bg-white border-slate-300 text-slate-900">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all" className="text-slate-900">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept} className="text-slate-900">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px] bg-white border-slate-300 text-slate-900">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all" className="text-slate-900">All Statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status} className="text-slate-900">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || selectedDepartment !== 'all' || selectedStatus !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDepartment('all');
                    setSelectedStatus('all');
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredProjects.length}</span> of{' '}
                <span className="font-semibold text-slate-900">{projects.length}</span> projects
              </p>
            </div>

            {/* Project Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="text-slate-700 font-semibold">Project ID</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Project Name</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Department</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Assigned To</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Priority</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Progress</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Deadline</TableHead>
                    <TableHead className="text-slate-700 font-semibold">Budget</TableHead>
                    <TableHead className="text-slate-700 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                        No projects found matching your search criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => {
                      const budgetPercentage = calculateBudgetPercentage(project.budgetUsed, project.budgetAllocated);
                      const daysUntilDeadline = getDaysUntilDeadline(project.deadline);
                      const isOverBudget = project.budgetUsed > project.budgetAllocated;

                      return (
                        <TableRow key={project.id} className="table-row-hover border-slate-200">
                          <TableCell className="font-semibold text-slate-900 mono">
                            {project.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-slate-900 font-semibold">{project.name}</p>
                              <p className="text-slate-500 text-xs">{project.section}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-700 border-blue-300 font-medium">
                              {project.department}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                                {project.assignedTo.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-slate-900 font-medium text-sm">{project.assignedTo}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(project.status)} border font-medium`}>
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getPriorityColor(project.priority)} font-semibold`}>
                              {project.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-600 font-semibold">{project.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-slate-900 text-sm mono">
                                {new Date(project.deadline).toLocaleDateString()}
                              </span>
                              {daysUntilDeadline < 7 && daysUntilDeadline >= 0 && (
                                <span className="text-red-600 text-xs font-semibold">
                                  {daysUntilDeadline} days left
                                </span>
                              )}
                              {daysUntilDeadline < 0 && (
                                <span className="text-red-700 text-xs font-semibold">
                                  {Math.abs(daysUntilDeadline)} days overdue
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className={`text-xs mono font-semibold ${isOverBudget ? 'text-red-600' : 'text-slate-700'}`}>
                                {formatCurrency(project.budgetUsed)}
                              </span>
                              <span className="text-xs text-slate-500 mono">
                                of {formatCurrency(project.budgetAllocated)}
                              </span>
                              <span className={`text-xs font-semibold ${
                                isOverBudget ? 'text-red-600' :
                                budgetPercentage > 80 ? 'text-amber-600' : 'text-blue-600'
                              }`}>
                                {budgetPercentage}% used
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white border-slate-200">
                                <DropdownMenuItem 
                                  onClick={() => handleView(project.id)}
                                  className="cursor-pointer text-slate-900 hover:bg-slate-100"
                                >
                                  <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleEdit(project.id)}
                                  className="cursor-pointer text-slate-900 hover:bg-slate-100"
                                >
                                  <Edit className="mr-2 h-4 w-4 text-green-600" />
                                  <span>Edit Project</span>
                                </DropdownMenuItem>
                                {project.status === 'Pending' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleStartProject(project.id)}
                                    className="cursor-pointer text-slate-900 hover:bg-slate-100"
                                  >
                                    <PlayCircle className="mr-2 h-4 w-4 text-green-600" />
                                    <span>Start Project</span>
                                  </DropdownMenuItem>
                                )}
                                {project.status === 'Ongoing' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleCompleteProject(project.id)}
                                    className="cursor-pointer text-slate-900 hover:bg-slate-100"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    <span>Mark Complete</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => handleArchive(project.id)}
                                  className="cursor-pointer text-slate-900 hover:bg-slate-100"
                                >
                                  <Archive className="mr-2 h-4 w-4 text-amber-600" />
                                  <span>Archive Project</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(project.id)}
                                  className="cursor-pointer text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete Project</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}