import { API_URL } from "./api-config";

export type ProjectTaskStatus = "not_started" | "ongoing" | "completed" | "cancelled";

export interface ProgramChairUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface Program {
  id: string;
  program_name: string;
  department_id?: string | null;
  status?: string | null;
  approval_status?: string | null;
  spent_budget?: number | null;
  budget_allocation?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface Project {
  id: string;
  project_name: string;
  project_description?: string | null;
  program_id?: string | null;
  department_id?: string | null;
  project_head_id?: string | null;
  created_by?: string | null;
  created_by_role?: string | null;
  budget_allocated?: number | null;
  budget_used?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
  approval_status: string;
  progress?: number | null;
  created_at: string;
}

export interface ChairBudget {
  allocated_budget?: number | null;
  spent_budget?: number | null;
}

export interface ChairDepartmentBudget {
  department_id?: string | null;
  allocated_budget?: number | null;
  spent_budget?: number | null;
}

export interface BudgetRequestRecord {
  id: string;
  project_id: string;
  amount: number;
  status: string;
  created_at?: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  budget_needed: number;
  assignee_ids: string[];
  assignee_id?: string;
  status: ProjectTaskStatus;
  priority?: "low" | "medium" | "high" | "critical";
  due_date?: string;
  created_at: string;
}

export interface ProgramChairWorkspaceData {
  programs: Program[];
  projects: Project[];
  tasks: ProjectTask[];
  budgetRequests: BudgetRequestRecord[];
  chairBudget: ChairBudget | null;
  chairDepartmentBudgets: ChairDepartmentBudget[];
}

const API = `${API_URL}/api/v1`;

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export function normalize(value?: string | null) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function formatCurrency(amount?: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value?: string | null) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTaskStatus(status: string) {
  const value = normalize(status);
  if (value === "notstarted" || value === "pending") return "Not Yet Started";
  if (value === "ongoing" || value === "inprogress") return "In Progress";
  if (value === "completed") return "Done";
  if (value === "cancelled") return "Cancelled";
  return String(status || "Unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

export function getDaysUntilDeadline(deadline?: string | null) {
  if (!deadline) return null;
  const diffMs = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getApprovedBudgetByProject(budgetRequests: BudgetRequestRecord[]) {
  const map = new Map<string, number>();
  for (const request of budgetRequests) {
    if (normalize(request.status) !== "approved") continue;
    map.set(request.project_id, (map.get(request.project_id) || 0) + Number(request.amount || 0));
  }
  return map;
}

export function getApprovedBudgetCountByProject(budgetRequests: BudgetRequestRecord[]) {
  const map = new Map<string, number>();
  for (const request of budgetRequests) {
    if (normalize(request.status) !== "approved") continue;
    map.set(request.project_id, (map.get(request.project_id) || 0) + 1);
  }
  return map;
}

export function projectNeedsFunding(project: Project, approvedBudgetCountByProject: Map<string, number>) {
  return normalize(project.approval_status) === "approved" && (approvedBudgetCountByProject.get(project.id) || 0) === 0;
}

export function projectBudgetDisplay(project: Project, approvedBudgetByProject: Map<string, number>) {
  return Number(approvedBudgetByProject.get(project.id) || project.budget_allocated || 0);
}

export function projectVerificationLabel(project: Project) {
  if (normalize(project.approval_status) === "approved") return "Approved";
  if (normalize(project.approval_status) === "rejected") return "Declined";
  if (normalize(project.approval_status) === "pending" && project.project_head_id) return "Pending Chair Review";
  if (!project.project_head_id) return "Pending Head Assignment";
  return "Pending Review";
}

export function projectVerificationTone(project: Project) {
  const label = projectVerificationLabel(project);
  if (label === "Approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (label === "Declined") return "border-rose-200 bg-rose-50 text-rose-700";
  if (label === "Pending Chair Review") return "border-indigo-200 bg-indigo-50 text-indigo-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function projectLifecycleLabel(project: Project, approvedBudgetCountByProject: Map<string, number>) {
  if (projectNeedsFunding(project, approvedBudgetCountByProject)) return "Needs Funding";
  const status = String(project.status || "").replace(/_/g, " ").trim();
  return status ? status.replace(/\b\w/g, char => char.toUpperCase()) : "Unknown";
}

export function projectLifecycleTone(project: Project, approvedBudgetCountByProject: Map<string, number>) {
  if (projectNeedsFunding(project, approvedBudgetCountByProject)) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  const value = normalize(project.status);
  if (value === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (value === "inprogress" || value === "ongoing") return "border-sky-200 bg-sky-50 text-sky-700";
  if (value === "pendingapproval" || value === "planning") return "border-blue-200 bg-blue-50 text-blue-700";
  if (value === "cancelled" || value === "onhold") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function getTaskCounts(tasks: ProjectTask[]) {
  return {
    completed: tasks.filter(task => task.status === "completed").length,
    ongoing: tasks.filter(task => task.status === "ongoing").length,
    notStarted: tasks.filter(task => task.status === "not_started").length,
    cancelled: tasks.filter(task => task.status === "cancelled").length,
  };
}

export function getProjectProgress(tasks: ProjectTask[], fallback = 0) {
  if (tasks.length === 0) return Math.max(0, Math.min(Math.round(fallback || 0), 100));
  return Math.round((tasks.filter(task => task.status === "completed").length / tasks.length) * 100);
}

function parseTaskStatus(status?: string | null): ProjectTaskStatus {
  const value = normalize(status);
  if (value === "inprogress" || value === "ongoing") return "ongoing";
  if (value === "completed") return "completed";
  if (value === "cancelled") return "cancelled";
  return "not_started";
}

function parseTaskPriority(priority?: string | null): "low" | "medium" | "high" | "critical" {
  const value = normalize(priority);
  if (value === "critical" || value === "urgent") return "critical";
  if (value === "high") return "high";
  if (value === "low") return "low";
  return "medium";
}

export async function loadProgramChairWorkspace(currentUser: ProgramChairUser): Promise<ProgramChairWorkspaceData> {
  if (!currentUser.id) {
    throw new Error("Could not resolve the current program chair session.");
  }

  const [programRes, chairBudgetRes, chairDeptBudgetRes, budgetRequestRes] = await Promise.all([
    fetch(`${API}/programs/program-chair/${currentUser.id}`, { headers: authHeaders() }),
    fetch(`${API}/budgets/chairs?chair_id=${currentUser.id}`, { headers: authHeaders() }),
    fetch(`${API}/budgets/chair-departments?chair_id=${currentUser.id}`, { headers: authHeaders() }),
    fetch(`${API}/budget-requests`, { headers: authHeaders() }),
  ]);

  if (!programRes.ok) throw new Error("Failed to load program chair programs.");

  const programPayload = await programRes.json();
  const chairBudgetPayload = chairBudgetRes.ok ? await chairBudgetRes.json() : { program_chair_budgets: [] };
  const chairDeptBudgetPayload = chairDeptBudgetRes.ok ? await chairDeptBudgetRes.json() : { chair_department_budgets: [] };
  const budgetRequestPayload = budgetRequestRes.ok ? await budgetRequestRes.json() : { requests: [] };

  const programs: Program[] = Array.isArray(programPayload.programs) ? programPayload.programs : [];
  const chairBudget: ChairBudget | null = (chairBudgetPayload.program_chair_budgets || [])[0] || null;
  const chairDepartmentBudgets: ChairDepartmentBudget[] = Array.isArray(chairDeptBudgetPayload.chair_department_budgets)
    ? chairDeptBudgetPayload.chair_department_budgets
    : [];

  const projectResponses = await Promise.all(
    programs.map(program => fetch(`${API}/projects?program_id=${program.id}`, { headers: authHeaders() }))
  );

  const projectMap = new Map<string, Project>();
  for (const response of projectResponses) {
    if (!response.ok) continue;
    const payload = await response.json();
    const projects: Project[] = Array.isArray(payload.projects) ? payload.projects : [];
    for (const project of projects) {
      if (!project?.id) continue;
      projectMap.set(project.id, project);
    }
  }

  const projects = [...projectMap.values()].sort(
    (a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
  );

  const taskResponses = await Promise.all(
    projects.map(project =>
      fetch(`${API}/projects/${project.id}/tasks`, { headers: authHeaders() })
        .then(async response => {
          if (!response.ok) return [];
          const payload = await response.json();
          const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];
          return tasks.map((task: Record<string, unknown>) => ({
            id: String(task.id || ""),
            project_id: String(task.project_id || project.id),
            title: String(task.title || "Untitled Task"),
            description: typeof task.description === "string" ? task.description : "",
            budget_needed: Number(task.budget_needed || 0),
            assignee_ids: Array.isArray(task.assignee_ids) ? task.assignee_ids.map(value => String(value)) : [],
            assignee_id: task.assignee_id ? String(task.assignee_id) : undefined,
            status: parseTaskStatus(typeof task.status === "string" ? task.status : ""),
            priority: parseTaskPriority(typeof task.priority === "string" ? task.priority : ""),
            due_date: task.due_date ? String(task.due_date) : undefined,
            created_at: task.created_at ? String(task.created_at) : new Date().toISOString(),
          })) as ProjectTask[];
        })
        .catch(() => [])
    )
  );

  const tasks = taskResponses.flat();
  const projectIDs = new Set(projects.map(project => project.id));
  const budgetRequestsRaw: Array<Record<string, unknown>> = Array.isArray(budgetRequestPayload?.requests)
    ? budgetRequestPayload.requests
    : Array.isArray(budgetRequestPayload?.budget_requests)
      ? budgetRequestPayload.budget_requests
      : [];

  const budgetRequests = budgetRequestsRaw
    .map(request => {
      const amount = typeof request.amount === "number" ? request.amount : Number(request.amount);
      return {
        id: String(request.id || ""),
        project_id: String(request.project_id || ""),
        amount: Number.isFinite(amount) ? amount : 0,
        status: String(request.status || ""),
        created_at: request.created_at ? String(request.created_at) : undefined,
      };
    })
    .filter((request): request is BudgetRequestRecord => Boolean(request.id && request.project_id && projectIDs.has(request.project_id)));

  return {
    programs,
    projects,
    tasks,
    budgetRequests,
    chairBudget,
    chairDepartmentBudgets,
  };
}
