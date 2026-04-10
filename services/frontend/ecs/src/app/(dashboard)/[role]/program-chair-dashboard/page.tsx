"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { ScrollArea } from '@/shared/components/ui/ScrollArea';
import { Button } from '@/shared/components/ui/Button';
import { AlertTriangle, Calendar, ChevronDown, ChevronUp, FolderOpen, Loader2, PhilippinePeso, TrendingUp } from 'lucide-react';
import ClientNow from '@/shared/components/ui/ClientNow';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AuthService } from '@/shared/lib/auth-service';
import { API_URL } from '@/shared/lib/api-config';

type Program = {
  id: string;
  program_name: string;
  status?: string;
};

type Project = {
  id: string;
  project_name: string;
  program_id?: string;
  status?: string;
  approval_status?: string;
  budget_allocated?: number | null;
  budget_used?: number | null;
  end_date?: string | null;
  created_at?: string;
};

type ChairBudget = {
  allocated_budget?: number;
  spent_budget?: number;
};

type ChairDepartmentBudget = {
  department_id?: string;
  allocated_budget?: number;
  spent_budget?: number;
};

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function normalize(v?: string | null) {
  return String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function daysUntil(endDate?: string | null) {
  if (!endDate) return null;
  const now = new Date();
  const d = Math.ceil((new Date(endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Number.isFinite(d) ? d : null;
}

export default function ProgramChairDashboardPage() {
  const params = useParams();
  const role = (params?.role as string) || 'program-chair';
  const API = `${API_URL}/api/v1`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [chairBudget, setChairBudget] = useState<ChairBudget | null>(null);
  const [chairDepartmentBudgets, setChairDepartmentBudgets] = useState<ChairDepartmentBudget[]>([]);
  const [expandedDeadlineBucket, setExpandedDeadlineBucket] = useState<'due7' | 'due14' | 'due30' | 'overdue' | null>(null);

  const [userName] = useState(() => {
    const user = AuthService.getUser();
    const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    return fullName || user?.username || 'Program Chair';
  });

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      const user = AuthService.getUser();
      if (!user?.id) {
        if (!mounted) return;
        setLoading(false);
        setError('Could not resolve current user session.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [programRes, budgetRes, chairDeptBudgetRes] = await Promise.all([
          fetch(`${API}/programs/program-chair/${user.id}`, { headers: authHeaders() }),
          fetch(`${API}/budgets/chairs?chair_id=${user.id}`, { headers: authHeaders() }),
          fetch(`${API}/budgets/chair-departments?chair_id=${user.id}`, { headers: authHeaders() }),
        ]);

        const nextPrograms: Program[] = programRes.ok ? ((await programRes.json()).programs || []) : [];
        const budgetPayload = budgetRes.ok ? await budgetRes.json() : { program_chair_budgets: [] };
        const chairDeptBudgetPayload = chairDeptBudgetRes.ok ? await chairDeptBudgetRes.json() : { chair_department_budgets: [] };
        const nextChairBudget: ChairBudget | null = (budgetPayload.program_chair_budgets || [])[0] || null;
        const nextChairDepartmentBudgets: ChairDepartmentBudget[] = chairDeptBudgetPayload.chair_department_budgets || [];

        const projectResponses = await Promise.all(
          nextPrograms.map((program) => fetch(`${API}/projects?program_id=${program.id}`, { headers: authHeaders() }))
        );

        const mergedProjects: Project[] = [];
        for (const res of projectResponses) {
          if (!res.ok) continue;
          const payload = await res.json();
          mergedProjects.push(...(payload.projects || []));
        }

        if (!mounted) return;
        setPrograms(nextPrograms);
        setChairBudget(nextChairBudget);
        setChairDepartmentBudgets(nextChairDepartmentBudgets);
        setProjects(mergedProjects.sort((a, b) => +new Date(b.created_at || '') - +new Date(a.created_at || '')));
      } catch (err) {
        if (!mounted) return;
        setPrograms([]);
        setChairBudget(null);
        setChairDepartmentBudgets([]);
        setProjects([]);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadDashboard();
    return () => {
      mounted = false;
    };
  }, [API]);

  const stats = useMemo(() => {
    const totalPrograms = programs.length;
    const activePrograms = programs.filter((p) => normalize(p.status) === 'active').length;
    const totalProjects = projects.length;
    const approvedProjects = projects.filter((p) => normalize(p.approval_status) === 'approved').length;
    const overdueProjects = projects.filter((p) => {
      if (!p.end_date) return false;
      return new Date(p.end_date) < new Date() && normalize(p.status) !== 'completed';
    }).length;
    const overBudgetProjects = projects.filter((p) => Number(p.budget_used || 0) > Number(p.budget_allocated || 0)).length;

    const allocated = Number(chairBudget?.allocated_budget || 0);
    const spent = Number(chairBudget?.spent_budget || 0);
    const allocatedToDepartments = chairDepartmentBudgets.reduce((sum, item) => sum + Number(item.allocated_budget || 0), 0);
    const utilization = allocated > 0 ? Math.min(100, Math.round((allocatedToDepartments / allocated) * 100)) : 0;

    const within = (days: number) => {
      return projects.filter((p) => {
        const d = daysUntil(p.end_date);
        return d != null && d >= 0 && d <= days;
      }).length;
    };

    return {
      totalPrograms,
      activePrograms,
      totalProjects,
      approvedProjects,
      overdueProjects,
      overBudgetProjects,
      allocated,
      spent,
      allocatedToDepartments,
      remaining: Math.max(allocated - allocatedToDepartments, 0),
      utilization,
      due7: within(7),
      due14: within(14),
      due30: within(30),
    };
  }, [programs, projects, chairBudget, chairDepartmentBudgets]);

  const programNameById = useMemo(() => {
    const map = new Map<string, string>();
    programs.forEach((p) => map.set(p.id, p.program_name));
    return map;
  }, [programs]);

  const due7Projects = useMemo(() => {
    return projects
      .filter((p) => {
        const d = daysUntil(p.end_date);
        return d != null && d >= 0 && d <= 7;
      })
      .sort((a, b) => (daysUntil(a.end_date) || 0) - (daysUntil(b.end_date) || 0));
  }, [projects]);

  const due14Projects = useMemo(() => {
    return projects
      .filter((p) => {
        const d = daysUntil(p.end_date);
        return d != null && d >= 0 && d <= 14;
      })
      .sort((a, b) => (daysUntil(a.end_date) || 0) - (daysUntil(b.end_date) || 0));
  }, [projects]);

  const due30Projects = useMemo(() => {
    return projects
      .filter((p) => {
        const d = daysUntil(p.end_date);
        return d != null && d >= 0 && d <= 30;
      })
      .sort((a, b) => (daysUntil(a.end_date) || 0) - (daysUntil(b.end_date) || 0));
  }, [projects]);

  const overdueProjectsList = useMemo(() => {
    return projects
      .filter((p) => {
        const d = daysUntil(p.end_date);
        return d != null && d < 0 && normalize(p.status) !== 'completed';
      })
      .sort((a, b) => (daysUntil(a.end_date) || 0) - (daysUntil(b.end_date) || 0));
  }, [projects]);

  const renderDeadlineList = (items: Project[], emptyText: string) => {
    if (items.length === 0) {
      return <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">{emptyText}</div>;
    }

    return (
      <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2">
        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
          {items.map((project) => {
            const d = daysUntil(project.end_date);
            return (
              <div key={project.id} className="rounded border border-slate-200 bg-white px-2 py-1.5">
                <p className="text-xs font-semibold text-slate-900">{project.project_name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {programNameById.get(project.program_id || '') || 'Program not mapped'}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Due: {project.end_date ? new Date(project.end_date).toLocaleDateString('en-PH') : '-'}
                  {d != null ? ` (${d} day${d === 1 ? '' : 's'} left)` : ''}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderOverdueList = (items: Project[], emptyText: string) => {
    if (items.length === 0) {
      return <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{emptyText}</div>;
    }

    return (
      <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2">
        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
          {items.map((project) => {
            const d = daysUntil(project.end_date);
            const lateDays = d != null ? Math.abs(d) : null;
            return (
              <div key={project.id} className="rounded border border-red-200 bg-white px-2 py-1.5">
                <p className="text-xs font-semibold text-slate-900">{project.project_name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {programNameById.get(project.program_id || '') || 'Program not mapped'}
                </p>
                <p className="text-[11px] text-red-700 mt-0.5">
                  Due: {project.end_date ? new Date(project.end_date).toLocaleDateString('en-PH') : '-'}
                  {lateDays != null ? ` (${lateDays} day${lateDays === 1 ? '' : 's'} overdue)` : ''}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 mb-3">
                Program Chair Workspace
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {userName}</h1>
              <p className="text-slate-500 mt-1">Real-time program and budget summary from your assigned portfolio.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild className="bg-[#BA0021] hover:bg-[#930018] text-white">
                <Link href={`/${role}/program-chair-program-management`}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Open Program Management
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                <Link href={`/${role}/program-chair-budget-management`}>
                  <PhilippinePeso className="h-4 w-4 mr-2" />
                  Budget Management
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">Last updated: <ClientNow /></div>
        </div>

        {error && (
          <Card className="border border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="py-4 text-sm text-amber-800">{error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-slate-400" /> : null}
                {stats.totalPrograms}
              </div>
              <p className="text-xs text-slate-500 mt-1">{stats.activePrograms} active programs</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalProjects}</div>
              <p className="text-xs text-slate-500 mt-1">{stats.approvedProjects} approved</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Budget Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.utilization}%</div>
              <p className="text-xs text-slate-500 mt-1">{formatCurrency(stats.allocatedToDepartments)} allocated to departments of {formatCurrency(stats.allocated)}</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Risk Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.overdueProjects + stats.overBudgetProjects}</div>
              <p className="text-xs text-slate-500 mt-1">{stats.overdueProjects} overdue, {stats.overBudgetProjects} over budget</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-slate-500" />
                <CardTitle>Program Snapshot</CardTitle>
              </div>
              <CardDescription>Current status of programs under your chair account.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[380px] pr-3">
                <div className="space-y-3">
                  {loading ? (
                    <div className="py-8 text-slate-500 flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading programs...</div>
                  ) : programs.length === 0 ? (
                    <div className="py-8 text-slate-500 text-sm">No assigned programs found.</div>
                  ) : (
                    programs.map((program) => (
                      <div key={program.id} className="rounded-xl border border-slate-200 p-4 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{program.program_name}</p>
                            <p className="text-xs text-slate-500 mt-1">Program ID: {program.id}</p>
                          </div>
                          <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
                            {(program.status || 'draft').replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-500" />
                <CardTitle>Deadline Radar</CardTitle>
              </div>
              <CardDescription>Click a range to view project deadlines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-slate-200 p-2">
                <button
                  type="button"
                  onClick={() => setExpandedDeadlineBucket(expandedDeadlineBucket === 'due7' ? null : 'due7')}
                  className="w-full px-1 py-0.5 flex items-center justify-between"
                >
                  <span className="text-sm text-slate-600">Due in 7 days</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#BA0021]">{stats.due7}</span>
                    {expandedDeadlineBucket === 'due7' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </span>
                </button>
                {expandedDeadlineBucket === 'due7' ? renderDeadlineList(due7Projects, 'No projects due in 7 days.') : null}
              </div>

              <div className="rounded-lg border border-slate-200 p-2">
                <button
                  type="button"
                  onClick={() => setExpandedDeadlineBucket(expandedDeadlineBucket === 'due14' ? null : 'due14')}
                  className="w-full px-1 py-0.5 flex items-center justify-between"
                >
                  <span className="text-sm text-slate-600">Due in 14 days</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900">{stats.due14}</span>
                    {expandedDeadlineBucket === 'due14' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </span>
                </button>
                {expandedDeadlineBucket === 'due14' ? renderDeadlineList(due14Projects, 'No projects due in 14 days.') : null}
              </div>

              <div className="rounded-lg border border-slate-200 p-2">
                <button
                  type="button"
                  onClick={() => setExpandedDeadlineBucket(expandedDeadlineBucket === 'due30' ? null : 'due30')}
                  className="w-full px-1 py-0.5 flex items-center justify-between"
                >
                  <span className="text-sm text-slate-600">Due in 30 days</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900">{stats.due30}</span>
                    {expandedDeadlineBucket === 'due30' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </span>
                </button>
                {expandedDeadlineBucket === 'due30' ? renderDeadlineList(due30Projects, 'No projects due in 30 days.') : null}
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-2">
                <button
                  type="button"
                  onClick={() => setExpandedDeadlineBucket(expandedDeadlineBucket === 'overdue' ? null : 'overdue')}
                  className="w-full px-1 py-0.5 flex items-center justify-between"
                >
                  <span className="text-sm text-red-700 flex items-center"><AlertTriangle className="h-4 w-4 mr-1" />Overdue</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xl font-bold text-red-700">{stats.overdueProjects}</span>
                    {expandedDeadlineBucket === 'overdue' ? <ChevronUp className="h-4 w-4 text-red-300" /> : <ChevronDown className="h-4 w-4 text-red-300" />}
                  </span>
                </button>
                {expandedDeadlineBucket === 'overdue' ? renderOverdueList(overdueProjectsList, 'No overdue projects.') : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}