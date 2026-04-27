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
  BudgetRequestRecord,
  ChairBudget,
  ChairDepartmentBudget,
  formatCurrency,
  formatDate,
  formatTaskStatus,
  getApprovedBudgetByProject,
  getApprovedBudgetCountByProject,
  getDaysUntilDeadline,
  getTaskCounts,
  loadProgramChairWorkspace,
  Program,
  ProgramChairUser,
  Project,
  ProjectTask,
  projectBudgetDisplay,
  projectLifecycleLabel,
  projectNeedsFunding,
  projectVerificationLabel,
} from "@/shared/lib/program-chair-workspace";
import Link from "next/link";
import {
  Download,
  Eye,
  FileText,
  FolderKanban,
  Loader2,
  Printer,
  Search,
} from "lucide-react";

interface ProgramChairReport {
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

function downloadReport(report: ProgramChairReport) {
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

function printReport(report: ProgramChairReport) {
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

export default function ProgramChairReportsPage() {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<ProgramChairReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        setError(err instanceof Error ? err.message : "Failed to load program chair reports.");
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

  const reports = useMemo<ProgramChairReport[]>(() => {
    const generatedOn = new Date().toLocaleDateString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const approvedProjects = projects.filter(project => project.approval_status === "approved");
    const pendingProjects = projects.filter(project => project.approval_status === "pending");
    const fundingGapProjects = projects.filter(project => projectNeedsFunding(project, approvedBudgetCountByProject));
    const dueSoonTasks = tasks
      .map(task => ({ ...task, daysLeft: getDaysUntilDeadline(task.due_date) }))
      .filter(task => task.status !== "completed" && task.status !== "cancelled" && task.daysLeft !== null && task.daysLeft <= 7)
      .sort((a, b) => (a.daysLeft ?? Number.POSITIVE_INFINITY) - (b.daysLeft ?? Number.POSITIVE_INFINITY));
    const taskCounts = getTaskCounts(tasks);
    const fundedBudgetPool = projects.reduce(
      (sum, project) => sum + projectBudgetDisplay(project, approvedBudgetByProject),
      0
    );
    const delegatedBudget = chairDepartmentBudgets.reduce(
      (sum, budget) => sum + Number(budget.allocated_budget || 0),
      0
    );
    const remainingChairBudget = Math.max(
      0,
      Number(chairBudget?.allocated_budget || 0) - Number(chairBudget?.spent_budget || 0)
    );

    return [
      {
        id: "PCR-001",
        title: "Program Portfolio Summary",
        category: "Operations",
        description: "Summarizes all chaired programs, project counts, and the overall task load inside the current portfolio.",
        generatedOn,
        highlights: [
          `${programs.length} chaired program${programs.length === 1 ? "" : "s"} are included in this snapshot.`,
          `${projects.length} project${projects.length === 1 ? "" : "s"} are being supervised across those programs.`,
          `${tasks.length} task${tasks.length === 1 ? "" : "s"} are currently tracked inside the delivery queue.`,
        ],
        metrics: [
          { label: "Programs", value: String(programs.length) },
          { label: "Projects", value: String(projects.length) },
          { label: "Tasks", value: String(tasks.length) },
        ],
        content: [
          "PROGRAM CHAIR REPORT: PROGRAM PORTFOLIO SUMMARY",
          `Prepared for: ${userName}`,
          `Generated on: ${generatedOn}`,
          "",
          "Program Coverage",
          ...(programs.length === 0 ? ["- No chaired programs found."] : programs.map(program => `- ${program.program_name}`)),
          "",
          "Project Rollup",
          ...(projects.length === 0
            ? ["- No projects are currently attached to chaired programs."]
            : projects.map(project => `- ${project.project_name} | ${projectVerificationLabel(project)} | ${projectLifecycleLabel(project, approvedBudgetCountByProject)} | ${formatCurrency(projectBudgetDisplay(project, approvedBudgetByProject))}`)),
        ].join("\n"),
      },
      {
        id: "PCR-002",
        title: "Approval and Funding Queue",
        category: "Governance",
        description: "Highlights projects pending review and approved projects that still need budget release.",
        generatedOn,
        highlights: [
          `${pendingProjects.length} project${pendingProjects.length === 1 ? "" : "s"} are currently pending chair action.`,
          `${fundingGapProjects.length} approved project${fundingGapProjects.length === 1 ? "" : "s"} still need funding activation.`,
          `${approvedProjects.length} project${approvedProjects.length === 1 ? "" : "s"} are already approved in the portfolio.`,
        ],
        metrics: [
          { label: "Pending", value: String(pendingProjects.length) },
          { label: "Needs Funding", value: String(fundingGapProjects.length) },
          { label: "Approved", value: String(approvedProjects.length) },
        ],
        content: [
          "PROGRAM CHAIR REPORT: APPROVAL AND FUNDING QUEUE",
          `Prepared for: ${userName}`,
          `Generated on: ${generatedOn}`,
          "",
          "Pending Review Projects",
          ...(pendingProjects.length === 0
            ? ["- No projects are currently pending chair review."]
            : pendingProjects.map(project => `- ${project.project_name} | ${programNameByID.get(project.program_id || "") || "Unassigned program"}`)),
          "",
          "Projects Awaiting Funding",
          ...(fundingGapProjects.length === 0
            ? ["- No approved projects are currently waiting on funding."]
            : fundingGapProjects.map(project => `- ${project.project_name} | ${project.status}`)),
        ].join("\n"),
      },
      {
        id: "PCR-003",
        title: "Budget Stewardship Snapshot",
        category: "Finance",
        description: "Tracks funded project volume, the chair budget position, and department allocation coverage.",
        generatedOn,
        highlights: [
          `${formatCurrency(fundedBudgetPool)} is the funded project budget currently visible across chaired programs.`,
          `${formatCurrency(remainingChairBudget)} remains in the chair budget after current spending.`,
          `${chairDepartmentBudgets.length} department allocation${chairDepartmentBudgets.length === 1 ? "" : "s"} currently receive delegated funding.`,
        ],
        metrics: [
          { label: "Funded Pool", value: formatCurrency(fundedBudgetPool) },
          { label: "Chair Remaining", value: formatCurrency(remainingChairBudget) },
          { label: "Delegated", value: formatCurrency(delegatedBudget) },
        ],
        content: [
          "PROGRAM CHAIR REPORT: BUDGET STEWARDSHIP SNAPSHOT",
          `Prepared for: ${userName}`,
          `Generated on: ${generatedOn}`,
          "",
          `Chair Budget Allocated: ${formatCurrency(chairBudget?.allocated_budget || 0)}`,
          `Chair Budget Spent: ${formatCurrency(chairBudget?.spent_budget || 0)}`,
          `Chair Budget Remaining: ${formatCurrency(remainingChairBudget)}`,
          `Delegated Department Budget: ${formatCurrency(delegatedBudget)}`,
          "",
          "Project Budget View",
          ...(projects.length === 0
            ? ["- No chaired projects are currently available."]
            : projects.map(project => `- ${project.project_name} | ${formatCurrency(projectBudgetDisplay(project, approvedBudgetByProject))}`)),
        ].join("\n"),
      },
      {
        id: "PCR-004",
        title: "Delivery Risk Digest",
        category: "Delivery",
        description: "Surfaces task pressure and open delivery risk inside the next seven days.",
        generatedOn,
        highlights: [
          `${taskCounts.completed} task${taskCounts.completed === 1 ? "" : "s"} are already done.`,
          `${taskCounts.ongoing + taskCounts.notStarted} task${taskCounts.ongoing + taskCounts.notStarted === 1 ? "" : "s"} remain open.`,
          `${dueSoonTasks.length} task${dueSoonTasks.length === 1 ? "" : "s"} are due within the next seven days.`,
        ],
        metrics: [
          { label: "Done", value: String(taskCounts.completed) },
          { label: "Open", value: String(taskCounts.ongoing + taskCounts.notStarted) },
          { label: "Due Soon", value: String(dueSoonTasks.length) },
        ],
        content: [
          "PROGRAM CHAIR REPORT: DELIVERY RISK DIGEST",
          `Prepared for: ${userName}`,
          `Generated on: ${generatedOn}`,
          "",
          "Task Status Summary",
          `Done: ${taskCounts.completed}`,
          `In progress: ${taskCounts.ongoing}`,
          `Not yet started: ${taskCounts.notStarted}`,
          `Cancelled: ${taskCounts.cancelled}`,
          "",
          "Due Soon",
          ...(dueSoonTasks.length === 0
            ? ["- No tasks fall inside the seven-day risk window."]
            : dueSoonTasks.map(task => `- ${task.title} | ${formatTaskStatus(task.status)} | ${formatDate(task.due_date)}`)),
        ].join("\n"),
      },
    ];
  }, [approvedBudgetByProject, approvedBudgetCountByProject, chairBudget, chairDepartmentBudgets, programNameByID, programs, projects, tasks, userName]);

  const filteredReports = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return reports;

    return reports.filter(report =>
      [report.id, report.title, report.category, report.description]
        .some(value => value.toLowerCase().includes(search))
    );
  }, [reports, searchTerm]);

  const handlePreview = (report: ProgramChairReport) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(186,0,33,0.10),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,116,144,0.12),_transparent_32%),linear-gradient(180deg,_#fff9f8_0%,_#f7fcfc_45%,_#ffffff_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-[#f1d7dc] bg-white/90 shadow-[0_24px_80px_-48px_rgba(125,10,35,0.35)] backdrop-blur">
          <div className="grid gap-6 px-6 py-7 md:px-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="space-y-4">
              <div className="inline-flex w-fit items-center rounded-full border border-[#e8c6ce] bg-[#fff4f6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8f1934]">
                Program Chair Reports
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Reporting library for {userName}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Generate concise portfolio, governance, budget, and delivery summaries from the current chaired workspace.
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
                <FileText className="h-10 w-10 text-white/75" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Reports Ready</p>
                  <p className="mt-2 text-2xl font-semibold">{reports.length}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Programs Covered</p>
                  <p className="mt-2 text-2xl font-semibold">{programs.length}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-white/80">
                Search and open generated chair reports, then preview, print, or download the output.
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
              <Link href="/program-chair/program-chair-program-management">
                <Button className="rounded-full bg-[#0f766e] text-white hover:bg-[#0b5e58]">
                  Open Program Management
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.9rem] border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Generated reports</CardTitle>
            <CardDescription>Operational summaries built from the current chaired portfolio.</CardDescription>
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
                        <FolderKanban className="mt-0.5 h-4 w-4 text-[#8f1934]" />
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
            <div id="program-chair-report-preview" className="space-y-5">
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
