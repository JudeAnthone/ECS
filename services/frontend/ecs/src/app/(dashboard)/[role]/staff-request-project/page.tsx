"use client"

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/TextArea";
import { Badge } from "@/shared/components/ui/Badge";
import { Spinner } from "@/shared/components/ui/Spinner";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/shared/components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogClose,
} from "@/shared/components/ui/Dialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/Select";

import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/Avatar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/shared/components/ui/Card';
import { ClipboardList, Clock, CheckCircle2, XCircle, Plus, FolderOpen, Loader2 } from 'lucide-react';

const API = "http://localhost:8081/api/v1";


interface Program {
  id: string;
  program_name: string;
  status?: string;
  approval_status?: string;
  program_chair_id?: string;
}

interface Project {
  id: string;
  project_name: string;
  program_id?: string;
  approval_status?: string;
  created_at?: string;
  feedback?: string;
}

interface ProjectFormState {
  project_name: string;
  project_description: string;
  objectives: string;
  start_date: string;
  end_date: string;
  program_id: string;
}

const emptyForm: ProjectFormState = {
  project_name: "",
  project_description: "",
  objectives: "",
  start_date: "",
  end_date: "",
  program_id: "",
};


export default function StaffRequestProjectPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProjectFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [requests, setRequests] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [programChair, setProgramChair] = useState<any>(null);
  // Fetch program chair info when program changes
  useEffect(() => {
    const selectedProgram = programs.find(p => p.id === form.program_id);
    if (selectedProgram?.program_chair_id) {
      fetch(`${API}/users/${selectedProgram.program_chair_id}`, { headers: authHeaders() })
        .then(res => res.ok ? res.json() : null)
        .then(data => setProgramChair(data?.user || null))
        .catch(() => setProgramChair(null));
    } else {
      setProgramChair(null);
    }
  }, [form.program_id, programs]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) setUser(JSON.parse(raw));
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [progRes, reqRes] = await Promise.all([
          fetch(`${API}/programs`, { headers: authHeaders() }),
          fetch(`${API}/projects?mine=1`, { headers: authHeaders() }),
        ]);
        const progData = await progRes.json();
        const reqData = await reqRes.json();
        setPrograms(progData.programs || []);
        setRequests(reqData.projects || []);
      } catch {
        setPrograms([]);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [modalOpen]);


  function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  }


  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | ChangeEvent<HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }


  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/projects`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to submit request");
      setModalOpen(false);
      setForm(emptyForm);
    } catch (err) {
      setError("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  }

  // Status counts
  const approvedCount = requests.filter(r => r.approval_status === 'approved' || r.approval_status === 'final approved').length;
  const rejectedCount = requests.filter(r => r.approval_status === 'rejected' || r.approval_status === 'final rejected').length;
  const pendingCount = requests.filter(r => !r.approval_status || r.approval_status === 'pending').length;
  const totalCount = requests.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Request a Project</h1>
            <p className="text-slate-500 mt-1">Create and track project requests under approved programs.</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" /> New Request
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-blue-50 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{totalCount}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">My Requests</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{pendingCount}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Pending</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{approvedCount}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Approved</div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-rose-50 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{rejectedCount}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Rejected</div>
            </div>
          </div>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl w-full bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">Create Project Request</DialogTitle>
          </DialogHeader>
          {/* Program/Department Info Box */}
          <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
            <div className="font-semibold text-sm text-slate-900">
              Program: {programs.find(p => p.id === form.program_id)?.program_name || 'Select a Program'}
            </div>
            <div className="text-xs text-slate-600">
              Department: College of Computer Studies (CCS)
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
              <span className="font-medium">Administered by:</span>
              <Avatar className="size-5">
                <AvatarImage src={programChair?.avatar_url || undefined} alt={programChair ? `${programChair.first_name} ${programChair.last_name}` : "Program Chair"} />
                <AvatarFallback>
                  {programChair
                    ? `${programChair.first_name?.[0] || ''}${programChair.last_name?.[0] || ''}`.toUpperCase()
                    : "PC"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{programChair ? `${programChair.first_name} ${programChair.last_name}` : "Program Chair"}</span>
            </div>
            {!form.program_id && (
              <div className="mt-3 p-2 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                No program selected. You cannot request a project until a program is selected.
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 tracking-wide uppercase">Project Name</label>
              <Input name="project_name" value={form.project_name} onChange={handleChange} required placeholder="Enter project name" disabled={!form.program_id} className="border-slate-300 focus:border-slate-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 tracking-wide uppercase">Description</label>
              <Textarea name="project_description" value={form.project_description} onChange={handleChange} required placeholder="Short project description" disabled={!form.program_id} className="border-slate-300 focus:border-slate-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 tracking-wide uppercase">Objectives</label>
              <Textarea name="objectives" value={form.objectives} onChange={handleChange} required placeholder="Project objectives" disabled={!form.program_id} className="border-slate-300 focus:border-slate-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1 tracking-wide uppercase">Start Date</label>
                <Input name="start_date" value={form.start_date} onChange={handleChange} type="date" required placeholder="dd/mm/yyyy" disabled={!form.program_id} className="border-slate-300 focus:border-slate-500" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1 tracking-wide uppercase">End Date</label>
                <Input name="end_date" value={form.end_date} onChange={handleChange} type="date" required placeholder="dd/mm/yyyy" disabled={!form.program_id} className="border-slate-300 focus:border-slate-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 tracking-wide uppercase">Program</label>
              <Select value={form.program_id} onValueChange={val => setForm(f => ({ ...f, program_id: val }))} required>
                <SelectTrigger className="border-slate-300"><SelectValue placeholder="Select Program" /></SelectTrigger>
                <SelectContent className="bg-white">
                  {programs
                    .filter(p => p.status === 'active' && p.approval_status === 'approved')
                    .map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.program_name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-slate-300">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={submitting || !form.program_id} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">{submitting ? <Spinner /> : "Submit Project Request"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Card className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <CardHeader className="px-6 pt-6 pb-2 border-b border-slate-100">
          <CardTitle className="text-xl font-semibold text-slate-900 mb-1">Project Requests</CardTitle>
          <CardDescription className="text-slate-500">Review your submitted project requests and their approval status.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-6">
          {loading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b bg-slate-50 text-left">
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Name</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Program</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Created At</TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {requests.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="px-4 py-10 text-center text-slate-400">No requests found.</TableCell></TableRow>
                  ) : requests.map(r => (
                    <TableRow key={r.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="px-4 py-3 font-medium text-slate-900">{r.project_name}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-700">{programs.find(p => p.id === r.program_id)?.program_name || '-'}</TableCell>
                      <TableCell className="px-4 py-3"><Badge className="capitalize">{r.approval_status || 'pending'}</Badge></TableCell>
                      <TableCell className="px-4 py-3 text-slate-600">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-slate-600">{r.approval_status === 'rejected' ? (r.feedback || '-') : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
