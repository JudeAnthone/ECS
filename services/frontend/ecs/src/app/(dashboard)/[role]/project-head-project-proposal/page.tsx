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
  Lightbulb,
  FileText,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
  Target,
  PhilippinePeso
} from 'lucide-react';

export default function ProjectRecommendationPage() {
  const [projectName, setProjectName] = useState('');
  const [department, setDepartment] = useState('');
  const [expectedBudget, setExpectedBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [durationType, setDurationType] = useState('months');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const departments = [
    'Engineering',
    'Marketing',
    'Research',
    'Operations',
    'Finance',
    'Human Resources'
  ];

  const durationTypes = [
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' }
  ];

  const handleClear = () => {
    setProjectName('');
    setDepartment('');
    setExpectedBudget('');
    setDuration('');
    setDurationType('months');
    setDetails('');
  };

  const handleSubmit = () => {
    if (!projectName || !department || !expectedBudget || !duration || !details) {
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
        handleClear();
        setShowSuccess(false);
      }, 3000);
    }, 1500);
  };

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    if (numericValue === '') return '';
    
    // Format as currency
    const number = parseFloat(numericValue);
    if (isNaN(number)) return value;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExpectedBudget(value);
  };

  const isFormValid = projectName && department && expectedBudget && duration && details;

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
              Project Recommendation
            </h1>
            <p className="text-slate-600 text-lg">Propose a new project for consideration</p>
          </div>
          <Badge className="bg-purple-600 text-white px-4 py-2 text-sm">
            <Lightbulb className="h-4 w-4 mr-2" />
            Recommendation
          </Badge>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Alert className="border-green-300 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-900 font-semibold">Proposal Submitted Successfully!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your project proposal has been submitted and will be reviewed by the management team. You will receive feedback within 5-7 business days.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section - Takes up 2/3 */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 text-2xl">Project Information</CardTitle>
                <CardDescription className="text-slate-600">
                  Provide comprehensive details about your recommended project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    Project Name
                    <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    type="text"
                    placeholder="Enter project name..."
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-white border-slate-300 text-slate-900"
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    Assigned Department
                    <span className="text-red-600">*</span>
                  </Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                      <SelectValue placeholder="Select department..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept} className="text-slate-900">
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Expected Budget */}
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <PhilippinePeso className="h-4 w-4 text-purple-600" />
                    Expected Budget
                    <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <PhilippinePeso className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600" />
                    <Input
                      id="budget"
                      type="text"
                      placeholder="0"
                      value={expectedBudget}
                      onChange={handleBudgetChange}
                      className="pl-8 bg-white border-slate-300 text-slate-900 font-semibold"
                    />
                  </div>
                  {expectedBudget && (
                    <p className="text-sm text-slate-600 mt-1">
                      Estimated Budget: <span className="font-semibold text-purple-600">{formatCurrency(expectedBudget)}</span>
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    Project Duration
                    <span className="text-red-600">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      placeholder="Enter duration..."
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                    <Select value={durationType} onValueChange={setDurationType}>
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {durationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value} className="text-slate-900">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {duration && (
                    <p className="text-sm text-slate-600 mt-1">
                      Estimated Timeline: <span className="font-semibold text-purple-600">{duration} {durationType}</span>
                    </p>
                  )}
                </div>

                {/* Project Details */}
                <div className="space-y-2">
                  <Label htmlFor="details" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    Project Details & Objectives
                    <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="bg-white border-slate-300 text-slate-900 min-h-[250px] resize-y"
                  />
                  <p className="text-xs text-slate-500">
                    {details.length} / 2000 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Clear Form
                  </Button>
                  <div className="flex-1" />
                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid || isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Recommendation
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions Section - Takes up 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Important Information */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                  Recommendation Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">What to Include</h4>
                  <ul className="text-sm text-purple-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Clear and concise project objectives</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Realistic budget estimates with justification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Measurable success criteria</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Expected impact and benefits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>Potential challenges and solutions</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Review Process</h4>
                  <p className="text-sm text-blue-800">
                    All recommendations are reviewed by the project committee within <span className="font-semibold">5-7 business days</span>. 
                    Selected projects will proceed to detailed planning phase.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">Evaluation Criteria</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Strategic alignment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Resource availability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Expected ROI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Feasibility assessment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      <span>Priority level</span>
                    </li>
                  </ul>
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
                    <span>Research similar past projects for reference</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Consult with department heads before submission</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Include data to support your recommendations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Be realistic with budget and timeline estimates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Focus on organizational strategic goals</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Consider cross-departmental collaboration opportunities</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 text-lg">Need Assistance?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-slate-600">
                  For guidance on project recommendations:
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
    </div>
  );
}