"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/shared/components/ui/Alert";
import { Badge } from "@/shared/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import { AuthService } from "@/shared/lib/auth-service";
import ClientNow from "@/shared/components/ui/ClientNow";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Loader2,
  Search,
  Target,
  TriangleAlert,
  CircleDashed,
} from "lucide-react";

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/v1`;

type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
type FilterStatus = "all" | "completed" | "in_progress" | "pending";

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
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function formatStatus(status: string) {
  const value = (status || "").toLowerCase();
  if (value === "in_progress") return "In Progress";
  if (value === "pending") return "Not Yet Started";
  if (value === "completed") return "Done";
  if (value === "cancelled") return "Cancelled";
  return value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "-";
}

function formatShortDate(value?: string | null) {
  if (!value) return "No deadline";
  return new Date(value).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount?: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusClasses(status: TaskStatus) {
  if (status === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "in_progress") return "border-sky-200 bg-sky-50 text-sky-700";
  if (status === "pending") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function getPriorityTone(priority: string) {
  const value = (priority || "").toLowerCase();
  if (value === "critical" || value === "urgent") return "text-rose-600 bg-rose-50 border-rose-200";
  if (value === "high") return "text-orange-600 bg-orange-50 border-orange-200";
  if (value === "medium") return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-emerald-600 bg-emerald-50 border-emerald-200";
}

function getDaysUntilDeadline(deadline?: string | null) {
  if (!deadline) return null;
  const today = new Date();
  const dueDate = new Date(deadline);
  const diffMs = dueDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

const filterOptions: Array<{ value: FilterStatus; label: string }> = [
  { value: "all", label: "All Tasks" },
  { value: "completed", label: "Done" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Not Yet Started" },
];

export default function StaffAnalyticsPage() {
  const [projects, setProjects] = useState<StaffProjectSummary[]>([]);
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = AuthService.getUser();
    const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
    setUserName(fullName || user?.username || "Staff Member");
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [projectRes, taskRes] = await Promise.all([
          fetch(`${API}/staff/projects-with-task-summary`, { headers: authHeaders() }),
          fetch(`${API}/staff/tasks`, { headers: authHeaders() }),
        ]);

        if (!projectRes.ok) throw new Error((await projectRes.text()) || "Failed to load analytics projects.");
        if (!taskRes.ok) throw new Error((await taskRes.text()) || "Failed to load analytics tasks.");

        const projectPayload = await projectRes.json();
        const taskPayload = await taskRes.json();

        if (!active) return;

        setProjects(Array.isArray(projectPayload.projects) ? projectPayload.projects : []);
        setTasks(Array.isArray(taskPayload.tasks) ? taskPayload.tasks : []);
      } catch (err) {
        if (!active) return;
        setProjects([]);
        setTasks([]);
        setError(err instanceof Error ? err.message : "Failed to load staff analytics.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const filteredTasks = useMemo(() => {
    const search = query.trim().toLowerCase();

    return tasks.filter(task => {
      const matchesStatus = statusFilter === "all" ? true : task.status === statusFilter;
      if (!matchesStatus) return false;

      if (!search) return true;

      return [
        task.title,
        task.description,
        task.project_name,
        task.priority,
        formatStatus(task.status),
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(search));
    });
  }, [query, statusFilter, tasks]);

  const filteredProjectIds = useMemo(() => new Set(filteredTasks.map(task => task.project_id)), [filteredTasks]);

  const filteredProjects = useMemo(() => {
    if (!query.trim() && statusFilter === "all") return projects;
    return projects.filter(project => filteredProjectIds.has(project.project_id));
  }, [filteredProjectIds, projects, query, statusFilter]);

  const taskCounts = useMemo(() => {
    const completed = filteredTasks.filter(task => task.status === "completed").length;
    const inProgress = filteredTasks.filter(task => task.status === "in_progress").length;
    const pending = filteredTasks.filter(task => task.status === "pending").length;
    const cancelled = filteredTasks.filter(task => task.status === "cancelled").length;
    return { completed, inProgress, pending, cancelled };
  }, [filteredTasks]);

  const completionRate = filteredTasks.length === 0 ? 0 : Math.round((taskCounts.completed / filteredTasks.length) * 100);

  const dueSoonTasks = useMemo(() => {
    return filteredTasks
      .filter(task => task.status !== "completed" && task.status !== "cancelled")
      .map(task => ({ ...task, daysLeft: getDaysUntilDeadline(task.deadline) }))
      .filter(task => task.daysLeft !== null && task.daysLeft <= 5)
      .sort((a, b) => (a.daysLeft ?? Number.POSITIVE_INFINITY) - (b.daysLeft ?? Number.POSITIVE_INFINITY))
      .slice(0, 4);
  }, [filteredTasks]);

  const projectCards = useMemo(() => {
    return filteredProjects.map(project => {
      const projectTasks = filteredTasks.filter(task => task.project_id === project.project_id);
      const completed = projectTasks.filter(task => task.status === "completed").length;
      const inProgress = projectTasks.filter(task => task.status === "in_progress").length;
      const pending = projectTasks.filter(task => task.status === "pending").length;
      const progress = projectTasks.length === 0 ? 0 : Math.round((completed / projectTasks.length) * 100);

      return {
        ...project,
        filteredTaskCount: projectTasks.length,
        completed,
        inProgress,
        pending,
        progress,
      };
    });
  }, [filteredProjects, filteredTasks]);

  const topTasks = useMemo(() => {
    return [...filteredTasks]
      .sort((a, b) => {
        const aDate = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
        const bDate = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
        return aDate - bDate;
      })
      .slice(0, 6);
  }, [filteredTasks]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(186,0,33,0.12),_transparent_28%),linear-gradient(180deg,_#fff7f7_0%,_#fffdf8_40%,_#ffffff_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-[#f1d7dc] bg-white/90 shadow-[0_24px_80px_-48px_rgba(125,10,35,0.45)] backdrop-blur">
          <div className="grid gap-6 px-6 py-7 md:px-8 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-4">
              <div className="inline-flex w-fit items-center rounded-full border border-[#e8c6ce] bg-[#fff4f6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8f1934]">
                Staff Analytics
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Workload clarity for {userName}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Search across assigned work, filter tasks by completion stage, and monitor which projects need attention next.
                </p>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] bg-[#8f1934] p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/75">Last updated</p>
                  <p className="mt-1 text-lg font-semibold">
                    <ClientNow />
                  </p>
                </div>
                <BarChart3 className="h-9 w-9 text-white/80" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-white/70">Projects in scope</p>
                  <p className="mt-1 text-2xl font-bold">{filteredProjects.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-white/70">Tasks matched</p>
                  <p className="mt-1 text-2xl font-bold">{filteredTasks.length}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <Alert className="border-rose-200 bg-rose-50 text-rose-700">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-[1.75rem] border-slate-200 bg-white/90 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900">Search and filter</CardTitle>
              <CardDescription className="text-slate-500">
                Find a task, project, or priority level, then narrow the view to a specific progress stage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search tasks, projects, priorities, or status..."
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {filterOptions.map(option => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={statusFilter === option.value ? "default" : "outline"}
                    onClick={() => setStatusFilter(option.value)}
                    className={
                      statusFilter === option.value
                        ? "rounded-full bg-[#8f1934] text-white hover:bg-[#78152c]"
                        : "rounded-full border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-slate-200 bg-white/90 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900">Snapshot</CardTitle>
              <CardDescription className="text-slate-500">Current performance based on the visible task set.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Done
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">{taskCounts.completed}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock3 className="h-4 w-4 text-sky-600" />
                  In Progress
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">{taskCounts.inProgress}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <CircleDashed className="h-4 w-4 text-amber-600" />
                  Not Yet Started
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">{taskCounts.pending}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Target className="h-4 w-4 text-[#8f1934]" />
                  Completion Rate
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">{completionRate}%</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-[#fff3f5] p-3">
                <FolderKanban className="h-6 w-6 text-[#8f1934]" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Visible Projects</p>
                <p className="text-3xl font-bold text-slate-900">{filteredProjects.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-sky-50 p-3">
                <BarChart3 className="h-6 w-6 text-sky-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Visible Tasks</p>
                <p className="text-3xl font-bold text-slate-900">{filteredTasks.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-amber-50 p-3">
                <TriangleAlert className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Due Soon</p>
                <p className="text-3xl font-bold text-slate-900">{dueSoonTasks.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Cancelled</p>
                <p className="text-3xl font-bold text-slate-900">{taskCounts.cancelled}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900">Project momentum</CardTitle>
              <CardDescription className="text-slate-500">
                Each card reflects the projects touched by the current search and filter selection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading analytics...
                </div>
              ) : projectCards.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500">
                  No projects match the current search or filter.
                </div>
              ) : (
                <div className="space-y-4">
                  {projectCards.map(project => (
                    <div key={project.project_id} className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#fff8f9_100%)] p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">{project.project_name}</h3>
                            <Badge className="border-[#edd0d6] bg-[#fff3f5] text-[#8f1934]">{project.department_name}</Badge>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {project.description || "No project description provided yet."}
                          </p>
                        </div>

                        <div className="grid min-w-[220px] grid-cols-2 gap-3 text-sm">
                          <div className="rounded-2xl border border-slate-200 bg-white p-3">
                            <p className="text-slate-500">Budget</p>
                            <p className="mt-1 font-semibold text-slate-900">{formatCurrency(project.budget_allocated)}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-3">
                            <p className="text-slate-500">Deadline</p>
                            <p className="mt-1 font-semibold text-slate-900">{formatShortDate(project.deadline)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-slate-500">Filtered completion</span>
                          <span className="font-semibold text-slate-900">{project.progress}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,_#8f1934_0%,_#d43e5d_100%)] transition-all"
                            style={{ width: `${Math.max(0, Math.min(project.progress, 100))}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Visible Tasks</p>
                          <p className="mt-2 text-xl font-bold text-slate-900">{project.filteredTaskCount}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-emerald-600">Done</p>
                          <p className="mt-2 text-xl font-bold text-emerald-700">{project.completed}</p>
                        </div>
                        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-sky-600">In Progress</p>
                          <p className="mt-2 text-xl font-bold text-sky-700">{project.inProgress}</p>
                        </div>
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-amber-600">Not Started</p>
                          <p className="mt-2 text-xl font-bold text-amber-700">{project.pending}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-slate-900">Deadline radar</CardTitle>
                <CardDescription className="text-slate-500">Tasks that are approaching their due date first.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <div className="flex items-center gap-2 py-8 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing deadlines...
                  </div>
                ) : dueSoonTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No urgent deadlines in the current view.
                  </div>
                ) : (
                  dueSoonTasks.map(task => (
                    <div key={task.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{task.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{task.project_name}</p>
                        </div>
                        <Badge className={`border ${getStatusClasses(task.status)}`}>{formatStatus(task.status)}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className={`rounded-full border px-2.5 py-1 font-medium ${getPriorityTone(task.priority)}`}>
                          {task.priority || "Normal"}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
                          Due {formatShortDate(task.deadline)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        {(task.daysLeft ?? 0) < 0
                          ? `Overdue by ${Math.abs(task.daysLeft ?? 0)} day${Math.abs(task.daysLeft ?? 0) === 1 ? "" : "s"}`
                          : `Due in ${task.daysLeft} day${task.daysLeft === 1 ? "" : "s"}`}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-slate-900">Task ledger</CardTitle>
                <CardDescription className="text-slate-500">
                  The first six tasks from the filtered result, sorted by nearest deadline.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <div className="flex items-center gap-2 py-8 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading tasks...
                  </div>
                ) : topTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No tasks match the current search or filter.
                  </div>
                ) : (
                  topTasks.map(task => (
                    <div key={task.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{task.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{task.project_name}</p>
                        </div>
                        <Badge className={`border ${getStatusClasses(task.status)}`}>{formatStatus(task.status)}</Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className={`rounded-full border px-2.5 py-1 font-medium ${getPriorityTone(task.priority)}`}>
                          {task.priority || "Normal"}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">
                          Assigned {formatShortDate(task.date_given)}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">
                          {formatShortDate(task.deadline)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
