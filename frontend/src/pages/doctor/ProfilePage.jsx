/**
 * ProfilePage.jsx — Doctor Profile & Settings
 * Route: /doctor/profile
 * Layout: DoctorLayout
 *
 * Sections (Tabs):
 *   Profile     — name, photo, specialization, clinic, contact
 *   Preferences — default language, notification settings
 *   Security    — change password, active sessions
 *   Account     — delete account, export data
 *
 * Data:
 *   GET /api/v1/doctors/me     → load doctor profile
 *   PUT /api/v1/doctors/me     → save updates
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Settings, Shield, Trash2, LogOut, Save,
  Camera, Bell, Globe, Lock, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

import DoctorLayout   from '@/components/layout/DoctorLayout'
import PageHeader     from '@/components/common/PageHeader'
import Tabs           from '@/components/ui/Tabs'
import Button         from '@/components/ui/Button'
import { Input }      from '@/components/ui/Input'
import Avatar         from '@/components/ui/Avatar'
import { ConfirmModal } from '@/components/ui/Modal'

import { useDoctor }  from '@/hooks/useDoctor'
import { useAuthStore } from '@/store'

const PROFILE_TABS = [
  { id: 'profile',     label: 'Profile'     },
  { id: 'preferences', label: 'Preferences' },
  { id: 'security',    label: 'Security'    },
  { id: 'account',     label: 'Account'     },
]

const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English'   },
  { code: 'hi', name: 'हिंदी'     },
  { code: 'ta', name: 'தமிழ்'     },
  { code: 'te', name: 'తెలుగు'    },
  { code: 'bn', name: 'বাংলা'     },
  { code: 'mr', name: 'मराठी'     },
  { code: 'gu', name: 'ગુજરાતી'   },
  { code: 'kn', name: 'ಕನ್ನಡ'     },
  { code: 'ml', name: 'മലയാളം'    },
  { code: 'pa', name: 'ਪੰਜਾਬੀ'    },
]

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'ENT Specialist',
  'Gastroenterologist', 'Gynecologist', 'Neurologist', 'Oncologist',
  'Ophthalmologist', 'Orthopedic Surgeon', 'Pediatrician', 'Psychiatrist',
  'Pulmonologist', 'Radiologist', 'Urologist', 'Endocrinologist',
]

export default function ProfilePage() {
  const navigate  = useNavigate()
  const { logout } = useAuthStore()

  const [activeTab, setActiveTab]       = useState('profile')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { doctor, isLoading, updateProfile, isUpdating } = useDoctor()

  // ── Profile form state ───────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    firstName:      doctor?.firstName ?? '',
    lastName:       doctor?.lastName  ?? '',
    phone:          doctor?.phone     ?? '',
    specialization: doctor?.specialization ?? '',
    clinicName:     doctor?.clinicName ?? '',
    clinicCity:     doctor?.clinicCity ?? '',
    registrationNo: doctor?.registrationNo ?? '',
    bio:            doctor?.bio ?? '',
  })

  // ── Preferences form state ────────────────────────────────────────────────
  const [prefsForm, setPrefsForm] = useState({
    defaultLanguage:  doctor?.defaultLanguage ?? 'hi',
    notifyOnChat:     doctor?.notifyOnChat ?? true,
    notifyOnDelivery: doctor?.notifyOnDelivery ?? true,
    autoSendEnabled:  doctor?.autoSendEnabled ?? false,
  })

  const handleProfileSave = async () => {
    try {
      await updateProfile(profileForm)
      toast.success('Profile updated successfully.')
    } catch {
      toast.error('Failed to update profile.')
    }
  }

  const handlePrefsSave = async () => {
    try {
      await updateProfile(prefsForm)
      toast.success('Preferences saved.')
    } catch {
      toast.error('Failed to save preferences.')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <DoctorLayout>
      <PageHeader
        title="Profile & Settings"
        subtitle="Manage your account, clinic info, and notification preferences."
      />

      <div className="px-4 sm:px-6 pt-4">
        <Tabs tabs={PROFILE_TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="p-4 sm:p-6 max-w-xl">

        {/* ══ Profile tab ════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            {/* Avatar section */}
            <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="relative">
                <Avatar
                  name={`${profileForm.firstName} ${profileForm.lastName}`}
                  size="xl"
                />
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-emerald-600 transition-colors">
                  <Camera size={12} className="text-white" />
                </button>
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  Dr. {profileForm.firstName} {profileForm.lastName}
                </div>
                <div className="text-sm text-gray-500">{profileForm.specialization || 'Doctor'}</div>
                <div className="text-xs text-gray-400 mt-0.5">{doctor?.email}</div>
              </div>
            </div>

            {/* Form fields */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <SectionTitle>Personal Information</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm(p => ({ ...p, firstName: e.target.value }))}
                  placeholder="Priya"
                />
                <Input
                  label="Last Name"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm(p => ({ ...p, lastName: e.target.value }))}
                  placeholder="Sharma"
                />
              </div>
              <Input
                label="Phone Number"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                type="tel"
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <SectionTitle>Clinic Information</SectionTitle>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Specialization</label>
                <select
                  value={profileForm.specialization}
                  onChange={(e) => setProfileForm(p => ({ ...p, specialization: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input
                label="Clinic / Hospital Name"
                value={profileForm.clinicName}
                onChange={(e) => setProfileForm(p => ({ ...p, clinicName: e.target.value }))}
                placeholder="City Health Clinic"
              />
              <Input
                label="City"
                value={profileForm.clinicCity}
                onChange={(e) => setProfileForm(p => ({ ...p, clinicCity: e.target.value }))}
                placeholder="Mumbai"
              />
              <Input
                label="Medical Registration Number"
                value={profileForm.registrationNo}
                onChange={(e) => setProfileForm(p => ({ ...p, registrationNo: e.target.value }))}
                placeholder="MH/12345/2010"
                helpText="Used to verify your registration on prescription templates."
              />
            </div>

            <Button
              fullWidth
              onClick={handleProfileSave}
              loading={isUpdating}
            >
              <Save size={16} className="mr-2" />
              Save Profile
            </Button>
          </div>
        )}

        {/* ══ Preferences tab ════════════════════════════════════════════ */}
        {activeTab === 'preferences' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
              <SectionTitle icon={Globe}>Language Settings</SectionTitle>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Default patient summary language
                </label>
                <select
                  value={prefsForm.defaultLanguage}
                  onChange={(e) => setPrefsForm(p => ({ ...p, defaultLanguage: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                >
                  {INDIAN_LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1.5">
                  Used when a patient has no preferred language set.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <SectionTitle icon={Bell}>Notifications</SectionTitle>
              <ToggleRow
                label="Notify when patient reads summary"
                desc="Get notified when a patient opens their WhatsApp portal link."
                checked={prefsForm.notifyOnDelivery}
                onChange={(v) => setPrefsForm(p => ({ ...p, notifyOnDelivery: v }))}
              />
              <ToggleRow
                label="Notify on patient chat message"
                desc="Get notified when a patient sends you a follow-up question."
                checked={prefsForm.notifyOnChat}
                onChange={(v) => setPrefsForm(p => ({ ...p, notifyOnChat: v }))}
              />
              <ToggleRow
                label="Auto-send summary after AI completes"
                desc="Automatically send WhatsApp summary without requiring manual approval."
                checked={prefsForm.autoSendEnabled}
                onChange={(v) => setPrefsForm(p => ({ ...p, autoSendEnabled: v }))}
                warning="Only enable this if you trust the AI output without review."
              />
            </div>

            <Button fullWidth onClick={handlePrefsSave} loading={isUpdating}>
              <Save size={16} className="mr-2" />
              Save Preferences
            </Button>
          </div>
        )}

        {/* ══ Security tab ═══════════════════════════════════════════════ */}
        {activeTab === 'security' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <SectionTitle icon={Lock}>Change Password</SectionTitle>
              <Input label="Current Password" type="password" placeholder="••••••••" />
              <Input label="New Password" type="password" placeholder="••••••••" helpText="Minimum 8 characters." />
              <Input label="Confirm New Password" type="password" placeholder="••••••••" />
              <Button variant="secondary" fullWidth>Update Password</Button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <SectionTitle>Sign Out</SectionTitle>
              <p className="text-sm text-gray-500 mb-4">
                Sign out from your current session. You'll need to sign in again.
              </p>
              <Button
                variant="secondary"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut size={15} className="mr-1.5" />
                Sign Out
              </Button>
            </div>
          </div>
        )}

        {/* ══ Account tab ════════════════════════════════════════════════ */}
        {activeTab === 'account' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <SectionTitle>Export Data</SectionTitle>
              <p className="text-sm text-gray-500 mb-4">
                Download all your patient data and visit records as a ZIP archive. Takes up to 24 hours.
              </p>
              <Button variant="secondary">Request Data Export</Button>
            </div>

            <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} className="text-red-500" />
                <span className="font-bold text-red-700 text-sm">Danger Zone</span>
              </div>
              <p className="text-sm text-red-600 mb-4">
                Deleting your account permanently removes all patient records, visit notes, and AI summaries. This action <strong>cannot be undone</strong>.
              </p>
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={14} className="mr-1.5" />
                Delete Account
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <ConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
      />
      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {/* TODO: call delete account API */}}
        title="Delete Account"
        description="This will permanently delete your account and all data. This cannot be undone."
        confirmLabel="Delete Account"
        danger
      />
    </DoctorLayout>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold text-gray-800 pb-1 border-b border-gray-50">
      {Icon && <Icon size={14} className="text-gray-400" />}
      {children}
    </div>
  )
}

function ToggleRow({ label, desc, checked, onChange, warning }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</div>
        {warning && (
          <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <AlertTriangle size={10} /> {warning}
          </div>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${
          checked ? 'bg-emerald-500' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  )
}
