import { useState, useEffect } from "react"
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
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Custom marker icons
const userIcon = L.divIcon({
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
  ">👤</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

const bikeIcon = L.divIcon({
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
})

export function LiveTrackingPage() {
  const navigate = useNavigate()
  const { rideId } = useParams()
  const [rideStatus, setRideStatus] = useState("waiting") // waiting, ongoing, completed
  const [eta, setEta] = useState("5 mins")
  const [userRole, setUserRole] = useState<"driver" | "rider">("driver") // Dynamic role

  // Mock ride data - in real app, fetch by rideId and determine user role
  const rideDetails = {
    driver: {
      id: "driver123",
      name: "Rahul Kumar",
      phone: "+91 98765 43210",
      rating: 4.8,
      avatar: "",
      vehicle: "Royal Enfield Classic 350",
      number: "KA 01 AB 1234",
    },
    rider: {
      id: "rider456",
      name: "Priya Sharma",
      phone: "+91 87654 32109",
      rating: 4.9,
      avatar: "",
    },
    route: {
      from: "Indiranagar Metro Station",
      to: "Whitefield IT Park",
      distance: "12.5 km",
    },
    riderLocation: { lat: 12.9716, lng: 77.5946 },
    driverLocation: { lat: 12.9650, lng: 77.5900 },
    pickupLocation: { lat: 12.9716, lng: 77.5946 },
    dropLocation: { lat: 12.9698, lng: 77.7499 },
  }

  // Determine current user's role (in real app, compare with logged-in user ID)
  const currentUserId = "driver123" // Get from auth context
  const isDriver = currentUserId === rideDetails.driver.id
  const otherPerson = isDriver ? rideDetails.rider : rideDetails.driver

  // Simulate driver moving closer
  useEffect(() => {
    if (rideStatus === "waiting") {
      const interval = setInterval(() => {
        setEta((prev) => {
          const mins = parseInt(prev)
          if (mins > 0) return `${mins - 1} mins`
          setRideStatus("ongoing")
          return "Started"
        })
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [rideStatus])

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
                rideStatus === "waiting"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  : rideStatus === "ongoing"
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/30"
              }`}
            >
              {rideStatus === "waiting" ? "Waiting" : rideStatus === "ongoing" ? "Ongoing" : "Completed"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[rideDetails.pickupLocation.lat, rideDetails.pickupLocation.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <MapUpdater center={rideDetails.pickupLocation} />
          
          {/* Rider Location */}
          <Marker position={[rideDetails.riderLocation.lat, rideDetails.riderLocation.lng]} icon={userIcon} />
          
          {/* Driver Location */}
          <Marker position={[rideDetails.driverLocation.lat, rideDetails.driverLocation.lng]} icon={bikeIcon} />
          
          {/* Route Line */}
          <Polyline
            positions={[
              [rideDetails.pickupLocation.lat, rideDetails.pickupLocation.lng],
              [rideDetails.dropLocation.lat, rideDetails.dropLocation.lng],
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
                    {otherPerson.name.split(" ").map(n => n[0]).join("")}
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
                  {isDriver ? null : (
                    <>
                      <p className="text-xs text-white/60">{rideDetails.driver.vehicle}</p>
                      <p className="text-xs text-white/40">{rideDetails.driver.number}</p>
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

        {/* Floating Ride Status Card */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <Card className="border-white/10 bg-[#1a1a1a]/95 backdrop-blur-xl">
            <CardContent className="p-4">
              {rideStatus === "waiting" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-semibold">
                        {isDriver ? "Rider waiting at pickup" : "Driver arriving in"}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-400">{eta}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>Pickup: {rideDetails.route.from}</span>
                  </div>
                  {isDriver && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => setRideStatus("ongoing")}
                    >
                      Start Ride
                    </Button>
                  )}
                </div>
              )}

              {rideStatus === "ongoing" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-green-400" />
                      <span className="text-white font-semibold">Ride In Progress</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                      {rideDetails.route.distance}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>Destination: {rideDetails.route.to}</span>
                  </div>
                  {isDriver && (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setRideStatus("completed")
                        setTimeout(() => navigate('/my-rides'), 2000)
                      }}
                    >
                      Complete Ride
                    </Button>
                  )}
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
