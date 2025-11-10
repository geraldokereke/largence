"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser, useOrganization } from "@clerk/nextjs"
import { Button } from "@largence/components/ui/button"
import { Input } from "@largence/components/ui/input"
import { Label } from "@largence/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@largence/components/ui/select"
import { Skeleton } from "@largence/components/ui/skeleton"
import { Separator } from "@largence/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@largence/components/ui/avatar"
import {
  User,
  Building2,
  Globe,
  CreditCard,
  Shield,
  Settings,
  Bell,
  Palette,
  Languages,
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Check,
} from "lucide-react"

type Tab = "profile" | "organization" | "language" | "billing" | "privacy" | "notifications" | "preferences"

const tabs = [
  { id: "profile" as Tab, name: "Profile & Info", icon: User },
  { id: "organization" as Tab, name: "Organization", icon: Building2 },
  { id: "language" as Tab, name: "Language & Region", icon: Languages },
  { id: "billing" as Tab, name: "Billing", icon: CreditCard },
  { id: "privacy" as Tab, name: "Privacy & Security", icon: Shield },
  { id: "notifications" as Tab, name: "Notifications", icon: Bell },
  { id: "preferences" as Tab, name: "Preferences", icon: Settings },
]

const languages = [
  "English (US)",
  "English (UK)",
  "French",
  "German",
  "Spanish",
  "Portuguese",
  "Italian",
  "Dutch",
  "Arabic",
  "Chinese (Simplified)",
]

const timezones = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Lagos",
  "Africa/Cairo",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
]

