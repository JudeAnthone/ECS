"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
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
  CheckCircle,
  Loader2,
} from 'lucide-react';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/v1`;

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

interface StaffProjectSummary {
  project_id: string;
  project_name: string;
  department_name: string;
  status: string;
  date_assigned: string;
  deadline?: string | null;
  budget_allocated?: number | null;
  progress: number;
  description?: string | null;
  total_tasks: number;
  completed_tasks: number;
  ongoing_tasks: number;
  not_started_tasks: number;
  cancelled_tasks: number;
}

interface StaffTask {
  id: string;
  title: string;
  description?: string | null;
  project_id: string;
  project_name: string;
  date_given: string;
  deadline?: string | null;
  status: TaskStatus;
  priority: string;
}

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function formatStatus(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'in_progress') return 'In Progress';
  if (s === 'pending') return 'Not Started';
  if (s === 'completed') return 'Completed';
  if (s === 'cancelled') return 'Cancelled';
  if (!s) return '-';
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function StaffProjectTaskPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [projects, setProjects] = useState<StaffProjectSummary[]>([]);
  const [tasks, setTasks] = useState<StaffTask[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [projectRes, taskRes] = await Promise.all([
        fetch(`${API}/staff/projects-with-task-summary`, { headers: authHeaders() }),
        fetch(`${API}/staff/tasks`, { headers: authHeaders() }),
      ]);

      if (!projectRes.ok) {
        const text = await projectRes.text();
        throw new Error(text || 'Failed to load assigned projects.');
      }
      if (!taskRes.ok) {
        const text = await taskRes.text();
        throw new Error(text || 'Failed to load assigned tasks.');
      }

      const projectPayload = await projectRes.json();
      const taskPayload = await taskRes.json();

      setProjects(Array.isArray(projectPayload.projects) ? projectPayload.projects : []);
      setTasks(Array.isArray(taskPayload.tasks) ? taskPayload.tasks : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff task data.');
      setProjects([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tasksByProject = useMemo(() => {
    const map = new Map<string, StaffTask[]>();
    for (const task of tasks) {
      const list = map.get(task.project_id) || [];
      list.push(task);
      map.set(task.project_id, list);
    }
    return map;
  }, [tasks]);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'pending':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getProjectStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'on_hold':
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    const p = (priority || '').toLowerCase();
    switch (p) {
      case 'urgent':
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'pending':
      default:
        return <CircleDashed className="h-5 w-5 text-slate-400" />;
    }
  };

  const getDaysUntilDeadline = (deadline?: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const updateTaskStatus = async (taskID: string, newStatus: TaskStatus) => {
    const previousTasks = tasks;
    setTasks(prev => prev.map(task => task.id === taskID ? { ...task, status: newStatus } : task));

    try {
      const res = await fetch(`${API}/staff/tasks/${taskID}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to update task status.');
      }

      setError('');
      setSuccessMessage(`Task status updated to "${formatStatus(newStatus)}"`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await loadData();
    } catch (err) {
      setTasks(previousTasks);
      setError(err instanceof Error ? err.message : 'Failed to update task status.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">My Projects & Tasks</h1>
            <p className="text-slate-600 text-lg">Track your assigned projects and manage your tasks</p>
          </div>
          <Badge className="bg-teal-600 text-white px-4 py-2 text-sm">
            <FolderKanban className="h-4 w-4 mr-2" />
            Staff Dashboard
          </Badge>
        </div>

        {loading && (
          <Card>
            <CardContent className="p-8 flex items-center justify-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading assigned projects and tasks...
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert className="border-red-300 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-900 font-semibold">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {showSuccess && (
          <Alert className="border-green-300 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-900 font-semibold">Success</AlertTitle>
            <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && projects.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-slate-600">
              No assigned projects found yet.
            </CardContent>
          </Card>
        )}

        {!loading && projects.length > 0 && (
          <>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FolderKanban className="h-6 w-6 text-teal-600" />
                Assigned Projects
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <Card key={project.project_id} className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg text-slate-900">{project.project_name}</CardTitle>
                        <Badge className={getProjectStatusColor(project.status)}>{formatStatus(project.status)}</Badge>
                      </div>
                      <CardDescription className="text-slate-600 text-sm">{project.description || 'No description provided'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Project ID:</span>
                          <span className="font-semibold text-slate-900">{project.project_id}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Department:</span>
                          <span className="font-semibold text-slate-900">{project.department_name || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Budget:</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(project.budget_allocated)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Deadline:</span>
                          <span className="font-semibold text-slate-900">{project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'}</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-700">Progress</span>
                          <span className="text-lg font-bold text-teal-600">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 mb-3">
                          <div className="bg-teal-600 h-3 rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(project.progress, 100))}%` }} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="text-slate-600">{project.completed_tasks} Done</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-blue-600" />
                            <span className="text-slate-600">{project.ongoing_tasks} Ongoing</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CircleDashed className="h-3 w-3 text-slate-400" />
                            <span className="text-slate-600">{project.not_started_tasks} Pending</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-teal-600" />
                My Tasks
              </h2>

              <div className="space-y-4">
                {projects.map(project => {
                  const projectTasks = tasksByProject.get(project.project_id) || [];
                  if (projectTasks.length === 0) {
                    return (
                      <Card key={project.project_id} className="bg-white border-slate-200 shadow-lg">
                        <CardHeader className="bg-slate-50 border-b border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FolderKanban className="h-5 w-5 text-teal-600" />
                              <div>
                                <CardTitle className="text-xl text-slate-900">{project.project_name}</CardTitle>
                                <CardDescription className="text-slate-600 text-sm">No tasks assigned yet</CardDescription>
                              </div>
                            </div>
                            <Badge className="bg-teal-100 text-teal-700 border-teal-300">{project.project_id}</Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  }

                  return (
                    <Card key={project.project_id} className="bg-white border-slate-200 shadow-lg">
                      <CardHeader className="bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FolderKanban className="h-5 w-5 text-teal-600" />
                            <div>
                              <CardTitle className="text-xl text-slate-900">{project.project_name}</CardTitle>
                              <CardDescription className="text-slate-600 text-sm">{projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'} assigned</CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-teal-100 text-teal-700 border-teal-300">{project.project_id}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {projectTasks.map(task => {
                            const daysLeft = getDaysUntilDeadline(task.deadline);
                            const overdue = daysLeft != null && daysLeft < 0;

                            return (
                              <Card key={task.id} className="border-slate-200 hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                  <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                      <div className="mt-1">{getStatusIcon(task.status)}</div>
                                      <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                          <div>
                                            <h3 className="font-bold text-slate-900 text-lg mb-1">{task.title}</h3>
                                            <p className="text-sm text-slate-600">{task.description || 'No description provided'}</p>
                                          </div>
                                          <Badge className={`${getPriorityColor(task.priority)} font-semibold`}>{formatStatus(task.priority)}</Badge>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                              <Calendar className="h-4 w-4 text-slate-500" />
                                              <div>
                                                <span className="text-xs text-slate-600">Date Given:</span>
                                                <p className="text-sm font-semibold text-slate-900">{new Date(task.date_given).toLocaleDateString()}</p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Calendar className="h-4 w-4 text-slate-500" />
                                              <div>
                                                <span className="text-xs text-slate-600">Deadline:</span>
                                                <p className="text-sm font-semibold text-slate-900">{task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}</p>
                                              </div>
                                            </div>
                                          </div>

                                          {overdue ? (
                                            <Alert className="border-red-300 bg-red-50 py-2">
                                              <AlertTriangle className="h-4 w-4 text-red-600" />
                                              <AlertDescription className="text-red-700 text-sm">
                                                <span className="font-semibold">Overdue by {Math.abs(daysLeft || 0)} days</span>
                                              </AlertDescription>
                                            </Alert>
                                          ) : daysLeft != null && daysLeft <= 3 && task.status !== 'completed' && task.status !== 'cancelled' ? (
                                            <Alert className="border-amber-300 bg-amber-50 py-2">
                                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                                              <AlertDescription className="text-amber-700 text-sm">
                                                <span className="font-semibold">Due in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>
                                              </AlertDescription>
                                            </Alert>
                                          ) : null}

                                          <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                                            <span className="text-sm font-semibold text-slate-700">Update Status:</span>
                                            {task.status === 'pending' ? (
                                              <Button
                                                className="bg-blue-600 hover:bg-blue-700"
                                                onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                              >
                                                Accept Task
                                              </Button>
                                            ) : (
                                              <Select value={task.status} onValueChange={(value: TaskStatus) => updateTaskStatus(task.id, value)}>
                                                <SelectTrigger className="w-[220px] bg-white border-slate-300 text-slate-900">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-slate-200">
                                                  <SelectItem value="in_progress" className="text-slate-900">Ongoing</SelectItem>
                                                  <SelectItem value="completed" className="text-slate-900">Completed</SelectItem>
                                                  <SelectItem value="cancelled" className="text-slate-900">Cancelled</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            )}
                                            <Badge className={`${getStatusColor(task.status)} border`}>{formatStatus(task.status)}</Badge>
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
          </>
        )}
      </div>
    </div>
  );
}
