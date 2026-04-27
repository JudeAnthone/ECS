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
  ChairBudget,
  ChairDepartmentBudget,
  formatCurrency,
  formatDate,
  formatTaskStatus,
  getApprovedBudgetByProject,
  getApprovedBudgetCountByProject,
  getDaysUntilDeadline,
  getProjectProgress,
  getTaskCounts,
  loadProgramChairWorkspace,
  Program,
  ProgramChairUser,
  Project,
  ProjectTask,
  projectBudgetDisplay,
  projectLifecycleLabel,
  projectLifecycleTone,
  projectNeedsFunding,
  projectVerificationLabel,
  projectVerificationTone,
} from "@/shared/lib/program-chair-workspace";
import {
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

type ProjectFilter = "all" | "approved" | "pending" | "needs_funding" | "overdue";

const filterOptions: Array<{ value: ProjectFilter; label: string }> = [
  { value: "all", label: "All Projects" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending Review" },
  { value: "needs_funding", label: "Needs Funding" },
  { value: "overdue", label: "Overdue" },
];

function isOverdue(project: Project) {
  const days = getDaysUntilDeadline(project.end_date);
  return days !== null && days < 0 && project.status !== "completed" && project.status !== "cancelled";
}

export default function ProgramChairAnalyticsPage() {
  const [user, setUser] = useState<ProgramChairUser | null>(null);
  const [userName, setUserName] = useState("Program Chair");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequestRecord[]>([]);
  const [chairBudget, setChairBudget] = useState<ChairBudget | null>(null);
  const [chairDepartmentBudgets, setChairDepartmentBudgets] = useState<ChairDepartmentBudget[]>([]);
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>("all");

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser) {
      setError("Could not resolve the current program chair session.");
      setLoading(false);
      return;
    }

    const normalizedUser: ProgramChairUser = {
      id: currentUser.id,
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      username: currentUser.username,
    };

    const fullName = `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim();
    setUser(normalizedUser);
    setUserName(fullName || currentUser.username || "Program Chair");
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!user) return;
      setLoading(true);
      setError("");

      try {
        const workspace = await loadProgramChairWorkspace(user);
        if (!active) return;

        setPrograms(workspace.programs);
        setProjects(workspace.projects);
        setTasks(workspace.tasks);
        setBudgetRequests(workspace.budgetRequests);
        setChairBudget(workspace.chairBudget);
        setChairDepartmentBudgets(workspace.chairDepartmentBudgets);
      } catch (err) {
        if (!active) return;
        setPrograms([]);
        setProjects([]);
        setTasks([]);
        setBudgetRequests([]);
        setChairBudget(null);
        setChairDepartmentBudgets([]);
        setError(err instanceof Error ? err.message : "Failed to load program chair analytics.");
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
  const approvedBudgetCountByProject = useMemo(() => getApprovedBudgetCountByProject(budgetRequests), [budgetRequests]);

  const visibleProjects = useMemo(() => {
    const search = query.trim().toLowerCase();

    return projects.filter(project => {
      if (projectFilter === "approved" && project.approval_status !== "approved") return false;
      if (projectFilter === "pending" && project.approval_status !== "pending") return false;
      if (projectFilter === "needs_funding" && !projectNeedsFunding(project, approvedBudgetCountByProject)) return false;
      if (projectFilter === "overdue" && !isOverdue(project)) return false;

      if (!search) return true;

      return [
        project.project_name,
        project.project_description,
        programNameByID.get(project.program_id || ""),
        project.status,
        project.approval_status,
        projectLifecycleLabel(project, approvedBudgetCountByProject),
        projectVerificationLabel(project),
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(search));
    });
  }, [approvedBudgetCountByProject, programNameByID, projectFilter, projects, query]);

  const visibleProjectIDs = useMemo(() => new Set(visibleProjects.map(project => project.id)), [visibleProjects]);

  const visibleTasks = useMemo(
    () => tasks.filter(task => visibleProjectIDs.has(task.project_id)),
    [tasks, visibleProjectIDs]
  );

  const taskCounts = useMemo(() => getTaskCounts(visibleTasks), [visibleTasks]);
  const completionRate = visibleTasks.length === 0 ? 0 : Math.round((taskCounts.completed / visibleTasks.length) * 100);

  const visiblePrograms = useMemo(() => {
    if (!query.trim() && projectFilter === "all") return programs;
    const visibleProgramIDs = new Set(visibleProjects.map(project => project.program_id).filter(Boolean));
    return programs.filter(program => visibleProgramIDs.has(program.id));
  }, [programs, projectFilter, query, visibleProjects]);

  const portfolioCards = useMemo(() => {
    return visiblePrograms.map(program => {
      const programProjects = visibleProjects.filter(project => project.program_id === program.id);
      const programTasks = visibleTasks.filter(task => programProjects.some(project => project.id === task.project_id));
      const programTaskCounts = getTaskCounts(programTasks);
      const fundedBudget = programProjects.reduce(
        (sum, project) => sum + projectBudgetDisplay(project, approvedBudgetByProject),
        0
      );
      const dueSoon = programProjects.filter(project => {
        const days = getDaysUntilDeadline(project.end_date);
        return days !== null && days <= 14 && days >= 0 && project.status !== "completed";
      }).length;

      return { program, programProjects, programTasks, programTaskCounts, fundedBudget, dueSoon };
    });
  }, [approvedBudgetByProject, visiblePrograms, visibleProjects, visibleTasks]);

  const pendingReviewProjects = useMemo(
    () => visibleProjects.filter(project => project.approval_status === "pending").slice(0, 6),
    [visibleProjects]
  );

  const dueSoonTasks = useMemo(() => {
    return visibleTasks
      .map(task => ({ ...task, daysLeft: getDaysUntilDeadline(task.due_date) }))
      .filter(task => task.status !== "completed" && task.status !== "cancelled" && task.daysLeft !== null && task.daysLeft <= 7)
      .sort((a, b) => (a.daysLeft ?? Number.POSITIVE_INFINITY) - (b.daysLeft ?? Number.POSITIVE_INFINITY))
      .slice(0, 6);
  }, [visibleTasks]);

  const fundingGapCount = useMemo(
    () => visibleProjects.filter(project => projectNeedsFunding(project, approvedBudgetCountByProject)).length,
    [approvedBudgetCountByProject, visibleProjects]
  );

  const approvedBudgetPool = useMemo(
    () => visibleProjects.reduce((sum, project) => sum + projectBudgetDisplay(project, approvedBudgetByProject), 0),
    [approvedBudgetByProject, visibleProjects]
  );

  const chairBudgetRemaining = Math.max(
    0,
    Number(chairBudget?.allocated_budget || 0) - Number(chairBudget?.spent_budget || 0)
  );

  const delegatedBudget = chairDepartmentBudgets.reduce(
    (sum, budget) => sum + Number(budget.allocated_budget || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(186,0,33,0.10),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,116,144,0.12),_transparent_32%),linear-gradient(180deg,_#fff9f8_0%,_#f7fcfc_45%,_#ffffff_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-[#f1d7dc] bg-white/90 shadow-[0_24px_80px_-48px_rgba(125,10,35,0.35)] backdrop-blur">
          <div className="grid gap-6 px-6 py-7 md:px-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="space-y-4">
              <div className="inline-flex w-fit items-center rounded-full border border-[#e8c6ce] bg-[#fff4f6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8f1934]">
                Program Chair Analytics
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Cross-program visibility for {userName}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Search across chaired programs, monitor approval queues, watch budget release pressure, and surface projects that need intervention before deadlines slip.
                </p>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] bg-[#8f1934] p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/75">Last updated</p>
                  <p className="mt-1 text-xl font-semibold">
                    <ClientNow />
                  </p>
                </div>
                <Target className="h-10 w-10 text-white/75" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Visible Budget Pool</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(approvedBudgetPool)}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Chair Budget Remaining</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(chairBudgetRemaining)}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-white/80">
                {fundingGapCount} project{fundingGapCount === 1 ? "" : "s"} still need funding attention, while {pendingReviewProjects.length} project{pendingReviewProjects.length === 1 ? "" : "s"} are sitting in review.
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <Alert className="border-rose-200 bg-rose-50 text-rose-700">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-4">
          <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Programs</CardDescription>
              <CardTitle className="flex items-center justify-between text-3xl text-slate-900">
                {visiblePrograms.length}
                <FolderKanban className="h-5 w-5 text-[#8f1934]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              {programs.length} assigned program{programs.length === 1 ? "" : "s"} currently tracked.
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Projects</CardDescription>
              <CardTitle className="flex items-center justify-between text-3xl text-slate-900">
                {visibleProjects.length}
                <FileSearch className="h-5 w-5 text-[#0f766e]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              {visibleProjects.filter(project => project.approval_status === "approved").length} approved and {fundingGapCount} waiting on funding.
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Task Completion</CardDescription>
              <CardTitle className="flex items-center justify-between text-3xl text-slate-900">
                {completionRate}%
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              {taskCounts.completed} done, {taskCounts.ongoing} in progress, {taskCounts.notStarted} not yet started.
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription>Delegated Budget</CardDescription>
              <CardTitle className="flex items-center justify-between text-3xl text-slate-900">
                {formatCurrency(delegatedBudget)}
                <Wallet className="h-5 w-5 text-amber-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Spread across {chairDepartmentBudgets.length} department allocation{chairDepartmentBudgets.length === 1 ? "" : "s"}.
            </CardContent>
          </Card>
        </section>

        <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-sm">
          <CardContent className="grid gap-4 p-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search programs, projects, lifecycle, or review stage..."
                className="h-12 rounded-full border-slate-200 bg-slate-50 pl-11 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(option => (
                <Button
                  key={option.value}
                  type="button"
                  variant={projectFilter === option.value ? "default" : "outline"}
                  onClick={() => setProjectFilter(option.value)}
                  className={projectFilter === option.value
                    ? "rounded-full bg-[#8f1934] text-white hover:bg-[#731228]"
                    : "rounded-full border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <Card className="rounded-[1.9rem] border-slate-200/80 bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Program portfolio</CardTitle>
              <CardDescription>Each card rolls up projects, tasks, and funded budget inside a chaired program.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 px-4 py-12 text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading analytics...
                </div>
              ) : portfolioCards.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500">
                  No programs match the current search and filter state.
                </div>
              ) : (
                portfolioCards.map(({ program, programProjects, programTasks, programTaskCounts, fundedBudget, dueSoon }) => (
                  <article key={program.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{program.program_name}</h3>
                          <Badge className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">
                            {programProjects.length} project{programProjects.length === 1 ? "" : "s"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {programTaskCounts.completed} completed tasks, {programTaskCounts.ongoing} in progress, {programTaskCounts.notStarted} not yet started.
                        </p>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600 md:text-right">
                        <span>Funded budget: <strong className="text-slate-900">{formatCurrency(fundedBudget)}</strong></span>
                        <span>Tasks tracked: <strong className="text-slate-900">{programTasks.length}</strong></span>
                        <span>Projects due in 14 days: <strong className="text-slate-900">{dueSoon}</strong></span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {programProjects.slice(0, 4).map(project => {
                        const projectTasks = visibleTasks.filter(task => task.project_id === project.id);
                        const progress = getProjectProgress(projectTasks, Number(project.progress || 0));
                        return (
                          <div key={project.id} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-medium text-slate-900">{project.project_name}</p>
                              <Badge className={`rounded-full border px-3 py-1 ${projectLifecycleTone(project, approvedBudgetCountByProject)}`}>
                                {projectLifecycleLabel(project, approvedBudgetCountByProject)}
                              </Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge className={`rounded-full border px-3 py-1 ${projectVerificationTone(project)}`}>
                                {projectVerificationLabel(project)}
                              </Badge>
                              <Badge className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                                {formatCurrency(projectBudgetDisplay(project, approvedBudgetByProject))}
                              </Badge>
                            </div>
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                <span>Task progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-200">
                                <div className="h-2 rounded-full bg-[#8f1934]" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                ))
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="rounded-[1.9rem] border-slate-200/80 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Review queue</CardTitle>
                <CardDescription>Projects waiting on chair action or funding release.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingReviewProjects.length === 0 && fundingGapCount === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                    No immediate review blockers found.
                  </div>
                ) : (
                  visibleProjects
                    .filter(project => project.approval_status === "pending" || projectNeedsFunding(project, approvedBudgetCountByProject))
                    .slice(0, 6)
                    .map(project => (
                      <div key={project.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{project.project_name}</p>
                            <p className="mt-1 text-sm text-slate-600">
                              {programNameByID.get(project.program_id || "") || "Unassigned program"}
                            </p>
                          </div>
                          <Badge className={`rounded-full border px-3 py-1 ${projectVerificationTone(project)}`}>
                            {projectVerificationLabel(project)}
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <Badge className={`rounded-full border px-3 py-1 ${projectLifecycleTone(project, approvedBudgetCountByProject)}`}>
                            {projectLifecycleLabel(project, approvedBudgetCountByProject)}
                          </Badge>
                          <span>Budget: {formatCurrency(projectBudgetDisplay(project, approvedBudgetByProject))}</span>
                        </div>
                      </div>
                    ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[1.9rem] border-slate-200/80 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Deadline pressure</CardTitle>
                <CardDescription>Upcoming task deadlines that may need follow-up.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dueSoonTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                    No tasks fall inside the seven-day risk window.
                  </div>
                ) : (
                  dueSoonTasks.map(task => (
                    <div key={task.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{task.title}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {visibleProjects.find(project => project.id === task.project_id)?.project_name || "Project task"}
                          </p>
                        </div>
                        <Badge className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                          {task.daysLeft === null ? "No date" : `${task.daysLeft} day${task.daysLeft === 1 ? "" : "s"}`}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>{formatDate(task.due_date)}</span>
                        <span>•</span>
                        <span>{formatTaskStatus(task.status)}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[1.9rem] border-slate-200/80 bg-[#0f172a] text-white shadow-sm">
              <CardContent className="flex h-full flex-col justify-between p-6">
                <div className="space-y-3">
                  <TriangleAlert className="h-10 w-10 text-amber-300" />
                  <h3 className="text-xl font-semibold">Chair signal</h3>
                  <p className="text-sm leading-6 text-slate-300">
                    {fundingGapCount} project{fundingGapCount === 1 ? "" : "s"} need budget activation, and {dueSoonTasks.length} task{dueSoonTasks.length === 1 ? "" : "s"} are due within the next week.
                  </p>
                </div>
                <div className="mt-6 grid gap-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Allocated chair budget</span>
                    <strong className="text-white">{formatCurrency(chairBudget?.allocated_budget || 0)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Spent chair budget</span>
                    <strong className="text-white">{formatCurrency(chairBudget?.spent_budget || 0)}</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
