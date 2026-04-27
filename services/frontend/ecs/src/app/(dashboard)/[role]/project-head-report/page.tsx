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
  formatCurrency,
  formatDate,
  formatTaskStatus,
  getApprovedBudgetByProject,
  getDaysUntilDeadline,
  getTaskCounts,
  loadProjectHeadWorkspace,
  Program,
  projectBudgetDisplay,
  projectLifecycleLabel,
  Project,
  ProjectTask,
  projectVerificationLabel,
  ProjectHeadUser,
  projectNeedsFunding,
} from "@/shared/lib/project-head-workspace";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  FolderKanban,
  Loader2,
  Printer,
  Search,
  Wallet,
} from "lucide-react";

interface ProjectHeadReport {
  id: string;
  title: string;
  category: string;
  description: string;
  generatedOn: string;
  highlights: string[];
  metrics: Array<{ label: string; value: string }>;
  content: string;
}

function downloadReport(report: ProjectHeadReport) {
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

export default function ProjectHeadReportsPage() {
  const [user, setUser] = useState<ProjectHeadUser | null>(null);
  const [userName, setUserName] = useState("Project Head");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequestRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<ProjectHeadReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        setError(err instanceof Error ? err.message : "Failed to load project head reports.");
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

  const reports = useMemo<ProjectHeadReport[]>(() => {
    const generatedOn = new Date().toLocaleDateString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const approvedProjects = projects.filter(project => project.approval_status === "approved");
    const pendingProjects = projects.filter(project => project.approval_status === "pending");
    const fundingGapProjects = projects.filter(project => projectNeedsFunding(project, approvedBudgetByProject));
    const visibleBudgetPool = projects.reduce(
      (sum, project) => sum + projectBudgetDisplay(project, approvedBudgetByProject),
      0
    );

    const taskCounts = getTaskCounts(tasks);
    const dueSoonTasks = tasks
      .map(task => ({ ...task, daysLeft: getDaysUntilDeadline(task.due_date) }))
      .filter(task => task.status !== "completed" && task.status !== "cancelled" && task.daysLeft !== null && task.daysLeft <= 7)
      .sort((a, b) => (a.daysLeft ?? Number.POSITIVE_INFINITY) - (b.daysLeft ?? Number.POSITIVE_INFINITY));

    const createdByMe = projects.filter(project => project.created_by === user?.id);

    return [
      {
        id: "PHR-001",
        title: "Portfolio Summary",
        category: "Operations",
        description: "A broad summary of programs, projects, and task volume currently under project-head oversight.",
        generatedOn,
        highlights: [
          `${programs.length} program${programs.length === 1 ? "" : "s"} are active in the current department scope.`,
          `${projects.length} total project${projects.length === 1 ? "" : "s"} are included in this report.`,
          `${tasks.length} task${tasks.length === 1 ? "" : "s"} are tracked across the portfolio.`,
        ],
        metrics: [
          { label: "Programs", value: String(programs.length) },
          { label: "Projects", value: String(projects.length) },
          { label: "Tasks", value: String(tasks.length) },
        ],
        content: [
          "PROJECT HEAD REPORT: PORTFOLIO SUMMARY",
          `Prepared for: ${userName}`,
          `Generated on: ${generatedOn}`,
          "",
          "Program Coverage",
          ...programs.map(program => `- ${program.program_name}`),
          "",
          "Projects",
          ...projects.map(project => `- ${project.project_name} | ${projectVerificationLabel(project, user?.id)} | ${projectLifecycleLabel(project, approvedBudgetByProject)} | ${formatCurrency(projectBudgetDisplay(project, approvedBudgetByProject))}`),
        ].join("\n"),
      },
      {
        id: "PHR-002",
        title: "Approval Queue Review",
        category: "Governance",
        description: "Focuses on projects awaiting project-head or chair review, plus projects initiated by the current user.",
        generatedOn,
        highlights: [
          `${pendingProjects.length} project${pendingProjects.length === 1 ? "" : "s"} are currently pending approval flow steps.`,
          `${createdByMe.length} project${createdByMe.length === 1 ? "" : "s"} were created by this project head.`,
          `${approvedProjects.length} project${approvedProjects.length === 1 ? "" : "s"} have already reached approved status.`,
        ],
        metrics: [
          { label: "Pending", value: String(pendingProjects.length) },
          { label: "Approved", value: String(approvedProjects.length) },
          { label: "Created By Me", value: String(createdByMe.length) },
        ],
        content: [
          "PROJECT HEAD REPORT: APPROVAL QUEUE REVIEW",
          `Prepared for: ${userName}`,
          `Generated on: ${generatedOn}`,
          "",
          "Pending Review Projects",
          ...(pendingProjects.length === 0
            ? ["- No projects are currently pending review."]
            : pendingProjects.map(project => `- ${project.project_name} | ${projectVerificationLabel(project, user?.id)} | Program ${programNameByID.get(project.program_id || "") || "Unassigned"}`)),
          "",
          "Projects Created By This User",
          ...(createdByMe.length === 0
            ? ["- No projects created by this user are currently listed."]
            : createdByMe.map(project => `- ${project.project_name} | ${project.approval_status} | ${project.status}`)),
        ].join("\n"),
      },
      {
        id: "PHR-003",
        title: "Funding and Budget Snapshot",
        category: "Finance",
        description: "Highlights funded projects, projects still needing funding, and the approved budget pool on record.",
        generatedOn,
        highlights: [
          `${fundingGapProjects.length} project${fundingGapProjects.length === 1 ? "" : "s"} still need funding.`,
          `${approvedProjects.length} approved project${approvedProjects.length === 1 ? "" : "s"} form the current delivery base.`,
          `${formatCurrency(visibleBudgetPool)} is the total visible approved budget pool across projects.`,
        ],
        metrics: [
          { label: "Budget Pool", value: formatCurrency(visibleBudgetPool) },
          { label: "Needs Funding", value: String(fundingGapProjects.length) },
          { label: "Approved Projects", value: String(approvedProjects.length) },
        ],
        content: [
          "PROJECT HEAD REPORT: FUNDING AND BUDGET SNAPSHOT",
          `Prepared for: ${userName}`,
          `Generated on: ${generatedOn}`,
          "",
          "Projects Requiring Funding",
          ...(fundingGapProjects.length === 0
            ? ["- No approved projects are currently waiting on funding."]
            : fundingGapProjects.map(project => `- ${project.project_name} | ${projectLifecycleLabel(project, approvedBudgetByProject)}`)),
          "",
          "Budget View",
          ...projects.map(project => `- ${project.project_name} | ${formatCurrency(projectBudgetDisplay(project, approvedBudgetByProject))} | Budget Used ${formatCurrency(project.budget_used || 0)}`),
        ].join("\n"),
      },
      {
        id: "PHR-004",
        title: "Task Delivery Digest",
        category: "Delivery",
        description: "Summarizes task throughput, open workload, and the nearest upcoming deadlines across all tracked projects.",
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
          "PROJECT HEAD REPORT: TASK DELIVERY DIGEST",
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
  }, [approvedBudgetByProject, programNameByID, programs, projects, tasks, user?.id, userName]);

  const filteredReports = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return reports;

    return reports.filter(report =>
      [report.id, report.title, report.category, report.description]
        .some(value => value.toLowerCase().includes(search))
    );
  }, [reports, searchTerm]);

  const dueSoonCount = useMemo(
    () => tasks.filter(task => task.status !== "completed" && task.status !== "cancelled" && (getDaysUntilDeadline(task.due_date) ?? 99) <= 7).length,
    [tasks]
  );

  const handlePreview = (report: ProjectHeadReport) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  const handlePrint = (report: ProjectHeadReport) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
    window.setTimeout(() => window.print(), 100);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(15,118,110,0.10),_transparent_28%),linear-gradient(180deg,_#f6fffd_0%,_#fbfdfd_45%,_#ffffff_100%)] p-4 md:p-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #project-head-report-preview, #project-head-report-preview * {
            visibility: visible;
          }
          #project-head-report-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 24px;
            background: white;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white/90 shadow-[0_24px_80px_-48px_rgba(13,90,86,0.35)] backdrop-blur">
          <div className="grid gap-6 px-6 py-7 md:px-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="space-y-4">
              <div className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Project Head Reports
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Reporting hub for {userName}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Generate portfolio summaries, review snapshots, funding overviews, and delivery digests, then preview, print, or download them.
                </p>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] bg-[#0f766e] p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/75">Generated</p>
                  <p className="mt-1 text-lg font-semibold">
                    <ClientNow />
                  </p>
                </div>
                <FileText className="h-9 w-9 text-white/80" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-white/70">Reports</p>
                  <p className="mt-1 text-2xl font-bold">{reports.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-white/70">Due Soon</p>
                  <p className="mt-1 text-2xl font-bold">{dueSoonCount}</p>
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <FileText className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Available Reports</p>
                <p className="text-3xl font-bold text-slate-900">{reports.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-sky-50 p-3">
                <FolderKanban className="h-6 w-6 text-sky-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Projects</p>
                <p className="text-3xl font-bold text-slate-900">{projects.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Approved Projects</p>
                <p className="text-3xl font-bold text-slate-900">{projects.filter(project => project.approval_status === "approved").length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-amber-50 p-3">
                <Wallet className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Budget Pool</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(projects.reduce((sum, project) => sum + projectBudgetDisplay(project, approvedBudgetByProject), 0))}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xl text-slate-900">Reports library</CardTitle>
                <CardDescription className="text-slate-500">
                  Search and open generated project-head reports, or jump to the report submission workflow.
                </CardDescription>
              </div>
              <Button asChild className="rounded-full bg-[#0f766e] text-white hover:bg-[#0b5e58]">
                <Link href="/project-head/project-head-report-submission">Open Report Submission</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="relative max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search report title, category, or ID..."
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Preparing project head reports...
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500">
                No reports match your search.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredReports.map(report => (
                  <div key={report.id} className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f5fffd_100%)] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{report.category}</Badge>
                          <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">{report.id}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">{report.title}</h3>
                        <p className="text-sm leading-6 text-slate-500">{report.description}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                        {report.generatedOn}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {report.metrics.map(metric => (
                        <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
                          <p className="mt-2 text-lg font-bold text-slate-900">{metric.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 space-y-2">
                      {report.highlights.map(highlight => (
                        <div key={highlight} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          {highlight}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button onClick={() => handlePreview(report)} className="rounded-full bg-[#0f766e] text-white hover:bg-[#0b5e58]">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePrint(report)}
                        className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => downloadReport(report)}
                        className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-slate-900">What these reports cover</CardTitle>
            <CardDescription className="text-slate-500">
              Each report is generated from the active department portfolio visible to the project head.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Program and project portfolio coverage.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Approval queue status and user-created requests.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Funding gaps, approved budgets, and budget pool visibility.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Task delivery progress and near-term deadline pressure.
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-900">{selectedReport?.title}</DialogTitle>
            <DialogDescription className="text-slate-600">
              {selectedReport?.id} · {selectedReport?.category} · Generated on {selectedReport?.generatedOn}
            </DialogDescription>
          </DialogHeader>

          <div id="project-head-report-preview" className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{selectedReport?.category}</Badge>
              <span className="text-sm text-slate-500">Prepared for {userName}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {selectedReport?.metrics.map(metric => (
                <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {selectedReport?.highlights.map(highlight => (
                <div key={highlight} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  {highlight}
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700">
                {selectedReport?.content}
              </pre>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => selectedReport && handlePrint(selectedReport)}
              className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedReport && downloadReport(selectedReport)}
              className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={() => setIsDialogOpen(false)} className="rounded-full bg-[#0f766e] text-white hover:bg-[#0b5e58]">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
