import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  Shield,
  CheckCircle2,
  Phone,
  MessageCircle,
  Navigation,
  DollarSign,
  AlertCircle,
  Info,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Mock ride data (in real app, fetch by ID)
const mockRideDetails = {
  id: "1",
  driver: {
    id: "driver123",
    name: "Rahul Kumar",
    rating: 4.8,
    totalTrips: 124,
    avatar: "",
    phoneNumber: "+91 98765 43210",
    verified: true,
    memberSince: "Jan 2023",
    bio: "Safe and punctual rider. Love long rides and meeting new people!",
  },
  vehicle: {
    model: "Royal Enfield Classic 350",
    number: "KA 01 AB 1234",
    color: "Black",
    year: 2022,
  },
  route: {
    from: "Indiranagar Metro Station, Bangalore",
    to: "Whitefield IT Park, Bangalore",
    fromCoords: { lat: 12.9716, lng: 77.5946 },
    toCoords: { lat: 12.9698, lng: 77.7499 },
    distance: "12.5 km",
    duration: "35 mins",
    stops: ["Marathahalli Junction", "Kundalahalli Gate"],
  },
  schedule: {
    date: "Today",
    time: "5:30 PM",
    flexibleTime: "± 15 mins",
  },
  pricing: {
    amount: 320,
    currency: "₹",
    breakdown: {
      baseFare: 250,
      platformFee: 50,
      gst: 20,
    },
  },
  seats: {
    available: 1,
    total: 1,
  },
  preferences: {
    luggage: "Small backpack only",
    smoking: false,
    music: true,
    chat: "Moderate",
  },
  policies: {
    cancellation: "Free cancellation up to 2 hours before departure",
    waiting: "Driver will wait for 5 minutes",
    helmet: "Provided",
  },
}

export function RideDetailsPage() {
  const navigate = useNavigate()
  const { rideId } = useParams()
  const [isBooking, setIsBooking] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const ride = mockRideDetails

  const handleBookRide = () => {
    setIsBooking(true)
    setTimeout(() => {
      setIsBooking(false)
      // Navigate to payment page
      navigate(`/ride/${rideId}/payment`)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white/60 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-white">Ride Details</h1>
              <p className="text-xs md:text-sm text-white/40">Review before booking</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Driver Info */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={ride.driver.avatar} />
                    <AvatarFallback className="bg-blue-600 text-white text-lg">
                      {ride.driver.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-bold text-white">{ride.driver.name}</h2>
                          {ride.driver.verified && (
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/60">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="font-semibold">{ride.driver.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{ride.driver.totalTrips} trips</span>
                          <span>•</span>
                          <span>Since {ride.driver.memberSince}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 mb-4">{ride.driver.bio}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white/80"
                        onClick={() => navigate('/messages')}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white/80"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Route Details */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-400" />
                  Route Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div className="w-0.5 h-16 bg-white/20" />
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div>
                        <p className="text-xs text-white/40 mb-1">Pickup</p>
                        <p className="text-white font-medium">{ride.route.from}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Drop</p>
                        <p className="text-white font-medium">{ride.route.to}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-sm">{ride.route.distance}</p>
                      <p className="text-white/40 text-xs">{ride.route.duration}</p>
                    </div>
                  </div>

                  {ride.route.stops.length > 0 && (
                    <>
                      <Separator className="bg-white/10" />
                      <div>
                        <p className="text-xs text-white/60 mb-2">Stops along the way</p>
                        <div className="flex flex-wrap gap-2">
                          {ride.route.stops.map((stop, index) => (
                            <Badge key={index} variant="outline" className="border-white/20 text-white/60">
                              {stop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Date</p>
                    <p className="text-white font-semibold">{ride.schedule.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Time</p>
                    <p className="text-white font-semibold">{ride.schedule.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Flexibility</p>
                    <p className="text-white font-semibold">{ride.schedule.flexibleTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Info */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  🏍️ Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Model</p>
                    <p className="text-white font-semibold">{ride.vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Number</p>
                    <p className="text-white font-semibold">{ride.vehicle.number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Color</p>
                    <p className="text-white font-semibold">{ride.vehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Year</p>
                    <p className="text-white font-semibold">{ride.vehicle.year}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences & Policies */}
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Ride Preferences & Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-white mb-2">Preferences</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-white/70">Music: {ride.preferences.music ? 'Allowed' : 'No'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-white/70">Smoking: {ride.preferences.smoking ? 'Allowed' : 'Not allowed'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-white/70">Luggage: {ride.preferences.luggage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-white/70">Chat level: {ride.preferences.chat}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div>
                  <p className="text-sm font-semibold text-white mb-2">Policies</p>
                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{ride.policies.cancellation}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{ride.policies.waiting}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Helmet: {ride.policies.helmet}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-4">
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm sticky top-24">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-3xl font-bold text-white">{ride.pricing.currency}{ride.pricing.amount}</span>
                      <span className="text-white/60 text-sm ml-2">per seat</span>
                    </div>
                  </div>
                  <div className="text-sm text-white/60">
                    <div className="flex justify-between mb-1">
                      <span>Base fare</span>
                      <span>₹{ride.pricing.breakdown.baseFare}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Platform fee</span>
                      <span>₹{ride.pricing.breakdown.platformFee}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>GST (18%)</span>
                      <span>₹{ride.pricing.breakdown.gst}</span>
                    </div>
                    <Separator className="bg-white/10 my-2" />
                    <div className="flex justify-between font-semibold text-white">
                      <span>Total</span>
                      <span>₹{ride.pricing.amount}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">Seats Available</span>
                  </div>
                  <p className="text-white text-lg font-bold">{ride.seats.available} of {ride.seats.total}</p>
                </div>

                <Button
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold mb-3"
                  onClick={handleBookRide}
                  disabled={isBooking || ride.seats.available === 0}
                >
                  {isBooking ? 'Booking...' : 'Book This Ride'}
                </Button>

                <div className="space-y-2 text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Safe and verified rider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span>Pay after ride completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span>{ride.policies.cancellation}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="border-green-500/50 bg-[#1a1a1a] max-w-md w-full">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Booking Confirmed!</h3>
              <p className="text-white/60 mb-4">Your ride has been booked successfully. The driver will contact you shortly.</p>
              <Button
                onClick={() => navigate('/my-rides')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                View My Rides
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
