"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Label } from '@/shared/components/ui/Label';
import { Textarea } from '@/shared/components/ui/TextArea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/Alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/Dialog';
import { 
  FileText,
  Search,
  FolderKanban,
  AlertCircle,
  CheckCircle2,
  Send,
  Calendar,
  TrendingUp,
  AlertTriangle,
  X
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  department: string;
  status: string;
  assignedTo: string;
  deadline: string;
}

export default function ReportSubmissionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectList, setShowProjectList] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportPeriod, setReportPeriod] = useState('');
  const [progressStatus, setProgressStatus] = useState('');
  const [accomplishments, setAccomplishments] = useState('');
  const [challenges, setChallenges] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sample projects list
  const allProjects: Project[] = [
    {
      id: 'PRJ001',
      name: 'Digital Transformation Initiative',
      department: 'Engineering',
      status: 'Ongoing',
      assignedTo: 'Sarah Chen',
      deadline: '2026-02-28'
    },
    {
      id: 'PRJ002',
      name: 'Customer Experience Enhancement',
      department: 'Marketing',
      status: 'Delayed',
      assignedTo: 'David Kim',
      deadline: '2026-01-31'
    },
    {
      id: 'PRJ003',
      name: 'AI Research Integration',
      department: 'Research',
      status: 'Ongoing',
      assignedTo: 'Emily Watson',
      deadline: '2026-03-15'
    },
    {
      id: 'PRJ004',
      name: 'Infrastructure Modernization',
      department: 'Operations',
      status: 'Ongoing',
      assignedTo: 'Marcus Rodriguez',
      deadline: '2026-02-15'
    },
    {
      id: 'PRJ005',
      name: 'Market Expansion Strategy',
      department: 'Marketing',
      status: 'Pending',
      assignedTo: 'Lisa Anderson',
      deadline: '2026-04-01'
    },
    {
      id: 'PRJ006',
      name: 'Security Compliance Audit',
      department: 'Operations',
      status: 'Delayed',
      assignedTo: 'James Foster',
      deadline: '2026-01-30'
    },
    {
      id: 'PRJ007',
      name: 'Product Line Extension',
      department: 'Engineering',
      status: 'Ongoing',
      assignedTo: 'Robert Taylor',
      deadline: '2026-03-01'
    },
    {
      id: 'PRJ008',
      name: 'Employee Training Program',
      department: 'Operations',
      status: 'Completed',
      assignedTo: 'Patricia Martinez',
      deadline: '2026-01-15'
    }
  ];

  const reportTypes = [
    'Progress Report',
    'Status Update',
    'Milestone Report',
    'Final Report',
    'Incident Report',
    'Weekly Summary',
    'Monthly Summary',
    'Quarterly Review'
  ];

  const progressStatuses = [
    'On Track',
    'Ahead of Schedule',
    'Slightly Delayed',
    'Significantly Delayed',
    'Completed',
    'On Hold'
  ];

  const filteredProjects = allProjects.filter(project =>
    searchTerm === '' ||
    project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectList(false);
    setSearchTerm('');
  };

  const handleClearProject = () => {
    setSelectedProject(null);
    setReportTitle('');
    setReportType('');
    setReportPeriod('');
    setProgressStatus('');
    setAccomplishments('');
    setChallenges('');
    setNextSteps('');
    setAdditionalNotes('');
  };

  const handleClearForm = () => {
    setReportTitle('');
    setReportType('');
    setReportPeriod('');
    setProgressStatus('');
    setAccomplishments('');
    setChallenges('');
    setNextSteps('');
    setAdditionalNotes('');
  };

  const handleSubmit = () => {
    if (!selectedProject || !reportTitle || !reportType || !reportPeriod || !progressStatus || !accomplishments) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Reset form after showing success
      setTimeout(() => {
        handleClearProject();
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Ongoing':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Delayed':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const isFormValid = selectedProject && reportTitle && reportType && reportPeriod && progressStatus && accomplishments;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Report Submission
            </h1>
            <p className="text-slate-600 text-lg">Submit progress reports for your projects</p>
          </div>
          <Badge className="bg-green-600 text-white px-4 py-2 text-sm">
            <FileText className="h-4 w-4 mr-2" />
            Submit Report
          </Badge>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Alert className="border-green-300 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-900 font-semibold">Report Submitted Successfully!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your project report has been submitted and is now available in the reports library. The project manager has been notified.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section - Takes up 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Selection */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 text-xl">Select Project</CardTitle>
                <CardDescription className="text-slate-600">
                  Choose the project you want to report on
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedProject ? (
                  <>
                    <Button
                      onClick={() => setShowProjectList(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Browse Projects
                    </Button>
                  </>
                ) : (
                  <div className="border border-slate-300 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FolderKanban className="h-5 w-5 text-blue-600" />
                          <h3 className="font-bold text-slate-900">{selectedProject.name}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-600">Project ID:</span>
                            <span className="ml-2 font-semibold text-slate-900 mono">{selectedProject.id}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Department:</span>
                            <span className="ml-2 font-semibold text-slate-900">{selectedProject.department}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Status:</span>
                            <Badge className={`ml-2 ${getStatusColor(selectedProject.status)}`}>
                              {selectedProject.status}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-slate-600">Assigned To:</span>
                            <span className="ml-2 font-semibold text-slate-900">{selectedProject.assignedTo}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearProject}
                        className="text-slate-600 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Report Form */}
            {selectedProject && (
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-xl">Report Information</CardTitle>
                  <CardDescription className="text-slate-600">
                    Provide detailed information about project progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Report Title */}
                  <div className="space-y-2">
                    <Label htmlFor="reportTitle" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      Report Title
                      <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="reportTitle"
                      type="text"
                      placeholder="Enter report title..."
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                  </div>

                  {/* Report Type and Period */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reportType" className="text-sm font-semibold text-slate-700">
                        Report Type
                        <span className="text-red-600 ml-1">*</span>
                      </Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                          {reportTypes.map(type => (
                            <SelectItem key={type} value={type} className="text-slate-900">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reportPeriod" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        Reporting Period
                        <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="reportPeriod"
                        type="date"
                        value={reportPeriod}
                        onChange={(e) => setReportPeriod(e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Progress Status */}
                  <div className="space-y-2">
                    <Label htmlFor="progressStatus" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Progress Status
                      <span className="text-red-600">*</span>
                    </Label>
                    <Select value={progressStatus} onValueChange={setProgressStatus}>
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                        <SelectValue placeholder="Select progress status..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {progressStatuses.map(status => (
                          <SelectItem key={status} value={status} className="text-slate-900">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Accomplishments */}
                  <div className="space-y-2">
                    <Label htmlFor="accomplishments" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Key Accomplishments
                      <span className="text-red-600">*</span>
                    </Label>
                    <Textarea
                      id="accomplishments"
                      placeholder="List major accomplishments and milestones achieved during this period..."
                      value={accomplishments}
                      onChange={(e) => setAccomplishments(e.target.value)}
                      className="bg-white border-slate-300 text-slate-900 min-h-[120px] resize-y"
                    />
                  </div>

                  {/* Challenges */}
                  <div className="space-y-2">
                    <Label htmlFor="challenges" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-green-600" />
                      Challenges & Issues
                    </Label>
                    <Textarea
                      id="challenges"
                      placeholder="Describe any challenges, obstacles, or issues encountered..."
                      value={challenges}
                      onChange={(e) => setChallenges(e.target.value)}
                      className="bg-white border-slate-300 text-slate-900 min-h-[100px] resize-y"
                    />
                  </div>

                  {/* Next Steps */}
                  <div className="space-y-2">
                    <Label htmlFor="nextSteps" className="text-sm font-semibold text-slate-700">
                      Next Steps & Action Items
                    </Label>
                    <Textarea
                      id="nextSteps"
                      placeholder="Outline planned activities and action items for the next period..."
                      value={nextSteps}
                      onChange={(e) => setNextSteps(e.target.value)}
                      className="bg-white border-slate-300 text-slate-900 min-h-[100px] resize-y"
                    />
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="additionalNotes" className="text-sm font-semibold text-slate-700">
                      Additional Notes
                    </Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Any other relevant information or comments..."
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      className="bg-white border-slate-300 text-slate-900 min-h-20 resize-y"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4">
                    <Button
                      onClick={handleClearForm}
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      Clear Form
                    </Button>
                    <div className="flex-1" />
                    <Button
                      onClick={handleSubmit}
                      disabled={!isFormValid || isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Report
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Instructions Section - Takes up 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Important Information */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-green-600" />
                  Report Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">What to Include</h4>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Specific accomplishments with measurable results</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Honest assessment of challenges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Clear action items for next period</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>Updated timeline or budget concerns</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Submission Frequency</h4>
                  <p className="text-sm text-blue-800">
                    Reports should be submitted based on project requirements. 
                    Most projects require <span className="font-semibold">weekly or monthly</span> status updates.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">Review Process</h4>
                  <p className="text-sm text-amber-800">
                    All reports are reviewed by project managers and stakeholders. 
                    Feedback may be provided within 2-3 business days.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 text-lg">Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Be specific and quantify achievements</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Report issues early to avoid delays</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Use clear, concise language</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Include data and metrics when available</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Submit reports on time</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-slate-600">
                  For assistance with report submission:
                </p>
                <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                  <p className="font-semibold text-slate-900">Project Management Office</p>
                  <p className="text-slate-600">pmo@company.com</p>
                  <p className="text-slate-600">Ext: 5123</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Project Selection Dialog */}
      <Dialog open={showProjectList} onOpenChange={setShowProjectList}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-900">Select Project</DialogTitle>
            <DialogDescription className="text-slate-600">
              Choose a project to submit a report for
            </DialogDescription>
          </DialogHeader>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by project ID, name, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-300 text-slate-900"
            />
          </div>

          {/* Project List */}
          <div className="space-y-3">
            {filteredProjects.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No projects found</p>
            ) : (
              filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 hover:border-blue-400"
                  onClick={() => handleSelectProject(project)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FolderKanban className="h-5 w-5 text-blue-600" />
                          <h3 className="font-bold text-slate-900">{project.name}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-600">ID:</span>
                            <span className="ml-2 font-semibold text-slate-900 mono">{project.id}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Department:</span>
                            <span className="ml-2 font-semibold text-slate-900">{project.department}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Assigned To:</span>
                            <span className="ml-2 font-semibold text-slate-900">{project.assignedTo}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Deadline:</span>
                            <span className="ml-2 font-semibold text-slate-900 mono">{new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(project.status)}`}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}