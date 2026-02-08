import { useState, useCallback, useRef } from "react"
import React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  MapPin,
  Search,
  Navigation,
  Clock,
  Star,
  ChevronRight,
  LocateFixed,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Spinner } from "@/components/ui/spinner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { rideService } from "@/services/rideService"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

const bikeIcon = L.divIcon({
  html: `<div style="
    background-color: #3b82f6; 
    width: 30px; 
    height: 30px; 
    border-radius: 50%; 
    border: 3px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  ">🏍️</div>`,
  className: 'custom-bike-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
})

// Helper function to get address from coordinates
async function getAddressFromCoords(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    )
    const data = await response.json()
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch (error) {
    console.error('Error fetching address:', error)
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}

export function FindRidePage() {
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [mapCenter, setMapCenter] = useState({
    lat: 12.9716,
    lng: 77.5946,
  })
  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [route, setRoute] = useState<Array<[number, number]>>([])
  const [availableRides, setAvailableRides] = useState<any[]>([])
  const [rideAddresses, setRideAddresses] = useState<Record<string, { start: string; end: string }>>({})

  const mapRef = useRef<L.Map | null>(null)
  const navigate = useNavigate()

  const handleGetCurrentLocation = () => {
    console.log('📍 Getting current location...')
    setLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          console.log('✅ Current location obtained:', coords)
          setFromCoords(coords)
          setMapCenter(coords)
          setFromLocation("Current Location")
          setLoadingLocation(false)
          toast.success('Location detected', {
            description: 'Your current location has been set as pickup point'
          })
        },
        (error) => {
          console.error("❌ Error getting location:", error)
          setLoadingLocation(false)
          toast.error('Location access denied', {
            description: 'Please enable location access or enter location manually'
          })
        }
      )
    } else {
      console.error('❌ Geolocation not supported')
      toast.error('Geolocation not supported', {
        description: 'Your browser does not support location services'
      })
      setLoadingLocation(false)
    }
  }

  const handleSearchRides = useCallback(async () => {
    if (!fromCoords || !toCoords) {
      console.log('❌ Search failed: Missing coordinates')
      console.log('fromCoords:', fromCoords)
      console.log('toCoords:', toCoords)
      return
    }
    
    setIsSearching(true)
    console.log('🔍 Starting ride search...')
    console.log('Your pickup:', fromCoords)
    console.log('Your destination:', toCoords)
    
    try {
      const rides = await rideService.searchRides(
        fromCoords.lat,   // Your pickup latitude
        fromCoords.lng,   // Your pickup longitude
        toCoords.lat,     // Your destination latitude
        toCoords.lng,     // Your destination longitude
        5.0               // 5km radius
      )
      
      console.log('✅ Search successful!')
      console.log('📦 Available rides:', rides)
      console.log('🚗 Total rides found:', rides.length)
      
      setAvailableRides(rides)
      
      if (rides.length > 0) {
        toast.success(`${rides.length} ride${rides.length > 1 ? 's' : ''} found!`, {
          description: 'Check the map and list below for available options'
        })
      } else {
        toast.info('No rides found', {
          description: 'Try adjusting your search locations or try again later'
        })
      }

      // Fetch addresses for each ride
      const addressPromises = rides.map(async (ride: any) => {
        const startAddress = await getAddressFromCoords(ride.startLatitude, ride.startLongitude)
        const endAddress = await getAddressFromCoords(ride.endLatitude, ride.endLongitude)
        return {
          id: ride.id,
          start: startAddress,
          end: endAddress
        }
      })

      const addresses = await Promise.all(addressPromises)
      const addressMap = addresses.reduce((acc, { id, start, end }) => {
        acc[id] = { start, end }
        return acc
      }, {} as Record<string, { start: string; end: string }>)
      
      setRideAddresses(addressMap)
      
      fetch(
        `https://router.project-osrm.org/route/v1/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}?overview=full&geometries=geojson`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log('🗺️ Route data received:', data)
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
            setRoute(coords)
            console.log('📍 Route coordinates calculated:', coords.length, 'points')
          }
        })
        .catch(err => console.error('❌ Route error:', err))
      
      setShowResults(true)
      console.log('✨ Results displayed')
    } catch (error) {
      console.error('❌ Search failed:', error)
      console.error('Error details:', {
        message: (error as any).message,
        stack: (error as any).stack
      })
    } finally {
      setIsSearching(false)
    }
  }, [fromCoords, toCoords])

  const handleFromLocationSelect = useCallback((coords: { lat: number; lng: number }, address: string) => {
    console.log('📍 From location selected:', { coords, address })
    setFromCoords(coords)
    setMapCenter(coords)
    setFromLocation(address)
  }, [])

  const handleToLocationSelect = useCallback((coords: { lat: number; lng: number }, address: string) => {
    console.log('📍 To location selected:', { coords, address })
    setToCoords(coords)
    setToLocation(address)
  }, [])

  function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
    const map = useMap()
    React.useEffect(() => {
      map.setView([center.lat, center.lng], 13)
    }, [center, map])
    return null
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#0a0a0a]">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-white">Find a Ride</h1>
                <p className="text-xs md:text-sm text-white/40">Search for available rides near you</p>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-8">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Search Panel - Smaller on large screens */}
              <div className="lg:col-span-4 xl:col-span-3">
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">Search Rides</CardTitle>
                    <CardDescription className="text-sm text-white/40">
                      Enter your pickup and drop location
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/80">From</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 z-10" />
                        <PlacesAutocomplete
                          value={fromLocation}
                          onChange={setFromLocation}
                          onSelect={handleFromLocationSelect}
                          placeholder="Pickup location"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        onClick={handleGetCurrentLocation}
                        disabled={loadingLocation}
                      >
                        {loadingLocation ? (
                          <>
                            <Spinner className="w-3 h-3 mr-2" />
                            Getting location...
                          </>
                        ) : (
                          <>
                            <LocateFixed className="w-3 h-3 mr-2" />
                            Use current location
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white/80">To</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 z-10" />
                        <PlacesAutocomplete
                          value={toLocation}
                          onChange={setToLocation}
                          onSelect={handleToLocationSelect}
                          placeholder="Drop location"
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleSearchRides}
                      disabled={!fromCoords || !toCoords || isSearching}
                    >
                      {isSearching ? (
                        <>
                          <Spinner className="w-4 h-4 mr-2" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Search Rides
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Map and Results - More space */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-4">
                {/* Map at top with compact header */}
                <Card className="border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="p-3 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-white">Route Map</CardTitle>
                      {showResults && availableRides.length > 0 && (
                        <Badge variant="outline" className="border-blue-500 text-blue-400">
                          🏍️ {availableRides.length} riders nearby
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <MapContainer
                      center={[mapCenter.lat, mapCenter.lng]}
                      zoom={12}
                      style={{
                        width: "100%",
                        height: "400px",
                      }}
                      ref={mapRef}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="© OpenStreetMap contributors"
                      />
                      <MapUpdater center={mapCenter} />
                      {fromCoords && (
                        <Marker position={[fromCoords.lat, fromCoords.lng]} />
                      )}
                      {toCoords && (
                        <Marker position={[toCoords.lat, toCoords.lng]} />
                      )}
                      {route.length > 0 && (
                        <Polyline positions={route} pathOptions={{ color: "blue", weight: 4 }} />
                      )}
                      {availableRides.length > 0 && availableRides.map(ride => (
                        <Marker 
                          key={`rider-${ride.id}`}
                          position={[ride.startLatitude, ride.startLongitude]}
                          icon={bikeIcon}
                        />
                      ))}
                    </MapContainer>
                  </CardContent>
                </Card>

                {/* Available Rides - Immediately below map */}
                {showResults && (
                  <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardHeader className="p-4 border-b border-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-semibold text-white">
                            Available Rides ({availableRides.length})
                          </CardTitle>
                          <CardDescription className="text-xs text-white/40">
                            Sorted by best match
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {availableRides.length === 0 ? (
                          <div className="p-8 text-center">
                            <p className="text-white/60">No rides found</p>
                            <p className="text-xs text-white/40 mt-1">Try searching in a different area</p>
                          </div>
                        ) : (
                          availableRides.map((ride) => (
                            <Card
                              key={ride.id}
                              className="border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                              onClick={() => navigate(`/ride/${ride.id}`)}
                            >
                              <CardContent className="p-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <div className="flex items-start gap-3 flex-1">
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                      <AvatarImage src={ride.driver?.profileImageUrl} />
                                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                                        {ride.driver?.firstName?.[0]}{ride.driver?.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-semibold text-white text-sm">
                                          {ride.driver?.firstName} {ride.driver?.lastName}
                                        </h3>
                                      </div>
                                      <p className="text-xs text-white/40 mb-1.5">
                                        {ride.status} • {new Date(ride.departureTime).toLocaleString()}
                                      </p>
                                      
                                      <div className="space-y-1">
                                        <div className="flex items-start gap-2 text-xs text-white/60">
                                          <MapPin className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                          <span className="line-clamp-1">
                                            {rideAddresses[ride.id]?.start || 'Loading...'}
                                          </span>
                                        </div>
                                        <div className="flex items-start gap-2 text-xs text-white/60">
                                          <MapPin className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                          <span className="line-clamp-1">
                                            {rideAddresses[ride.id]?.end || 'Loading...'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-3">
                                    <div className="text-right">
                                      <div className="text-xl font-bold text-white">₹{ride.price}</div>
                                      <p className="text-xs text-white/40">per seat</p>
                                    </div>
                                    <div className="flex sm:flex-col items-center gap-2">
                                      <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                                        {ride.availableSeats} seats
                                      </Badge>
                                      <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          navigate(`/ride/${ride.id}`)
                                        }}
                                      >
                                        View
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Empty state */}
                {!showResults && fromLocation && toLocation && !isSearching && (
                  <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardContent className="p-12 text-center">
                      <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">Click "Search Rides" to find available rides</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

interface PlacesAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (coords: { lat: number; lng: number }, address: string) => void
  placeholder: string
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder,
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)
    if (val.length > 2) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=5`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data)
          setShowDropdown(true)
        })
    } else {
      setSuggestions([])
      setShowDropdown(false)
    }
  }

  const handleSelect = (item: any) => {
    const coords = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) }
    onSelect(coords, item.display_name)
    setShowDropdown(false)
    setSuggestions([])
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
        autoComplete="off"
      />
      {showDropdown && suggestions.length > 0 && (
        <div 
          onWheel={handleWheel}
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="max-h-64 overflow-y-auto">
            <div className="p-2">
              {suggestions.map((item, index) => (
                <div
                  key={item.place_id}
                  className={`px-3 py-3 cursor-pointer hover:bg-white/10 transition-colors flex items-start gap-3 rounded-md ${
                    index !== suggestions.length - 1 ? 'mb-1' : ''
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  <MapPin className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium mb-1 break-words">
                      {item.display_name.split(',')[0]}
                    </p>
                    <p className="text-xs text-white/50 break-words line-clamp-2">
                      {item.display_name.split(',').slice(1).join(',').trim()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}