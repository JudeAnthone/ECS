"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/shared/components/ui/Alert";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import ClientNow from "@/shared/components/ui/ClientNow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { Input } from "@/shared/components/ui/Input";
import { AuthService } from "@/shared/lib/auth-service";
import {
  AdminUser,
  BudgetRequestRecord,
  Department,
  formatCurrency,
  formatDate,
  formatRoleLabel,
  formatTaskStatus,
  getApprovedBudgetByProject,
  getApprovedBudgetCountByProject,
  getDaysUntilDeadline,
  getTaskCounts,
  loadAdminWorkspace,
  Program,
  Project,
  ProjectTask,
  projectBudgetDisplay,
  projectLifecycleLabel,
  projectNeedsFunding,
  projectVerificationLabel,
  UserRecord,
} from "@/shared/lib/admin-workspace";
import Link from "next/link";
import {
  Download,
  Eye,
  FileText,
  Loader2,
  Printer,
  Search,
  ShieldCheck,
} from "lucide-react";

interface AdminReport {
  id: string;
  title: string;
  category: string;
  description: string;
  generatedOn: string;
  highlights: string[];
  metrics: Array<{ label: string; value: string }>;
  content: string;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function downloadReport(report: AdminReport) {
  const blob = new Blob([report.content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${report.id}_${report.title.replace(/\s+/g, "_")}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function printReport(report: AdminReport) {
  const popup = window.open("", "_blank", "width=900,height=700");
  if (!popup) return;

  popup.document.write(`
    <html>
      <head>
        <title>${escapeHtml(report.title)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
          h1 { margin-bottom: 8px; }
          pre { white-space: pre-wrap; line-height: 1.5; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(report.title)}</h1>
        <pre>${escapeHtml(report.content)}</pre>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
}

export default function AdminReportsPage() {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        setError(err instanceof Error ? err.message : "Failed to load admin reports.");
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
      map.set(department.id, department.department_name || department.department_code || "Unnamed department");
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

  const reports = useMemo<AdminReport[]>(() => {
    const generatedOn = new Date().toLocaleDateString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const approvedProjects = projects.filter(project => project.approval_status === "approved");
    const pendingProjects = projects.filter(project => project.approval_status === "pending");
    const fundingGapProjects = projects.filter(project => projectNeedsFunding(project, approvedBudgetCountByProject));
    const visibleBudgetPool = projects.reduce(
      (sum, project) => sum + projectBudgetDisplay(project, approvedBudgetByProject),
      0
    );
    const taskCounts = getTaskCounts(tasks);
    const dueSoonTasks = tasks
      .map(task => ({ ...task, daysLeft: getDaysUntilDeadline(task.due_date) }))
      .filter(task => task.status !== "completed" && task.status !== "cancelled" && task.daysLeft !== null && task.daysLeft <= 7)
      .sort((a, b) => (a.daysLeft ?? Number.POSITIVE_INFINITY) - (b.daysLeft ?? Number.POSITIVE_INFINITY));

    const roleCounts = new Map<string, number>();
    users.forEach(account => {
      const role = account.role || "unknown";
      roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
    });

    const programsWithoutChair = programs.filter(program => !program.program_chair_id);
    const projectsWithoutHead = projects.filter(project => !project.project_head_id);

    return [
      {
        id: "ADR-001",
        title: "System Portfolio Summary",
        category: "Operations",
        description: "A high-level summary of departments, programs, projects, and task volume across the extension services system.",
        generatedOn,
        highlights: [
          `${departments.length} department${departments.length === 1 ? "" : "s"} are in the current workspace.`,
          `${programs.length} program${programs.length === 1 ? "" : "s"} and ${projects.length} project${projects.length === 1 ? "" : "s"} are currently tracked.`,
          `${tasks.length} task${tasks.length === 1 ? "" : "s"} are visible across all projects.`,
        ],
        metrics: [
          { label: "Departments", value: String(departments.length) },
          { label: "Programs", value: String(programs.length) },
          { label: "Projects", value: String(projects.length) },
        ],
        content: [
          "ADMIN REPORT: SYSTEM PORTFOLIO SUMMARY",
          `Prepared for: ${userName}`,
          `Generated on: ${generatedOn}`,
          "",
          "Department Coverage",
          ...(departments.length === 0
            ? ["- No departments available."]
            : departments.map(department => `- ${department.department_name || department.department_code || "Unnamed department"}`)),
          "",
          "Projects",
          ...(projects.length === 0
            ? ["- No projects are currently visible."]
            : projects.map(project => `- ${project.project_name} | ${projectVerificationLabel(project)} | ${projectLifecycleLabel(project, approvedBudgetCountByProject)} | ${formatCurrency(projectBudgetDisplay(project, approvedBudgetByProject))}`)),
        ].join("\n"),
      },
      {
        id: "ADR-002",
        title: "User and Role Overview",
        category: "People",
        description: "Summarizes active role coverage and highlights unassigned programs or projects that still need leadership placement.",
        generatedOn,
        highlights: [
          `${users.length} account${users.length === 1 ? "" : "s"} are represented in the current admin scope.`,
          `${programsWithoutChair.length} program${programsWithoutChair.length === 1 ? "" : "s"} still need a chair assignment.`,
          `${projectsWithoutHead.length} project${projectsWithoutHead.length === 1 ? "" : "s"} still need a project head assignment.`,
        ],
        metrics: [
          { label: "Accounts", value: String(users.length) },
          { label: "Programs w/o Chair", value: String(programsWithoutChair.length) },
          { label: "Projects w/o Head", value: String(projectsWithoutHead.length) },
        ],
        content: [
          "ADMIN REPORT: USER AND ROLE OVERVIEW",
          `Prepared for: ${userName}`,
          `Generated on: ${generatedOn}`,
          "",
          "Role Counts",
          ...[...roleCounts.entries()].map(([role, count]) => `- ${formatRoleLabel(role)}: ${count}`),
          "",
          "Programs Without Chair",
          ...(programsWithoutChair.length === 0
            ? ["- All programs currently have chair assignments."]
            : programsWithoutChair.map(program => `- ${program.program_name}`)),
          "",
          "Projects Without Head",
          ...(projectsWithoutHead.length === 0
            ? ["- All projects currently have head assignments."]
            : projectsWithoutHead.map(project => `- ${project.project_name} | ${departmentNameByID.get(project.department_id || "") || "Unassigned department"}`)),
        ].join("\n"),
      },
      {
        id: "ADR-003",
        title: "Funding Governance Snapshot",
        category: "Finance",
        description: "Tracks funded project volume, approved budget pool, and approved projects still waiting on budget activation.",
        generatedOn,
        highlights: [
          `${formatCurrency(visibleBudgetPool)} is the visible approved budget pool across all projects.`,
          `${fundingGapProjects.length} approved project${fundingGapProjects.length === 1 ? "" : "s"} still need funding activation.`,
          `${approvedProjects.length} project${approvedProjects.length === 1 ? "" : "s"} are already in approved status.`,
        ],
        metrics: [
          { label: "Budget Pool", value: formatCurrency(visibleBudgetPool) },
          { label: "Needs Funding", value: String(fundingGapProjects.length) },
          { label: "Approved", value: String(approvedProjects.length) },
        ],
        content: [
          "ADMIN REPORT: FUNDING GOVERNANCE SNAPSHOT",
          `Prepared for: ${userName}`,
          `Generated on: ${generatedOn}`,
          "",
          `Visible Approved Budget Pool: ${formatCurrency(visibleBudgetPool)}`,
          "",
          "Projects Requiring Funding",
          ...(fundingGapProjects.length === 0
            ? ["- No approved projects are currently waiting on funding."]
            : fundingGapProjects.map(project => `- ${project.project_name} | ${programNameByID.get(project.program_id || "") || "Unassigned program"}`)),
        ].join("\n"),
      },
      {
        id: "ADR-004",
        title: "Delivery and Approval Risk Digest",
        category: "Delivery",
        description: "Surfaces task delivery pressure and the project approval queue for fast triage.",
        generatedOn,
        highlights: [
          `${pendingProjects.length} project${pendingProjects.length === 1 ? "" : "s"} are still pending review.`,
          `${taskCounts.ongoing + taskCounts.notStarted} task${taskCounts.ongoing + taskCounts.notStarted === 1 ? "" : "s"} remain open.`,
          `${dueSoonTasks.length} task${dueSoonTasks.length === 1 ? "" : "s"} are due within seven days.`,
        ],
        metrics: [
          { label: "Pending", value: String(pendingProjects.length) },
          { label: "Open Tasks", value: String(taskCounts.ongoing + taskCounts.notStarted) },
          { label: "Due Soon", value: String(dueSoonTasks.length) },
        ],
        content: [
          "ADMIN REPORT: DELIVERY AND APPROVAL RISK DIGEST",
          `Prepared for: ${userName}`,
          `Generated on: ${generatedOn}`,
          "",
          "Pending Review Projects",
          ...(pendingProjects.length === 0
            ? ["- No projects are currently pending review."]
            : pendingProjects.map(project => `- ${project.project_name} | ${departmentNameByID.get(project.department_id || "") || "Unassigned department"}`)),
          "",
          "Due Soon Tasks",
          ...(dueSoonTasks.length === 0
            ? ["- No tasks fall inside the seven-day risk window."]
            : dueSoonTasks.map(task => `- ${task.title} | ${formatTaskStatus(task.status)} | ${formatDate(task.due_date)}`)),
        ].join("\n"),
      },
    ];
  }, [approvedBudgetByProject, approvedBudgetCountByProject, departments, departmentNameByID, programNameByID, programs, projects, tasks, userName, users]);

  const filteredReports = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return reports;

    return reports.filter(report =>
      [report.id, report.title, report.category, report.description]
        .some(value => value.toLowerCase().includes(search))
    );
  }, [reports, searchTerm]);

  const handlePreview = (report: AdminReport) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(186,0,33,0.10),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(2,132,199,0.12),_transparent_32%),linear-gradient(180deg,_#fff8f8_0%,_#f7fbfd_45%,_#ffffff_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-[#f1d7dc] bg-white/90 shadow-[0_24px_80px_-48px_rgba(125,10,35,0.35)] backdrop-blur">
          <div className="grid gap-6 px-6 py-7 md:px-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="space-y-4">
              <div className="inline-flex w-fit items-center rounded-full border border-[#e8c6ce] bg-[#fff4f6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8f1934]">
                Admin Reports
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Reporting library for {userName}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Generate live operational, people, finance, and delivery summaries from the current organization-wide extension services workspace.
                </p>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] bg-[#8f1934] p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/75">Generated with live data</p>
                  <p className="mt-1 text-xl font-semibold">
                    <ClientNow />
                  </p>
                </div>
                <ShieldCheck className="h-10 w-10 text-white/75" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Reports Ready</p>
                  <p className="mt-2 text-2xl font-semibold">{reports.length}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Accounts Covered</p>
                  <p className="mt-2 text-2xl font-semibold">{users.length}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-white/80">
                Search, preview, print, or download live admin reports for the full extension services portfolio.
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <Alert className="border-rose-200 bg-rose-50 text-rose-700">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/90 shadow-sm">
          <CardContent className="grid gap-4 p-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search reports..."
                className="h-12 rounded-full border-slate-200 bg-slate-50 pl-11 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link href="/admin/admin-program-management">
                <Button className="rounded-full bg-[#0f766e] text-white hover:bg-[#0b5e58]">
                  Open Program Management
                </Button>
              </Link>
              <Link href="/admin/admin-user-management">
                <Button variant="outline" className="rounded-full">
                  Open User Management
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.9rem] border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Generated reports</CardTitle>
            <CardDescription>Live summaries for portfolio, people, budget governance, and delivery risk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 px-4 py-12 text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading reports...
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500">
                No reports match the current search term.
              </div>
            ) : (
              filteredReports.map(report => (
                <article key={report.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">
                          {report.id}
                        </Badge>
                        <Badge className="rounded-full border border-[#e8c6ce] bg-[#fff4f6] px-3 py-1 text-[#8f1934]">
                          {report.category}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">{report.title}</h3>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{report.description}</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {report.metrics.map(metric => (
                          <div key={metric.label} className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">{metric.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:w-[270px] lg:justify-end">
                      <Button onClick={() => handlePreview(report)} className="rounded-full bg-[#0f766e] text-white hover:bg-[#0b5e58]">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button variant="outline" onClick={() => printReport(report)} className="rounded-full">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                      <Button variant="outline" onClick={() => downloadReport(report)} className="rounded-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {report.highlights.map(highlight => (
                      <div key={highlight} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                        <FileText className="mt-0.5 h-4 w-4 text-[#8f1934]" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title || "Report preview"}</DialogTitle>
            <DialogDescription>
              Preview the generated report, then print or download it if you need a copy.
            </DialogDescription>
          </DialogHeader>

          {selectedReport ? (
            <div id="admin-report-preview" className="space-y-5">
              <div className="grid gap-3 md:grid-cols-3">
                {selectedReport.metrics.map(metric => (
                  <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{metric.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{selectedReport.content}</pre>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={() => printReport(selectedReport)} className="rounded-full">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button onClick={() => downloadReport(selectedReport)} className="rounded-full bg-[#8f1934] text-white hover:bg-[#731228]">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
