"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
  Languages,
  Save,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

type Tab = "profile" | "organization" | "language"

const tabs = [
  { id: "profile" as Tab, name: "Profile", icon: User },
  { id: "organization" as Tab, name: "Organization", icon: Building2 },
  { id: "language" as Tab, name: "Language", icon: Languages },
]

export default function AccountPage() {
  const searchParams = useSearchParams()
  const { user, isLoaded: userLoaded } = useUser()
  const { organization, isLoaded: orgLoaded } = useOrganization()
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("English (US)")

  const isLoaded = userLoaded && orgLoaded
  const orgMetadata = organization?.publicMetadata as any || {}

  // Set active tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab") as Tab
    if (tab && tabs.find(t => t.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleSaveLanguage = async () => {
    setIsSaving(true)
    try {
      // In a real implementation, this would save to user preferences
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Language settings updated")
    } catch (error) {
      toast.error("Failed to update settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-1 flex-col p-8 w-full">
        <div className="mb-8">
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
    <div className="flex flex-1 flex-col p-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2 font-heading">
          Account Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your profile, organization, and preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <nav className="w-64 space-y-1 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.name}
              </button>
            )
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-card border rounded-sm p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1 font-heading">
                    Profile Information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your personal details from your account
                  </p>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div className="flex items-start gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                      <AvatarFallback className="text-2xl">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>First Name</Label>
                          <Input
                            value={user?.firstName || ""}
                            className="h-10 rounded-sm mt-1.5 bg-muted"
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <Input
                            value={user?.lastName || ""}
                            className="h-10 rounded-sm mt-1.5 bg-muted"
                            readOnly
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Email Address</Label>
                        <Input
                          value={user?.primaryEmailAddress?.emailAddress || ""}
                          className="h-10 rounded-sm mt-1.5 bg-muted"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Organization Tab */}
            {activeTab === "organization" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1 font-heading">
                    Organization Settings
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Information about your organization
                  </p>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="shrink-0">
                      {orgMetadata?.logoUrl ? (
                        <Avatar className="h-20 w-20 rounded-sm">
                          <AvatarImage src={orgMetadata.logoUrl} alt={organization?.name || "Organization"} />
                          <AvatarFallback className="rounded-sm">
                            <Building2 className="h-10 w-10" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-20 w-20 rounded-sm bg-primary/10 flex items-center justify-center border">
                          <Building2 className="h-10 w-10 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label>Organization Name</Label>
                      <Input
                        value={organization?.name || ""}
                        className="h-10 rounded-sm mt-1.5 bg-muted"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Industry</Label>
                      <Input
                        value={orgMetadata?.industry || "Not specified"}
                        className="h-10 rounded-sm mt-1.5 bg-muted"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Company Size</Label>
                      <Input
                        value={orgMetadata?.companySize || "Not specified"}
                        className="h-10 rounded-sm mt-1.5 bg-muted"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Country</Label>
                      <Input
                        value={orgMetadata?.country || "Not specified"}
                        className="h-10 rounded-sm mt-1.5 bg-muted"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Team Size</Label>
                      <Input
                        value={orgMetadata?.teamSize || "Not specified"}
                        className="h-10 rounded-sm mt-1.5 bg-muted"
                        readOnly
                      />
                    </div>
                  </div>

                  {orgMetadata?.website && (
                    <div>
                      <Label>Website</Label>
                      <Input
                        value={orgMetadata.website}
                        className="h-10 rounded-sm mt-1.5 bg-muted"
                        readOnly
                      />
                    </div>
                  )}

                  {orgMetadata?.billingEmail && (
                    <div>
                      <Label>Billing Email</Label>
                      <Input
                        value={orgMetadata.billingEmail}
                        className="h-10 rounded-sm mt-1.5 bg-muted"
                        readOnly
                      />
                    </div>
                  )}

                  {orgMetadata?.onboardedAt && (
                    <div>
                      <Label>Member Since</Label>
                      <Input
                        value={new Date(orgMetadata.onboardedAt).toLocaleString('en-US', { 
                          dateStyle: 'long', 
                          timeStyle: 'short' 
                        })}
                        className="h-10 rounded-sm mt-1.5 bg-muted"
                        readOnly
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Language Tab */}
            {activeTab === "language" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1 font-heading">
                    Language
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred language for the interface
                  </p>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="language">Interface Language</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="h-10 rounded-sm mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English (US)">English (US)</SelectItem>
                        <SelectItem value="English (UK)">English (UK)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      Currently, only English variants are available. More languages coming soon.
                    </p>
                  </div>

                  <div className="bg-muted/30 border rounded-sm p-4">
                    <p className="text-sm text-muted-foreground">
                      Language settings will be applied automatically across the application.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={handleSaveLanguage}
                    disabled={isSaving}
                    className="h-10 rounded-sm"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
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
