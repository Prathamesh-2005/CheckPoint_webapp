import { useState, useEffect } from "react"
import React from "react"
import {
  Home,
  Car,
  Search,
  MapPin,
  Users,
  Wallet,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Navigation,
  TrendingUp,
  Activity,
  ChevronRight,
  Menu,
  X,
  Clock,
  DollarSign,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Spinner } from "@/components/ui/spinner"
import { useNavigate } from "react-router-dom"
import { rideService } from "@/services/rideService"

export function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    activeRides: 0,
    totalTrips: 0,
    savedAmount: 0,
    liveTracking: "Active"
  })
  const [recentRides, setRecentRides] = useState<any[]>([])
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || '{"firstName":"User","email":"user@checkpoint.com"}')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const rides = await rideService.getMyRides()
      setRecentRides(rides.slice(0, 3))
      setStats({
        activeRides: rides.filter((r: any) => r.status === "IN_PROGRESS").length,
        totalTrips: rides.length,
        savedAmount: rides.reduce((acc: number, r: any) => acc + (r.price || 0), 0),
        liveTracking: "Active"
      })
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#0a0a0a]">
        <AppSidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-white">Welcome back, {user.firstName}</h1>
                  <p className="text-xs md:text-sm text-white/40 hidden sm:block">Here's what's happening with your rides today</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative h-9 w-9 text-white/60 hover:text-white hover:bg-white/5"
                  onClick={() => navigate("/notifications")}
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                </Button>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src={user.profileImageUrl} />
                  <AvatarFallback className="bg-white text-black text-xs">
                    {user.firstName?.[0]}{user.lastName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-4 md:p-8 space-y-6">
            {/* Stats Grid - Now Memoized */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                      <Car className="h-5 w-5 text-white/60" />
                    </div>
                    <span className="text-xs font-medium text-green-500">Live</span>
                  </div>
                  <div className="text-2xl font-semibold text-white mb-1">{stats.activeRides}</div>
                  <p className="text-xs text-white/40">Active Rides</p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                      <Activity className="h-5 w-5 text-white/60" />
                    </div>
                    <span className="text-xs font-medium text-green-500">+8%</span>
                  </div>
                  <div className="text-2xl font-semibold text-white mb-1">{stats.totalTrips}</div>
                  <p className="text-xs text-white/40">Total Trips</p>
                  <p className="text-xs text-white/30 mt-1">This month</p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                      <TrendingUp className="h-5 w-5 text-white/60" />
                    </div>
                    <span className="text-xs font-medium text-green-500">+23%</span>
                  </div>
                  <div className="text-2xl font-semibold text-white mb-1">₹{stats.savedAmount}</div>
                  <p className="text-xs text-white/40">Saved Amount</p>
                  <p className="text-xs text-white/30 mt-1">vs solo rides</p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                      <Navigation className="h-5 w-5 text-white/60" />
                    </div>
                    <span className="text-xs font-medium text-white/40">
                      Real-time
                    </span>
                  </div>
                  <div className="text-2xl font-semibold text-white mb-1">{stats.liveTracking}</div>
                  <p className="text-xs text-white/40">Live Tracking</p>
                  <p className="text-xs text-white/30 mt-1">Location enabled</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-white/5 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm hover:from-blue-500/20 hover:to-blue-600/10 transition-all cursor-pointer group"
                onClick={() => window.location.href = '/search'}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                      <Search className="h-6 w-6 text-blue-400" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-white/60 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Find a Ride</h3>
                  <p className="text-sm text-white/40 mb-4">Search for available rides near you</p>
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white border-0">
                    Search Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm hover:from-purple-500/20 hover:to-purple-600/10 transition-all cursor-pointer group"
                onClick={() => window.location.href = '/offer'}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                      <Car className="h-6 w-6 text-purple-400" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-white/60 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Offer a Ride</h3>
                  <p className="text-sm text-white/40 mb-4">Share your route with others</p>
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white border-0">
                    Create Ride
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Add Messages Quick Action */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-white/5 bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm hover:from-green-500/20 hover:to-green-600/10 transition-all cursor-pointer group"
                onClick={() => window.location.href = '/messages'}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                      <MessageCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-white/60 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Messages</h3>
                  <p className="text-sm text-white/40 mb-4">Chat with riders and drivers</p>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white border-0">
                    Open Chat
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Rides */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
              <CardHeader className="border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-white">Recent Activity</CardTitle>
                    <CardDescription className="text-sm text-white/40">
                      Your latest ride activity
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Spinner className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentRides.length === 0 ? (
                      <div className="p-8 text-center">
                        <Car className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">No recent rides</p>
                      </div>
                    ) : (
                      recentRides.map((ride) => (
                        <div
                          key={ride.id}
                          className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-all gap-3"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 shrink-0">
                              <Navigation className="h-5 w-5 text-white/60" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm mb-1 truncate">
                                {ride.from} → {ride.to}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-white/40">
                                <Clock className="h-3 h-3" />
                                <span>{new Date(ride.departureTime).toLocaleDateString()}</span>
                                <span>•</span>
                                {/* ✅ FIXED: Render driver name properly instead of object */}
                                {ride.driver && (
                                  <span>
                                    Driver: {ride.driver.firstName} {ride.driver.lastName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 md:ml-4">
                            <div className="flex items-center gap-1 text-white/60">
                              <DollarSign className="h-3 w-3" />
                              <span className="text-sm font-medium">{ride.price}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-white/10 text-white/60 text-xs"
                            >
                              {ride.role}
                            </Badge>
                            <Badge
                              className={`${ride.color} border text-xs`}
                            >
                              {ride.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
