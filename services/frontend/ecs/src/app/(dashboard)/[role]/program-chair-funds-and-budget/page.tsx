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
  PhilippinePeso,
  FileText,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle2,
  Send
} from 'lucide-react';

export default function FundRequestPage() {
  const [projectName, setProjectName] = useState('');
  const [department, setDepartment] = useState('');
  const [amount, setAmount] = useState('');
  const [dateNeeded, setDateNeeded] = useState('');
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

  const handleClear = () => {
    setProjectName('');
    setDepartment('');
    setAmount('');
    setDateNeeded('');
    setDetails('');
  };

  const handleSubmit = () => {
    if (!projectName || !department || !amount || !dateNeeded || !details) {
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
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
  };

  const isFormValid = projectName && department && amount && dateNeeded && details;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-6">

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Fund Request Form
            </h1>
            <p className="text-slate-600 text-lg">Submit a request for project funding</p>
          </div>
          <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
            <PhilippinePeso  className="h-4 w-4 mr-2" />
            Fund Request
          </Badge>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Alert className="border-green-300 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-900 font-semibold">Request Submitted Successfully!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your fund request has been submitted and is now pending approval. You will receive a notification once it has been reviewed by the finance department.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section - Takes up 2/3 */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 text-2xl">Request Details</CardTitle>
                <CardDescription className="text-slate-600">
                  Please provide all required information for your fund request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
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
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Department
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

                {/* Amount Needed */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <PhilippinePeso  className="h-4 w-4 text-blue-600" />
                    Amount Needed
                    <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <PhilippinePeso className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4 mr-2' />
                    <Input
                      id="amount"
                      type="text"
                      placeholder="0"
                      value={amount}
                      onChange={handleAmountChange}
                      className="pl-8 bg-white border-slate-300 text-slate-900 font-semibold"
                    />
                  </div>
                  {amount && (
                    <p className="text-sm text-slate-600 mt-1">
                      Amount: <span className="font-semibold text-blue-600">{formatCurrency(amount)}</span>
                    </p>
                  )}
                </div>

                {/* Date Needed */}
                <div className="space-y-2">
                  <Label htmlFor="dateNeeded" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Date Needed
                    <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="dateNeeded"
                      type="date"
                      value={dateNeeded}
                      onChange={(e) => setDateNeeded(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="bg-white border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                {/* Details/Justification */}
                <div className="space-y-2">
                  <Label htmlFor="details" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Details & Justification
                    <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="details"
                    placeholder="Please provide detailed justification for this fund request, including:&#10;• Purpose of the funding&#10;• How it will be utilized&#10;• Expected outcomes&#10;• Breakdown of expenses (if applicable)&#10;• Why this funding is critical for the project"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="bg-white border-slate-300 text-slate-900 min-h-[200px] resize-y"
                  />
                  <p className="text-xs text-slate-500">
                    {details.length} / 1000 characters
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Request
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
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Before Submitting</h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Ensure all required fields are completed accurately</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Provide detailed justification for the funding request</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Include expense breakdown if applicable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Allow sufficient time for review and approval</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">Processing Time</h4>
                  <p className="text-sm text-amber-800">
                    Fund requests are typically reviewed within <span className="font-semibold">3-5 business days</span>. 
                    Urgent requests should be clearly marked in the details section.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">After Submission</h4>
                  <p className="text-sm text-green-800">
                    You will receive email notifications regarding the status of your request. 
                    Track your submission in the dashboard under &quot;My Requests.&quot;
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 text-lg">Request Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Be specific about how funds will be used</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Include relevant budget breakdowns</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Explain expected project outcomes</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Submit requests at least 2 weeks in advance</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                    <span>Provide supporting documentation if needed</span>
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
                  For questions regarding fund requests, contact:
                </p>
                <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                  <p className="font-semibold text-slate-900">Finance Department</p>
                  <p className="text-slate-600">finance@company.com</p>
                  <p className="text-slate-600">Ext: 5432</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}