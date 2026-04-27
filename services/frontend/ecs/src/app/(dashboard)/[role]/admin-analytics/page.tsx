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
  AdminUser,
  BudgetRequestRecord,
  Department,
  formatCurrency,
  formatRoleLabel,
  getApprovedBudgetByProject,
  getApprovedBudgetCountByProject,
  getDaysUntilDeadline,
  getProjectProgress,
  getTaskCounts,
  loadAdminWorkspace,
  Program,
  Project,
  ProjectTask,
  projectBudgetDisplay,
  projectLifecycleLabel,
  projectLifecycleTone,
  projectNeedsFunding,
  projectVerificationLabel,
  projectVerificationTone,
  UserRecord,
} from "@/shared/lib/admin-workspace";
import {
  CheckCircle2,
  FileSearch,
  FolderKanban,
  Loader2,
  Search,
  ShieldCheck,
  TriangleAlert,
  Users,
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

export default function AdminAnalyticsPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [userName, setUserName] = useState("Administrator");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequestRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>("all");

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser) {
      setError("Could not resolve the current administrator session.");
      setLoading(false);
      return;
    }

    const normalizedUser: AdminUser = {
      id: currentUser.id,
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      username: currentUser.username,
    };

    const fullName = `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim();
    setUser(normalizedUser);
    setUserName(fullName || currentUser.username || "Administrator");
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!user) return;
      setLoading(true);
      setError("");

      try {
        const workspace = await loadAdminWorkspace();
        if (!active) return;

        setDepartments(workspace.departments);
        setPrograms(workspace.programs);
        setProjects(workspace.projects);
        setTasks(workspace.tasks);
        setBudgetRequests(workspace.budgetRequests);
        setUsers(workspace.users);
      } catch (err) {
        if (!active) return;
        setDepartments([]);
        setPrograms([]);
        setProjects([]);
        setTasks([]);
        setBudgetRequests([]);
        setUsers([]);
        setError(err instanceof Error ? err.message : "Failed to load admin analytics.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [user]);

  const departmentNameByID = useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach(department => {
      const label = department.department_name || department.department_code || "Unnamed department";
      map.set(department.id, label);
    });
    return map;
  }, [departments]);

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
        departmentNameByID.get(project.department_id || ""),
        programNameByID.get(project.program_id || ""),
        project.status,
        project.approval_status,
        projectLifecycleLabel(project, approvedBudgetCountByProject),
        projectVerificationLabel(project),
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(search));
    });
  }, [approvedBudgetCountByProject, departmentNameByID, programNameByID, projectFilter, projects, query]);

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

  const visibleDepartments = useMemo(() => {
    if (!query.trim() && projectFilter === "all") return departments;
    const visibleDepartmentIDs = new Set(visibleProjects.map(project => project.department_id).filter(Boolean));
    return departments.filter(department => visibleDepartmentIDs.has(department.id));
  }, [departments, projectFilter, query, visibleProjects]);

  const departmentCards = useMemo(() => {
    return visibleDepartments.map(department => {
      const departmentPrograms = visiblePrograms.filter(program => program.department_id === department.id);
      const departmentProjects = visibleProjects.filter(project => project.department_id === department.id);
      const departmentTasks = visibleTasks.filter(task => departmentProjects.some(project => project.id === task.project_id));
      const budgetPool = departmentProjects.reduce(
        (sum, project) => sum + projectBudgetDisplay(project, approvedBudgetByProject),
        0
      );

      return { department, departmentPrograms, departmentProjects, departmentTasks, budgetPool };
    });
  }, [approvedBudgetByProject, visibleDepartments, visiblePrograms, visibleProjects, visibleTasks]);

  const pendingProjects = useMemo(
    () => visibleProjects.filter(project => project.approval_status === "pending").slice(0, 6),
    [visibleProjects]
  );

  const fundingGapProjects = useMemo(
    () => visibleProjects.filter(project => projectNeedsFunding(project, approvedBudgetCountByProject)).slice(0, 6),
    [approvedBudgetCountByProject, visibleProjects]
  );

  const dueSoonTasks = useMemo(() => {
    return visibleTasks
      .map(task => ({ ...task, daysLeft: getDaysUntilDeadline(task.due_date) }))
      .filter(task => task.status !== "completed" && task.status !== "cancelled" && task.daysLeft !== null && task.daysLeft <= 7)
      .sort((a, b) => (a.daysLeft ?? Number.POSITIVE_INFINITY) - (b.daysLeft ?? Number.POSITIVE_INFINITY))
      .slice(0, 6);
  }, [visibleTasks]);

  const roleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const account of users) {
      const role = account.role || "unknown";
      counts.set(role, (counts.get(role) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([role, count]) => ({ role, count }));
  }, [users]);

  const approvedBudgetPool = useMemo(
    () => visibleProjects.reduce((sum, project) => sum + projectBudgetDisplay(project, approvedBudgetByProject), 0),
    [approvedBudgetByProject, visibleProjects]
  );

  const programsWithoutChair = useMemo(
    () => programs.filter(program => !program.program_chair_id).length,
    [programs]
  );

  const projectsWithoutHead = useMemo(
    () => visibleProjects.filter(project => !project.project_head_id).length,
    [visibleProjects]
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(186,0,33,0.10),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(2,132,199,0.12),_transparent_32%),linear-gradient(180deg,_#fff8f8_0%,_#f7fbfd_45%,_#ffffff_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-[#f1d7dc] bg-white/90 shadow-[0_24px_80px_-48px_rgba(125,10,35,0.35)] backdrop-blur">
          <div className="grid gap-6 px-6 py-7 md:px-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="space-y-4">
              <div className="inline-flex w-fit items-center rounded-full border border-[#e8c6ce] bg-[#fff4f6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8f1934]">
                Admin Analytics
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Organization-wide view for {userName}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Search the entire extension service portfolio, compare department pressure, monitor review bottlenecks, and keep user and funding governance visible in one place.
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
                <ShieldCheck className="h-10 w-10 text-white/75" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Visible Budget Pool</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCurrency(approvedBudgetPool)}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Active People Scope</p>
                  <p className="mt-2 text-2xl font-semibold">{users.length}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-white/80">
                {pendingProjects.length} visible project{pendingProjects.length === 1 ? "" : "s"} are pending review, {fundingGapProjects.length} need funding, and {projectsWithoutHead} still need head assignment.
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
              {programsWithoutChair} program{programsWithoutChair === 1 ? "" : "s"} still need chair assignment.
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
              {pendingProjects.length} pending and {fundingGapProjects.length} waiting on funding.
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
              <CardDescription>Accounts in Scope</CardDescription>
              <CardTitle className="flex items-center justify-between text-3xl text-slate-900">
                {users.length}
                <Users className="h-5 w-5 text-amber-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              {roleCounts.length} role group{roleCounts.length === 1 ? "" : "s"} represented in the current workspace.
            </CardContent>
          </Card>
        </section>

        <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-sm">
          <CardContent className="grid gap-4 p-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search departments, programs, projects, lifecycle, or review state..."
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
              <CardTitle className="text-xl text-slate-900">Department portfolio</CardTitle>
              <CardDescription>Compare program and project pressure by department across the visible scope.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 px-4 py-12 text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading analytics...
                </div>
              ) : departmentCards.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500">
                  No departments match the current search and filter state.
                </div>
              ) : (
                departmentCards.map(({ department, departmentPrograms, departmentProjects, departmentTasks, budgetPool }) => (
                  <article key={department.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {department.department_name || department.department_code || "Unnamed department"}
                          </h3>
                          <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">
                            {departmentPrograms.length} program{departmentPrograms.length === 1 ? "" : "s"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {departmentProjects.length} projects and {departmentTasks.length} tasks are currently visible.
                        </p>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600 md:text-right">
                        <span>Funded budget: <strong className="text-slate-900">{formatCurrency(budgetPool)}</strong></span>
                        <span>Pending review: <strong className="text-slate-900">{departmentProjects.filter(project => project.approval_status === "pending").length}</strong></span>
                        <span>Needs funding: <strong className="text-slate-900">{departmentProjects.filter(project => projectNeedsFunding(project, approvedBudgetCountByProject)).length}</strong></span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {departmentProjects.slice(0, 4).map(project => {
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
                <CardTitle className="text-xl text-slate-900">Governance queue</CardTitle>
                <CardDescription>Review, funding, and assignment pressure across the visible project set.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...pendingProjects, ...fundingGapProjects]
                  .slice(0, 6)
                  .map(project => (
                    <div key={project.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{project.project_name}</p>
                          <p className="mt-1 text-sm text-slate-600">
                            {departmentNameByID.get(project.department_id || "") || "Unassigned department"}
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
                        <span>Program: {programNameByID.get(project.program_id || "") || "Unassigned"}</span>
                      </div>
                    </div>
                  ))}
                {pendingProjects.length === 0 && fundingGapProjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                    No visible projects currently need governance attention.
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="rounded-[1.9rem] border-slate-200/80 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Role distribution</CardTitle>
                <CardDescription>Quick count of users grouped by role in the current workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {roleCounts.map(role => (
                  <div key={role.role} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <span className="text-sm text-slate-600">{formatRoleLabel(role.role)}</span>
                    <strong className="text-slate-900">{role.count}</strong>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[1.9rem] border-slate-200/80 bg-[#0f172a] text-white shadow-sm">
              <CardContent className="flex h-full flex-col justify-between p-6">
                <div className="space-y-3">
                  <TriangleAlert className="h-10 w-10 text-amber-300" />
                  <h3 className="text-xl font-semibold">System signal</h3>
                  <p className="text-sm leading-6 text-slate-300">
                    {dueSoonTasks.length} task{dueSoonTasks.length === 1 ? "" : "s"} are due this week, and {projectsWithoutHead} project{projectsWithoutHead === 1 ? "" : "s"} still need head assignment.
                  </p>
                </div>
                <div className="mt-6 grid gap-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Programs without chair</span>
                    <strong className="text-white">{programsWithoutChair}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Visible budget pool</span>
                    <strong className="text-white">{formatCurrency(approvedBudgetPool)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Due soon tasks</span>
                    <strong className="text-white">{dueSoonTasks.length}</strong>
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
