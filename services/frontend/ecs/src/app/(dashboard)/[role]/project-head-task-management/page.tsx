"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/Dialog';
import { 
  ClipboardList,
  Search,
  FolderKanban,
  CheckCircle2,
  Clock,
  CircleDashed,
  Calendar,
  User,
  AlertCircle,
  Filter
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dateGiven: string;
  dueDate: string;
  status: 'Not Started' | 'Ongoing' | 'Completed';
  priority: string;
}

interface Project {
  id: string;
  name: string;
  department: string;
  status: string;
  assignedTo: string;
  totalTasks: number;
  completedTasks: number;
  ongoingTasks: number;
  notStartedTasks: number;
}

export default function TaskManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectList, setShowProjectList] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Sample projects with task counts
  const allProjects: Project[] = [
    {
      id: 'PRJ001',
      name: 'Digital Transformation Initiative',
      department: 'Engineering',
      status: 'Ongoing',
      assignedTo: 'Sarah Chen',
      totalTasks: 12,
      completedTasks: 7,
      ongoingTasks: 4,
      notStartedTasks: 1
    },
    {
      id: 'PRJ002',
      name: 'Customer Experience Enhancement',
      department: 'Marketing',
      status: 'Ongoing',
      assignedTo: 'David Kim',
      totalTasks: 8,
      completedTasks: 3,
      ongoingTasks: 3,
      notStartedTasks: 2
    },
    {
      id: 'PRJ003',
      name: 'AI Research Integration',
      department: 'Research',
      status: 'Ongoing',
      assignedTo: 'Emily Watson',
      totalTasks: 10,
      completedTasks: 4,
      ongoingTasks: 5,
      notStartedTasks: 1
    },
    {
      id: 'PRJ004',
      name: 'Infrastructure Modernization',
      department: 'Operations',
      status: 'Ongoing',
      assignedTo: 'Marcus Rodriguez',
      totalTasks: 15,
      completedTasks: 12,
      ongoingTasks: 2,
      notStartedTasks: 1
    },
    {
      id: 'PRJ005',
      name: 'Market Expansion Strategy',
      department: 'Marketing',
      status: 'Pending',
      assignedTo: 'Lisa Anderson',
      totalTasks: 6,
      completedTasks: 0,
      ongoingTasks: 2,
      notStartedTasks: 4
    }
  ];

  // Sample tasks for each project (in real app, this would be fetched based on selected project)
  const projectTasks: Record<string, Task[]> = {
    'PRJ001': [
      {
        id: 'TSK001',
        title: 'Setup development environment',
        description: 'Configure local and cloud development environments with required tools',
        assignedTo: 'Robert Taylor',
        dateGiven: '2026-01-15',
        dueDate: '2026-01-20',
        status: 'Completed',
        priority: 'High'
      },
      {
        id: 'TSK002',
        title: 'Design system architecture',
        description: 'Create comprehensive architecture diagrams and documentation',
        assignedTo: 'Sarah Chen',
        dateGiven: '2026-01-18',
        dueDate: '2026-01-30',
        status: 'Completed',
        priority: 'Critical'
      },
      {
        id: 'TSK003',
        title: 'Implement authentication module',
        description: 'Develop secure authentication with OAuth 2.0 and JWT tokens',
        assignedTo: 'David Kim',
        dateGiven: '2026-01-22',
        dueDate: '2026-02-05',
        status: 'Ongoing',
        priority: 'High'
      },
      {
        id: 'TSK004',
        title: 'Database migration scripts',
        description: 'Create and test all database migration scripts for legacy data',
        assignedTo: 'Robert Taylor',
        dateGiven: '2026-01-25',
        dueDate: '2026-02-10',
        status: 'Ongoing',
        priority: 'High'
      },
      {
        id: 'TSK005',
        title: 'API endpoint development',
        description: 'Build RESTful API endpoints for core functionality',
        assignedTo: 'Emily Watson',
        dateGiven: '2026-01-28',
        dueDate: '2026-02-15',
        status: 'Ongoing',
        priority: 'Medium'
      },
      {
        id: 'TSK006',
        title: 'Unit testing implementation',
        description: 'Write comprehensive unit tests with 80%+ coverage',
        assignedTo: 'David Kim',
        dateGiven: '2026-01-30',
        dueDate: '2026-02-18',
        status: 'Not Started',
        priority: 'Medium'
      },
      {
        id: 'TSK007',
        title: 'Frontend component library',
        description: 'Develop reusable React components following design system',
        assignedTo: 'Michelle Lee',
        dateGiven: '2026-01-20',
        dueDate: '2026-02-08',
        status: 'Completed',
        priority: 'High'
      },
      {
        id: 'TSK008',
        title: 'Performance optimization',
        description: 'Optimize application performance and reduce load times',
        assignedTo: 'Sarah Chen',
        dateGiven: '2026-01-26',
        dueDate: '2026-02-12',
        status: 'Ongoing',
        priority: 'Medium'
      },
      {
        id: 'TSK009',
        title: 'Security audit',
        description: 'Conduct comprehensive security audit and fix vulnerabilities',
        assignedTo: 'James Foster',
        dateGiven: '2026-01-19',
        dueDate: '2026-02-03',
        status: 'Completed',
        priority: 'Critical'
      },
      {
        id: 'TSK010',
        title: 'User documentation',
        description: 'Create detailed user guides and API documentation',
        assignedTo: 'Patricia Martinez',
        dateGiven: '2026-01-24',
        dueDate: '2026-02-14',
        status: 'Completed',
        priority: 'Medium'
      },
      {
        id: 'TSK011',
        title: 'Integration testing',
        description: 'Perform end-to-end integration testing across all modules',
        assignedTo: 'Marcus Rodriguez',
        dateGiven: '2026-01-27',
        dueDate: '2026-02-16',
        status: 'Completed',
        priority: 'High'
      },
      {
        id: 'TSK012',
        title: 'Deployment pipeline setup',
        description: 'Configure CI/CD pipeline for automated deployments',
        assignedTo: 'Robert Taylor',
        dateGiven: '2026-01-21',
        dueDate: '2026-02-07',
        status: 'Completed',
        priority: 'High'
      }
    ],
    'PRJ002': [
      {
        id: 'TSK013',
        title: 'Customer survey analysis',
        description: 'Analyze customer feedback and survey results',
        assignedTo: 'Lisa Anderson',
        dateGiven: '2026-01-18',
        dueDate: '2026-02-01',
        status: 'Completed',
        priority: 'High'
      },
      {
        id: 'TSK014',
        title: 'UX redesign mockups',
        description: 'Create new user interface mockups based on feedback',
        assignedTo: 'Michelle Lee',
        dateGiven: '2026-01-22',
        dueDate: '2026-02-08',
        status: 'Ongoing',
        priority: 'High'
      },
      {
        id: 'TSK015',
        title: 'A/B testing setup',
        description: 'Configure A/B testing framework for new features',
        assignedTo: 'David Kim',
        dateGiven: '2026-01-25',
        dueDate: '2026-02-10',
        status: 'Ongoing',
        priority: 'Medium'
      },
      {
        id: 'TSK016',
        title: 'Customer journey mapping',
        description: 'Map complete customer journey across all touchpoints',
        assignedTo: 'Marcus Rodriguez',
        dateGiven: '2026-01-28',
        dueDate: '2026-02-15',
        status: 'Not Started',
        priority: 'Medium'
      },
      {
        id: 'TSK017',
        title: 'Chatbot integration',
        description: 'Integrate AI chatbot for customer support',
        assignedTo: 'Emily Watson',
        dateGiven: '2026-01-30',
        dueDate: '2026-02-20',
        status: 'Not Started',
        priority: 'Low'
      },
      {
        id: 'TSK018',
        title: 'Mobile app optimization',
        description: 'Optimize mobile app performance and user experience',
        assignedTo: 'Sarah Chen',
        dateGiven: '2026-01-20',
        dueDate: '2026-02-05',
        status: 'Completed',
        priority: 'High'
      },
      {
        id: 'TSK019',
        title: 'Analytics dashboard',
        description: 'Build customer analytics dashboard for stakeholders',
        assignedTo: 'Robert Taylor',
        dateGiven: '2026-01-26',
        dueDate: '2026-02-12',
        status: 'Ongoing',
        priority: 'Medium'
      },
      {
        id: 'TSK020',
        title: 'Support ticket system',
        description: 'Implement new support ticket management system',
        assignedTo: 'James Foster',
        dateGiven: '2026-01-19',
        dueDate: '2026-02-06',
        status: 'Completed',
        priority: 'High'
      }
    ],
    'PRJ003': [
      {
        id: 'TSK021',
        title: 'Data collection framework',
        description: 'Setup data collection infrastructure for AI training',
        assignedTo: 'Emily Watson',
        dateGiven: '2026-01-16',
        dueDate: '2026-01-28',
        status: 'Completed',
        priority: 'Critical'
      },
      {
        id: 'TSK022',
        title: 'ML model training',
        description: 'Train and optimize machine learning models',
        assignedTo: 'Michelle Lee',
        dateGiven: '2026-01-20',
        dueDate: '2026-02-10',
        status: 'Ongoing',
        priority: 'High'
      },
      {
        id: 'TSK023',
        title: 'Model evaluation',
        description: 'Evaluate model performance and accuracy metrics',
        assignedTo: 'David Kim',
        dateGiven: '2026-01-24',
        dueDate: '2026-02-14',
        status: 'Ongoing',
        priority: 'High'
      },
      {
        id: 'TSK024',
        title: 'API integration',
        description: 'Integrate AI models into existing API infrastructure',
        assignedTo: 'Robert Taylor',
        dateGiven: '2026-01-26',
        dueDate: '2026-02-18',
        status: 'Ongoing',
        priority: 'Medium'
      },
      {
        id: 'TSK025',
        title: 'Performance benchmarking',
        description: 'Benchmark AI performance against industry standards',
        assignedTo: 'Sarah Chen',
        dateGiven: '2026-01-28',
        dueDate: '2026-02-20',
        status: 'Not Started',
        priority: 'Medium'
      },
      {
        id: 'TSK026',
        title: 'Documentation',
        description: 'Document AI models, architecture, and usage guidelines',
        assignedTo: 'Patricia Martinez',
        dateGiven: '2026-01-22',
        dueDate: '2026-02-12',
        status: 'Ongoing',
        priority: 'Medium'
      },
      {
        id: 'TSK027',
        title: 'Data preprocessing pipeline',
        description: 'Build automated data preprocessing and cleaning pipeline',
        assignedTo: 'Marcus Rodriguez',
        dateGiven: '2026-01-18',
        dueDate: '2026-02-04',
        status: 'Completed',
        priority: 'High'
      },
      {
        id: 'TSK028',
        title: 'User interface design',
        description: 'Design UI for AI-powered features',
        assignedTo: 'Michelle Lee',
        dateGiven: '2026-01-25',
        dueDate: '2026-02-15',
        status: 'Ongoing',
        priority: 'High'
      },
      {
        id: 'TSK029',
        title: 'Testing framework',
        description: 'Create comprehensive testing framework for AI models',
        assignedTo: 'James Foster',
        dateGiven: '2026-01-19',
        dueDate: '2026-02-08',
        status: 'Completed',
        priority: 'High'
      },
      {
        id: 'TSK030',
        title: 'Deployment strategy',
        description: 'Plan and document AI model deployment strategy',
        assignedTo: 'Emily Watson',
        dateGiven: '2026-01-21',
        dueDate: '2026-02-11',
        status: 'Completed',
        priority: 'High'
      }
    ],
    'PRJ004': [
      {
        id: 'TSK031',
        title: 'Server migration',
        description: 'Migrate all servers to new infrastructure',
        assignedTo: 'Marcus Rodriguez',
        dateGiven: '2026-01-10',
        dueDate: '2026-01-25',
        status: 'Completed',
        priority: 'Critical'
      },
      {
        id: 'TSK032',
        title: 'Network upgrade',
        description: 'Upgrade network infrastructure and bandwidth',
        assignedTo: 'Robert Taylor',
        dateGiven: '2026-01-15',
        dueDate: '2026-02-05',
        status: 'Completed',
        priority: 'High'
      },
      {
        id: 'TSK033',
        title: 'Load balancer configuration',
        description: 'Setup and configure load balancing system',
        assignedTo: 'David Kim',
        dateGiven: '2026-01-20',
        dueDate: '2026-02-10',
        status: 'Ongoing',
        priority: 'High'
      },
      {
        id: 'TSK034',
        title: 'Disaster recovery plan',
        description: 'Develop comprehensive disaster recovery procedures',
        assignedTo: 'James Foster',
        dateGiven: '2026-01-25',
        dueDate: '2026-02-15',
        status: 'Ongoing',
        priority: 'Critical'
      },
      {
        id: 'TSK035',
        title: 'Monitoring system',
        description: 'Implement infrastructure monitoring and alerting',
        assignedTo: 'Sarah Chen',
        dateGiven: '2026-01-12',
        dueDate: '2026-01-28',
        status: 'Completed',
        priority: 'High'
      }
    ],
    'PRJ005': [
      {
        id: 'TSK036',
        title: 'Market research',
        description: 'Conduct comprehensive market research for target regions',
        assignedTo: 'Lisa Anderson',
        dateGiven: '2026-01-22',
        dueDate: '2026-02-12',
        status: 'Ongoing',
        priority: 'High'
      },
      {
        id: 'TSK037',
        title: 'Competitor analysis',
        description: 'Analyze competitors in new markets',
        assignedTo: 'Marcus Rodriguez',
        dateGiven: '2026-01-25',
        dueDate: '2026-02-15',
        status: 'Ongoing',
        priority: 'High'
      },
      {
        id: 'TSK038',
        title: 'Partnership opportunities',
        description: 'Identify and evaluate potential partnership opportunities',
        assignedTo: 'Emily Watson',
        dateGiven: '2026-01-28',
        dueDate: '2026-02-20',
        status: 'Not Started',
        priority: 'Medium'
      },
      {
        id: 'TSK039',
        title: 'Regulatory compliance',
        description: 'Research regulatory requirements for target markets',
        assignedTo: 'James Foster',
        dateGiven: '2026-01-30',
        dueDate: '2026-02-25',
        status: 'Not Started',
        priority: 'High'
      },
      {
        id: 'TSK040',
        title: 'Localization strategy',
        description: 'Develop product localization strategy for new markets',
        assignedTo: 'Patricia Martinez',
        dateGiven: '2026-02-01',
        dueDate: '2026-02-28',
        status: 'Not Started',
        priority: 'Medium'
      },
      {
        id: 'TSK041',
        title: 'Budget planning',
        description: 'Create detailed budget plan for market expansion',
        assignedTo: 'Lisa Anderson',
        dateGiven: '2026-02-03',
        dueDate: '2026-03-01',
        status: 'Not Started',
        priority: 'High'
      }
    ]
  };

  const filteredProjects = allProjects.filter(project =>
    searchTerm === '' ||
    project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectList(false);
    setSearchTerm('');
    setStatusFilter('all');
  };

  const getCurrentTasks = (): Task[] => {
    if (!selectedProject) return [];
    const tasks = projectTasks[selectedProject.id] || [];
    
    if (statusFilter === 'all') return tasks;
    return tasks.filter(task => task.status === statusFilter);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'Ongoing':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'Not Started':
        return <CircleDashed className="h-5 w-5 text-slate-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Ongoing':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Not Started':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getProjectStatusColor = (status: string) => {
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

  const calculateProgress = (project: Project) => {
    return Math.round((project.completedTasks / project.totalTasks) * 100);
  };

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
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Task Management
            </h1>
            <p className="text-slate-600 text-lg">Track and monitor project tasks and progress</p>
          </div>
          <Badge className="bg-indigo-600 text-white px-4 py-2 text-sm">
            <ClipboardList className="h-4 w-4 mr-2" />
            Task Tracker
          </Badge>
        </div>

        {/* Project Selection */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 text-xl">Select Project</CardTitle>
            <CardDescription className="text-slate-600">
              Choose a project to view its tasks and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedProject ? (
              <Button
                onClick={() => setShowProjectList(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Projects
              </Button>
            ) : (
              <div className="border border-indigo-300 rounded-lg p-6 bg-indigo-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FolderKanban className="h-6 w-6 text-indigo-600" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-xl">{selectedProject.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">Project ID: {selectedProject.id}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowProjectList(true)}
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                  >
                    Change Project
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <p className="text-xs text-slate-600 mb-1">Department</p>
                    <p className="font-semibold text-slate-900">{selectedProject.department}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <p className="text-xs text-slate-600 mb-1">Project Status</p>
                    <Badge className={getProjectStatusColor(selectedProject.status)}>
                      {selectedProject.status}
                    </Badge>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <p className="text-xs text-slate-600 mb-1">Project Lead</p>
                    <p className="font-semibold text-slate-900 text-sm">{selectedProject.assignedTo}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <p className="text-xs text-slate-600 mb-1">Total Tasks</p>
                    <p className="font-semibold text-slate-900 text-xl">{selectedProject.totalTasks}</p>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-900">Overall Progress</h4>
                    <span className="text-lg font-bold text-indigo-600">{calculateProgress(selectedProject)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-indigo-600 h-3 rounded-full transition-all"
                      style={{ width: `${calculateProgress(selectedProject)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-slate-600">Completed: <span className="font-semibold text-slate-900">{selectedProject.completedTasks}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-slate-600">Ongoing: <span className="font-semibold text-slate-900">{selectedProject.ongoingTasks}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CircleDashed className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">Not Started: <span className="font-semibold text-slate-900">{selectedProject.notStartedTasks}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task List */}
        {selectedProject && (
          <Card className="bg-white border-slate-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 text-2xl">Project Tasks</CardTitle>
                  <CardDescription className="text-slate-600">
                    All tasks assigned for this project
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-white border-slate-300 text-slate-900">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="all" className="text-slate-900">All Tasks</SelectItem>
                      <SelectItem value="Completed" className="text-slate-900">Completed</SelectItem>
                      <SelectItem value="Ongoing" className="text-slate-900">Ongoing</SelectItem>
                      <SelectItem value="Not Started" className="text-slate-900">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getCurrentTasks().length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No tasks found matching the selected filter</p>
                  </div>
                ) : (
                  getCurrentTasks().map((task) => (
                    <Card key={task.id} className="border-slate-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {getStatusIcon(task.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-bold text-slate-900 text-lg mb-1">{task.title}</h3>
                                <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                              </div>
                              <Badge className={`${getStatusColor(task.status)} ml-4 border font-medium`}>
                                {task.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-600 font-medium mono">Task ID:</span>
                                <span className="text-xs text-slate-900 font-semibold mono">{task.id}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-slate-500" />
                                <span className="text-xs text-slate-600">Assigned to:</span>
                                <span className="text-xs text-slate-900 font-semibold">{task.assignedTo}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-slate-500" />
                                <span className="text-xs text-slate-600">Given:</span>
                                <span className="text-xs text-slate-900 font-semibold mono">{new Date(task.dateGiven).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-slate-500" />
                                <span className="text-xs text-slate-600">Due:</span>
                                <span className="text-xs text-slate-900 font-semibold mono">{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Project Selection Dialog */}
      <Dialog open={showProjectList} onOpenChange={setShowProjectList}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-900">Select Project</DialogTitle>
            <DialogDescription className="text-slate-600">
              Choose a project to view its tasks and track progress
            </DialogDescription>
          </DialogHeader>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by project ID, name, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-300 text-slate-900"
            />
          </div>

          {/* Project List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.length === 0 ? (
              <p className="col-span-2 text-center text-slate-500 py-8">No projects found</p>
            ) : (
              filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:shadow-lg transition-all border-slate-200 hover:border-indigo-400"
                  onClick={() => handleSelectProject(project)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <FolderKanban className="h-6 w-6 text-indigo-600 shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 mb-1">{project.name}</h3>
                        <p className="text-xs text-slate-600 mono mb-2">ID: {project.id}</p>
                        <Badge className={getProjectStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Department:</span>
                        <span className="font-semibold text-slate-900">{project.department}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Total Tasks:</span>
                        <span className="font-semibold text-slate-900">{project.totalTasks}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${calculateProgress(project)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-600">{calculateProgress(project)}% Complete</span>
                        <div className="flex items-center gap-3">
                          <span className="text-green-600">✓ {project.completedTasks}</span>
                          <span className="text-blue-600">⟳ {project.ongoingTasks}</span>
                          <span className="text-slate-400">○ {project.notStartedTasks}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}