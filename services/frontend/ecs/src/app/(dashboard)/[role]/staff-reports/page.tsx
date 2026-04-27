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
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  FolderKanban,
  Loader2,
  Printer,
  Search,
} from "lucide-react";

const API = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/v1`;

type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

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

interface StaffReport {
  id: string;
  title: string;
  category: string;
  description: string;
  generatedOn: string;
  highlights: string[];
  metrics: Array<{ label: string; value: string }>;
  content: string;
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

function formatDate(value?: string | null) {
  if (!value) return "No date";
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

function getDaysUntilDeadline(deadline?: string | null) {
  if (!deadline) return null;
  const today = new Date();
  const dueDate = new Date(deadline);
  const diffMs = dueDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function downloadReport(report: StaffReport) {
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

export default function StaffReportsPage() {
  const [projects, setProjects] = useState<StaffProjectSummary[]>([]);
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<StaffReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

        if (!projectRes.ok) throw new Error((await projectRes.text()) || "Failed to load staff projects.");
        if (!taskRes.ok) throw new Error((await taskRes.text()) || "Failed to load staff tasks.");

        const projectPayload = await projectRes.json();
        const taskPayload = await taskRes.json();

        if (!active) return;

        setProjects(Array.isArray(projectPayload.projects) ? projectPayload.projects : []);
        setTasks(Array.isArray(taskPayload.tasks) ? taskPayload.tasks : []);
      } catch (err) {
        if (!active) return;
        setProjects([]);
        setTasks([]);
        setError(err instanceof Error ? err.message : "Failed to load staff reports.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const reports = useMemo<StaffReport[]>(() => {
    const completedTasks = tasks.filter(task => task.status === "completed");
    const inProgressTasks = tasks.filter(task => task.status === "in_progress");
    const pendingTasks = tasks.filter(task => task.status === "pending");
    const cancelledTasks = tasks.filter(task => task.status === "cancelled");
    const dueSoonTasks = tasks
      .map(task => ({ ...task, daysLeft: getDaysUntilDeadline(task.deadline) }))
      .filter(task => task.status !== "completed" && task.status !== "cancelled" && task.daysLeft !== null && task.daysLeft <= 5)
      .sort((a, b) => (a.daysLeft ?? Number.POSITIVE_INFINITY) - (b.daysLeft ?? Number.POSITIVE_INFINITY));

    const activeProjects = projects.filter(project => (project.status || "").toLowerCase() === "in_progress");
    const totalBudget = projects.reduce((sum, project) => sum + (project.budget_allocated || 0), 0);
    const averageProgress = projects.length === 0
      ? 0
      : Math.round(
          projects.reduce((sum, project) => sum + (project.progress || 0), 0) / projects.length
        );

    const recentCompleted = completedTasks
      .slice()
      .sort((a, b) => new Date(b.date_given).getTime() - new Date(a.date_given).getTime())
      .slice(0, 5)
      .map(task => `${task.title} (${task.project_name})`);

    const riskLines = dueSoonTasks.length === 0
      ? ["No deadline risks detected in the next five days."]
      : dueSoonTasks.slice(0, 5).map(task => {
          const days = task.daysLeft ?? 0;
          if (days < 0) return `${task.title} is overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}.`;
          return `${task.title} is due in ${days} day${days === 1 ? "" : "s"}.`;
        });

    const reportDate = new Date().toLocaleDateString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return [
      {
        id: "SREP-001",
        title: "Workload Overview",
        category: "Operations",
        description: "A roll-up of assigned projects, total task volume, and budget exposure for current staff work.",
        generatedOn: reportDate,
        highlights: [
          `${projects.length} assigned project${projects.length === 1 ? "" : "s"} are currently tracked.`,
          `${tasks.length} total task${tasks.length === 1 ? "" : "s"} are included in this report.`,
          `${averageProgress}% is the average reported project progress across visible assignments.`,
        ],
        metrics: [
          { label: "Projects", value: String(projects.length) },
          { label: "Tasks", value: String(tasks.length) },
          { label: "Budget Scope", value: formatCurrency(totalBudget) },
        ],
        content: [
          "STAFF REPORT: WORKLOAD OVERVIEW",
          `Prepared for: ${userName}`,
          `Generated on: ${reportDate}`,
          "",
          "Summary",
          `Assigned projects: ${projects.length}`,
          `Assigned tasks: ${tasks.length}`,
          `Active projects: ${activeProjects.length}`,
          `Average project progress: ${averageProgress}%`,
          `Combined tracked budget: ${formatCurrency(totalBudget)}`,
          "",
          "Project Coverage",
          ...projects.map(project => `- ${project.project_name}: ${formatStatus(project.status)}, deadline ${formatDate(project.deadline)}, budget ${formatCurrency(project.budget_allocated)}`),
        ].join("\n"),
      },
      {
        id: "SREP-002",
        title: "Completion Summary",
        category: "Performance",
        description: "Highlights finished work, current execution load, and outstanding not-yet-started tasks.",
        generatedOn: reportDate,
        highlights: [
          `${completedTasks.length} task${completedTasks.length === 1 ? "" : "s"} have been marked done.`,
          `${inProgressTasks.length} task${inProgressTasks.length === 1 ? "" : "s"} remain in progress.`,
          `${pendingTasks.length} task${pendingTasks.length === 1 ? "" : "s"} have not yet started.`,
        ],
        metrics: [
          { label: "Done", value: String(completedTasks.length) },
          { label: "In Progress", value: String(inProgressTasks.length) },
          { label: "Not Started", value: String(pendingTasks.length) },
        ],
        content: [
          "STAFF REPORT: COMPLETION SUMMARY",
          `Prepared for: ${userName}`,
          `Generated on: ${reportDate}`,
          "",
          "Task Breakdown",
          `Done: ${completedTasks.length}`,
          `In progress: ${inProgressTasks.length}`,
          `Not yet started: ${pendingTasks.length}`,
          `Cancelled: ${cancelledTasks.length}`,
          "",
          "Recently Completed Work",
          ...(recentCompleted.length === 0 ? ["- No completed tasks recorded yet."] : recentCompleted.map(item => `- ${item}`)),
        ].join("\n"),
      },
      {
        id: "SREP-003",
        title: "Deadline Risk Review",
        category: "Risk",
        description: "A quick view of tasks due soon or already overdue so staff can prioritize follow-up work.",
        generatedOn: reportDate,
        highlights: [
          `${dueSoonTasks.length} task${dueSoonTasks.length === 1 ? "" : "s"} need attention within the next five days.`,
          dueSoonTasks.some(task => (task.daysLeft ?? 0) < 0)
            ? "At least one task is already overdue."
            : "No overdue tasks are currently listed in this report.",
          "This report excludes cancelled and already completed tasks.",
        ],
        metrics: [
          { label: "Due Soon", value: String(dueSoonTasks.filter(task => (task.daysLeft ?? 0) >= 0).length) },
          { label: "Overdue", value: String(dueSoonTasks.filter(task => (task.daysLeft ?? 0) < 0).length) },
          { label: "Open Tasks", value: String(inProgressTasks.length + pendingTasks.length) },
        ],
        content: [
          "STAFF REPORT: DEADLINE RISK REVIEW",
          `Prepared for: ${userName}`,
          `Generated on: ${reportDate}`,
          "",
          "Risk Notes",
          ...riskLines.map(line => `- ${line}`),
          "",
          "Tasks Reviewed",
          ...(dueSoonTasks.length === 0
            ? ["- No tasks currently fall within the risk window."]
            : dueSoonTasks.map(task => `- ${task.title} | ${task.project_name} | ${formatStatus(task.status)} | Deadline ${formatDate(task.deadline)}`)),
        ].join("\n"),
      },
      {
        id: "SREP-004",
        title: "Project Status Digest",
        category: "Projects",
        description: "A staff-facing digest of project assignments, current progress, and task distribution by project.",
        generatedOn: reportDate,
        highlights: [
          `${activeProjects.length} project${activeProjects.length === 1 ? "" : "s"} are actively moving forward.`,
          `${projects.filter(project => project.completed_tasks > 0).length} project${projects.filter(project => project.completed_tasks > 0).length === 1 ? "" : "s"} already include completed work.`,
          `${projects.filter(project => project.not_started_tasks > 0).length} project${projects.filter(project => project.not_started_tasks > 0).length === 1 ? "" : "s"} still contain not-yet-started tasks.`,
        ],
        metrics: [
          { label: "Active Projects", value: String(activeProjects.length) },
          { label: "Avg Progress", value: `${averageProgress}%` },
          { label: "Tracked Budget", value: formatCurrency(totalBudget) },
        ],
        content: [
          "STAFF REPORT: PROJECT STATUS DIGEST",
          `Prepared for: ${userName}`,
          `Generated on: ${reportDate}`,
          "",
          "Project Detail",
          ...projects.map(project => {
            return [
              `- ${project.project_name}`,
              `  Department: ${project.department_name}`,
              `  Status: ${formatStatus(project.status)}`,
              `  Tasks: ${project.total_tasks} total, ${project.completed_tasks} done, ${project.ongoing_tasks} in progress, ${project.not_started_tasks} not started`,
              `  Deadline: ${formatDate(project.deadline)}`,
            ].join("\n");
          }),
        ].join("\n"),
      },
    ];
  }, [projects, tasks, userName]);

  const filteredReports = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return reports;

    return reports.filter(report =>
      [report.id, report.title, report.category, report.description]
        .some(value => value.toLowerCase().includes(search))
    );
  }, [reports, searchTerm]);

  const totalCompleted = tasks.filter(task => task.status === "completed").length;
  const totalOpen = tasks.filter(task => task.status === "pending" || task.status === "in_progress").length;

  const handleView = (report: StaffReport) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  const handlePrint = (report: StaffReport) => {
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
          #staff-report-preview, #staff-report-preview * {
            visibility: visible;
          }
          #staff-report-preview {
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
                Staff Reports
              </div>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Export-ready reporting for {userName}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                  Review workload snapshots, completion summaries, and deadline risks, then preview, print, or download each report.
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
                  <p className="text-white/70">Open Tasks</p>
                  <p className="mt-1 text-2xl font-bold">{totalOpen}</p>
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
                <p className="text-sm text-slate-500">Assigned Projects</p>
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
                <p className="text-sm text-slate-500">Completed Tasks</p>
                <p className="text-3xl font-bold text-slate-900">{totalCompleted}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-amber-50 p-3">
                <Clock3 className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Open Tasks</p>
                <p className="text-3xl font-bold text-slate-900">{totalOpen}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-slate-900">Report library</CardTitle>
            <CardDescription className="text-slate-500">
              Search generated staff reports by title, category, or report ID.
            </CardDescription>
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
                Preparing staff reports...
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
                      <Button
                        onClick={() => handleView(report)}
                        className="rounded-full bg-[#0f766e] text-white hover:bg-[#0b5e58]"
                      >
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
            <CardTitle className="text-xl text-slate-900">What the reports cover</CardTitle>
            <CardDescription className="text-slate-500">
              These staff reports are generated from your current assigned projects and tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Workload and budget scope across assigned projects.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Completion progress for done, in-progress, and not-yet-started tasks.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Deadline risk visibility for tasks due soon or already overdue.
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

          <div id="staff-report-preview" className="space-y-5">
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