export default function AccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded: userLoaded } = useUser()
  const { organization, isLoaded: orgLoaded } = useOrganization()
  const [activeTab, setActiveTab] = useState<Tab>("profile")

  const isLoaded = userLoaded && orgLoaded

  // Set active tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab") as Tab
    if (tab && tabs.find(t => t.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "1" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setActiveTab("profile")
      }
      if (e.key === "2" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setActiveTab("organization")
      }
      if (e.key === "3" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setActiveTab("language")
      }
      if (e.key === "4" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setActiveTab("billing")
      }
      if (e.key === "5" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setActiveTab("privacy")
      }
      if (e.key === "6" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setActiveTab("notifications")
      }
      if (e.key === "7" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setActiveTab("preferences")
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  if (!isLoaded) {
    return (
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-6">
          <div className="w-64">
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full mb-2" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1 font-(family-name:--font-general-sans)">
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, organization, and preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <nav className="w-64 space-y-1">
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.name}
                </div>
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100">
                  ⌘{index + 1}
                </kbd>
              </button>
            )
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-card border rounded-sm p-6">
            {/* Profile & Info Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1 font-(family-name:--font-general-sans)">
                    Profile Information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Update your personal information and profile details
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                        <AvatarFallback className="text-2xl">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            defaultValue={user?.firstName || ""}
                            className="h-9 rounded-sm mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            defaultValue={user?.lastName || ""}
                            className="h-9 rounded-sm mt-1.5"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                          className="h-9 rounded-sm mt-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="h-9 rounded-sm mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      placeholder="Tell us a bit about yourself..."
                      className="w-full min-h-24 px-3 py-2 rounded-sm border border-input bg-background mt-1.5 text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button className="h-9 rounded-sm">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Organization Tab */}
            {activeTab === "organization" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1 font-(family-name:--font-general-sans)">
                    Organization Settings
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your organization details and settings
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      {organization?.imageUrl ? (
                        <Avatar className="h-20 w-20 rounded-sm">
                          <AvatarImage src={organization.imageUrl} alt={organization.name || "Organization"} />
                          <AvatarFallback className="rounded-sm text-2xl">
                            <Building2 className="h-10 w-10" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-20 w-20 rounded-sm bg-primary/10 flex items-center justify-center border">
                          <Building2 className="h-10 w-10 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <Label htmlFor="orgName">Organization Name</Label>
                        <Input
                          id="orgName"
                          defaultValue={organization?.name || ""}
                          className="h-9 rounded-sm mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="orgSlug">Organization Subdomain</Label>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Input
                            id="orgSlug"
                            defaultValue={organization?.slug || ""}
                            className="h-9 rounded-sm"
                          />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            .largence.com
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select>
                        <SelectTrigger className="h-9 rounded-sm mt-1.5">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Technology & Software</SelectItem>
                          <SelectItem value="finance">Financial Services</SelectItem>
                          <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                          <SelectItem value="legal">Legal Services</SelectItem>
                          <SelectItem value="realestate">Real Estate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="size">Company Size</Label>
                      <Select>
                        <SelectTrigger className="h-9 rounded-sm mt-1.5">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501+">501+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      className="h-9 rounded-sm mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street, City, Country"
                      className="h-9 rounded-sm mt-1.5"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button className="h-9 rounded-sm">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Language & Region Tab */}
            {activeTab === "language" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1 font-(family-name:--font-general-sans)">
                    Language & Region
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Set your preferred language, timezone, and regional settings
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="English (US)">
                      <SelectTrigger className="h-9 rounded-sm mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="UTC">
                      <SelectTrigger className="h-9 rounded-sm mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select defaultValue="mm/dd/yyyy">
                      <SelectTrigger className="h-9 rounded-sm mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <Select defaultValue="12h">
                      <SelectTrigger className="h-9 rounded-sm mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button className="h-9 rounded-sm">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1 font-(family-name:--font-general-sans)">
                    Billing & Subscription
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your subscription, payment methods, and billing history
                  </p>
                </div>

                <Separator />

                {/* Current Plan */}
                <div className="bg-muted/50 rounded-sm p-4 border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">Pro Plan</h3>
                      <p className="text-sm text-muted-foreground">$99/month</p>
                    </div>
                    <Button variant="outline" className="h-8 rounded-sm text-xs">
                      Change Plan
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Unlimited documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Advanced AI generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Team collaboration</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <Label className="mb-3 block">Payment Method</Label>
                  <div className="border rounded-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 bg-muted rounded-sm flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                        <p className="text-xs text-muted-foreground">Expires 12/2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 rounded-sm text-xs">
                      Update
                    </Button>
                  </div>
                </div>

                {/* Billing Information */}
                <div className="space-y-4">
                  <Label>Billing Information</Label>
                  <div>
                    <Label htmlFor="billingEmail">Billing Email</Label>
                    <Input
                      id="billingEmail"
                      type="email"
                      placeholder="billing@example.com"
                      className="h-9 rounded-sm mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Input
                      id="billingAddress"
                      placeholder="123 Main St, City, Country"
                      className="h-9 rounded-sm mt-1.5"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button className="h-9 rounded-sm">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Privacy & Security Tab */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1 font-(family-name:--font-general-sans)">
                    Privacy & Security
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your privacy settings and account security
                  </p>
                </div>

                <Separator />

                {/* Password */}
                <div className="space-y-4">
                  <Label>Change Password</Label>
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      className="h-9 rounded-sm mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      className="h-9 rounded-sm mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="h-9 rounded-sm mt-1.5"
                    />
                  </div>
                  <Button variant="outline" className="h-9 rounded-sm">
                    Update Password
                  </Button>
                </div>

                <Separator />

                {/* Two-Factor Authentication */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline" className="h-9 rounded-sm">
                      Enable
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Sessions */}
                <div className="space-y-3">
                  <Label className="text-base">Active Sessions</Label>
                  <div className="space-y-2">
                    <div className="border rounded-sm p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Current Session</p>
                        <p className="text-xs text-muted-foreground">
                          macOS • Chrome • Lagos, Nigeria
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">Active now</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 rounded-sm text-xs">
                    Sign Out All Sessions
                  </Button>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button className="h-9 rounded-sm">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1 font-(family-name:--font-general-sans)">
                    Notification Preferences
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose how and when you want to be notified
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  {[
                    { title: "Document Updates", desc: "Get notified when documents are shared or updated" },
                    { title: "Team Activity", desc: "Notifications about team member actions" },
                    { title: "Comments & Mentions", desc: "When someone comments or mentions you" },
                    { title: "System Updates", desc: "Important updates about the platform" },
                    { title: "Marketing Emails", desc: "Tips, news, and product updates" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs">
                          <input type="checkbox" defaultChecked className="rounded" />
                          Email
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input type="checkbox" defaultChecked className="rounded" />
                          Push
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button className="h-9 rounded-sm">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1 font-(family-name:--font-general-sans)">
                    App Preferences
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Customize your app experience and interface
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select defaultValue="system">
                      <SelectTrigger className="h-9 rounded-sm mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sidebarPosition">Sidebar Position</Label>
                    <Select defaultValue="left">
                      <SelectTrigger className="h-9 rounded-sm mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">Compact View</p>
                        <p className="text-xs text-muted-foreground">Use smaller spacing and fonts</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">Show Recent Documents</p>
                        <p className="text-xs text-muted-foreground">Display recently accessed documents</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">Auto-save</p>
                        <p className="text-xs text-muted-foreground">Automatically save changes</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button className="h-9 rounded-sm">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
