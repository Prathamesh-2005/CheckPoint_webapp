import { useState, useEffect } from "react"
import {
  Calendar,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  User,
  Car,
  Filter,
  Search as SearchIcon,
  Phone,
  MessageSquare,
  X,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import { useNavigate } from "react-router-dom"
import { rideService } from "@/services/rideService"
import { bookingService } from "@/services/bookingService"

export function MyRidesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRide, setSelectedRide] = useState<any | null>(null)
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // ✅ Add this: Get current user to determine if they're the driver
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  // ✅ Add auto-refresh every 5 seconds to detect status changes
  useEffect(() => {
    loadRides()
    
    const interval = setInterval(() => {
      loadRides()
    }, 5000) // Refresh every 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  const loadRides = async () => {
    try {
      const data = await rideService.getMyRides()
      
      // ✅ Fetch all bookings once at the beginning
      const allBookings = await bookingService.getMyBookings()
      
      const currentUserId = currentUser.id
      const ridesWithBookings = data.map((ride: any) => {
        const isDriver = ride.driver?.id === currentUserId
        
        // ✅ Find booking for this ride
        const booking = allBookings.find((b: any) => b.ride?.id === ride.id)
        
        return { 
          ...ride, 
          userBooking: booking,
          isDriver 
        }
      })
      
      setRides(ridesWithBookings)
    } catch (error) {
      console.error("Failed to load rides:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRides = rides.filter((ride) => {
    const matchesSearch = searchQuery === ""
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "upcoming") return (ride.status === "REQUESTED" || ride.status === "CONFIRMED") && matchesSearch
    if (activeTab === "completed") return ride.status === "COMPLETED" && matchesSearch
    if (activeTab === "offered") return matchesSearch
    if (activeTab === "booked") return matchesSearch
    
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "REQUESTED":
      case "CONFIRMED":
        return "border-blue-500/50 bg-blue-500/10 text-blue-400"
      case "COMPLETED":
        return "border-green-500/50 bg-green-500/10 text-green-400"
      case "CANCELLED":
        return "border-red-500/50 bg-red-500/10 text-red-400"
      default:
        return "border-white/20 bg-white/5 text-white/60"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "REQUESTED":
      case "CONFIRMED":
        return <Clock className="w-3 h-3" />
      case "COMPLETED":
        return <CheckCircle2 className="w-3 h-3" />
      case "CANCELLED":
        return <AlertCircle className="w-3 h-3" />
      default:
        return null
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
                <h1 className="text-xl md:text-2xl font-semibold text-white">My Rides</h1>
                <p className="text-xs md:text-sm text-white/40">Manage your rides and bookings</p>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-12">
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg font-semibold text-white">All Rides</CardTitle>
                        <CardDescription className="text-xs text-white/40">
                          {filteredRides.length} rides found
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial sm:w-64">
                          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <Input
                            placeholder="Search rides..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <Separator className="bg-white/5" />

                  <div className="p-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="bg-white/5 border border-white/10 p-1 w-full sm:w-auto">
                        <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                          All
                        </TabsTrigger>
                        <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                          Upcoming
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                          Completed
                        </TabsTrigger>
                        <TabsTrigger value="offered" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                          Offered
                        </TabsTrigger>
                        <TabsTrigger value="booked" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                          Booked
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value={activeTab} className="mt-4">
                        <ScrollArea className="h-[calc(100vh-320px)]">
                          <div className="space-y-3 pr-4">
                            {filteredRides.length === 0 ? (
                              <Card className="border-white/5 bg-white/5">
                                <CardContent className="p-12 text-center">
                                  <Car className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                  <p className="text-white/60">No rides found</p>
                                  <p className="text-sm text-white/40 mt-1">Try adjusting your filters</p>
                                </CardContent>
                              </Card>
                            ) : (
                              filteredRides.map((ride) => {
                                // ✅ Determine if current user is the driver of this ride
                                const isDriver = currentUser.id === ride.driver?.id

                                return (
                                <Card
                                  key={ride.id}
                                  className="border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                  <CardContent className="p-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                      <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`text-xs ${getStatusColor(ride.status)}`}>
                                              {getStatusIcon(ride.status)}
                                              <span className="ml-1 capitalize">{ride.status}</span>
                                            </Badge>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span className="text-white font-medium">
                                              Lat: {ride.startLatitude}, Lng: {ride.startLongitude}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                                            <span className="text-white font-medium">
                                              Lat: {ride.endLatitude}, Lng: {ride.endLongitude}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                                          <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(ride.departureTime).toLocaleDateString()}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(ride.departureTime).toLocaleTimeString()}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-4 sm:min-w-[120px]">
                                        <div className="text-right">
                                          <div className="text-2xl font-bold text-white">₹{ride.price}</div>
                                          <p className="text-xs text-white/40">Total</p>
                                        </div>
                                        
                                        {/* ✅ Show chat button only for CONFIRMED/IN_PROGRESS rides with booking */}
                                        {ride.userBooking && (ride.status === 'CONFIRMED' || ride.status === 'IN_PROGRESS') && !ride.isDriver && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-white/20 w-full"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              const driverName = `${ride.driver?.firstName || ''} ${ride.driver?.lastName || ''}`.trim()
                                              navigate(`/chat?bookingId=${ride.userBooking.id}&name=${driverName}&avatar=${ride.driver?.profileImageUrl || ''}`)
                                            }}
                                          >
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Chat with Driver
                                          </Button>
                                        )}

                                        {/* ✅ Driver can see chat with passengers after accepting */}
                                        {ride.isDriver && (ride.status === 'CONFIRMED' || ride.status === 'IN_PROGRESS') && ride.userBooking && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-white/20 w-full"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              navigate(`/chat?bookingId=${ride.userBooking.id}&name=Passenger&avatar=`)
                                            }}
                                          >
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Chat with Passenger
                                          </Button>
                                        )}

                                        {ride.status === 'AVAILABLE' && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-white/20 mt-2"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              navigate(`/ride/${ride.id}`)
                                            }}
                                          >
                                            View Details
                                          </Button>
                                        )}
                                        
                                        {ride.status === 'CONFIRMED' && (
                                          <>
                                            <Button
                                              size="sm"
                                              className="bg-green-600 hover:bg-green-700 mt-2"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/ride/${ride.id}/track`)
                                              }}
                                            >
                                              {isDriver ? 'Start Ride' : 'Track Ride'}
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="border-white/20"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/ride/${ride.id}`)
                                              }}
                                            >
                                              Details
                                            </Button>
                                          </>
                                        )}
                                        
                                        {ride.status === 'IN_PROGRESS' && (
                                          <>
                                            <Button
                                              size="sm"
                                              className="bg-blue-600 hover:bg-blue-700 mt-2"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/ride/${ride.id}/track`)
                                              }}
                                            >
                                              Track Live
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="border-white/20"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/ride/${ride.id}`)
                                              }}
                                            >
                                              Details
                                            </Button>
                                          </>
                                        )}
                                        
                                        {ride.status === 'COMPLETED' && !isDriver && (
                                          <>
                                            <Button
                                              size="sm"
                                              className="bg-purple-600 hover:bg-purple-700 mt-2 w-full"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/ride/${ride.id}/payment`)
                                              }}
                                            >
                                              💳 Pay Now
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="border-white/20 w-full"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/ride/${ride.id}`)
                                              }}
                                            >
                                              Details
                                            </Button>
                                          </>
                                        )}
                                        
                                        {ride.status === 'COMPLETED' && isDriver && (
                                          <>
                                            <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                                              ✅ Completed
                                            </Badge>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="border-white/20"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/ride/${ride.id}`)
                                              }}
                                            >
                                              Details
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                )
                              })
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {selectedRide && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="border-white/10 bg-[#1a1a1a] max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <CardHeader className="border-b border-white/5">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-white">Ride Details</CardTitle>
                    <CardDescription className="text-xs text-white/40 mt-1">
                      Ride ID: #{selectedRide.id}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRide(null)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <ScrollArea className="max-h-[calc(90vh-180px)]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        selectedRide.type === "offered"
                          ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                          : "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                      }`}
                    >
                      {selectedRide.type === "offered" ? "Offered Ride" : "Booked Ride"}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(selectedRide.status)}`}>
                      {getStatusIcon(selectedRide.status)}
                      <span className="ml-1 capitalize">{selectedRide.status}</span>
                    </Badge>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-white">Route</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <MapPin className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-white/60">From</p>
                          <p className="text-sm text-white font-medium">{selectedRide.from}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-white/60">To</p>
                          <p className="text-sm text-white font-medium">{selectedRide.to}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Date</p>
                      <p className="text-sm text-white font-medium">{selectedRide.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Time</p>
                      <p className="text-sm text-white font-medium">{selectedRide.time}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Distance</p>
                      <p className="text-sm text-white font-medium">{selectedRide.distance}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Duration</p>
                      <p className="text-sm text-white font-medium">{selectedRide.duration}</p>
                    </div>
                  </div>

                  {selectedRide.vehicle && (
                    <>
                      <Separator className="bg-white/10" />
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2">Vehicle</h3>
                        <div className="p-3 bg-white/5 rounded-lg space-y-1">
                          <p className="text-sm text-white">{selectedRide.vehicle.model}</p>
                          <p className="text-xs text-white/60">{selectedRide.vehicle.number}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedRide.type === "booked" && selectedRide.driver && (
                    <>
                      <Separator className="bg-white/10" />
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-3">Driver Information</h3>
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                          <Avatar className="h-12 w-12 border-2 border-white/10">
                            <AvatarImage src={selectedRide.driver.avatar} />
                            <AvatarFallback className="bg-blue-600 text-white">
                              {selectedRide.driver.name.split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{selectedRide.driver.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              <span className="text-xs text-yellow-500">{selectedRide.driver.rating}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-white/20">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-white/20">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedRide.type === "offered" && selectedRide.passengers && selectedRide.passengers.length > 0 && (
                    <>
                      <Separator className="bg-white/10" />
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-3">Passengers</h3>
                        <div className="space-y-2">
                          {selectedRide.passengers.map((passenger: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                              <Avatar className="h-10 w-10 border-2 border-white/10">
                                <AvatarImage src={passenger.avatar} />
                                <AvatarFallback className="bg-blue-600 text-white text-xs">
                                  {passenger.name.split(" ").map((n: string) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white">{passenger.name}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                  <span className="text-xs text-yellow-500">{passenger.rating}</span>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={passenger.status === "confirmed" 
                                  ? "border-green-500/50 bg-green-500/10 text-green-400 text-xs"
                                  : "border-yellow-500/50 bg-yellow-500/10 text-yellow-400 text-xs"
                                }
                              >
                                {passenger.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <div>
                      <p className="text-xs text-blue-400 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-white">₹{selectedRide.price}</p>
                    </div>
                  </div>
                </CardContent>
              </ScrollArea>
              <div className="border-t border-white/5 p-4 flex gap-2">
                {selectedRide.status === "upcoming" && (
                  <>
                    <Button className="flex-1 bg-red-600 hover:bg-red-700">
                      Cancel Ride
                    </Button>
                    {selectedRide.type === "booked" && (
                      <Button variant="outline" className="flex-1 border-white/20">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Driver
                      </Button>
                    )}
                  </>
                )}
                {selectedRide.status === "completed" && (
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Star className="w-4 h-4 mr-2" />
                    Rate {selectedRide.type === "offered" ? "Passenger" : "Driver"}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </SidebarProvider>
  )
}
