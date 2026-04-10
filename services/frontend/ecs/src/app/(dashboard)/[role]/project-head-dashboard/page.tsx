"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { ScrollArea } from '@/shared/components/ui/ScrollArea'
import { Button } from '@/shared/components/ui/Button';
import { 
  TrendingUp,
  Clock,
  Wallet2,
  Folder,
  FolderOpen,
  Wallet,
  FileText,
  Loader2
} from 'lucide-react';
import ClientNow from '@/shared/components/ui/ClientNow'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AuthService } from '@/shared/lib/auth-service'
import { API_URL } from '@/shared/lib/api-config'

type CurrentUser = {
  id: string
  first_name?: string
  last_name?: string
  username?: string
  department?: string
  assigned_program_chair_id?: string | null
}

type Department = {
  id: string
  department_code?: string
  department_name?: string
  program_chair_id?: string
}

type Program = {
  id: string
  program_name: string
  department_id?: string | null
}

type Project = {
  id: string
  project_name: string
  created_at?: string
  created_by?: string
  status?: string
  approval_status?: string
  budget_allocated?: number | null
  budget_used?: number | null
}

type ChairDepartmentBudget = {
  department_id?: string
  allocated_budget?: number
  spent_budget?: number
}

type Allocation = {
  allocated: number
  spent: number
  remaining: number
  percent: number
}

function normalize(v?: string | null) {
  return String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function toAcronym(name?: string | null) {
  if (!name) return ''
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toLowerCase()
}

function fmtCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount)
}

