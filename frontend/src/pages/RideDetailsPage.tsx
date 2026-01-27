import { useState, useEffect } from "react"
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
import { Loader2 } from "lucide-react"
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { rideService } from "@/services/rideService"
import { bookingService } from "@/services/bookingService"

export function RideDetailsPage() {
  const navigate = useNavigate()
  const { rideId } = useParams()
  const [isBooking, setIsBooking] = useState(false)
  const [ride, setRide] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    loadRideDetails()
  }, [rideId])

  const loadRideDetails = async () => {
    try {
      const data = await rideService.getRideById(rideId!)
      setRide(data)
    } catch (error) {
      console.error("Failed to load ride:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookRide = async () => {
    setIsBooking(true)
    try {
      const bookingResponse = await bookingService.requestRide(rideId!)
      setBooking(bookingResponse)
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        navigate('/my-rides')
      }, 2000)
    } catch (error: any) {
      alert(error.message || "Failed to book ride")
    } finally {
      setIsBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <p className="text-white">Ride not found</p>
      </div>
    )
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
                    <AvatarImage src={ride.driver?.profileImageUrl} />
                    <AvatarFallback className="bg-blue-600 text-white text-lg">
                      {ride.driver?.firstName?.[0]}{ride.driver?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-white">
                        {ride.driver?.firstName} {ride.driver?.lastName}
                      </h2>
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <p className="text-sm text-white/60">Driver</p>
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
                        <p className="text-white font-medium">
                          Lat: {ride.startLatitude}, Lng: {ride.startLongitude}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Drop</p>
                        <p className="text-white font-medium">
                          Lat: {ride.endLatitude}, Lng: {ride.endLongitude}
                        </p>
                      </div>
                    </div>
                  </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Date & Time</p>
                    <p className="text-white font-semibold">
                      {new Date(ride.departureTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Status</p>
                    <p className="text-white font-semibold">{ride.status}</p>
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
                      <span className="text-3xl font-bold text-white">₹{ride.price}</span>
                      <span className="text-white/60 text-sm ml-2">per seat</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">Seats Available</span>
                  </div>
                  <p className="text-white text-lg font-bold">{ride.availableSeats}</p>
                </div>

                <Button
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold mb-3"
                  onClick={handleBookRide}
                  disabled={isBooking || ride.availableSeats === 0}
                >
                  {isBooking ? 'Booking...' : 'Book This Ride'}
                </Button>

                {/* ✅ Only show chat button if user has a booking */}
                {booking && (
                  <Button
                    variant="outline"
                    className="w-full h-12 border-white/20 text-white hover:bg-white/10 mb-3"
                    onClick={() => navigate(`/chat?bookingId=${booking.id}&name=${ride.driver?.firstName} ${ride.driver?.lastName}&avatar=${ride.driver?.profileImageUrl || ''}`)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat with Driver
                  </Button>
                )}

                <div className="space-y-2 text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Safe and verified rider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span>Pay after ride completion</span>
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
