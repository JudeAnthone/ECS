"use client"

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { ScrollArea } from '@/shared/components/ui/ScrollArea'
import { Alert, AlertDescription } from '@/shared/components/ui/Alert'
import { CheckCircle2, Bell, Folder, Loader2 } from 'lucide-react'
import ClientNow from '@/shared/components/ui/ClientNow'
import { AuthService } from '@/shared/lib/auth-service'

const API = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/v1`

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

interface StaffProjectSummary {
  project_id: string
  project_name: string
  department_name: string
  status: string
  date_assigned: string
  deadline?: string | null
  budget_allocated?: number | null
  progress: number
  description?: string | null
  total_tasks: number
  completed_tasks: number
  ongoing_tasks: number
  not_started_tasks: number
  cancelled_tasks: number
}

interface StaffTask {
  id: string
  title: string
  description?: string | null
  project_id: string
  project_name: string
  date_given: string
  deadline?: string | null
  status: TaskStatus
  priority: string
}

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

function formatStatus(status: string) {
  const value = (status || '').toLowerCase()
  if (value === 'in_progress') return 'In Progress'
  if (value === 'pending') return 'Not Started'
  if (value === 'completed') return 'Completed'
  if (value === 'cancelled') return 'Cancelled'
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '-'
}

function formatCurrency(amount?: number | null) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getPriorityBadge(priority: string) {
  const value = (priority || '').toLowerCase()
  if (value === 'critical' || value === 'urgent') return 'bg-red-100 text-red-700 border-red-200'
  if (value === 'high') return 'bg-orange-100 text-orange-700 border-orange-200'
  if (value === 'medium') return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-slate-100 text-slate-700 border-slate-200'
}

export default function PersonnelDashboard() {
  const [projects, setProjects] = useState<StaffProjectSummary[]>([])
  const [tasks, setTasks] = useState<StaffTask[]>([])
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [projectRes, taskRes] = await Promise.all([
        fetch(`${API}/staff/projects-with-task-summary`, { headers: authHeaders() }),
        fetch(`${API}/staff/tasks`, { headers: authHeaders() }),
      ])

      if (!projectRes.ok) throw new Error(await projectRes.text() || 'Failed to load assigned projects.')
      if (!taskRes.ok) throw new Error(await taskRes.text() || 'Failed to load assigned tasks.')

      const projectPayload = await projectRes.json()
      const taskPayload = await taskRes.json()

      setProjects(Array.isArray(projectPayload.projects) ? projectPayload.projects : [])
      setTasks(Array.isArray(taskPayload.tasks) ? taskPayload.tasks : [])
    } catch (err) {
      setProjects([])
      setTasks([])
      setError(err instanceof Error ? err.message : 'Failed to load staff dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const user = AuthService.getUser()
    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
    setUserName(fullName || user?.username || '')
  }, [])

  const tasksByProject = useMemo(() => {
    const map = new Map<string, StaffTask[]>()
    for (const task of tasks) {
      const list = map.get(task.project_id) || []
      list.push(task)
      map.set(task.project_id, list)
    }
    return map
  }, [tasks])

  const totalProjects = projects.length
  const activeProjects = projects.filter(project => (project.status || '').toLowerCase() === 'in_progress').length
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in_progress').length

  const upcomingTasks = [...tasks]
    .filter(task => task.status !== 'completed' && task.status !== 'cancelled')
    .sort((a, b) => {
      const aDate = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY
      const bDate = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY
      return aDate - bDate
    })
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm text-slate-900">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-600">
                Staff Workspace
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {userName ? `Welcome back, ${userName}` : 'Welcome back'}
                </h1>
                <p className="mt-3 max-w-2xl text-sm md:text-base text-slate-500">
                  Track the projects you own, review task progress, and stay aligned with your assigned work in one place.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Last updated: <span className="font-semibold text-slate-900"><ClientNow /></span>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50 text-red-700">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center">
              <Folder className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{totalProjects}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Assigned Projects</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{activeProjects}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Active Projects</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-amber-50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{completedTasks}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Completed Tasks</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-rose-50 flex items-center justify-center">
              <Bell className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{pendingTasks}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Pending Tasks</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl font-semibold text-slate-900">Assigned Projects</CardTitle>
              <CardDescription className="text-slate-500">Current project workload and task completion status.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading assigned projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="py-10 text-center text-slate-400">No assigned projects found yet.</div>
              ) : (
                <div className="space-y-4">
                  {projects.map(project => {
                    const projectTasks = tasksByProject.get(project.project_id) || []
                    const completedCount = projectTasks.filter(task => task.status === 'completed').length
                    const taskProgress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : project.progress

                    return (
                      <div key={project.project_id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-semibold text-slate-900">{project.project_name}</h3>
                              <Badge className="bg-slate-100 text-slate-700 border-slate-200">{formatStatus(project.status)}</Badge>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">{project.department_name}</p>
                          </div>
                          <div className="text-right text-sm text-slate-600">
                            <div className="font-medium text-slate-900">{formatCurrency(project.budget_allocated)}</div>
                            <div className="text-xs text-slate-500">Budget</div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2 text-sm">
                            <span className="text-slate-600">Task Progress</span>
                            <span className="font-semibold text-slate-900">{taskProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-slate-900 h-2.5 rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(taskProgress, 100))}%` }} />
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div className="rounded-lg bg-white border border-slate-200 p-3">
                            <div className="text-xs text-slate-500">Total Tasks</div>
                            <div className="font-semibold text-slate-900">{project.total_tasks}</div>
                          </div>
                          <div className="rounded-lg bg-white border border-slate-200 p-3">
                            <div className="text-xs text-slate-500">Completed</div>
                            <div className="font-semibold text-emerald-600">{project.completed_tasks}</div>
                          </div>
                          <div className="rounded-lg bg-white border border-slate-200 p-3">
                            <div className="text-xs text-slate-500">Ongoing</div>
                            <div className="font-semibold text-blue-600">{project.ongoing_tasks}</div>
                          </div>
                          <div className="rounded-lg bg-white border border-slate-200 p-3">
                            <div className="text-xs text-slate-500">Pending</div>
                            <div className="font-semibold text-amber-600">{project.not_started_tasks}</div>
                          </div>
                        </div>

                        <div className="mt-4 text-xs text-slate-500">
                          Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : '—'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-white border border-slate-200 rounded-3xl shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-slate-600" />
                  <CardTitle className="text-lg font-semibold text-slate-900">Notifications</CardTitle>
                </div>
                <CardDescription className="text-slate-500">To be developed</CardDescription>
              </CardHeader>
              <CardContent className="p-6 text-sm text-slate-500 bg-white rounded-b-3xl">
                Notifications are not available yet.
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200 rounded-3xl shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold text-slate-900">Upcoming Tasks</CardTitle>
                <CardDescription className="text-slate-500">Nearest deadlines from your assigned work.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[420px]">
                  <div className="p-4 space-y-3">
                    {upcomingTasks.length === 0 ? (
                      <div className="py-8 text-center text-slate-400">No upcoming tasks.</div>
                    ) : upcomingTasks.map(task => (
                      <div key={task.id} className="rounded-2xl border border-slate-200 p-4 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{task.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{task.project_name}</p>
                          </div>
                          <Badge className={`text-xs border ${getPriorityBadge(task.priority)}`}>{task.priority}</Badge>
                        </div>
                        <div className="mt-3 text-xs text-slate-600">
                          Status: <span className="font-medium text-slate-900">{formatStatus(task.status)}</span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
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
    </div>
  )
}