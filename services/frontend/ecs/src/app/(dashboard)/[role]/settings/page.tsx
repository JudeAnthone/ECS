"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Label } from '@/shared/components/ui/Label';
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
import { Switch } from '@/shared/components/ui/Switch';
import {
  Settings as SettingsIcon,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Shield,
  Bell,
  Lock,
  Globe,
  Palette,
  CheckCircle2,
  Info,
} from 'lucide-react';

const PREFS_KEY = 'ecs_user_prefs';

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function ReadOnlyField({ label, value, icon: Icon, note }: {
  label: string; value?: string; icon?: React.ElementType; note?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
        {label}
      </Label>
      <Input
        value={value ?? 'â€”'}
        disabled
        className="bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed"
      />
      {note && <p className="text-xs text-slate-400">{note}</p>}
    </div>
  );
}

export default function SettingsPage() {
  // Loaded from localStorage
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [accountStatus, setAccountStatus] = useState('');
  const [memberSince, setMemberSince] = useState('');

  // Notifications â€” persisted in localStorage
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskNotifications, setTaskNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Preferences â€” persisted in localStorage
  const [language, setLanguage] = useState('English');
  const [theme] = useState('Light');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  const [showSuccess, setShowSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  // Load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        setUserId(u.id ?? '');
        setUsername(u.username ?? '');
        setFirstName(u.first_name ?? '');
        setLastName(u.last_name ?? '');
        setEmail(u.email ?? '');
        setContactNumber(u.contact_number ?? '');
        setDepartment(u.department ?? '');
        setRole(u.role ? u.role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '');
        setAccountStatus(u.account_status ?? '');
        setMemberSince(
          u.created_at
            ? new Date(u.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
            : ''
        );
      }
    } catch { /* ignore */ }

    const prefs = loadPrefs();
    if (prefs.emailNotifications !== undefined) setEmailNotifications(prefs.emailNotifications);
    if (prefs.taskNotifications !== undefined) setTaskNotifications(prefs.taskNotifications);
    if (prefs.projectUpdates !== undefined) setProjectUpdates(prefs.projectUpdates);
    if (prefs.weeklyReports !== undefined) setWeeklyReports(prefs.weeklyReports);
    if (prefs.systemAlerts !== undefined) setSystemAlerts(prefs.systemAlerts);
    if (prefs.language) setLanguage(prefs.language);

    if (prefs.dateFormat) setDateFormat(prefs.dateFormat);
  }, []);

  const flash = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const handleSaveContact = () => {
    // Update the locally stored user object with editable fields
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        u.first_name = firstName;
        u.last_name = lastName;
        u.email = email;
        u.contact_number = contactNumber;
        localStorage.setItem('user', JSON.stringify(u));
      }
    } catch { /* ignore */ }
    flash('Contact information saved locally. Sync to server is managed by your administrator.');
  };

  const savePrefs = (patch: object) => {
    const prefs = { ...loadPrefs(), ...patch };
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  };

  const handleSaveNotifications = () => {
    savePrefs({ emailNotifications, taskNotifications, projectUpdates, weeklyReports, systemAlerts });
    flash('Notification preferences saved.');
  };

  const handleSavePreferences = () => {
    savePrefs({ language, dateFormat });
    flash('Display preferences saved.');
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'account', label: 'Account & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Settings</h1>
            <p className="text-slate-600 text-lg">Manage your account settings and preferences</p>
          </div>
          <Badge className="bg-slate-700 text-white px-4 py-2 text-sm">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Account Settings
          </Badge>
        </div>

        {/* Success flash */}
        {showSuccess && (
          <Alert className="border-green-300 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-900 font-semibold">Saved</AlertTitle>
            <AlertDescription className="text-green-700">{showSuccess}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar nav */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-slate-200 shadow-lg sticky top-6">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">

            {/* â”€â”€ Personal Info â”€â”€ */}
            {activeTab === 'personal' && (
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-2xl flex items-center gap-2">
                    <User className="h-6 w-6 text-indigo-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Your profile details on this system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">

                  {/* Read-only system fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ReadOnlyField label="User ID" value={userId} icon={Shield} note="Unique system identifier â€” cannot be changed" />
                    <ReadOnlyField label="Username" value={username} icon={User} note="Set during registration" />
                    <ReadOnlyField label="Role" value={role} icon={Briefcase} />
                    <ReadOnlyField label="Department / Section" value={department} icon={Building2} />
                    <ReadOnlyField label="Account Status" value={accountStatus} />
                    <ReadOnlyField label="Member Since" value={memberSince} icon={Calendar} />
                  </div>

                  <hr className="border-slate-100" />

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    The fields below can be updated locally. To sync changes to the server, contact your administrator.
                  </p>

                  {/* Editable contact fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-500" /> First Name
                      </Label>
                      <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-white border-slate-300" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-500" /> Last Name
                      </Label>
                      <Input value={lastName} onChange={e => setLastName(e.target.value)} className="bg-white border-slate-300" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-indigo-500" /> Email Address
                      </Label>
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-white border-slate-300" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-indigo-500" /> Contact Number
                      </Label>
                      <Input type="tel" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="e.g. +63 9xx xxx xxxx" className="bg-white border-slate-300" />
                    </div>
                  </div>

                  <Button onClick={handleSaveContact} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Save Contact Info
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* â”€â”€ Account & Security â”€â”€ */}
            {activeTab === 'account' && (
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-2xl flex items-center gap-2">
                    <Lock className="h-6 w-6 text-indigo-600" />
                    Account & Security
                  </CardTitle>
                  <CardDescription>Password and account security information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Password changes are managed by your administrator</p>
                      <p className="text-sm text-blue-700 mt-1">
                        To reset or change your password, please contact your system administrator or submit a request through official channels. Self-service password change will be available in a future update.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ReadOnlyField label="Account Status" value={accountStatus} icon={Shield} />
                    <ReadOnlyField label="Role" value={role} icon={Briefcase} />
                    <ReadOnlyField label="Member Since" value={memberSince} icon={Calendar} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* â”€â”€ Notifications â”€â”€ */}
            {activeTab === 'notifications' && (
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-2xl flex items-center gap-2">
                    <Bell className="h-6 w-6 text-indigo-600" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Email Notifications', desc: 'Receive notifications via email', value: emailNotifications, set: setEmailNotifications },
                    { label: 'Task Notifications', desc: 'Get notified when tasks are assigned or updated', value: taskNotifications, set: setTaskNotifications },
                    { label: 'Project Updates', desc: 'Receive updates about your projects', value: projectUpdates, set: setProjectUpdates },
                    { label: 'Weekly Reports', desc: 'Receive weekly summary reports', value: weeklyReports, set: setWeeklyReports },
                    { label: 'System Alerts', desc: 'Important system notifications and alerts', value: systemAlerts, set: setSystemAlerts },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-0.5">{item.label}</h4>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <Switch checked={item.value} onCheckedChange={item.set} />
                    </div>
                  ))}
                  <Button onClick={handleSaveNotifications} className="bg-indigo-600 hover:bg-indigo-700 text-white mt-2">
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* â”€â”€ Preferences â”€â”€ */}
            {activeTab === 'preferences' && (
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-2xl flex items-center gap-2">
                    <Palette className="h-6 w-6 text-indigo-600" />
                    Display & Preferences
                  </CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">

                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-indigo-500" /> Language
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="bg-white border-slate-300"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['English', 'Filipino'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-indigo-500" /> Theme
                      <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">Coming soon</span>
                    </Label>
                    <Select value={theme} disabled>
                      <SelectTrigger className="bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed opacity-70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Light', 'Dark', 'Auto'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400">Theme switching is not yet available.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-500" /> Date Format
                    </Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger className="bg-white border-slate-300"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(f => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleSavePreferences} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
