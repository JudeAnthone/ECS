import { API_URL } from "./api-config";

export type ProjectTaskStatus = "not_started" | "ongoing" | "completed" | "cancelled";

export interface ProjectHeadUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  department?: string;
  assigned_program_chair_id?: string | null;
}

export interface Department {
  id: string;
  department_code?: string;
  department_name?: string;
  program_chair_id?: string;
}

export interface Program {
  id: string;
  program_name: string;
  department_id?: string | null;
}

export interface Project {
  id: string;
  project_name: string;
  project_description?: string | null;
  program_id?: string | null;
  department_id?: string | null;
  created_by: string;
  created_by_role?: string | null;
  project_head_id?: string | null;
  budget_allocated?: number | null;
  budget_used?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
  approval_status: string;
  created_at: string;
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

export interface ProjectHeadWorkspaceData {
  department: Department;
  programs: Program[];
  projects: Project[];
  tasks: ProjectTask[];
  budgetRequests: BudgetRequestRecord[];
}

const API = `${API_URL}/api/v1`;

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export function normalize(value?: string | null) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toAcronym(name?: string | null) {
  if (!name) return "";
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join("")
    .toLowerCase();
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
  const value = (status || "").toLowerCase();
  if (value === "not_started" || value === "pending") return "Not Yet Started";
  if (value === "ongoing" || value === "in_progress") return "In Progress";
  if (value === "completed") return "Done";
  if (value === "cancelled") return "Cancelled";
  return value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "-";
}

export function getDaysUntilDeadline(deadline?: string | null) {
  if (!deadline) return null;
  const today = new Date();
  const dueDate = new Date(deadline);
  const diffMs = dueDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getApprovedBudgetByProject(budgetRequests: BudgetRequestRecord[]) {
  const map = new Map<string, number>();
  for (const request of budgetRequests) {
    if ((request.status || "").toLowerCase() !== "approved") continue;
    const previous = map.get(request.project_id) || 0;
    map.set(request.project_id, previous + Number(request.amount || 0));
  }
  return map;
}

export function getApprovedBudgetCountByProject(budgetRequests: BudgetRequestRecord[]) {
  const map = new Map<string, number>();
  for (const request of budgetRequests) {
    if ((request.status || "").toLowerCase() !== "approved") continue;
    const previous = map.get(request.project_id) || 0;
    map.set(request.project_id, previous + 1);
  }
  return map;
}

export function isProjectApproved(project: Project) {
  return normalize(project.approval_status) === "approved";
}

export function projectNeedsFunding(project: Project, approvedBudgetByProject: Map<string, number>) {
  const isApproved = isProjectApproved(project);
  const approvedRequestBudget = Number(approvedBudgetByProject.get(project.id) || 0);
  const allocatedBudget = Number(project.budget_allocated || 0);
  return isApproved && allocatedBudget <= 0 && approvedRequestBudget <= 0;
}

export function projectBudgetDisplay(project: Project, approvedBudgetByProject: Map<string, number>) {
  if (projectNeedsFunding(project, approvedBudgetByProject)) return 0;
  return Number(approvedBudgetByProject.get(project.id) || project.budget_allocated || 0);
}

export function projectVerificationLabel(project: Project, currentUserID?: string | null) {
  if (project.approval_status === "approved") return "Approved";
  if (project.approval_status === "rejected") return "Declined";
  if (project.approval_status === "pending" && project.project_head_id && project.status !== "pending_approval") {
    return "Pending Chair Review";
  }
  if (!project.project_head_id || project.project_head_id === currentUserID) {
    return "Pending Head Review";
  }
  return "Pending Head Assignment";
}

export function projectVerificationTone(project: Project, currentUserID?: string | null) {
  const label = projectVerificationLabel(project, currentUserID);
  if (label === "Approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (label === "Declined") return "border-rose-200 bg-rose-50 text-rose-700";
  if (label === "Pending Chair Review") return "border-indigo-200 bg-indigo-50 text-indigo-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function projectLifecycleLabel(project: Project, approvedBudgetByProject: Map<string, number>) {
  if (projectNeedsFunding(project, approvedBudgetByProject)) return "Needs Funding";
  const status = (project.status || "").replace(/_/g, " ").trim();
  return status ? status.replace(/\b\w/g, c => c.toUpperCase()) : "Unknown";
}

export function projectLifecycleTone(project: Project, approvedBudgetByProject: Map<string, number>) {
  if (projectNeedsFunding(project, approvedBudgetByProject)) {
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
  const completed = tasks.filter(task => task.status === "completed").length;
  return Math.round((completed / tasks.length) * 100);
}

function parseTaskStatus(status?: string | null): ProjectTaskStatus {
  const value = (status || "").toLowerCase();
  if (value === "in_progress" || value === "ongoing") return "ongoing";
  if (value === "completed") return "completed";
  if (value === "cancelled") return "cancelled";
  return "not_started";
}

function parseTaskPriority(priority?: string | null): "low" | "medium" | "high" | "critical" {
  const value = (priority || "").toLowerCase();
  if (value === "critical" || value === "urgent") return "critical";
  if (value === "high") return "high";
  if (value === "low") return "low";
  return "medium";
}

export async function loadProjectHeadWorkspace(currentUser: ProjectHeadUser): Promise<ProjectHeadWorkspaceData> {
  if (!currentUser.id) {
    throw new Error("Could not resolve the current project head session.");
  }

  const [programRes, departmentRes, budgetRequestRes] = await Promise.all([
    fetch(`${API}/programs`, { headers: authHeaders() }),
    fetch(`${API}/departments`, { headers: authHeaders() }),
    fetch(`${API}/budget-requests`, { headers: authHeaders() }),
  ]);

  if (!programRes.ok) throw new Error("Failed to load programs.");
  if (!departmentRes.ok) throw new Error("Failed to load departments.");

  const programPayload = await programRes.json();
  const departmentPayload = await departmentRes.json();
  const budgetRequestPayload = budgetRequestRes.ok ? await budgetRequestRes.json() : { requests: [] };

  const programs: Program[] = Array.isArray(programPayload.programs) ? programPayload.programs : [];
  const departments: Department[] = Array.isArray(departmentPayload.departments) ? departmentPayload.departments : [];

  const userDepartment = String(currentUser.department || "").toLowerCase().trim();
  const userDepartmentNorm = normalize(userDepartment);

  const mappedDepartment = departments.find(department => {
    const code = String(department.department_code || "").toLowerCase();
    const name = String(department.department_name || "").toLowerCase();
    const acronym = toAcronym(department.department_name);
    const codeNorm = normalize(code);
    const nameNorm = normalize(name);

    return (
      code === userDepartment ||
      name === userDepartment ||
      acronym === userDepartment ||
      codeNorm === userDepartmentNorm ||
      nameNorm === userDepartmentNorm ||
      nameNorm.includes(userDepartmentNorm) ||
      userDepartmentNorm.includes(codeNorm)
    );
  });

  if (!mappedDepartment) {
    throw new Error("Your account department is not mapped to an active department record.");
  }

  const scopedPrograms = programs.filter(program => program.department_id === mappedDepartment.id);

  const projectResponses = await Promise.all(
    scopedPrograms.map(program =>
      fetch(`${API}/projects?program_id=${program.id}`, { headers: authHeaders() })
    )
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
            assignee_ids: Array.isArray(task.assignee_ids)
              ? task.assignee_ids.map(value => String(value))
              : [],
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

  const requestRecordsRaw: Array<Record<string, unknown>> = Array.isArray(budgetRequestPayload?.requests)
    ? budgetRequestPayload.requests
    : Array.isArray(budgetRequestPayload?.budget_requests)
      ? budgetRequestPayload.budget_requests
      : [];

  const budgetRequests: BudgetRequestRecord[] = requestRecordsRaw
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
    .filter(request => request.id && request.project_id);

  return {
    department: mappedDepartment,
    programs: scopedPrograms,
    projects,
    tasks,
    budgetRequests,
  };
}
