"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/shared/components/ui/Alert";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import ClientNow from "@/shared/components/ui/ClientNow";
import { Input } from "@/shared/components/ui/Input";
import { AuthService } from "@/shared/lib/auth-service";
import {
  BudgetRequestRecord,
  formatCurrency,
  formatDate,
  formatTaskStatus,
  getApprovedBudgetByProject,
  getDaysUntilDeadline,
  getProjectProgress,
  Program,
  Project,
  getTaskCounts,
  loadProjectHeadWorkspace,
  ProjectTask,
  projectBudgetDisplay,
  projectLifecycleLabel,
  projectLifecycleTone,
  ProjectHeadUser,
  projectNeedsFunding,
  projectVerificationLabel,
  projectVerificationTone,
} from "@/shared/lib/project-head-workspace";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  FileSearch,
  FolderKanban,
  Loader2,
  Search,
  Target,
  TriangleAlert,
  Wallet,
} from "lucide-react";

type ProjectFilter = "all" | "mine" | "approved" | "pending" | "needs_funding";

const filterOptions: Array<{ value: ProjectFilter; label: string }> = [
  { value: "all", label: "All Projects" },
  { value: "mine", label: "Created By Me" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending Review" },
  { value: "needs_funding", label: "Needs Funding" },
];

export default function ProjectHeadAnalyticsPage() {
  const [user, setUser] = useState<ProjectHeadUser | null>(null);
  const [userName, setUserName] = useState("Project Head");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequestRecord[]>([]);
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>("all");

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser) {
      setError("Could not resolve the current project head session.");
      setLoading(false);
      return;
    }

    const normalizedUser: ProjectHeadUser = {
      id: currentUser.id,
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      username: currentUser.username,
      department: currentUser.department,
      assigned_program_chair_id: currentUser.assigned_program_chair_id || null,
    };

    const fullName = `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim();
    setUser(normalizedUser);
    setUserName(fullName || currentUser.username || "Project Head");
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!user) return;
      setLoading(true);
      setError("");

      try {
        const workspace = await loadProjectHeadWorkspace(user);
        if (!active) return;

        setPrograms(workspace.programs);
        setProjects(workspace.projects);
        setTasks(workspace.tasks);
        setBudgetRequests(workspace.budgetRequests);
      } catch (err) {
        if (!active) return;
        setPrograms([]);
        setProjects([]);
        setTasks([]);
        setBudgetRequests([]);
        setError(err instanceof Error ? err.message : "Failed to load project head analytics.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [user]);

  const programNameByID = useMemo(() => {
    const map = new Map<string, string>();
    programs.forEach(program => map.set(program.id, program.program_name));
    return map;
  }, [programs]);

  const approvedBudgetByProject = useMemo(() => getApprovedBudgetByProject(budgetRequests), [budgetRequests]);

  const visibleProjects = useMemo(() => {
    const search = query.trim().toLowerCase();

    return projects.filter(project => {
      if (projectFilter === "mine" && project.created_by !== user?.id) return false;
      if (projectFilter === "approved" && project.approval_status !== "approved") return false;
      if (projectFilter === "pending" && project.approval_status !== "pending") return false;
      if (projectFilter === "needs_funding" && !projectNeedsFunding(project, approvedBudgetByProject)) return false;

      if (!search) return true;

      return [
        project.project_name,
        project.project_description,
        programNameByID.get(project.program_id || ""),
        project.status,
        project.approval_status,
        projectLifecycleLabel(project, approvedBudgetByProject),
        projectVerificationLabel(project, user?.id),
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(search));
    });
  }, [approvedBudgetByProject, programNameByID, projectFilter, projects, query, user?.id]);

  const visibleProjectIDs = useMemo(() => new Set(visibleProjects.map(project => project.id)), [visibleProjects]);

  const visibleTasks = useMemo(
    () => tasks.filter(task => visibleProjectIDs.has(task.project_id)),
    [tasks, visibleProjectIDs]
  );

  const taskCounts = useMemo(() => getTaskCounts(visibleTasks), [visibleTasks]);

  const completionRate = visibleTasks.length === 0 ? 0 : Math.round((taskCounts.completed / visibleTasks.length) * 100);

  const visibleBudgetPool = useMemo(() => {
    return visibleProjects.reduce(
      (sum, project) => sum + projectBudgetDisplay(project, approvedBudgetByProject),
      0
    );
  }, [approvedBudgetByProject, visibleProjects]);

  const dueSoonTasks = useMemo(() => {
    return visibleTasks
      .map(task => ({ ...task, daysLeft: getDaysUntilDeadline(task.due_date) }))
      .filter(task => task.status !== "completed" && task.status !== "cancelled" && task.daysLeft !== null && task.daysLeft <= 7)
      .sort((a, b) => (a.daysLeft ?? Number.POSITIVE_INFINITY) - (b.daysLeft ?? Number.POSITIVE_INFINITY))
      .slice(0, 5);
  }, [visibleTasks]);

  const pendingReviewProjects = useMemo(
    () => visibleProjects.filter(project => project.approval_status === "pending"),
    [visibleProjects]
  );

  const projectCards = useMemo(() => {
    return visibleProjects.map(project => {
      const projectTasks = visibleTasks.filter(task => task.project_id === project.id);
      const progress = getProjectProgress(projectTasks, Number(project.progress || 0));
      const counts = getTaskCounts(projectTasks);
      const budget = projectBudgetDisplay(project, approvedBudgetByProject);
      return { project, projectTasks, progress, counts, budget };
    });
  }, [approvedBudgetByProject, visibleProjects, visibleTasks]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(186,0,33,0.10),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(2,132,199,0.10),_transparent_32%),linear-gradient(180deg,_#fff8f8_0%,_#fcfdfd_45%,_#ffffff_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-[#f1d7dc] bg-white/90 shadow-[0_24px_80px_-48px_rgba(125,10,35,0.35)] backdrop-blur">
          <div className="grid gap-6 px-6 py-7 md:px-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="space-y-4">
              <div className="inline-flex w-fit items-center rounded-full border border-[#e8c6ce] bg-[#fff4f6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8f1934]">
                Project Head Analytics
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Portfolio visibility for {userName}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Search through department projects, track approval stages, monitor task delivery, and spot funding gaps before they slow delivery.
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
                  <p className="text-white/70">Programs</p>
                  <p className="mt-1 text-2xl font-bold">{programs.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-white/70">Visible Projects</p>
                  <p className="mt-1 text-2xl font-bold">{visibleProjects.length}</p>
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

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900">Search and review filters</CardTitle>
              <CardDescription className="text-slate-500">
                Narrow the portfolio by ownership, approval state, or projects that still need funding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search projects, programs, lifecycle, or verification..."
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map(option => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={projectFilter === option.value ? "default" : "outline"}
                    onClick={() => setProjectFilter(option.value)}
                    className={
                      projectFilter === option.value
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

          <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900">Snapshot</CardTitle>
              <CardDescription className="text-slate-500">A quick read on the currently visible portfolio slice.</CardDescription>
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
                <p className="mt-2 text-2xl font-bold text-slate-900">{taskCounts.ongoing}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Wallet className="h-4 w-4 text-amber-600" />
                  Budget Pool
                </div>
                <p className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(visibleBudgetPool)}</p>
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
                <p className="text-3xl font-bold text-slate-900">{visibleProjects.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-blue-50 p-3">
                <FileSearch className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pending Reviews</p>
                <p className="text-3xl font-bold text-slate-900">{pendingReviewProjects.length}</p>
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
                <BarChart3 className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Visible Tasks</p>
                <p className="text-3xl font-bold text-slate-900">{visibleTasks.length}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900">Project portfolio</CardTitle>
              <CardDescription className="text-slate-500">
                Approval state, funding readiness, and task completion for each visible project.
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
                  No project matches the current search or filter.
                </div>
              ) : (
                <div className="space-y-4">
                  {projectCards.map(({ project, projectTasks, progress, counts, budget }) => (
                    <div key={project.id} className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#fff9f9_100%)] p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">{project.project_name}</h3>
                            <Badge className={`border ${projectVerificationTone(project, user?.id)}`}>{projectVerificationLabel(project, user?.id)}</Badge>
                            <Badge className={`border ${projectLifecycleTone(project, approvedBudgetByProject)}`}>{projectLifecycleLabel(project, approvedBudgetByProject)}</Badge>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {project.project_description || "No project description provided yet."}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                            {programNameByID.get(project.program_id || "") || "Unassigned Program"}
                          </p>
                        </div>

                        <div className="grid min-w-[230px] grid-cols-2 gap-3 text-sm">
                          <div className="rounded-2xl border border-slate-200 bg-white p-3">
                            <p className="text-slate-500">Budget</p>
                            <p className="mt-1 font-semibold text-slate-900">{formatCurrency(budget)}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-3">
                            <p className="text-slate-500">Created</p>
                            <p className="mt-1 font-semibold text-slate-900">{formatDate(project.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-slate-500">Task completion</span>
                          <span className="font-semibold text-slate-900">{progress}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,_#8f1934_0%,_#d43e5d_100%)] transition-all"
                            style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tasks</p>
                          <p className="mt-2 text-xl font-bold text-slate-900">{projectTasks.length}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-emerald-600">Done</p>
                          <p className="mt-2 text-xl font-bold text-emerald-700">{counts.completed}</p>
                        </div>
                        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-sky-600">In Progress</p>
                          <p className="mt-2 text-xl font-bold text-sky-700">{counts.ongoing}</p>
                        </div>
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-amber-600">Not Started</p>
                          <p className="mt-2 text-xl font-bold text-amber-700">{counts.notStarted}</p>
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
                <CardTitle className="text-xl text-slate-900">Review queue</CardTitle>
                <CardDescription className="text-slate-500">Projects that still need a decision or further coordination.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <div className="flex items-center gap-2 py-8 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing queue...
                  </div>
                ) : pendingReviewProjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No pending reviews in the current view.
                  </div>
                ) : (
                  pendingReviewProjects.slice(0, 5).map(project => (
                    <div key={project.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{project.project_name}</p>
                          <p className="mt-1 text-sm text-slate-500">{programNameByID.get(project.program_id || "") || "Unassigned Program"}</p>
                        </div>
                        <Badge className={`border ${projectVerificationTone(project, user?.id)}`}>{projectVerificationLabel(project, user?.id)}</Badge>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        Lifecycle: {projectLifecycleLabel(project, approvedBudgetByProject)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-slate-900">Deadline pressure</CardTitle>
                <CardDescription className="text-slate-500">Nearest due tasks across the visible projects.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <div className="flex items-center gap-2 py-8 text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking deadlines...
                  </div>
                ) : dueSoonTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No near-term task deadlines in the current slice.
                  </div>
                ) : (
                  dueSoonTasks.map(task => (
                    <div key={task.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{task.title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {projects.find(project => project.id === task.project_id)?.project_name || task.project_id}
                          </p>
                        </div>
                        <Badge className="border border-slate-200 bg-slate-50 text-slate-700">
                          {formatTaskStatus(task.status)}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        {(task.daysLeft ?? 0) < 0
                          ? `Overdue by ${Math.abs(task.daysLeft ?? 0)} day${Math.abs(task.daysLeft ?? 0) === 1 ? "" : "s"}`
                          : `Due in ${task.daysLeft} day${task.daysLeft === 1 ? "" : "s"}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Deadline {formatDate(task.due_date)}</p>
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
