import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Navigation,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  User,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { rideService } from "@/services/rideService"
import { locationService } from "@/services/locationService"
import { Loader2 } from "lucide-react"

// Custom marker icons
const passengerIcon = L.divIcon({
  html: `<div style="
    background-color: #3b82f6; 
    width: 40px; 
    height: 40px; 
    border-radius: 50%; 
    border: 4px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  ">👤</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
})

const driverIcon = L.divIcon({
  html: `<div style="
    background-color: #10b981; 
    width: 40px; 
    height: 40px; 
    border-radius: 50%; 
    border: 4px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  ">🏍️</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
})

export function LiveTrackingPage() {
  const navigate = useNavigate()
  const { rideId } = useParams()
  const [ride, setRide] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<L.Map | null>(null)

  // ✅ Remove hardcoded rideStatus, use ride.status from backend
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    loadRideDetails()
    
    // ✅ Poll for ride updates every 5 seconds
    const interval = setInterval(() => {
      loadRideDetails()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [rideId])

  const loadRideDetails = async () => {
    try {
      const data = await rideService.getRideById(rideId!)
      setRide(data)
      
      // ✅ If ride is completed, redirect to payment for passengers
      if (data.status === 'COMPLETED' && currentUser.id !== data.driver?.id) {
        setTimeout(() => {
          navigate(`/ride/${rideId}/payment`)
        }, 2000)
      }
    } catch (error) {
      console.error("Failed to load ride:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartRide = async () => {
    try {
      await rideService.startRide(rideId!)
      // Refresh ride data
      await loadRideDetails()
    } catch (error: any) {
      alert(error.message || 'Failed to start ride')
    }
  }

  const handleCompleteRide = async () => {
    try {
      await rideService.completeRide(rideId!)
      // Refresh ride data
      await loadRideDetails()
      setTimeout(() => navigate('/my-rides'), 2000)
    } catch (error: any) {
      alert(error.message || 'Failed to complete ride')
    }
  }

  // Add early return for loading/error states BEFORE using ride data
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

  // ✅ Convert ride data to expected format with proper null checks
  const pickupLocation = {
    lat: ride.startLatitude || 12.9716,
    lng: ride.startLongitude || 77.5946
  }

  const dropLocation = {
    lat: ride.endLatitude || 12.9716,
    lng: ride.endLongitude || 77.5946
  }

  // Mock current locations (these would come from real-time tracking)
  const riderLocation = pickupLocation // Passenger starts at pickup
  const driverLocation = {
    lat: pickupLocation.lat + 0.01, // Driver slightly away
    lng: pickupLocation.lng + 0.01
  }

  const isDriver = currentUser.id === ride.driver?.id
  
  // ✅ Get passenger name from booking if available
  const passengerName = isDriver ? "Passenger" : `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
  const driverName = `${ride.driver?.firstName || ''} ${ride.driver?.lastName || ''}`.trim()

  const otherPerson = isDriver 
    ? { 
        name: passengerName, 
        avatar: "", 
        rating: 4.5, 
        phone: "1234567890" 
      }
    : {
        name: driverName,
        avatar: ride.driver?.profileImageUrl || "",
        rating: 4.5,
        phone: "1234567890",
        vehicle: "Honda Activa",
        number: "KA 01 AB 1234"
      }

  function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
    const map = useMap()
    useEffect(() => {
      map.setView([center.lat, center.lng], 13)
    }, [center, map])
    return null
  }

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/my-rides')}
                className="text-white/60 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-white">Live Tracking</h1>
                <p className="text-xs text-white/40">
                  {isDriver ? "Track your rider" : "Track your driver"}
                </p>
              </div>
            </div>
            <Badge
              className={`${
                ride.status === "waiting"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  : ride.status === "ongoing"
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/30"
              }`}
            >
              {ride.status === "CONFIRMED" ? "Waiting" : ride.status === "IN_PROGRESS" ? "Ongoing" : "Completed"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[pickupLocation.lat, pickupLocation.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <MapUpdater center={pickupLocation} />
          
          {/* ✅ Passenger Location with Popup */}
          <Marker 
            position={[riderLocation.lat, riderLocation.lng]} 
            icon={passengerIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-sm">👤 Passenger</p>
                <p className="text-xs text-gray-600">{passengerName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  📍 {riderLocation.lat.toFixed(4)}, {riderLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
          
          {/* ✅ Driver Location with Popup */}
          <Marker 
            position={[driverLocation.lat, driverLocation.lng]} 
            icon={driverIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-sm">🏍️ Driver</p>
                <p className="text-xs text-gray-600">{driverName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  📍 {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
          
          {/* Route Line */}
          <Polyline
            positions={[
              [pickupLocation.lat, pickupLocation.lng],
              [dropLocation.lat, dropLocation.lng],
            ]}
            pathOptions={{ color: "blue", weight: 4, opacity: 0.6 }}
          />
        </MapContainer>

        {/* Floating Other Person Info Card */}
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <Card className="border-white/10 bg-[#1a1a1a]/95 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={otherPerson.avatar} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {otherPerson.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold truncate">{otherPerson.name}</h3>
                    <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-400 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs text-white/60">{otherPerson.rating}</span>
                    <span className="text-xs text-white/40">•</span>
                    <span className="text-xs text-white/60">{isDriver ? "Rider" : "Driver"}</span>
                  </div>
                  {!isDriver && 'vehicle' in otherPerson && (
                    <>
                      <p className="text-xs text-white/60">{otherPerson.vehicle}</p>
                      <p className="text-xs text-white/40">{otherPerson.number}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700 h-10 w-10"
                    onClick={() => window.location.href = `tel:${otherPerson.phone}`}
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-white/20 h-10 w-10"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ Floating Ride Status Card - Based on ACTUAL ride.status */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <Card className="border-white/10 bg-[#1a1a1a]/95 backdrop-blur-xl">
            <CardContent className="p-4">
              {ride.status === "CONFIRMED" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-semibold">
                        {isDriver ? "Ready to start ride" : "Waiting for driver to start"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>Pickup: Lat {pickupLocation.lat.toFixed(4)}, Lng {pickupLocation.lng.toFixed(4)}</span>
                  </div>
                  {isDriver && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleStartRide}
                    >
                      Start Ride
                    </Button>
                  )}
                  {!isDriver && (
                    <p className="text-sm text-white/60 text-center">
                      The driver will start the ride shortly
                    </p>
                  )}
                </div>
              )}

              {ride.status === "IN_PROGRESS" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-green-400" />
                      <span className="text-white font-semibold">Ride In Progress</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                      En route
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>Destination: Lat {dropLocation.lat.toFixed(4)}, Lng {dropLocation.lng.toFixed(4)}</span>
                  </div>
                  {isDriver && (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleCompleteRide}
                    >
                      Complete Ride
                    </Button>
                  )}
                  {!isDriver && (
                    <p className="text-sm text-white/60 text-center">
                      Enjoy your ride! You'll be notified when you arrive.
                    </p>
                  )}
                </div>
              )}

              {ride.status === "COMPLETED" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-white font-semibold">Ride Completed</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                      Finished
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60 mb-3">
                    {isDriver 
                      ? "Ride completed successfully! Returning to My Rides..."
                      : "Ride completed! Redirecting to payment..."}
                  </p>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white/80"
                  onClick={() => navigate(`/ride/${rideId}`)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
