import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/Alert';
import { 
  FolderKanban,
  CheckCircle2,
  Clock,
  CircleDashed,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  dateGiven: string;
  deadline: string;
  status: 'Not Started' | 'Ongoing' | 'Completed';
  priority: string;
}

interface Project {
  id: string;
  name: string;
  department: string;
  status: string;
  dateAssigned: string;
  deadline: string;
  budget: number;
  progress: number;
  description: string;
  totalTasks: number;
  completedTasks: number;
  ongoingTasks: number;
  notStartedTasks: number;
}

export default function ClientDashboard() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Client's assigned projects
  const [projects] = useState<Project[]>([
    {
      id: 'PRJ001',
      name: 'Digital Transformation Initiative',
      department: 'Engineering',
      status: 'Ongoing',
      dateAssigned: '2025-12-01',
      deadline: '2026-02-28',
      budget: 150000,
      progress: 58,
      description: 'Modernizing legacy systems and implementing cloud infrastructure',
      totalTasks: 12,
      completedTasks: 7,
      ongoingTasks: 4,
      notStartedTasks: 1
    },
    {
      id: 'PRJ003',
      name: 'AI Research Integration',
      department: 'Research',
      status: 'Ongoing',
      dateAssigned: '2026-01-05',
      deadline: '2026-03-15',
      budget: 200000,
      progress: 45,
      description: 'Integrating AI capabilities into core product offerings',
      totalTasks: 10,
      completedTasks: 4,
      ongoingTasks: 5,
      notStartedTasks: 1
    },
    {
      id: 'PRJ007',
      name: 'Product Line Extension',
      department: 'Engineering',
      status: 'Ongoing',
      dateAssigned: '2025-12-15',
      deadline: '2026-03-01',
      budget: 175000,
      progress: 55,
      description: 'Developing new product features and variants',
      totalTasks: 8,
      completedTasks: 4,
      ongoingTasks: 3,
      notStartedTasks: 1
    }
  ]);

  // Client's tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'TSK001',
      title: 'Setup development environment',
      description: 'Configure local and cloud development environments with required tools',
      projectId: 'PRJ001',
      dateGiven: '2026-01-15',
      deadline: '2026-01-20',
      status: 'Completed',
      priority: 'High'
    },
    {
      id: 'TSK003',
      title: 'Implement authentication module',
      description: 'Develop secure authentication with OAuth 2.0 and JWT tokens',
      projectId: 'PRJ001',
      dateGiven: '2026-01-22',
      deadline: '2026-02-05',
      status: 'Ongoing',
      priority: 'High'
    },
    {
      id: 'TSK004',
      title: 'Database migration scripts',
      description: 'Create and test all database migration scripts for legacy data',
      projectId: 'PRJ001',
      dateGiven: '2026-01-25',
      deadline: '2026-02-10',
      status: 'Ongoing',
      priority: 'High'
    },
    {
      id: 'TSK006',
      title: 'Unit testing implementation',
      description: 'Write comprehensive unit tests with 80%+ coverage',
      projectId: 'PRJ001',
      dateGiven: '2026-01-30',
      deadline: '2026-02-18',
      status: 'Not Started',
      priority: 'Medium'
    },
    {
      id: 'TSK021',
      title: 'Data collection framework',
      description: 'Setup data collection infrastructure for AI training',
      projectId: 'PRJ003',
      dateGiven: '2026-01-16',
      deadline: '2026-01-28',
      status: 'Completed',
      priority: 'Critical'
    },
    {
      id: 'TSK022',
      title: 'ML model training',
      description: 'Train and optimize machine learning models',
      projectId: 'PRJ003',
      dateGiven: '2026-01-20',
      deadline: '2026-02-10',
      status: 'Ongoing',
      priority: 'High'
    },
    {
      id: 'TSK023',
      title: 'Model evaluation',
      description: 'Evaluate model performance and accuracy metrics',
      projectId: 'PRJ003',
      dateGiven: '2026-01-24',
      deadline: '2026-02-14',
      status: 'Ongoing',
      priority: 'High'
    },
    {
      id: 'TSK025',
      title: 'Performance benchmarking',
      description: 'Benchmark AI performance against industry standards',
      projectId: 'PRJ003',
      dateGiven: '2026-01-28',
      deadline: '2026-02-20',
      status: 'Not Started',
      priority: 'Medium'
    },
    {
      id: 'TSK041',
      title: 'Frontend component library',
      description: 'Develop reusable React components following design system',
      projectId: 'PRJ007',
      dateGiven: '2026-01-20',
      deadline: '2026-02-08',
      status: 'Completed',
      priority: 'High'
    },
    {
      id: 'TSK042',
      title: 'API integration testing',
      description: 'Test all API endpoints and integrations',
      projectId: 'PRJ007',
      dateGiven: '2026-01-26',
      deadline: '2026-02-12',
      status: 'Ongoing',
      priority: 'Medium'
    },
    {
      id: 'TSK043',
      title: 'User documentation',
      description: 'Create comprehensive user guides and tutorials',
      projectId: 'PRJ007',
      dateGiven: '2026-01-28',
      deadline: '2026-02-15',
      status: 'Not Started',
      priority: 'Low'
    }
  ]);

  const handleStatusChange = (taskId: string, newStatus: 'Not Started' | 'Ongoing' | 'Completed') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    setSuccessMessage(`Task status updated to "${newStatus}"`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
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

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (deadline: string) => {
    return getDaysUntilDeadline(deadline) < 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-6">

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              My Projects & Tasks
            </h1>
            <p className="text-slate-600 text-lg">Track your assigned projects and manage your tasks</p>
          </div>
          <Badge className="bg-teal-600 text-white px-4 py-2 text-sm">
            <FolderKanban className="h-4 w-4 mr-2" />
            Client Dashboard
          </Badge>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Alert className="border-green-300 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-900 font-semibold">Success!</AlertTitle>
            <AlertDescription className="text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Assigned Projects Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-teal-600" />
            Assigned Projects
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg text-slate-900">{project.name}</CardTitle>
                    <Badge className={getProjectStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-600 text-sm">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Project ID:</span>
                      <span className="font-semibold text-slate-900 ">{project.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Department:</span>
                      <span className="font-semibold text-slate-900">{project.department}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Budget:</span>
                      <span className="font-semibold text-slate-900 ">{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Deadline:</span>
                      <span className="font-semibold text-slate-900 ">{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">Progress</span>
                      <span className="text-lg font-bold text-teal-600">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 mb-3">
                      <div 
                        className="bg-teal-600 h-3 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span className="text-slate-600">{project.completedTasks} Done</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <span className="text-slate-600">{project.ongoingTasks} Ongoing</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CircleDashed className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-600">{project.notStartedTasks} Pending</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* My Tasks Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-teal-600" />
            My Tasks
          </h2>

          <div className="space-y-4">
            {projects.map((project) => {
              const projectTasks = tasks.filter(task => task.projectId === project.id);
              if (projectTasks.length === 0) return null;

              return (
                <Card key={project.id} className="bg-white border-slate-200 shadow-lg">
                  <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FolderKanban className="h-5 w-5 text-teal-600" />
                        <div>
                          <CardTitle className="text-xl text-slate-900">{project.name}</CardTitle>
                          <CardDescription className="text-slate-600 text-sm">
                            {projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'} assigned
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-teal-100 text-teal-700 border-teal-300">
                        {project.id}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {projectTasks.map((task) => {
                        const daysLeft = getDaysUntilDeadline(task.deadline);
                        const overdue = isOverdue(task.deadline);

                        return (
                          <Card key={task.id} className="border-slate-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                              <div className="space-y-4">
                                {/* Task Header */}
                                <div className="flex items-start gap-4">
                                  <div className="mt-1">
                                    {getStatusIcon(task.status)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                      <div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-1">{task.title}</h3>
                                        <p className="text-sm text-slate-600">{task.description}</p>
                                      </div>
                                      <Badge className={`${getPriorityColor(task.priority)} font-semibold`}>
                                        {task.priority}
                                      </Badge>
                                    </div>

                                    {/* Task Details */}
                                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-slate-500" />
                                          <div>
                                            <span className="text-xs text-slate-600">Date Given:</span>
                                            <p className="text-sm font-semibold text-slate-900 mono">{new Date(task.dateGiven).toLocaleDateString()}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4 text-slate-500" />
                                          <div>
                                            <span className="text-xs text-slate-600">Deadline:</span>
                                            <p className="text-sm font-semibold text-slate-900 mono">{new Date(task.deadline).toLocaleDateString()}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Deadline Warning */}
                                      {overdue ? (
                                        <Alert className="border-red-300 bg-red-50 py-2">
                                          <AlertTriangle className="h-4 w-4 text-red-600" />
                                          <AlertDescription className="text-red-700 text-sm">
                                            <span className="font-semibold">Overdue by {Math.abs(daysLeft)} days</span>
                                          </AlertDescription>
                                        </Alert>
                                      ) : daysLeft <= 3 && task.status !== 'Completed' ? (
                                        <Alert className="border-amber-300 bg-amber-50 py-2">
                                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                                          <AlertDescription className="text-amber-700 text-sm">
                                            <span className="font-semibold">Due in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>
                                          </AlertDescription>
                                        </Alert>
                                      ) : null}

                                      {/* Status Change */}
                                      <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                                        <span className="text-sm font-semibold text-slate-700">Update Status:</span>
                                        <Select 
                                          value={task.status} 
                                          onValueChange={(value: 'Not Started' | 'Ongoing' | 'Completed') => handleStatusChange(task.id, value)}
                                        >
                                          <SelectTrigger className="w-[200px] bg-white border-slate-300 text-slate-900">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white border-slate-200">
                                            <SelectItem value="Not Started" className="text-slate-900">
                                              <div className="flex items-center gap-2">
                                                <CircleDashed className="h-4 w-4 text-slate-400" />
                                                <span>Not Started</span>
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="Ongoing" className="text-slate-900">
                                              <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                                <span>Ongoing</span>
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="Completed" className="text-slate-900">
                                              <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <span>Completed</span>
                                              </div>
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Badge className={`${getStatusColor(task.status)} border`}>
                                          {task.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}