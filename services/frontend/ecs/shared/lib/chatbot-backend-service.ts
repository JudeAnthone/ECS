import { API_URL } from "@/shared/lib/api-config";

export interface RoleContextData {
  projects?: {
    total: number;
    pending: number;
    approved: number;
    list: Array<{ id: string; name: string; status: string }>;
  };
  programs?: {
    total: number;
    list: Array<{ id: string; name: string; status: string }>;
  };
  requests?: {
    total: number;
    pending: number;
    assigned: number;
    list: Array<{ id: string; title: string; status: string; stage: string }>;
  };
  budgets?: {
    total: number;
    allocated: number;
    spent: number;
    remaining: number;
    pending_requests: number;
  };
  tasks?: {
    total: number;
    in_progress: number;
    pending: number;
    list: Array<{ id: string; title: string; status: string }>;
  };
  notifications?: {
    unread_count: number;
  };
}

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function fetchWithAuth(path: string) {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) return { error: "No auth token" };

    const res = await fetch(`${API_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("auth_token");
        return { error: "Unauthorized" };
      }
      return { error: `API error: ${res.status}` };
    }

    return res.json();
  } catch (error) {
    console.error(`Fetch error for ${path}:`, error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getAdminContextData(): Promise<RoleContextData> {
  try {
    const [budgetSum, chairBudgetsRaw, budgetRequestsRaw, allProjects, allRequests, allActivities] = await Promise.allSettled([
      fetchWithAuth("/api/v1/budgets/summary"),
      fetchWithAuth("/api/v1/budgets/chairs"),
      fetchWithAuth("/api/v1/budget-requests"),
      fetchWithAuth("/api/v1/projects?mine=1"),
      fetchWithAuth("/api/v1/requests"),
      fetchWithAuth("/api/v1/notifications?unread_only=1&limit=5"),
    ]);

    const chairBudgets =
      chairBudgetsRaw.status === "fulfilled" && !chairBudgetsRaw.value.error
        ? Array.isArray(chairBudgetsRaw.value.program_chair_budgets)
          ? chairBudgetsRaw.value.program_chair_budgets
          : []
        : [];
    const aggregatedAllocated = chairBudgets.reduce(
      (sum: number, item: any) => sum + toNumber(item?.allocated_budget),
      0,
    );
    const aggregatedSpent = chairBudgets.reduce(
      (sum: number, item: any) => sum + toNumber(item?.spent_budget),
      0,
    );
    const pendingBudgetRequests =
      budgetRequestsRaw.status === "fulfilled" && !budgetRequestsRaw.value.error
        ? (budgetRequestsRaw.value.requests || []).filter((r: any) => r.status === "pending").length
        : 0;

    const budgets =
      budgetSum.status === "fulfilled" && !budgetSum.value.error
        ? {
            total: toNumber(budgetSum.value.total),
            allocated: aggregatedAllocated > 0 ? aggregatedAllocated : toNumber((budgetSum.value as any).allocated),
            spent: aggregatedSpent > 0 ? aggregatedSpent : toNumber((budgetSum.value as any).spent),
            remaining: Math.max(
              (aggregatedAllocated > 0 ? aggregatedAllocated : toNumber((budgetSum.value as any).allocated)) -
                (aggregatedSpent > 0 ? aggregatedSpent : toNumber((budgetSum.value as any).spent)),
              0,
            ),
            pending_requests: pendingBudgetRequests,
          }
        : undefined;

    const projects =
      allProjects.status === "fulfilled"
        ? {
            total: allProjects.value.projects?.length || 0,
            pending:
              allProjects.value.projects?.filter((p: any) => p.status === "pending").length || 0,
            approved:
              allProjects.value.projects?.filter((p: any) => p.status === "approved").length || 0,
            list: (allProjects.value.projects || []).slice(0, 3),
          }
        : undefined;

    const requests =
      allRequests.status === "fulfilled"
        ? {
            total: allRequests.value.requests?.length || 0,
            pending:
              allRequests.value.requests?.filter((r: any) => r.status === "pending").length || 0,
            assigned:
              allRequests.value.requests?.filter((r: any) => r.assigned_to_project_head)
                .length || 0,
            list: (allRequests.value.requests || []).slice(0, 3),
          }
        : undefined;

    const notifications =
      allActivities.status === "fulfilled"
        ? { unread_count: allActivities.value.notifications?.length || 0 }
        : undefined;

    return {
      budgets,
      projects,
      requests,
      notifications,
    };
  } catch (error) {
    console.error("Failed to fetch admin context:", error);
    return {};
  }
}

export async function getProgramChairContextData(): Promise<RoleContextData> {
  try {
    // Wrap all fetches in allSettled to gracefully handle network failures
    const [userReq, programsReq, budgetReqsReq, chairBudgetReq, notifReq] = await Promise.allSettled([
      fetchWithAuth("/api/v1/users/me"),
      fetchWithAuth("/api/v1/programs/program-chair/me"),
      fetchWithAuth("/api/v1/budget-requests"),
      fetchWithAuth("/api/v1/budgets/chairs"),
      fetchWithAuth("/api/v1/notifications?unread_only=1&limit=5"),
    ]);

    const userId = userReq.status === "fulfilled" ? userReq.value.user?.id : null;

    const programList =
      programsReq.status === "fulfilled"
        ? {
            total: programsReq.value.programs?.length || 0,
            list: (programsReq.value.programs || []).slice(0, 3),
          }
        : undefined;

    const ownChairBudget =
      chairBudgetReq.status === "fulfilled"
        ? (chairBudgetReq.value.program_chair_budgets || [])[0]
        : null;

    const budgets =
      budgetReqsReq.status === "fulfilled"
        ? {
            total: budgetReqsReq.value.requests?.length || 0,
            allocated: toNumber(ownChairBudget?.allocated_budget),
            spent: toNumber(ownChairBudget?.spent_budget),
            remaining: Math.max(
              toNumber(ownChairBudget?.allocated_budget) - toNumber(ownChairBudget?.spent_budget),
              0,
            ),
            pending_requests:
              budgetReqsReq.value.requests?.filter((r: any) => r.status === "pending").length || 0,
          }
        : undefined;

    const notifications =
      notifReq.status === "fulfilled"
        ? { unread_count: notifReq.value.notifications?.length || 0 }
        : undefined;

    return {
      programs: programList,
      budgets,
      notifications,
    };
  } catch (error) {
    console.error("Failed to fetch program chair context:", error);
    return {};
  }
}

export async function getProjectHeadContextData(): Promise<RoleContextData> {
  try {
    const [myProjects, staffProjects, budgetReqs, unreadNotif] = await Promise.allSettled([
      fetchWithAuth("/api/v1/projects?assigned_to_me=1"),
      fetchWithAuth("/api/v1/staff/projects-with-task-summary"),
      fetchWithAuth("/api/v1/budget-requests"),
      fetchWithAuth("/api/v1/notifications?unread_only=1&limit=5"),
    ]);

    const projects =
      myProjects.status === "fulfilled"
        ? {
            total: myProjects.value.projects?.length || 0,
            pending:
              myProjects.value.projects?.filter((p: any) => p.status === "pending").length || 0,
            approved:
              myProjects.value.projects?.filter((p: any) => p.status === "approved").length || 0,
            list: (myProjects.value.projects || []).slice(0, 3),
          }
        : undefined;

    const tasks =
      staffProjects.status === "fulfilled"
        ? {
            total: staffProjects.value.projects?.reduce((sum: number, p: any) => sum + (p.task_count || 0), 0) || 0,
            in_progress:
              staffProjects.value.projects?.reduce((sum: number, p: any) => sum + (p.in_progress_count || 0), 0) || 0,
            pending:
              staffProjects.value.projects?.reduce((sum: number, p: any) => sum + (p.pending_count || 0), 0) || 0,
            list: (staffProjects.value.projects || []).slice(0, 3),
          }
        : undefined;

    const budgets =
      budgetReqs.status === "fulfilled"
        ? {
            total: budgetReqs.value.requests?.length || 0,
            allocated: 0,
            spent: 0,
            remaining: 0,
            pending_requests:
              budgetReqs.value.requests?.filter((r: any) => r.status === "pending").length || 0,
          }
        : undefined;

    const notifications =
      unreadNotif.status === "fulfilled"
        ? { unread_count: unreadNotif.value.notifications?.length || 0 }
        : undefined;

    return {
      projects,
      tasks,
      budgets,
      notifications,
    };
  } catch (error) {
    console.error("Failed to fetch project head context:", error);
    return {};
  }
}

export async function getStaffContextData(): Promise<RoleContextData> {
  try {
    const [staffTasks, unreadNotif] = await Promise.allSettled([
      fetchWithAuth("/api/v1/staff/tasks"),
      fetchWithAuth("/api/v1/notifications?unread_only=1&limit=5"),
    ]);

    const tasks =
      staffTasks.status === "fulfilled"
        ? {
            total: staffTasks.value.tasks?.length || 0,
            in_progress:
              staffTasks.value.tasks?.filter((t: any) => t.status === "in_progress").length || 0,
            pending: staffTasks.value.tasks?.filter((t: any) => t.status === "pending").length || 0,
            list: (staffTasks.value.tasks || []).slice(0, 5),
          }
        : undefined;

    const notifications =
      unreadNotif.status === "fulfilled"
        ? { unread_count: unreadNotif.value.notifications?.length || 0 }
        : undefined;

    return {
      tasks,
      notifications,
    };
  } catch (error) {
    console.error("Failed to fetch staff context:", error);
    return {};
  }
}

export async function getPublicUserContextData(): Promise<RoleContextData> {
  try {
    const [ownRequests, unreadNotif] = await Promise.allSettled([
      fetchWithAuth("/api/v1/requests"),
      fetchWithAuth("/api/v1/notifications?unread_only=1&limit=5"),
    ]);

    const requests =
      ownRequests.status === "fulfilled"
        ? {
            total: ownRequests.value.requests?.length || 0,
            pending:
              ownRequests.value.requests?.filter((r: any) => r.status === "pending").length || 0,
            assigned: 0,
            list: (ownRequests.value.requests || []).slice(0, 3),
          }
        : undefined;

    const notifications =
      unreadNotif.status === "fulfilled"
        ? { unread_count: unreadNotif.value.notifications?.length || 0 }
        : undefined;

    return {
      requests,
      notifications,
    };
  } catch (error) {
    console.error("Failed to fetch public user context:", error);
    return {};
  }
}

export async function getContextDataForRole(role: string): Promise<RoleContextData> {
  try {
    switch (role) {
      case "admin":
        return await getAdminContextData();
      case "program-chair":
        return await getProgramChairContextData();
      case "project-head":
        return await getProjectHeadContextData();
      case "staff":
        return await getStaffContextData();
      case "public-user":
        return await getPublicUserContextData();
      default:
        return {};
    }
  } catch (error) {
    console.error(`Failed to get context for role ${role}:`, error);
    return {};
  }
}
