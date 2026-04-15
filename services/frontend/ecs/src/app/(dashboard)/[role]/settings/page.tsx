"use client"
import React, { useRef, useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Label } from '@/shared/components/ui/Label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/Dialog';
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
  Upload,
  Trash2,
} from 'lucide-react';
import { AuthService, type UserDTO } from '@/shared/lib/auth-service';
import { API_ENDPOINTS } from '@/shared/lib/api-config';
import ProfileAvatar from '@/shared/components/ui/ProfileAvatar';
import { useTheme } from '@/shared/components/providers/theme-provider';

const PREFS_KEY = 'ecs_user_prefs';

type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ContactDraft = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
};

type ContactChange = {
  label: string;
  before: string;
  after: string;
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

async function parseResponsePayload(response: Response): Promise<{ data: any; raw: string }> {
  const raw = await response.text();
  if (!raw) return { data: null, raw: '' };
  try {
    return { data: JSON.parse(raw), raw };
  } catch {
    return { data: null, raw };
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function getCroppedBlob(imageSrc: string, pixelCrop: CropArea, mimeType: string): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(pixelCrop.width));
  canvas.height = Math.max(1, Math.floor(pixelCrop.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to initialize image editor');
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const safeType = mimeType === 'image/png' || mimeType === 'image/webp' || mimeType === 'image/jpeg'
    ? mimeType
    : 'image/jpeg';

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to crop image'));
        return;
      }
      resolve(blob);
    }, safeType, 0.92);
  });
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
        value={value ?? '-'}
        disabled
        className="bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed"
      />
      {note && <p className="text-xs text-slate-400">{note}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { isDark } = useTheme();
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
  const [avatarURL, setAvatarURL] = useState('');
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [cropImageName, setCropImageName] = useState('avatar.jpg');
  const [cropMimeType, setCropMimeType] = useState('image/jpeg');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Notifications â€” persisted in localStorage
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskNotifications, setTaskNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState(true);


  const [showSuccess, setShowSuccess] = useState('');
  const [showError, setShowError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [contactBaseline, setContactBaseline] = useState<ContactDraft>({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
  });
  const [contactChanges, setContactChanges] = useState<ContactChange[]>([]);
  const [contactConfirmOpen, setContactConfirmOpen] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);

  const applyUser = (u: UserDTO) => {
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
    setAvatarURL(AuthService.resolveAvatarUrl(u.avatar_url));
    setContactBaseline({
      firstName: u.first_name ?? '',
      lastName: u.last_name ?? '',
      email: u.email ?? '',
      contactNumber: u.contact_number ?? '',
    });
  };

  // Load on mount
  useEffect(() => {
    const loadProfile = async () => {
      const token = AuthService.getToken();
      if (!token) return;
      try {
        const response = await fetch(API_ENDPOINTS.users.me, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const me = (data?.user ?? null) as UserDTO | null;
          if (me) {
            applyUser(me);
            AuthService.setUser(me);
          }
          return;
        }
      } catch {
        // fall through to local cache
      }

      const cached = AuthService.getUser();
      if (cached) {
        applyUser(cached);
      }
    };

    void loadProfile();

    const prefs = loadPrefs();
    if (prefs.emailNotifications !== undefined) setEmailNotifications(prefs.emailNotifications);
    if (prefs.taskNotifications !== undefined) setTaskNotifications(prefs.taskNotifications);
    if (prefs.projectUpdates !== undefined) setProjectUpdates(prefs.projectUpdates);
    if (prefs.weeklyReports !== undefined) setWeeklyReports(prefs.weeklyReports);
    if (prefs.systemAlerts !== undefined) setSystemAlerts(prefs.systemAlerts);
  }, []);

  const flash = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const flashError = (msg: string) => {
    setShowError(msg);
    setTimeout(() => setShowError(''), 4000);
  };

  const getCurrentContactDraft = (): ContactDraft => ({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    contactNumber: contactNumber.trim(),
  });

  const computeContactChanges = (next: ContactDraft): ContactChange[] => {
    const fields: Array<{ label: string; key: keyof ContactDraft }> = [
      { label: 'First Name', key: 'firstName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'Email Address', key: 'email' },
      { label: 'Contact Number', key: 'contactNumber' },
    ];

    return fields
      .filter((field) => contactBaseline[field.key] !== next[field.key])
      .map((field) => ({
        label: field.label,
        before: contactBaseline[field.key] || '(empty)',
        after: next[field.key] || '(empty)',
      }));
  };

  const cleanupCropSource = () => {
    if (cropImageSrc.startsWith('blob:')) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setCropImageSrc('');
  };

  const uploadAvatarBlob = async (blob: Blob, fileName: string, mimeType: string) => {
    const token = AuthService.getToken();
    if (!token) {
      throw new Error('You are not authenticated.');
    }

    const uploadFile = new File([blob], fileName, { type: mimeType });
    const formData = new FormData();
    formData.append('avatar', uploadFile);

    const response = await fetch(API_ENDPOINTS.users.avatar, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const { data, raw } = await parseResponsePayload(response);
    if (!response.ok) {
      throw new Error(data?.error || raw || 'Failed to upload profile photo');
    }

    const updated = (data?.user ?? null) as UserDTO | null;
    if (updated) {
      applyUser(updated);
      AuthService.setUser(updated);
    }
  };

  const handleSaveContact = () => {
    setContactChanges(computeContactChanges(getCurrentContactDraft()));
    setContactConfirmOpen(true);
  };

  const handleConfirmSaveContact = async () => {
    const token = AuthService.getToken();
    if (!token) {
      flashError('You are not authenticated. Please sign in again.');
      return;
    }

    const payload = getCurrentContactDraft();
    setContactSaving(true);
    try {
      const response = await fetch(API_ENDPOINTS.users.updateMe, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: payload.firstName,
          last_name: payload.lastName,
          email: payload.email,
          contact_number: payload.contactNumber,
        }),
      });

      const { data, raw } = await parseResponsePayload(response);
      if (!response.ok) {
        throw new Error(data?.error || raw || 'Failed to update contact information');
      }

      const updated = (data?.user ?? null) as UserDTO | null;
      if (!updated) {
        throw new Error('Missing updated user payload');
      }

      applyUser(updated);
      AuthService.setUser(updated);
      setContactConfirmOpen(false);
      flash('Contact information updated successfully.');
    } catch (err) {
      flashError(err instanceof Error ? err.message : 'Failed to update contact information');
    } finally {
      setContactSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarError('');
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be 5MB or smaller.');
      return;
    }

    const token = AuthService.getToken();
    if (!token) {
      setAvatarError('You are not authenticated.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setCropImageName(file.name || 'avatar.jpg');
    setCropMimeType(file.type || 'image/jpeg');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropOpen(true);

    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleCropSave = async () => {
    if (!cropImageSrc || !croppedAreaPixels) {
      setAvatarError('Please adjust the crop area before saving.');
      return;
    }

    setAvatarBusy(true);
    setAvatarError('');

    try {
      const croppedBlob = await getCroppedBlob(cropImageSrc, croppedAreaPixels, cropMimeType);
      await uploadAvatarBlob(croppedBlob, cropImageName, cropMimeType);
      setCropOpen(false);
      cleanupCropSource();
      flash('Profile photo updated.');
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Failed to upload profile photo');
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleCropCancel = () => {
    setCropOpen(false);
    cleanupCropSource();
  };

  const handleRemoveAvatar = async () => {
    const token = AuthService.getToken();
    if (!token) {
      setAvatarError('You are not authenticated.');
      return;
    }

    setAvatarError('');
    setAvatarBusy(true);
    try {
      const response = await fetch(API_ENDPOINTS.users.avatar, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const { data, raw } = await parseResponsePayload(response);
      if (!response.ok) {
        throw new Error(data?.error || raw || 'Failed to remove profile photo');
      }

      const updated = (data?.user ?? null) as UserDTO | null;
      if (updated) {
        applyUser(updated);
        AuthService.setUser(updated);
      }
      flash('Profile photo removed.');
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Failed to remove profile photo');
    } finally {
      setAvatarBusy(false);
    }
  };

  const savePrefs = (patch: object) => {
    const prefs = { ...loadPrefs(), ...patch };
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  };

  const handleSaveNotifications = () => {
    savePrefs({ emailNotifications, taskNotifications, projectUpdates, weeklyReports, systemAlerts });
    flash('Notification preferences saved.');
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'account', label: 'Account & Security', icon: Shield },
  ];

  return (
    <div className={isDark ? "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6" : "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6"}>
      <Dialog open={cropOpen} onOpenChange={(open) => {
        if (!open) handleCropCancel();
      }}>
        <DialogContent className="max-w-xl" showCloseButton={!avatarBusy}>
          <DialogHeader>
            <DialogTitle>Crop Profile Photo</DialogTitle>
            <DialogDescription>Drag and zoom to choose the area to save.</DialogDescription>
          </DialogHeader>

          <div className="relative h-72 w-full overflow-hidden rounded-lg bg-slate-900">
            {cropImageSrc && (
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels as CropArea)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-slate-700">Zoom</Label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
              disabled={avatarBusy}
            />
          </div>

          <DialogFooter className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCropCancel} disabled={avatarBusy}>
              Cancel
            </Button>
            <Button type="button" className="bg-[#BA0021] hover:bg-[#BA0021]/90 text-white" onClick={handleCropSave} disabled={avatarBusy}>
              {avatarBusy ? 'Saving...' : 'Save Photo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={contactConfirmOpen} onOpenChange={(open) => {
        if (!contactSaving) setContactConfirmOpen(open);
      }}>
        <DialogContent className="max-w-lg" showCloseButton={!contactSaving}>
          <DialogHeader>
            <DialogTitle>Confirm Contact Info Update</DialogTitle>
            <DialogDescription>
              Review the changes below before saving them to your account.
            </DialogDescription>
          </DialogHeader>

          {contactChanges.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              No changes detected. Update at least one field to continue.
            </div>
          ) : (
            <div className="space-y-2">
              {contactChanges.map((change) => (
                <div key={change.label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-800">{change.label}</p>
                  <p className="text-xs text-slate-500 mt-1">From: {change.before}</p>
                  <p className="text-xs text-slate-700">To: {change.after}</p>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setContactConfirmOpen(false)} disabled={contactSaving}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[#BA0021] hover:bg-[#BA0021]/90 text-white"
              onClick={handleConfirmSaveContact}
              disabled={contactSaving || contactChanges.length === 0}
            >
              {contactSaving ? 'Saving...' : 'Confirm & Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={isDark ? "text-4xl font-bold text-white mb-2 tracking-tight" : "text-4xl font-bold text-slate-900 mb-2 tracking-tight"}>Settings</h1>
            <p className={isDark ? "text-gray-300 text-lg" : "text-slate-600 text-lg"}>Manage your account settings and preferences</p>
          </div>
          <Badge className={isDark ? "bg-slate-700 text-white px-4 py-2 text-sm" : "bg-slate-700 text-white px-4 py-2 text-sm"}>
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

        {showError && (
          <Alert className="border-red-300 bg-red-50">
            <AlertTitle className="text-red-900 font-semibold">Update failed</AlertTitle>
            <AlertDescription className="text-red-700">{showError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar nav */}
          <div className="lg:col-span-1">
            <Card className={isDark ? "bg-slate-800 border-slate-700 shadow-lg sticky top-6" : "bg-white border-slate-200 shadow-lg sticky top-6"}>
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
                            ? 'bg-[#BA0021] text-white shadow-md'
                            : isDark ? 'text-gray-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-[#BA0021]/10'
                        }`}
                      >
                        <Icon className={activeTab === tab.id ? "h-5 w-5 text-white" : "h-5 w-5 text-[#BA0021]"} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">

            {/* ──── Personal Info ──── */}
            {activeTab === 'personal' && (
              <Card className={isDark ? "bg-slate-800 border-slate-700 shadow-lg" : "bg-white border-slate-200 shadow-lg"}>
                <CardHeader>
                  <CardTitle className={isDark ? "text-white text-2xl flex items-center gap-2" : "text-slate-900 text-2xl flex items-center gap-2"}>
                    <User className="h-6 w-6 text-[#BA0021]" />
                    Personal Information
                  </CardTitle>
                  <CardDescription className={isDark ? "text-gray-400" : ""}>Your profile details on this system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">

                  <div className={isDark ? "rounded-lg border border-slate-700 bg-slate-700/50 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4" : "rounded-lg border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"}>
                    <ProfileAvatar
                      imageUrl={avatarURL}
                      firstName={firstName}
                      lastName={lastName}
                      fullName={username}
                      alt="Profile"
                      className="h-20 w-20 border border-slate-300"
                      textClassName="text-2xl"
                    />
                    <div className="flex-1 space-y-2">
                      <p className={isDark ? "text-sm text-gray-200 font-medium" : "text-sm text-slate-700 font-medium"}>Profile Photo</p>
                      <p className={isDark ? "text-xs text-gray-400" : "text-xs text-slate-500"}>Upload JPG, PNG, or WEBP up to 5MB. This photo appears in your dashboard and menus.</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                        <Button
                          type="button"
                          className="bg-[#BA0021] hover:bg-[#BA0021]/90 text-white"
                          disabled={avatarBusy}
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {avatarBusy ? 'Updating...' : 'Upload New Photo'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={avatarBusy || !avatarURL}
                          onClick={handleRemoveAvatar}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Photo
                        </Button>
                      </div>
                      {avatarError && <p className="text-xs text-red-600">{avatarError}</p>}
                    </div>
                  </div>

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
                    Changes below will be saved to your account after confirmation.
                  </p>

                  {/* Editable contact fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-[#BA0021]" /> First Name
                      </Label>
                      <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-white border-slate-300" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-[#BA0021]" /> Last Name
                      </Label>
                      <Input value={lastName} onChange={e => setLastName(e.target.value)} className="bg-white border-slate-300" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#BA0021]" /> Email Address
                      </Label>
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-white border-slate-300" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#BA0021]" /> Contact Number
                      </Label>
                      <Input type="tel" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="e.g. +63 9xx xxx xxxx" className="bg-white border-slate-300" />
                    </div>
                  </div>

                  <Button onClick={handleSaveContact} className="bg-[#BA0021] hover:bg-[#BA0021]/90 text-white">
                    Save Contact Info
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* â”€â”€ Account & Security â”€â”€ */}
            {activeTab === 'account' && (
              <Card className={isDark ? "bg-slate-800 border-slate-700 shadow-lg" : "bg-white border-slate-200 shadow-lg"}>
                <CardHeader>
                  <CardTitle className={isDark ? "text-white text-2xl flex items-center gap-2" : "text-slate-900 text-2xl flex items-center gap-2"}>
                    <Lock className="h-6 w-6 text-[#BA0021]" />
                    Account & Security
                  </CardTitle>
                  <CardDescription className={isDark ? "text-gray-400" : ""}>Password and account security information</CardDescription>
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
              <Card className={isDark ? "bg-slate-800 border-slate-700 shadow-lg" : "bg-white border-slate-200 shadow-lg"}>
                <CardHeader>
                  <CardTitle className={isDark ? "text-white text-2xl flex items-center gap-2" : "text-slate-900 text-2xl flex items-center gap-2"}>
                    <Bell className="h-6 w-6 text-[#BA0021]" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription className={isDark ? "text-gray-400" : ""}>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Email Notifications', desc: 'Receive notifications via email', value: emailNotifications, set: setEmailNotifications },
                    { label: 'Task Notifications', desc: 'Get notified when tasks are assigned or updated', value: taskNotifications, set: setTaskNotifications },
                    { label: 'Project Updates', desc: 'Receive updates about your projects', value: projectUpdates, set: setProjectUpdates },
                    { label: 'Weekly Reports', desc: 'Receive weekly summary reports', value: weeklyReports, set: setWeeklyReports },
                    { label: 'System Alerts', desc: 'Important system notifications and alerts', value: systemAlerts, set: setSystemAlerts },
                  ].map(item => (
                    <div key={item.label} className={isDark ? "flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-700/50" : "flex items-center justify-between p-4 border border-slate-200 rounded-lg"}>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-0.5">{item.label}</h4>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <Switch checked={item.value} onCheckedChange={item.set} />
                    </div>
                  ))}
                  <Button onClick={handleSaveNotifications} className="bg-[#BA0021] hover:bg-[#BA0021]/90 text-white mt-2">
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* â”€â”€ Preferences â”€â”€ */}
            {activeTab === 'preferences' && (
              <Card className={isDark ? "bg-slate-800 border-slate-700 shadow-lg" : "bg-white border-slate-200 shadow-lg"}>
                <CardHeader>
                  <CardTitle className={isDark ? "text-white text-2xl flex items-center gap-2" : "text-slate-900 text-2xl flex items-center gap-2"}>
                    <Palette className="h-6 w-6 text-[#BA0021]" />
                    Display & Preferences
                  </CardTitle>
                  <CardDescription className={isDark ? "text-gray-400" : ""}>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <Alert className={isDark ? "border-slate-700 bg-slate-700/50" : "border-slate-200 bg-slate-50"}>
                    <AlertDescription className={isDark ? "text-gray-300" : ""}>
                      🔒 Theme is currently locked to Light mode for system consistency
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-1.5">
                    <Label className={isDark ? "text-sm font-semibold text-gray-200 flex items-center gap-2" : "text-sm font-semibold text-slate-700 flex items-center gap-2"}>
                      <Palette className="h-4 w-4 text-[#BA0021]" /> Theme
                    </Label>
                    <Select value="light" disabled>
                      <SelectTrigger className={isDark ? "bg-slate-700 border-slate-600 opacity-60" : "bg-gray-100 border-slate-300 opacity-60"} disabled>
                        <SelectValue />
                      </SelectTrigger>
                    </Select>
                    <p className={isDark ? "text-xs text-gray-400" : "text-xs text-slate-500"}>Theme is locked to ensure interface consistency.</p>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
