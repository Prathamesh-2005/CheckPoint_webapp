import { useState, useEffect } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Bell,
  Shield,
  CreditCard,
  Star,
  Award,
  Calendar,
  TrendingUp,
  Edit2,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ModeToggle } from "@/components/mode-toggle"
import { authService } from "@/services/authService"

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    bio: "",
    avatar: "",
  })

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: "",
        city: "",
        bio: "",
        avatar: user.profileImageUrl || "",
      })
    }
  }, [])

  // Remove hardcoded stats, these should come from backend
  const [stats, setStats] = useState({
    totalRides: 0,
    rating: 0,
    totalEarnings: "₹0",
    joinedDate: "Jan 2024",
    completionRate: 0,
    responseTime: "N/A",
  })

  const [settings, setSettings] = useState({
    notifications: {
      rideRequests: true,
      messages: true,
      updates: false,
      marketing: false,
    },
    privacy: {
      showPhone: true,
      showEmail: false,
      profileVisibility: "public",
    },
    preferences: {
      language: "en",
      currency: "INR",
      theme: "dark",
    },
  })

  const handleSaveProfile = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
      localStorage.setItem("user", JSON.stringify(profile))
    }, 1500)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#0a0a0a]">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-white">Profile & Settings</h1>
                <p className="text-xs md:text-sm text-white/40">Manage your account and preferences</p>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4 space-y-6">
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <Avatar className="h-24 w-24 border-4 border-white/10">
                          <AvatarImage src={profile.avatar} />
                          <AvatarFallback className="bg-blue-600 text-white text-2xl">
                            {profile.firstName[0]}{profile.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="sm"
                          className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>

                      <h2 className="text-xl font-semibold text-white mb-1">
                        {profile.firstName} {profile.lastName}
                      </h2>
                      <p className="text-sm text-white/60 mb-3">{profile.email}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-400">
                          <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                          {stats.rating}
                        </Badge>
                        <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-400">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>

                      <p className="text-sm text-white/80 mb-4">{profile.bio}</p>

                      <Separator className="bg-white/10 my-4" />

                      <div className="w-full space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Total Rides</span>
                          <span className="text-white font-medium">{stats.totalRides}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Member Since</span>
                          <span className="text-white font-medium">{stats.joinedDate}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Completion Rate</span>
                          <span className="text-white font-medium">{stats.completionRate}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Response Time</span>
                          <span className="text-white font-medium">{stats.responseTime}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white mb-1">{stats.totalEarnings}</p>
                      <p className="text-sm text-white/60">Total Earnings</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-8">
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                  <Tabs defaultValue="profile" className="w-full">
                    <CardHeader className="pb-3 border-b border-white/5">
                      <TabsList className="bg-white/5 border border-white/10 p-1 w-full sm:w-auto">
                        <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                          Profile
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                          Settings
                        </TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                          Security
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                          Preferences
                        </TabsTrigger>
                      </TabsList>
                    </CardHeader>

                    <CardContent className="p-6">
                      <TabsContent value="profile" className="space-y-6 mt-0">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                            <p className="text-sm text-white/60">Update your personal details</p>
                          </div>
                          {!isEditing ? (
                            <Button
                              size="sm"
                              onClick={() => setIsEditing(true)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="border-white/20"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {isSaving ? (
                                  <>
                                    <Save className="w-4 h-4 mr-2 animate-pulse" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Save
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-white/80">First Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                              <Input
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                disabled={!isEditing}
                                className="pl-10 bg-white/5 border-white/10 text-white disabled:opacity-60"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-white/80">Last Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                              <Input
                                value={profile.lastName}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                disabled={!isEditing}
                                className="pl-10 bg-white/5 border-white/10 text-white disabled:opacity-60"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-white/80">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                              <Input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                disabled={!isEditing}
                                className="pl-10 bg-white/5 border-white/10 text-white disabled:opacity-60"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-white/80">Phone</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                              <Input
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                disabled={!isEditing}
                                className="pl-10 bg-white/5 border-white/10 text-white disabled:opacity-60"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-sm text-white/80">City</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                              <Input
                                value={profile.city}
                                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                disabled={!isEditing}
                                className="pl-10 bg-white/5 border-white/10 text-white disabled:opacity-60"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-sm text-white/80">Bio</Label>
                            <Textarea
                              value={profile.bio}
                              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                              disabled={!isEditing}
                              rows={3}
                              className="bg-white/5 border-white/10 text-white disabled:opacity-60 resize-none"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="settings" className="space-y-6 mt-0">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Notification Settings</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-blue-400" />
                                <div>
                                  <p className="text-sm font-medium text-white">Ride Requests</p>
                                  <p className="text-xs text-white/60">Get notified when someone requests your ride</p>
                                </div>
                              </div>
                              <Switch
                                checked={settings.notifications.rideRequests}
                                onCheckedChange={(checked) =>
                                  setSettings({
                                    ...settings,
                                    notifications: { ...settings.notifications, rideRequests: checked },
                                  })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-blue-400" />
                                <div>
                                  <p className="text-sm font-medium text-white">Messages</p>
                                  <p className="text-xs text-white/60">Get notified of new messages</p>
                                </div>
                              </div>
                              <Switch
                                checked={settings.notifications.messages}
                                onCheckedChange={(checked) =>
                                  setSettings({
                                    ...settings,
                                    notifications: { ...settings.notifications, messages: checked },
                                  })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-blue-400" />
                                <div>
                                  <p className="text-sm font-medium text-white">App Updates</p>
                                  <p className="text-xs text-white/60">Get notified about app updates and features</p>
                                </div>
                              </div>
                              <Switch
                                checked={settings.notifications.updates}
                                onCheckedChange={(checked) =>
                                  setSettings({
                                    ...settings,
                                    notifications: { ...settings.notifications, updates: checked },
                                  })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-blue-400" />
                                <div>
                                  <p className="text-sm font-medium text-white">Marketing</p>
                                  <p className="text-xs text-white/60">Receive promotional offers and deals</p>
                                </div>
                              </div>
                              <Switch
                                checked={settings.notifications.marketing}
                                onCheckedChange={(checked) =>
                                  setSettings({
                                    ...settings,
                                    notifications: { ...settings.notifications, marketing: checked },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-white/10" />

                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Privacy Settings</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-blue-400" />
                                <div>
                                  <p className="text-sm font-medium text-white">Show Phone Number</p>
                                  <p className="text-xs text-white/60">Allow riders to see your phone number</p>
                                </div>
                              </div>
                              <Switch
                                checked={settings.privacy.showPhone}
                                onCheckedChange={(checked) =>
                                  setSettings({
                                    ...settings,
                                    privacy: { ...settings.privacy, showPhone: checked },
                                  })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-blue-400" />
                                <div>
                                  <p className="text-sm font-medium text-white">Show Email</p>
                                  <p className="text-xs text-white/60">Allow riders to see your email address</p>
                                </div>
                              </div>
                              <Switch
                                checked={settings.privacy.showEmail}
                                onCheckedChange={(checked) =>
                                  setSettings({
                                    ...settings,
                                    privacy: { ...settings.privacy, showEmail: checked },
                                  })
                                }
                              />
                            </div>

                            <div className="p-4 bg-white/5 rounded-lg">
                              <div className="flex items-center gap-3 mb-3">
                                <Shield className="w-5 h-5 text-blue-400" />
                                <div>
                                  <p className="text-sm font-medium text-white">Profile Visibility</p>
                                  <p className="text-xs text-white/60">Control who can see your profile</p>
                                </div>
                              </div>
                              <Select
                                value={settings.privacy.profileVisibility}
                                onValueChange={(value) =>
                                  setSettings({
                                    ...settings,
                                    privacy: { ...settings.privacy, profileVisibility: value },
                                  })
                                }
                              >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10">
                                  <SelectItem value="public">Public</SelectItem>
                                  <SelectItem value="riders-only">Riders Only</SelectItem>
                                  <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="security" className="space-y-6 mt-0">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm text-white/80">Current Password</Label>
                              <Input
                                type="password"
                                placeholder="Enter current password"
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-white/80">New Password</Label>
                              <Input
                                type="password"
                                placeholder="Enter new password"
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-white/80">Confirm New Password</Label>
                              <Input
                                type="password"
                                placeholder="Confirm new password"
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              Update Password
                            </Button>
                          </div>
                        </div>

                        <Separator className="bg-white/10" />

                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
                          <div className="p-4 bg-white/5 rounded-lg">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <p className="text-sm font-medium text-white mb-1">Enable 2FA</p>
                                <p className="text-xs text-white/60">Add an extra layer of security to your account</p>
                              </div>
                              <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-400">
                                Recommended
                              </Badge>
                            </div>
                            <Button variant="outline" className="border-white/20">
                              Set Up 2FA
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="preferences" className="space-y-6 mt-0">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">App Preferences</h3>
                          <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-lg">
                              <Label className="text-sm text-white/80 mb-2 block">Language</Label>
                              <Select value={settings.preferences.language} onValueChange={(value) =>
                                setSettings({
                                  ...settings,
                                  preferences: { ...settings.preferences, language: value },
                                })
                              }>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10">
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="hi">हिंदी</SelectItem>
                                  <SelectItem value="te">తెలుగు</SelectItem>
                                  <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="p-4 bg-white/5 rounded-lg">
                              <Label className="text-sm text-white/80 mb-2 block">Currency</Label>
                              <Select value={settings.preferences.currency} onValueChange={(value) =>
                                setSettings({
                                  ...settings,
                                  preferences: { ...settings.preferences, currency: value },
                                })
                              }>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10">
                                  <SelectItem value="INR">₹ INR</SelectItem>
                                  <SelectItem value="USD">$ USD</SelectItem>
                                  <SelectItem value="EUR">€ EUR</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="p-4 bg-white/5 rounded-lg">
                              <Label className="text-sm text-white/80 mb-2 block">Theme</Label>
                              <Select value={settings.preferences.theme} onValueChange={(value) =>
                                setSettings({
                                  ...settings,
                                  preferences: { ...settings.preferences, theme: value },
                                })
                              }>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10">
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-white/10" />

                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
                          <p className="text-sm text-white/60 mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                            Delete Account
                          </Button>
                        </div>
                      </TabsContent>
                    </CardContent>
                  </Tabs>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
