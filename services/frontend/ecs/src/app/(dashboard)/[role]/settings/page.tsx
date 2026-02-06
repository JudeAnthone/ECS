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
import { Switch } from '@/shared/components/ui/Switch';
import { 
  Settings as SettingsIcon,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Eye,
  Lock,
  Globe,
  Palette,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  // Personal Information
  const [userId, setUserId] = useState('USR001');
  const [fullName, setFullName] = useState('John Smith');
  const [email, setEmail] = useState('john.smith@company.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [department, setDepartment] = useState('Engineering');
  const [role, setRole] = useState('Senior Developer');
  const [location, setLocation] = useState('New York, USA');
  const [joinDate, setJoinDate] = useState('2023-03-15');
  const [bio, setBio] = useState('Experienced software developer with a passion for building scalable applications.');

  // Account Settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskNotifications, setTaskNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Privacy & Security
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('team');
  const [activityTracking, setActivityTracking] = useState(true);

  // Preferences
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('America/New_York');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [theme, setTheme] = useState('Light');

  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const departments = [
    'Engineering',
    'Marketing',
    'Research',
    'Operations',
    'Finance',
    'Human Resources'
  ];

  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];
  const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai'
  ];
  const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
  const themes = ['Light', 'Dark', 'Auto'];

  const handleSavePersonalInfo = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    setShowSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSavePreferences = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'account', label: 'Account & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-6">

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Settings
            </h1>
            <p className="text-slate-600 text-lg">Manage your account settings and preferences</p>
          </div>
          <Badge className="bg-slate-700 text-white px-4 py-2 text-sm">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Account Settings
          </Badge>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <Alert className="border-green-300 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-900 font-semibold">Changes Saved Successfully!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your settings have been updated.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-slate-200 shadow-lg sticky top-6">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
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

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <>
                <Card className="bg-white border-slate-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-slate-900 text-2xl flex items-center gap-2">
                      <User className="h-6 w-6 text-indigo-600" />
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Your basic profile information and details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* User ID (Read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor="userId" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-indigo-600" />
                        User ID
                      </Label>
                      <Input
                        id="userId"
                        type="text"
                        value={userId}
                        disabled
                        className="bg-slate-100 border-slate-300 text-slate-900 font-semibold mono cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-500">This is your unique identifier and cannot be changed</p>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-indigo-600" />
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-indigo-600" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-indigo-600" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                      />
                    </div>

                    {/* Department and Role */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-indigo-600" />
                          Department
                        </Label>
                        <Select value={department} onValueChange={setDepartment}>
                          <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                            <SelectValue />
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

                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-indigo-600" />
                          Role/Position
                        </Label>
                        <Input
                          id="role"
                          type="text"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="bg-white border-slate-300 text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Location and Join Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-indigo-600" />
                          Location
                        </Label>
                        <Input
                          id="location"
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="bg-white border-slate-300 text-slate-900"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="joinDate" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-indigo-600" />
                          Join Date
                        </Label>
                        <Input
                          id="joinDate"
                          type="date"
                          value={joinDate}
                          disabled
                          className="bg-slate-100 border-slate-300 text-slate-900 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-semibold text-slate-700">
                        Bio / About Me
                      </Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="bg-white border-slate-300 text-slate-900 min-h-[100px]"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <Button
                      onClick={handleSavePersonalInfo}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto"
                    >
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Account & Security Tab */}
            {activeTab === 'account' && (
              <>
                <Card className="bg-white border-slate-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-slate-900 text-2xl flex items-center gap-2">
                      <Lock className="h-6 w-6 text-indigo-600" />
                      Change Password
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm font-semibold text-slate-700">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                        placeholder="Enter new password"
                      />
                      <p className="text-xs text-slate-500">Password must be at least 8 characters long</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-white border-slate-300 text-slate-900"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <Button
                      onClick={handleChangePassword}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto"
                    >
                      Update Password
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-slate-900 text-2xl flex items-center gap-2">
                      <Shield className="h-6 w-6 text-indigo-600" />
                      Security & Privacy
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Manage your security settings and privacy preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">Two-Factor Authentication</h4>
                        <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
                      </div>
                      <Switch
                        checked={twoFactorAuth}
                        onCheckedChange={setTwoFactorAuth}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profileVisibility" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-indigo-600" />
                        Profile Visibility
                      </Label>
                      <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                        <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                          <SelectItem value="public" className="text-slate-900">Public - Visible to everyone</SelectItem>
                          <SelectItem value="team" className="text-slate-900">Team Only - Visible to your team</SelectItem>
                          <SelectItem value="private" className="text-slate-900">Private - Only you can see</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">Activity Tracking</h4>
                        <p className="text-sm text-slate-600">Allow us to track your activity for analytics</p>
                      </div>
                      <Switch
                        checked={activityTracking}
                        onCheckedChange={setActivityTracking}
                      />
                    </div>

                    <Button
                      onClick={handleSavePreferences}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto"
                    >
                      Save Security Settings
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-2xl flex items-center gap-2">
                    <Bell className="h-6 w-6 text-indigo-600" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">Email Notifications</h4>
                      <p className="text-sm text-slate-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">Task Notifications</h4>
                      <p className="text-sm text-slate-600">Get notified when tasks are assigned or updated</p>
                    </div>
                    <Switch
                      checked={taskNotifications}
                      onCheckedChange={setTaskNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">Project Updates</h4>
                      <p className="text-sm text-slate-600">Receive updates about your projects</p>
                    </div>
                    <Switch
                      checked={projectUpdates}
                      onCheckedChange={setProjectUpdates}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">Weekly Reports</h4>
                      <p className="text-sm text-slate-600">Receive weekly summary reports</p>
                    </div>
                    <Switch
                      checked={weeklyReports}
                      onCheckedChange={setWeeklyReports}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">System Alerts</h4>
                      <p className="text-sm text-slate-600">Important system notifications and alerts</p>
                    </div>
                    <Switch
                      checked={systemAlerts}
                      onCheckedChange={setSystemAlerts}
                    />
                  </div>

                  <Button
                    onClick={handleSavePreferences}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto mt-6"
                  >
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-slate-900 text-2xl flex items-center gap-2">
                    <Palette className="h-6 w-6 text-indigo-600" />
                    Display & Preferences
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Customize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-indigo-600" />
                      Language
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {languages.map(lang => (
                          <SelectItem key={lang} value={lang} className="text-slate-900">
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-indigo-600" />
                      Timezone
                    </Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {timezones.map(tz => (
                          <SelectItem key={tz} value={tz} className="text-slate-900">
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateFormat" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      Date Format
                    </Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {dateFormats.map(format => (
                          <SelectItem key={format} value={format} className="text-slate-900">
                            {format}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-indigo-600" />
                      Theme
                    </Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="bg-white border-slate-300 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {themes.map(t => (
                          <SelectItem key={t} value={t} className="text-slate-900">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleSavePreferences}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto mt-6"
                  >
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