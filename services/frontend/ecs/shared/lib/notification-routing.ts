import type { NotificationItem } from './notification-service';

function encode(value: string): string {
  return encodeURIComponent(value.trim());
}

export function resolveNotificationTarget(roleSlug: string, item: NotificationItem): string | null {
  const entityType = item.entity_type?.trim();
  const entityID = item.entity_id?.trim();

  if (item.type === 'request_submitted' && entityType === 'project_request' && entityID) {
    if (roleSlug === 'program-chair') {
      return `/${roleSlug}/program-chair-program-management?tab=requests&requestId=${encode(entityID)}`;
    }
    if (roleSlug === 'admin') {
      return `/${roleSlug}/admin-program-management?requestId=${encode(entityID)}`;
    }
  }

  if (item.type === 'request_submitted' && entityType === 'program' && entityID) {
    if (roleSlug === 'program-chair') {
      return `/${roleSlug}/program-chair-program-management?tab=programs&view=projects&programId=${encode(entityID)}`;
    }
  }

  if ((item.type === 'request_approved' || item.type === 'request_rejected' || item.type === 'feedback_received') && entityType === 'project' && entityID) {
    if (roleSlug === 'project-head') {
      return `/${roleSlug}/project-head-request-management?projectId=${encode(entityID)}&focus=review`;
    }
  }

  // Feedback notifications should deep-link to the request detail view where feedback is visible.
  if (item.type === 'feedback_received' && entityType === 'project_request' && entityID) {
    return `/${roleSlug}/public-user-request-form?requestId=${encode(entityID)}&focus=feedback`;
  }

  if (item.type === 'budget_request' && entityType === 'budget_request') {
    if (roleSlug === 'program-chair') {
      return `/${roleSlug}/program-chair-budget-management`;
    }
  }

  if ((item.type === 'budget_approved' || item.type === 'request_updated') && entityType === 'budget_request') {
    if (roleSlug === 'project-head') {
      return `/${roleSlug}/project-head-request-management`;
    }
  }

  return null;
}
