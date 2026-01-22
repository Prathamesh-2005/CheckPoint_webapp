import { useState } from "react"
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

interface Ride {
  id: number
  type: "offered" | "booked"
  status: "upcoming" | "completed" | "cancelled"
  from: string
  to: string
  date: string
  time: string
  price: string
  distance: string
  duration: string
  stops?: string[]
  vehicle?: {
    model: string
    number: string
  }
  rider?: {
    name: string
    avatar: string
    rating: number
    phone: string
  }
  driver?: {
    name: string
    avatar: string
    rating: number
    phone: string
  }
  passengers?: Array<{
    name: string
    avatar: string
    rating: number
    status: "confirmed" | "pending"
  }>
}

const mockRides: Ride[] = [
  {
    id: 1,
    type: "offered",
    status: "upcoming",
    from: "Koramangala",
    to: "Whitefield",
    date: "2024-01-15",
    time: "09:00 AM",
    price: "250",
    distance: "14.5 km",
    duration: "35 min",
    vehicle: {
      model: "Royal Enfield Classic 350",
      number: "KA 01 AB 1234",
    },
    passengers: [
      {
        name: "Priya Sharma",
        avatar: "",
        rating: 4.8,
        status: "confirmed",
      },
    ],
  },
  {
    id: 2,
    type: "booked",
    status: "upcoming",
    from: "Indiranagar",
    to: "Electronic City",
    date: "2024-01-16",
    time: "06:00 PM",
    price: "320",
    distance: "18.2 km",
    duration: "45 min",
    driver: {
      name: "Rahul Kumar",
      avatar: "",
      rating: 4.9,
      phone: "+91 98765 43210",
    },
    vehicle: {
      model: "Bajaj Pulsar NS200",
      number: "KA 05 CD 5678",
    },
  },
  {
    id: 3,
    type: "offered",
    status: "completed",
    from: "Marathahalli",
    to: "HSR Layout",
    date: "2024-01-10",
    time: "08:30 AM",
    price: "180",
    distance: "9.5 km",
    duration: "25 min",
    vehicle: {
      model: "Honda Activa 6G",
      number: "KA 02 EF 9012",
    },
    passengers: [
      {
        name: "Amit Singh",
        avatar: "",
        rating: 4.7,
        status: "confirmed",
      },
    ],
  },
  {
    id: 4,
    type: "booked",
    status: "completed",
    from: "Jayanagar",
    to: "MG Road",
    date: "2024-01-08",
    time: "05:15 PM",
    price: "150",
    distance: "7.8 km",
    duration: "20 min",
    driver: {
      name: "Sneha Reddy",
      avatar: "",
      rating: 5.0,
      phone: "+91 98765 11111",
    },
    vehicle: {
      model: "TVS Apache RTR 160",
      number: "KA 03 GH 3456",
    },
  },
  {
    id: 5,
    type: "offered",
    status: "cancelled",
    from: "Bellandur",
    to: "Koramangala",
    date: "2024-01-12",
    time: "07:00 AM",
    price: "120",
    distance: "5.5 km",
    duration: "15 min",
    vehicle: {
      model: "Suzuki Gixxer SF",
      number: "KA 04 IJ 7890",
    },
    passengers: [],
  },
]

export function MyRidesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const navigate = useNavigate()

  const filteredRides = mockRides.filter((ride) => {
    const matchesSearch = 
      ride.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.to.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "offered") return ride.type === "offered" && matchesSearch
    if (activeTab === "booked") return ride.type === "booked" && matchesSearch
    if (activeTab === "upcoming") return ride.status === "upcoming" && matchesSearch
    if (activeTab === "completed") return ride.status === "completed" && matchesSearch
    
    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "border-blue-500/50 bg-blue-500/10 text-blue-400"
      case "completed":
        return "border-green-500/50 bg-green-500/10 text-green-400"
      case "cancelled":
        return "border-red-500/50 bg-red-500/10 text-red-400"
      default:
        return "border-white/20 bg-white/5 text-white/60"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="w-3 h-3" />
      case "completed":
        return <CheckCircle2 className="w-3 h-3" />
      case "cancelled":
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
                              filteredRides.map((ride) => (
                                <Card
                                  key={ride.id}
                                  className="border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                                  onClick={() => setSelectedRide(ride)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                      <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            <Badge
                                              variant="outline"
                                              className={`text-xs ${
                                                ride.type === "offered"
                                                  ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                                                  : "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                                              }`}
                                            >
                                              {ride.type === "offered" ? (
                                                <>
                                                  <Car className="w-3 h-3 mr-1" />
                                                  Offered
                                                </>
                                              ) : (
                                                <>
                                                  <User className="w-3 h-3 mr-1" />
                                                  Booked
                                                </>
                                              )}
                                            </Badge>
                                            <Badge variant="outline" className={`text-xs ${getStatusColor(ride.status)}`}>
                                              {getStatusIcon(ride.status)}
                                              <span className="ml-1 capitalize">{ride.status}</span>
                                            </Badge>
                                          </div>
                                        </div>

                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span className="text-white font-medium">{ride.from}</span>
                                          </div>
                                          <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                                            <span className="text-white font-medium">{ride.to}</span>
                                          </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                                          <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{ride.date}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{ride.time}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <ChevronRight className="w-3 h-3" />
                                            <span>{ride.distance} • {ride.duration}</span>
                                          </div>
                                        </div>

                                        {ride.vehicle && (
                                          <div className="flex items-center gap-2 text-xs text-white/60 bg-white/5 px-3 py-2 rounded">
                                            <Car className="w-3 h-3" />
                                            <span>{ride.vehicle.model} • {ride.vehicle.number}</span>
                                          </div>
                                        )}

                                        {ride.type === "offered" && ride.passengers && ride.passengers.length > 0 && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-white/60">Passengers:</span>
                                            {ride.passengers.map((passenger, idx) => (
                                              <div key={idx} className="flex items-center gap-1">
                                                <Avatar className="h-6 w-6 border border-white/10">
                                                  <AvatarImage src={passenger.avatar} />
                                                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                                                    {passenger.name.split(" ").map(n => n[0]).join("")}
                                                  </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs text-white/80">{passenger.name}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {ride.type === "booked" && ride.driver && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-white/60">Driver:</span>
                                            <div className="flex items-center gap-2">
                                              <Avatar className="h-6 w-6 border border-white/10">
                                                <AvatarImage src={ride.driver.avatar} />
                                                <AvatarFallback className="bg-blue-600 text-white text-xs">
                                                  {ride.driver.name.split(" ").map(n => n[0]).join("")}
                                                </AvatarFallback>
                                              </Avatar>
                                              <span className="text-xs text-white/80">{ride.driver.name}</span>
                                              <div className="flex items-center gap-0.5">
                                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                <span className="text-xs text-yellow-500">{ride.driver.rating}</span>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-4 sm:min-w-[120px]">
                                        <div className="text-right">
                                          <div className="text-2xl font-bold text-white">₹{ride.price}</div>
                                          <p className="text-xs text-white/40">Total</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-white/40" />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
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
                              {selectedRide.driver.name.split(" ").map(n => n[0]).join("")}
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
                          {selectedRide.passengers.map((passenger, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                              <Avatar className="h-10 w-10 border-2 border-white/10">
                                <AvatarImage src={passenger.avatar} />
                                <AvatarFallback className="bg-blue-600 text-white text-xs">
                                  {passenger.name.split(" ").map(n => n[0]).join("")}
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
