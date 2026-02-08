import { useState, useEffect } from "react"
import {
  User,
  Mail,
  Phone,
  Camera,
  Star,
  Award,
  TrendingUp,
  Edit2,
  Check,
  X,
  AlertCircle,
  Car as CarIcon,
  Link as LinkIcon,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { authService } from "@/services/authService"
import { userService } from "@/services/userService"
import { useToast } from "@/hooks/use-toast"

export function ProfilePage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileUrl: "",
    avatar: "",
  })

  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleModel: "",
    vehicleNumber: "",
    vehicleColor: "",
  })
  const [isEditingVehicle, setIsEditingVehicle] = useState(false)

  const [stats, setStats] = useState({
    rating: 4.8,
    totalRides: 0,
    totalEarnings: "₹0",
  })

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: "",
        profileUrl: "",
        avatar: user.profileImageUrl || "",
      })
    }

    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const profileData = await userService.getProfile()
      
      if (profileData.vehicleDetails) {
        setVehicleDetails({
          vehicleModel: profileData.vehicleDetails.vehicleModel || "",
          vehicleNumber: profileData.vehicleDetails.vehicleNumber || "",
          vehicleColor: profileData.vehicleDetails.vehicleColor || "",
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

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

  const handleSaveVehicle = async () => {
    try {
      await userService.updateVehicleDetails(vehicleDetails)
      
      // Update user in localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      user.vehicleDetails = vehicleDetails
      localStorage.setItem("user", JSON.stringify(user))
      
      setIsEditingVehicle(false)
      
      toast({
        title: "Success!",
        description: "Your vehicle details have been updated.",
      })
      
      loadProfile()
    } catch (error) {
      console.error('Failed to update vehicle:', error)
      toast({
        title: "Error",
        description: "Failed to update vehicle details. Please try again.",
        variant: "destructive",
      })
    }
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

                      <Separator className="bg-white/10 my-4" />

                      <div className="w-full space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Total Rides</span>
                          <span className="text-white font-medium">{stats.totalRides}</span>
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
                      <TabsList className="bg-white/5 border border-white/10 p-1 w-full grid grid-cols-2">
                        <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 text-sm">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </TabsTrigger>
                        <TabsTrigger value="vehicle" className="data-[state=active]:bg-blue-600 text-sm">
                          <CarIcon className="w-4 h-4 mr-2" />
                          Vehicle
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
                            <Label className="text-sm text-white/80 flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-400" />
                              First Name
                            </Label>
                            <Input
                              value={profile.firstName}
                              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                              disabled={!isEditing}
                              className="bg-white/5 border-white/10 text-white disabled:opacity-60 focus:border-blue-500 transition-colors"
                              placeholder="Enter first name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-white/80 flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-400" />
                              Last Name
                            </Label>
                            <Input
                              value={profile.lastName}
                              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                              disabled={!isEditing}
                              className="bg-white/5 border-white/10 text-white disabled:opacity-60 focus:border-blue-500 transition-colors"
                              placeholder="Enter last name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-white/80 flex items-center gap-2">
                              <Mail className="w-4 h-4 text-blue-400" />
                              Email
                            </Label>
                            <Input
                              type="email"
                              value={profile.email}
                              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                              disabled={!isEditing}
                              className="bg-white/5 border-white/10 text-white disabled:opacity-60 focus:border-blue-500 transition-colors"
                              placeholder="Enter email"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-white/80 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-blue-400" />
                              Phone Number
                            </Label>
                            <Input
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              disabled={!isEditing}
                              className="bg-white/5 border-white/10 text-white disabled:opacity-60 focus:border-blue-500 transition-colors"
                              placeholder="Enter phone number"
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-sm text-white/80 flex items-center gap-2">
                              <LinkIcon className="w-4 h-4 text-blue-400" />
                              Profile URL
                            </Label>
                            <Input
                              value={profile.profileUrl}
                              onChange={(e) => setProfile({ ...profile, profileUrl: e.target.value })}
                              disabled={!isEditing}
                              className="bg-white/5 border-white/10 text-white disabled:opacity-60 focus:border-blue-500 transition-colors"
                              placeholder="https://yourwebsite.com"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="vehicle" className="space-y-6 mt-0">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">Vehicle Information</h3>
                            <p className="text-sm text-white/60">Manage your vehicle details for ride offers</p>
                          </div>
                          {!isEditingVehicle ? (
                            <Button
                              size="sm"
                              onClick={() => setIsEditingVehicle(true)}
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
                                onClick={() => {
                                  setIsEditingVehicle(false)
                                  loadProfile()
                                }}
                                className="border-white/20 hover:bg-white/5"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveVehicle}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Save Changes
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-white/80 flex items-center gap-2">
                              <CarIcon className="w-4 h-4 text-blue-400" />
                              Vehicle Model *
                            </Label>
                            <Input
                              value={vehicleDetails.vehicleModel}
                              onChange={(e) => setVehicleDetails({ ...vehicleDetails, vehicleModel: e.target.value })}
                              disabled={!isEditingVehicle}
                              placeholder="e.g., Honda Activa, Royal Enfield"
                              className="bg-white/5 border-white/10 text-white disabled:opacity-60 placeholder:text-white/40 focus:border-blue-500 transition-colors"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-white/80 flex items-center gap-2">
                              <CarIcon className="w-4 h-4 text-blue-400" />
                              Vehicle Number *
                            </Label>
                            <Input
                              value={vehicleDetails.vehicleNumber}
                              onChange={(e) => setVehicleDetails({ ...vehicleDetails, vehicleNumber: e.target.value.toUpperCase() })}
                              disabled={!isEditingVehicle}
                              placeholder="e.g., KA-01-AB-1234"
                              className="bg-white/5 border-white/10 text-white disabled:opacity-60 placeholder:text-white/40 focus:border-blue-500 transition-colors"
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-sm text-white/80 flex items-center gap-2">
                              <CarIcon className="w-4 h-4 text-blue-400" />
                              Vehicle Color
                            </Label>
                            <Input
                              value={vehicleDetails.vehicleColor}
                              onChange={(e) => setVehicleDetails({ ...vehicleDetails, vehicleColor: e.target.value })}
                              disabled={!isEditingVehicle}
                              placeholder="e.g., Black, Red, Blue"
                              className="bg-white/5 border-white/10 text-white disabled:opacity-60 placeholder:text-white/40 focus:border-blue-500 transition-colors"
                            />
                          </div>
                        </div>

                        {!vehicleDetails.vehicleModel && !vehicleDetails.vehicleNumber && (
                          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-blue-300">No Vehicle Details</p>
                                <p className="text-xs text-white/60 mt-1">
                                  Add your vehicle details to start offering rides. This information will be shown to passengers for easy identification.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
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
