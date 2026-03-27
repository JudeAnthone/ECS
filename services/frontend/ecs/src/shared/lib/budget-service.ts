// Lightweight frontend-only stub service for budget management
// Replace with real API calls when backend endpoints are ready.
const fakeDelay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export type Allocation = {
  allocated: number;
  spent: number;
  remaining: number;
  percent: number;
};

export type RequestItem = {
  id: string;
  projectName: string;
  date: string;
  amount: number;
  programChair: string;
  status: 'pending' | 'approved' | 'declined';
  fileUrl?: string;
};

export type ReportItem = {
  id: string;
  name: string;
  uploadedAt: string;
  uploader: string;
  url?: string;
};

export async function getAllocation(_deptId: string): Promise<Allocation> {
  await fakeDelay(500);
  const allocated = 500000;
  const spent = 215000;
  const remaining = allocated - spent;
  const percent = Math.min(100, Math.round((spent / allocated) * 100));
  return { allocated, spent, remaining, percent };
}

export async function listRequests(_deptId: string): Promise<RequestItem[]> {
  await fakeDelay(300);
  return [
    {
      id: 'REQ-2026-001',
      projectName: 'Procurement of Lab Supplies',
      date: '2026-03-15',
      amount: 50000,
      programChair: 'Dr. Santos',
      status: 'pending',
      fileUrl: undefined,
    },
    {
      id: 'REQ-2026-002',
      projectName: 'Student Outreach Program',
      date: '2026-02-25',
      amount: 75000,
      programChair: 'Prof. Reyes',
      status: 'approved',
      fileUrl: undefined,
    },
  ];
}

export async function createRequest(formData: FormData, onProgress?: (p: number) => void): Promise<RequestItem> {
  // Simulate upload progress
  const totalSteps = 5;
  for (let i = 1; i <= totalSteps; i++) {
    await fakeDelay(120);
    onProgress?.(Math.round((i / totalSteps) * 100));
  }

  // Simulate created item
  const projectName = (formData.get('projectName') as string) || 'Untitled';
  const amount = Number(formData.get('amount')) || 0;
  const now = new Date().toISOString().split('T')[0];

  return {
    id: `REQ-${Date.now()}`,
    projectName,
    date: now,
    amount,
    programChair: (formData.get('programChair') as string) || 'Assigned Chair',
    status: 'pending',
  };
}

export async function listReports(_deptId: string): Promise<ReportItem[]> {
  await fakeDelay(250);
  return [
    { id: 'REP-1', name: 'Q1 Market Research', uploadedAt: '2026-01-10', uploader: 'Analyst A', url: undefined },
  ];
}

export async function uploadReport(_formData: FormData, onProgress?: (p: number) => void): Promise<ReportItem> {
  const totalSteps = 4;
  for (let i = 1; i <= totalSteps; i++) {
    await fakeDelay(150);
    onProgress?.(Math.round((i / totalSteps) * 100));
  }
  const now = new Date().toISOString().split('T')[0];
  return { id: `REP-${Date.now()}`, name: 'Uploaded Report', uploadedAt: now, uploader: 'You', url: undefined };
}

export default {
  getAllocation,
  listRequests,
  createRequest,
  listReports,
  uploadReport,
};