function fmtDate(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export default function PerformanceDashboard() {
  const params = useParams();
  const role = (params?.role as string) || 'project-head';
  const API = `${API_URL}/api/v1`

  const [currentUser] = useState<CurrentUser | null>(() => AuthService.getUser())
  const [userName] = useState(() => {
    const user = AuthService.getUser();
    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    return fullName || user?.username || 'Project Head';
  });
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [allocation, setAllocation] = useState<Allocation>({ allocated: 0, spent: 0, remaining: 0, percent: 0 })
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    let mounted = true

    const loadDashboard = async () => {
      if (!currentUser?.id) {
        if (!mounted) return
        setError('Could not resolve current user session.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const [deptRes, programRes] = await Promise.all([
          fetch(`${API}/departments`, { headers: authHeaders() }),
          fetch(`${API}/programs`, { headers: authHeaders() }),
        ])

        if (!deptRes.ok) throw new Error('Failed to load departments')
        if (!programRes.ok) throw new Error('Failed to load programs')

        const deptPayload = await deptRes.json()
        const programPayload = await programRes.json()

        const departments: Department[] = deptPayload.departments || []
        const programs: Program[] = programPayload.programs || []

        const userDept = String(currentUser.department || '').toLowerCase().trim()
        const userDeptNorm = normalize(userDept)

        const myDepartment = departments.find((d) => {
          const code = String(d.department_code || '').toLowerCase()
          const name = String(d.department_name || '').toLowerCase()
          const acronym = toAcronym(d.department_name)
          const codeNorm = normalize(code)
          const nameNorm = normalize(name)

          return (
            code === userDept ||
            name === userDept ||
            acronym === userDept ||
            codeNorm === userDeptNorm ||
            nameNorm === userDeptNorm ||
            nameNorm.includes(userDeptNorm) ||
            userDeptNorm.includes(codeNorm)
          )
        })

        if (!myDepartment) {
          throw new Error('Your account department is not mapped to an active department record.')
        }

        const scopedPrograms = programs.filter(p => p.department_id === myDepartment.id)

        const projectResponses = await Promise.all(
          scopedPrograms.map(p => fetch(`${API}/projects?program_id=${p.id}`, { headers: authHeaders() }))
        )

        const mergedProjects: Project[] = []
        for (const res of projectResponses) {
          if (!res.ok) continue
          const payload = await res.json()
          mergedProjects.push(...(payload.projects || []))
        }

        let chairID = currentUser.assigned_program_chair_id || myDepartment.program_chair_id || ''
        let nextAllocation: Allocation = { allocated: 0, spent: 0, remaining: 0, percent: 0 }

        if (chairID) {
          const allocRes = await fetch(
            `${API}/budgets/chair-departments?chair_id=${chairID}&department_id=${myDepartment.id}`,
            { headers: authHeaders() }
          )

          if (allocRes.ok) {
            const allocPayload = await allocRes.json()
            const item: ChairDepartmentBudget | undefined = allocPayload?.chair_department_budgets?.[0]
            const allocated = Number(item?.allocated_budget || 0)
            const spent = Number(item?.spent_budget || 0)
            const remaining = Math.max(allocated - spent, 0)
            const percent = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0
            nextAllocation = { allocated, spent, remaining, percent }
          }
        }

        if (!mounted) return
        setProjects(mergedProjects.sort((a, b) => +new Date(b.created_at || '') - +new Date(a.created_at || '')))
        setAllocation(nextAllocation)
      } catch (err) {
        if (!mounted) return
        setProjects([])
        setAllocation({ allocated: 0, spent: 0, remaining: 0, percent: 0 })
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()
    return () => {
      mounted = false
    }
  }, [API, currentUser])

  const projectStats = useMemo(() => {
    const total = projects.length
    const completed = projects.filter(p => normalize(p.status) === 'completed').length
    const approved = projects.filter(p => normalize(p.approval_status) === 'approved').length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0

    return {
      total,
      completed,
      approved,
      completionRate,
      approvalRate,
    }
  }, [projects])

  const performanceMetrics = [
    {
      title: 'Activity Completion Rate',
      value: `${projectStats.completionRate}%`,
      icon: TrendingUp,
      description: `${projectStats.completed} of ${projectStats.total} projects completed`,
      trend: 'Based on Project Management status',
    },
    {
      title: 'Project Approval Rate',
      value: `${projectStats.approvalRate}%`,
      icon: Clock,
      description: `${projectStats.approved} of ${projectStats.total} projects approved`,
      trend: 'Based on approval workflow results',
    },
    {
      title: 'Budget Utilization',
      value: `${allocation.percent}%`,
      icon: Wallet2,
      description: `${fmtCurrency(allocation.spent)} used from ${fmtCurrency(allocation.allocated)}`,
      trend: 'Based on Budget Management allocation',
    }
  ]

  const displayProjects = useMemo(() => projects.slice(0, 20), [projects])

  const getOwnerLabel = (project: Project) => {
    if (project.created_by && currentUser?.id && project.created_by === currentUser.id) {
      return 'You'
    }
    return 'Project Team'
  }

  const getProjectStatusClass = (status?: string) => {
    const s = normalize(status)
    if (s === 'completed') return 'bg-green-100 text-green-700 border-green-200'
    if (s === 'inprogress') return 'bg-blue-100 text-blue-700 border-blue-200'
    if (s === 'pendingapproval') return 'bg-amber-100 text-amber-700 border-amber-200'
    if (s === 'cancelled') return 'bg-red-100 text-red-700 border-red-200'
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 mb-3">
                Project Head Workspace
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {userName}</h1>
              <p className="text-slate-500 mt-1">Track performance, manage projects, and monitor progress.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild className="bg-[#BA0021] hover:bg-[#930018] text-white">
                <Link href={`/${role}/project-head-request-management`}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Open Project Management
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Last updated: <ClientNow />
          </div>
        </div>

        {error && (
          <Card className="border border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="py-4 text-sm text-amber-800">{error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performanceMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="border border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {metric.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-slate-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : null}
                    <span>{metric.value}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    {metric.description}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    {metric.trend}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-slate-500" />
                <CardTitle>Project List</CardTitle>
              </div>
              <CardDescription>
                All projects assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[450px] pr-4">
                {loading ? (
                  <div className="h-[200px] flex items-center justify-center text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading projects...
                  </div>
                ) : displayProjects.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
                    No projects found for your department.
                  </div>
                ) : (
                <div className="space-y-3">
                  {displayProjects.map((project) => (
                    <div 
                      key={project.id} 
                      className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">
                            {project.project_name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{fmtDate(project.created_at)}</span>
                            </div>
                            <span>•</span>
                            <span>{getOwnerLabel(project)}</span>
                            <Badge className={`${getProjectStatusClass(project.status)} border text-[10px]`}>
                              {(project.status || 'unknown').replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-xs shrink-0">
                          {getOwnerLabel(project).split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 border border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-slate-500" />
                <CardTitle>Quick Access</CardTitle>
              </div>
              <CardDescription>
                Go to core Project Head management pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-[#BA0021] hover:bg-[#930018] text-white">
                <Link href={`/${role}/project-head-request-management`}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Project Management
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50">
                <Link href={`/${role}/project-head-budget-management`}>
                  <Wallet className="h-4 w-4 mr-2" />
                  Budget Management
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50">
                <Link href={`/${role}/project-head-report-submission`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Report Submission
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}