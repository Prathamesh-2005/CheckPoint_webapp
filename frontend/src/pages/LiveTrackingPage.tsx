import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Navigation,
  Clock,
  MapPin,
  CheckCircle2,
  Star,
  Loader2,
  Maximize2,
  Car as CarIcon,
  AlertCircle,
  User,
  MapPinned,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { rideService } from "@/services/rideService"
import { bookingService } from "@/services/bookingService"
import { locationService } from "@/services/locationService"

const createVehicleIcon = (rotation: number = 0) => L.divIcon({
  html: `<div style="
    transform: rotate(${rotation}deg);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
  ">
    <div style="
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    ">🚗</div>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  className: 'vehicle-marker'
})

const passengerIcon = L.divIcon({
  html: `<div style="
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
  ">👤</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const destinationIcon = L.divIcon({
  html: `<div style="
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
  ">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

export function LiveTrackingPage() {
  const navigate = useNavigate()
  const { rideId } = useParams()
  const [ride, setRide] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [passengerInfo, setPassengerInfo] = useState<any>(null)
  const [pickupAddress, setPickupAddress] = useState<any>(null)
  const [dropAddress, setDropAddress] = useState<any>(null)
  const [driverPosition, setDriverPosition] = useState<any>(null)
  const [vehicleRotation, setVehicleRotation] = useState(0)
  const [distance, setDistance] = useState<number>(0)
  const [eta, setETA] = useState<string>('')
  const [userCanPan, setUserCanPan] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isStartingRide, setIsStartingRide] = useState(false)
  const [isCompletingRide, setIsCompletingRide] = useState(false)
  
  const mapRef = useRef<L.Map | null>(null)
  const driverMarkerRef = useRef<L.Marker | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const previousPositionRef = useRef<{ lat: number; lng: number } | null>(null)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    loadRideDetails()
    const interval = setInterval(loadRideDetails, 5000)
    return () => {
      clearInterval(interval)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [rideId])

  const loadRideDetails = async () => {
    try {
      setError(null)
      const data = await rideService.getRideById(rideId!)
      setRide(data)
      
      // ✅ Extract and log vehicle details
      console.log('🔍 Full ride data:', data)
      console.log('🔍 Driver object:', data.driver)
      console.log('🔍 Vehicle details from driver:', (data.driver as any)?.vehicleDetails)
      
      const vehicleDetails = (data.driver as any)?.vehicleDetails || (data as any)?.vehicleDetails
      if (vehicleDetails) {
        console.log('✅ Setting vehicle details:', vehicleDetails)
        setDriverVehicleDetails(vehicleDetails)
      } else {
        console.warn('⚠️ No vehicle details found for driver')
        setDriverVehicleDetails(null)
      }
      
      if ((data as any).bookings && Array.isArray((data as any).bookings) && (data as any).bookings.length > 0) {
        const booking = (data as any).bookings[0]
        setPassengerInfo(booking.user)
        if (!bookingId) {
          setBookingId(booking.bookingId || booking.id)
        }
      } else {
        if (!bookingId || !passengerInfo) {
          try {
            const bookings = await bookingService.getMyBookings()
            const booking = bookings.find((b: any) => b.rideId === rideId || b.ride?.id === rideId)
            if (booking) {
              setBookingId(booking.bookingId || booking.id)
              if (booking.user) {
                setPassengerInfo(booking.user)
              }
            }
          } catch (err) {
            console.error('Failed to load booking:', err)
          }
        }
      }
      
      // Load addresses only once (cache them)
      if (!pickupAddress || !dropAddress) {
        try {
          const pickup = await locationService.getAddress(data.startLatitude, data.startLongitude)
          const drop = await locationService.getAddress(data.endLatitude, data.endLongitude)
          setPickupAddress(pickup)
          setDropAddress(drop)
        } catch (addrError) {
          console.warn('Failed to load addresses:', addrError)
        }
      }
      
      // Determine target based on ride status
      const targetLat = data.status === "CONFIRMED" ? data.startLatitude : data.endLatitude
      const targetLng = data.status === "CONFIRMED" ? data.startLongitude : data.endLongitude
      
      // Use smooth simulation instead of random jumps
      let newDriverPos: { lat: number; lng: number }
      
      if (!driverPosition) {
        // Initialize driver position near the start
        newDriverPos = {
          lat: data.startLatitude + 0.005, // ~500m away
          lng: data.startLongitude + 0.005
        }
        setDriverPosition(newDriverPos)
        previousPositionRef.current = newDriverPos
      } else {
        // Simulate smooth movement towards target
        newDriverPos = locationService.simulateDriverMovement(
          rideId!,
          driverPosition.lat,
          driverPosition.lng,
          targetLat,
          targetLng,
          data.status
        )
        
        // Only update if position actually changed
        if (
          newDriverPos.lat !== driverPosition.lat || 
          newDriverPos.lng !== driverPosition.lng
        ) {
          // Calculate bearing for rotation
          const bearing = locationService.calculateBearing(
            driverPosition.lat,
            driverPosition.lng,
            newDriverPos.lat,
            newDriverPos.lng
          )
          setVehicleRotation(bearing)
          
          // Animate the marker movement
          animateDriverMarker(driverPosition, newDriverPos)
        }
      }
      
      // Calculate distance and ETA
      const dist = locationService.calculateDistance(
        newDriverPos.lat,
        newDriverPos.lng,
        targetLat,
        targetLng
      )
      setDistance(dist)
      setETA(locationService.calculateETA(dist))
      
      // Redirect when ride is completed
      if (data.status === 'COMPLETED' && currentUser.id !== data.driver?.id) {
        setTimeout(() => navigate(`/ride/${rideId}/payment`), 2000)
      }
      
      // Redirect driver to dashboard after completion
      if (data.status === 'COMPLETED' && currentUser.id === data.driver?.id) {
        setTimeout(() => navigate('/my-rides'), 2000)
      }
    } catch (error: any) {
      console.error("Failed to load ride:", error)
      setError(error.message || "Failed to load ride details")
    } finally {
      setLoading(false)
    }
  }

  const animateDriverMarker = (from: any, to: any) => {
    if (!driverMarkerRef.current) return
    
    const duration = 2000 // 2 seconds for smooth animation
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3)
      
      const lat = from.lat + (to.lat - from.lat) * eased
      const lng = from.lng + (to.lng - from.lng) * eased
      
      driverMarkerRef.current?.setLatLng([lat, lng])
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setDriverPosition(to)
        previousPositionRef.current = to
      }
    }
    
    animate()
  }

  const handleRecenter = () => {
    setUserCanPan(false)
    setHasInitialized(false)
  }

  const handleStartRide = async () => {
    try {
      setIsStartingRide(true)
      setError(null)
      await rideService.startRide(rideId!)
      
      // Reset simulation when ride starts
      locationService.resetSimulation(rideId!)
      setHasInitialized(false) // Re-center map
      
      await loadRideDetails()
    } catch (error: any) {
      setError(error.message || 'Failed to start ride')
      console.error('Failed to start ride:', error)
    } finally {
      setIsStartingRide(false)
    }
  }

  const handleCompleteRide = async () => {
    try {
      setIsCompletingRide(true)
      setError(null)
      await rideService.completeRide(rideId!)
      await loadRideDetails()
    } catch (error: any) {
      setError(error.message || 'Failed to complete ride')
      console.error('Failed to complete ride:', error)
    } finally {
      setIsCompletingRide(false)
    }
  }

  const [driverVehicleDetails, setDriverVehicleDetails] = useState<any>(null)

  function MapController() {
    const map = useMap()
    
    useEffect(() => {
      mapRef.current = map
      
      const handleDragStart = () => {
        setUserCanPan(true)
      }
      
      const handleZoomStart = () => {

      }
      
      map.on('dragstart', handleDragStart)
      map.on('zoomstart', handleZoomStart)
      
      return () => {
        map.off('dragstart', handleDragStart)
        map.off('zoomstart', handleZoomStart)
      }
    }, [map])
    
    useEffect(() => {
      if (!ride || !driverPosition || userCanPan) return
      
      if (!hasInitialized) {
        // Initial fit - show all markers with padding
        const bounds = L.latLngBounds([
          [ride.startLatitude, ride.startLongitude],
          [ride.endLatitude, ride.endLongitude],
          [driverPosition.lat, driverPosition.lng]
        ])
        
        // Fit with animation disabled to prevent flickering
        map.fitBounds(bounds, { 
          padding: [100, 100], 
          maxZoom: 15,
          animate: false // Disable animation to prevent flickering
        })
        setHasInitialized(true)
      }
    }, [ride, driverPosition, userCanPan, hasInitialized, map])
    
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-white/60 text-sm">Loading ride details...</p>
        </div>
      </div>
    )
  }

  if (error && !ride) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] p-4">
        <Card className="border-red-500/20 bg-[#1a1a1a] max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-white font-bold text-lg mb-2">Error Loading Ride</h2>
            <p className="text-white/60 text-sm mb-4">{error}</p>
            <Button 
              onClick={() => navigate('/my-rides')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to My Rides
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!ride || !driverPosition) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Card className="border-white/10 bg-[#1a1a1a] max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h2 className="text-white font-bold text-lg mb-2">Ride Not Found</h2>
            <p className="text-white/60 text-sm mb-4">
              The ride you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              onClick={() => navigate('/my-rides')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to My Rides
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isDriver = currentUser.id === ride.driver?.id
  const driverName = `${ride.driver?.firstName || ''} ${ride.driver?.lastName || ''}`.trim() || "Driver"
  const passengerName = passengerInfo 
    ? `${passengerInfo.firstName || ''} ${passengerInfo.lastName || ''}`.trim() || "Passenger"
    : "Passenger"

  return (
    <div className="h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-xl">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/my-rides')} 
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full h-9 w-9"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-base font-bold text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-400" />
                  Live Tracking
                </h1>
                <p className="text-xs text-white/60">
                  {isDriver ? `🚗 Passenger: ${passengerName}` : `📍 Driver: ${driverName}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRecenter}
                className="border-white/20 h-8 text-white/80 hover:text-white hover:bg-white/10"
              >
                <Maximize2 className="w-4 h-4 mr-1" />
                Recenter
              </Button>
              <Badge className={`px-2 py-1 text-xs ${
                ride.status === "CONFIRMED" 
                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" 
                  : ride.status === "IN_PROGRESS" 
                  ? "bg-green-500/20 text-green-300 border-green-500/30" 
                  : "bg-blue-500/20 text-blue-300 border-blue-500/30"
              }`}>
                {ride.status === "CONFIRMED" ? "⏳ Waiting" : ride.status === "IN_PROGRESS" ? "🚀 Ongoing" : "✅ Done"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="flex-shrink-0 px-4 py-2 bg-red-500/10 border-b border-red-500/20">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer 
          center={[ride.startLatitude, ride.startLongitude]} 
          zoom={14} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          preferCanvas={true} // Better performance
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution="© OpenStreetMap"
            updateWhenIdle={true} // Reduce flickering
            updateWhenZooming={false} // Reduce flickering
          />
          <MapController />
          
          {/* Pickup Location with Popup */}
          <Marker 
            position={[ride.startLatitude, ride.startLongitude]} 
            icon={passengerIcon}
          >
            <Popup className="custom-popup" maxWidth={250}>
              <div className="p-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {passengerName.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{passengerName}</h3>
                    <p className="text-xs text-gray-500">Passenger</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-700">Pickup Location</p>
                      <p className="text-gray-600">{pickupAddress?.placeName || 'Loading...'}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{pickupAddress?.fullAddress || ''}</p>
                    </div>
                  </div>
                  {passengerInfo?.phone && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Phone className="w-3 h-3 text-blue-500" />
                      <a href={`tel:${passengerInfo.phone}`} className="text-blue-600 hover:underline">
                        {passengerInfo.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
          
          {/* Destination with Popup */}
          <Marker 
            position={[ride.endLatitude, ride.endLongitude]} 
            icon={destinationIcon}
          >
            <Popup className="custom-popup" maxWidth={250}>
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinned className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold text-sm">Destination</h3>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-gray-700">{dropAddress?.placeName || 'Loading...'}</p>
                  <p className="text-gray-600">{dropAddress?.fullAddress || 'Fetching address...'}</p>
                  <div className="pt-2 border-t">
                    <p className="text-gray-500">
                      Distance: <span className="font-semibold text-gray-700">{distance.toFixed(1)} km</span>
                    </p>
                    <p className="text-gray-500">
                      ETA: <span className="font-semibold text-green-600">{eta}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
          
          {/* Driver Vehicle with Popup */}
          <Marker 
            position={[driverPosition.lat, driverPosition.lng]}
            icon={createVehicleIcon(vehicleRotation)}
            ref={driverMarkerRef}
          >
            <Popup className="custom-popup" maxWidth={250}>
              <div className="p-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                    {driverName.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{driverName}</h3>
                    <p className="text-xs text-gray-500">Driver</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{ride.driver?.rating || 4.8}</span>
                    <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-600 text-xs px-1 py-0">
                      Verified
                    </Badge>
                  </div>
                  
                  {/* ✅ Only show vehicle details if they exist */}
                  {driverVehicleDetails ? (
                    <div className="pt-2 border-t space-y-1">
                      <p className="text-gray-600">
                        <span className="font-semibold">Vehicle:</span> {driverVehicleDetails.vehicleNumber}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Model:</span> {driverVehicleDetails.vehicleModel}
                      </p>
                      {driverVehicleDetails.vehicleColor && (
                        <p className="text-gray-600">
                          <span className="font-semibold">Color:</span> {driverVehicleDetails.vehicleColor}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 border-t">
                      <p className="text-gray-500 text-xs italic">
                        ℹ️ Vehicle details not available
                      </p>
                    </div>
                  )}
                  
                  <p className="text-gray-600 pt-2 border-t">
                    <span className="font-semibold">Distance:</span> {distance.toFixed(1)} km to {ride.status === "CONFIRMED" ? "pickup" : "destination"}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
          
          {/* Route from driver to pickup (if not started) */}
          {ride.status === "CONFIRMED" && (
            <Polyline 
              positions={[
                [driverPosition.lat, driverPosition.lng],
                [ride.startLatitude, ride.startLongitude]
              ]} 
              pathOptions={{ 
                color: "#10b981", 
                weight: 3, 
                opacity: 0.7,
                dashArray: "5, 5"
              }} 
            />
          )}
          
          {/* Route from pickup to destination */}
          <Polyline 
            positions={[
              [ride.startLatitude, ride.startLongitude], 
              [ride.endLatitude, ride.endLongitude]
            ]} 
            pathOptions={{ 
              color: "#3b82f6", 
              weight: 4, 
              opacity: 0.7
            }} 
          />
          
          {/* Route from driver to destination (if in progress) */}
          {ride.status === "IN_PROGRESS" && (
            <Polyline 
              positions={[
                [driverPosition.lat, driverPosition.lng],
                [ride.endLatitude, ride.endLongitude]
              ]} 
              pathOptions={{ 
                color: "#10b981", 
                weight: 3, 
                opacity: 0.7,
                dashArray: "5, 5"
              }} 
            />
          )}
        </MapContainer>

        {/* Driver/Passenger Info Card - Top Left */}
        <div className="absolute top-4 left-4 right-4 md:right-auto md:max-w-sm z-[1000] pointer-events-none">
          <Card className="border-white/10 bg-[#1a1a1a]/95 backdrop-blur-xl shadow-2xl pointer-events-auto">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-blue-500">
                  <AvatarImage src={isDriver ? passengerInfo?.profileImageUrl : ride.driver?.profileImageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                    {isDriver 
                      ? passengerName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                      : driverName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold truncate">
                    {isDriver ? passengerName : driverName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    {!isDriver && (
                      <>
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-yellow-500 font-semibold">{ride.driver?.rating || 4.8}</span>
                        <span className="text-white/40">•</span>
                      </>
                    )}
                    <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-400 text-xs px-1 py-0">
                      {isDriver ? "Passenger" : "Driver"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    size="icon" 
                    className="bg-blue-600 hover:bg-blue-700 h-9 w-9 rounded-full" 
                    onClick={() => {
                      const phone = isDriver ? passengerInfo?.phone : ride.driver?.phone
                      window.location.href = `tel:${phone || '1234567890'}`
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="border-white/20 bg-white/5 hover:bg-white/10 h-9 w-9 rounded-full" 
                    onClick={() => {
                      if (bookingId) {
                        const name = isDriver ? passengerName : driverName
                        navigate(`/chat?bookingId=${bookingId}&name=${encodeURIComponent(name)}`)
                      }
                    }}
                    disabled={!bookingId}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* ETA & Distance */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                <div className="flex-1">
                  <p className="text-xs text-white/40">Distance</p>
                  <p className="text-sm font-bold text-white">{distance.toFixed(1)} km</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/40">ETA</p>
                  <p className="text-sm font-bold text-green-400">{eta}</p>
                </div>
                {!isDriver && driverVehicleDetails?.vehicleNumber && (
                  <div className="flex-1">
                    <p className="text-xs text-white/40">Vehicle</p>
                    <p className="text-sm font-bold text-white">
                      {driverVehicleDetails.vehicleNumber}
                    </p>
                  </div>
                )}
              </div>
              
              {/* ✅ Show vehicle model ONLY for passengers and ONLY if exists */}
              {!isDriver && driverVehicleDetails && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">Model</span>
                    <span className="text-white font-medium">{driverVehicleDetails.vehicleModel || 'N/A'}</span>
                  </div>
                  {driverVehicleDetails.vehicleColor && (
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-white/40">Color</span>
                      <span className="text-white font-medium">{driverVehicleDetails.vehicleColor}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* ✅ Show warning if driver hasn't set vehicle details */}
              {!isDriver && !driverVehicleDetails && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-xs text-yellow-400 text-center">
                    ℹ️ Driver vehicle details not available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status - Bottom */}
        <div className="absolute bottom-4 right-4 left-4 md:left-auto md:max-w-md z-[1000] pointer-events-none">
          <Card className="border-white/10 bg-[#1a1a1a]/95 backdrop-blur-xl shadow-2xl pointer-events-auto">
            <CardContent className="p-4">
              {ride.status === "CONFIRMED" && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-yellow-500/10 rounded-full">
                      <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{isDriver ? "Ready to Start" : "Driver Arriving"}</p>
                      <p className="text-xs text-white/60">{isDriver ? "Tap to begin ride" : "Wait at pickup location"}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3 p-3 bg-white/5 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/40 mb-1">Pickup Location</p>
                        <p className="text-sm text-white font-medium">{pickupAddress?.placeName || 'Loading...'}</p>
                        <p className="text-xs text-white/60 mt-1">{pickupAddress?.fullAddress || 'Fetching address...'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {isDriver && (
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                      onClick={handleStartRide}
                      disabled={isStartingRide}
                    >
                      {isStartingRide ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4 mr-2" />
                          Start Ride
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {ride.status === "IN_PROGRESS" && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/10 rounded-full animate-pulse">
                      <CarIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">Ride In Progress</p>
                      <p className="text-xs text-green-400">En route to destination</p>
                    </div>
                  </div>
                  
                  <div className="mb-3 p-3 bg-white/5 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/40 mb-1">Drop Location</p>
                        <p className="text-sm text-white font-medium">{dropAddress?.placeName || 'Loading...'}</p>
                        <p className="text-xs text-white/60 mt-1">{dropAddress?.fullAddress || 'Fetching address...'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {isDriver && (
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700" 
                      onClick={handleCompleteRide}
                      disabled={isCompletingRide}
                    >
                      {isCompletingRide ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Complete Ride
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {ride.status === "COMPLETED" && (
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-bold">Ride Completed!</p>
                  <p className="text-xs text-white/60 mt-1">
                    {isDriver ? "Redirecting to dashboard..." : "Redirecting to payment..."}
                  </p>
                  <div className="mt-3">
                    <Loader2 className="w-5 h-5 animate-spin text-green-400 mx-auto" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}