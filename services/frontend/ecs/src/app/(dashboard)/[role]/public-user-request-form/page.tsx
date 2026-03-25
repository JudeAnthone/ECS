"use client";
import React, { useState, useEffect } from 'react';
import {
  FileText, Target, Users, XCircle,
  Send, CheckCircle2, Lightbulb, RefreshCw, ClipboardList,
  ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select';
import { filterVisibleDepartments } from '@/shared/configs/department-visibility';

const API = 'http://localhost:8081/api/v1';
function getToken() { return localStorage.getItem('auth_token'); }
function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

interface RequestRecord {
  id: string;
  request_title: string;
  request_description?: string | null;
  target_beneficiaries?: string | null;
  justification?: string | null;
  requested_department?: string | null;
  requested_department_id?: string | null;
  status: string;
  workflow_stage: string;
  // review fields
  review_notes?: string | null;
  program_chair_feedback?: string | null;
  reviewed_at?: string | null;
  // assignment
  assignment_notes?: string | null;
  department_assignment_date?: string | null;
  // project head
  project_head_response?: string | null;
  project_head_notes?: string | null;
  project_head_response_date?: string | null;
  // proposal
  proposal_submitted_date?: string | null;
  proposal_review_notes?: string | null;
  // final
  final_approval_date?: string | null;
  final_approval_notes?: string | null;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-orange-100 text-orange-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    under_review: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function WorkflowBadge({ stage }: { stage: string }) {
  const labels: Record<string, string> = {
    submitted: 'Submitted',
    program_chair_review: 'Chair Review',
    department_assigned: 'Dept. Assigned',
    project_head_response: 'Head Response',
    proposal_review: 'Proposal Review',
    final_approval: 'Final Approval',
  };
  const map: Record<string, string> = {
    submitted: 'bg-slate-100 text-slate-600',
    program_chair_review: 'bg-blue-100 text-blue-700',
    department_assigned: 'bg-indigo-100 text-indigo-700',
    project_head_response: 'bg-violet-100 text-violet-700',
    proposal_review: 'bg-amber-100 text-amber-700',
    final_approval: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[stage] ?? 'bg-gray-100 text-gray-700'}`}>
      {labels[stage] ?? stage.replace(/_/g, ' ')}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="grid grid-cols-3 gap-2">
      <dt className="text-xs font-medium text-slate-500 col-span-1">{label}</dt>
      <dd className="text-xs text-slate-800 col-span-2 break-words">{String(value)}</dd>
    </div>
  );
}

function RequestDetailDialog({
  req, open, onClose,
}: { req: RequestRecord | null; open: boolean; onClose: () => void }) {
  if (!req) return null;
  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : null;
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-slate-900 pr-6">{req.request_title}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap gap-2 mt-1">
              <StatusBadge status={req.status} />
              <WorkflowBadge stage={req.workflow_stage} />
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Request Details</h3>
            <dl className="space-y-2 bg-slate-50 rounded-lg p-3">
              <DetailRow label="Submitted" value={fmt(req.created_at)} />
              <DetailRow label="Department" value={req.requested_department} />
              <DetailRow label="Target Beneficiaries" value={req.target_beneficiaries} />
            </dl>
          </section>

          {req.request_description && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Description</h3>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">{req.request_description}</p>
            </section>
          )}

          {req.justification && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Justification / Objectives</h3>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">{req.justification}</p>
            </section>
          )}

          {(req.review_notes || req.program_chair_feedback || req.reviewed_at) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Program Chair Review</h3>
              <dl className="space-y-2 bg-blue-50 rounded-lg p-3">
                <DetailRow label="Reviewed" value={fmt(req.reviewed_at)} />
                <DetailRow label="Review Notes" value={req.review_notes} />
                <DetailRow label="Chair Feedback" value={req.program_chair_feedback} />
              </dl>
            </section>
          )}

          {(req.department_assignment_date || req.assignment_notes) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Department Assignment</h3>
              <dl className="space-y-2 bg-indigo-50 rounded-lg p-3">
                <DetailRow label="Assigned" value={fmt(req.department_assignment_date)} />
                <DetailRow label="Notes" value={req.assignment_notes} />
              </dl>
            </section>
          )}

          {(req.project_head_response || req.project_head_notes || req.project_head_response_date) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Project Head Response</h3>
              <dl className="space-y-2 bg-violet-50 rounded-lg p-3">
                <DetailRow label="Response Date" value={fmt(req.project_head_response_date)} />
                <DetailRow label="Response" value={req.project_head_response} />
                <DetailRow label="Notes" value={req.project_head_notes} />
              </dl>
            </section>
          )}

          {(req.proposal_submitted_date || req.proposal_review_notes) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Proposal Review</h3>
              <dl className="space-y-2 bg-amber-50 rounded-lg p-3">
                <DetailRow label="Submitted" value={fmt(req.proposal_submitted_date)} />
                <DetailRow label="Review Notes" value={req.proposal_review_notes} />
              </dl>
            </section>
          )}

          {(req.final_approval_date || req.final_approval_notes) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Final Approval</h3>
              <dl className="space-y-2 bg-green-50 rounded-lg p-3">
                <DetailRow label="Date" value={fmt(req.final_approval_date)} />
                <DetailRow label="Notes" value={req.final_approval_notes} />
              </dl>
            </section>
          )}

        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

interface Department {
  id: string;
  department_name: string;
  department_code?: string;
}

export default function PublicUserRequestFormPage() {
  // Form state
  const [formData, setFormData] = useState({
    request_title: '',
    request_description: '',
    justification: '',
    target_beneficiaries: '',
    requested_department: '',
    requested_department_id: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState<RequestRecord | null>(null);

  // Departments dropdown
  const [departments, setDepartments] = useState<Department[]>([]);

  // My requests state
  const [myRequests, setMyRequests] = useState<RequestRecord[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RequestRecord | null>(null);

  const fetchMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const r = await fetch(`${API}/requests`, { headers: authHeaders() });
      if (r.ok) {
        const data = await r.json();
        setMyRequests(data.requests ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const r = await fetch(`${API}/departments`, { headers: authHeaders() });
      if (r.ok) {
        const data = await r.json();
        const filtered = filterVisibleDepartments(data.departments ?? []);
        setDepartments(filtered);
      }
    } catch { /* silently fail */ }
  };

  useEffect(() => { fetchMyRequests(); fetchDepartments(); }, []);

  const handleSubmit = async () => {
    if (!formData.request_title.trim() || !formData.request_description.trim()) {
      setSubmitError('Request Title and Description are required.');
      return;
    }
    setSubmitError('');
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        request_title: formData.request_title.trim(),
        request_description: formData.request_description.trim(),
      };
      if (formData.justification.trim()) body.justification = formData.justification.trim();
      if (formData.target_beneficiaries.trim()) body.target_beneficiaries = formData.target_beneficiaries.trim();
      if (formData.requested_department.trim()) body.requested_department = formData.requested_department.trim();
      if (formData.requested_department_id) body.requested_department_id = formData.requested_department_id;

      const r = await fetch(`${API}/requests`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) {
        setSubmitError(data.error ?? 'Submission failed. Please try again.');
        return;
      }
      setSubmitSuccess(data);
      setFormData({ request_title: '', request_description: '', justification: '', target_beneficiaries: '', requested_department: '', requested_department_id: '' });
      fetchMyRequests();
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({ request_title: '', request_description: '', justification: '', target_beneficiaries: '', requested_department: '', requested_department_id: '' });
    setSubmitError('');
    setSubmitSuccess(null);
  };

  const isFormValid = formData.request_title.trim() && formData.request_description.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Program Request</h1>
            <p className="text-slate-500 mt-1">Request a new extension program for review by the program chair</p>
          </div>
          <Badge className="bg-purple-600 text-white px-4 py-2 text-sm">
            <Lightbulb className="h-4 w-4 mr-2" />
            Request a Program
          </Badge>
        </div>

        {/* Success banner */}
        {submitSuccess && (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-5 py-4">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Program Request Submitted Successfully!</p>
              <p className="text-sm text-green-700 mt-0.5">
                Your request <span className="font-mono font-medium">#{submitSuccess.id.slice(0, 8)}</span> is now under review by the program chair.
                Track its progress in the <span className="font-medium">My Requests</span> section below.
              </p>
            </div>
            <button onClick={() => setSubmitSuccess(null)} className="ml-auto text-green-500 hover:text-green-700">✕</button>
          </div>
        )}

        {/* Form card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Program Request Information</h2>
            <p className="text-sm text-slate-500">Fill in the details of the program you would like to request</p>
          </div>

          <div className="p-6 space-y-5">

            {/* ── Project Details ── */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Program Details</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Program Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.request_title}
                    onChange={e => setFormData({ ...formData, request_title: e.target.value })}
                    placeholder="Enter the name of the program you are requesting"
                    className="border-slate-300 focus:border-slate-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.request_description}
                    onChange={e => setFormData({ ...formData, request_description: e.target.value })}
                    placeholder="Describe what this program aims to achieve, its scope, and expected outcomes..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
                  />
                  <p className="text-xs text-slate-400">{formData.request_description.length} / 2000 characters</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Program Objectives</label>
                  <textarea
                    value={formData.justification}
                    onChange={e => setFormData({ ...formData, justification: e.target.value })}
                    placeholder="What are the main goals and objectives of this program? What problem does it address?"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* ── Goals & Beneficiaries ── */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <Target className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Goals & Beneficiaries</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Target Beneficiaries
                  </label>
                  <Input
                    value={formData.target_beneficiaries}
                    onChange={e => setFormData({ ...formData, target_beneficiaries: e.target.value })}
                    placeholder="e.g. Local communities, Students, Farmers in Pasay City"
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Preferred Department (optional)</label>
                  {departments.length > 0 ? (
                    <Select
                      value={formData.requested_department_id}
                      onValueChange={val => {
                        const dept = departments.find(d => d.id === val);
                        setFormData({
                          ...formData,
                          requested_department_id: val,
                          requested_department: dept?.department_name ?? '',
                        });
                      }}
                    >
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Select a department (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(d => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.department_name}{d.department_code ? ` (${d.department_code})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={formData.requested_department}
                      onChange={e => setFormData({ ...formData, requested_department: e.target.value })}
                      placeholder="e.g. College of Engineering (optional)"
                      className="border-slate-300"
                    />
                  )}
                  <p className="text-xs text-slate-400">Optional — the program chair will make the final department assignment.</p>
                </div>
              </div>
            </div>

            {/* Error */}
            {submitError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={handleClear} className="px-5">Clear Form</Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !isFormValid}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6"
              >
                {submitting ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Submit Request</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ── My Requests ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowRequests(v => !v)}
            onKeyDown={e => e.key === 'Enter' && setShowRequests(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors rounded-t-xl cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-slate-800">My Submitted Requests</span>
              {myRequests.length > 0 && (
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">{myRequests.length}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); fetchMyRequests(); }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loadingRequests ? 'animate-spin' : ''}`} />
              </button>
              {showRequests ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>

          {showRequests && (
            <div className="p-6">
              {loadingRequests ? (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading requests...
                </div>
              ) : myRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <ClipboardList className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No requests submitted yet. Use the form above to submit your first request.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stage</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted</th>
                        <th className="py-2 px-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myRequests.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="py-3 px-3">
                            <p className="font-medium text-slate-800 max-w-xs truncate">{req.request_title}</p>
                            {req.requested_department && (
                              <p className="text-xs text-slate-400 mt-0.5">{req.requested_department}</p>
                            )}
                          </td>
                          <td className="py-3 px-3"><StatusBadge status={req.status} /></td>
                          <td className="py-3 px-3"><WorkflowBadge stage={req.workflow_stage} /></td>
                          <td className="py-3 px-3 text-slate-500">
                            {new Date(req.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() => setSelectedRequest(req)}
                              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <RequestDetailDialog
        req={selectedRequest}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
}
