import { useState, useCallback, useRef } from "react"
import React from "react"
import { useNavigate } from "react-router-dom"
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

function generateMockRiders(centerLat: number, centerLng: number, count: number = 8) {
  const riders = []
  const radiusInDegrees = 0.09
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI
    const distance = Math.random() * radiusInDegrees
    
    const lat = centerLat + (distance * Math.cos(angle))
    const lng = centerLng + (distance * Math.sin(angle))
    
    riders.push({
      id: i + 1,
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
    })
  }
  
  return riders
}

const availableRides = [
  {
    id: 1,
    driver: {
      name: "Rahul Kumar",
      rating: 4.8,
      avatar: "",
      trips: 124,
    },
    from: "Indiranagar",
    to: "Whitefield",
    departureTime: "Today, 5:30 PM",
    price: "₹320",
    availableSeats: 2,
    distance: "12.5 km",
    duration: "35 min",
    carModel: "Honda City",
  },
  {
    id: 2,
    driver: {
      name: "Priya Sharma",
      rating: 4.9,
      avatar: "",
      trips: 89,
    },
    from: "Indiranagar",
    to: "Electronic City",
    departureTime: "Today, 6:00 PM",
    price: "₹280",
    availableSeats: 1,
    distance: "10.2 km",
    duration: "28 min",
    carModel: "Maruti Swift",
  },
  {
    id: 3,
    driver: {
      name: "Vikram Singh",
      rating: 4.7,
      avatar: "",
      trips: 156,
    },
    from: "Koramangala",
    to: "Whitefield",
    departureTime: "Today, 5:45 PM",
    price: "₹350",
    availableSeats: 3,
    distance: "14.8 km",
    duration: "42 min",
    carModel: "Toyota Innova",
  },
]

const mapContainerStyle = {
  width: "100%",
  height: "400px",
}

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
}

export function FindRidePage() {
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [route, setRoute] = useState<Array<[number, number]>>([])
  const [nearbyRiders, setNearbyRiders] = useState<Array<{ id: number; lat: number; lng: number }>>([])

  const mapRef = useRef<L.Map | null>(null)
  const navigate = useNavigate()

  const handleGetCurrentLocation = () => {
    setLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setFromCoords(coords)
          setMapCenter(coords)
          setFromLocation("Current Location")
          setLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setLoadingLocation(false)
        }
      )
    }
  }

  const handleSearchRides = useCallback(() => {
    if (!fromCoords || !toCoords) return
    setIsSearching(true)
    
    const mockRiders = generateMockRiders(toCoords.lat, toCoords.lng)
    console.log('Generated riders:', mockRiders)
    setNearbyRiders(mockRiders)
    
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}?overview=full&geometries=geojson`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
          setRoute(coords)
        }
        setTimeout(() => {
          setIsSearching(false)
          setShowResults(true)
        }, 1500)
      })
      .catch(() => {
        setIsSearching(false)
        setShowResults(true)
      })
  }, [fromCoords, toCoords])

  const handleFromLocationSelect = useCallback((coords: { lat: number; lng: number }, address: string) => {
    setFromCoords(coords)
    setMapCenter(coords)
    setFromLocation(address)
  }, [])

  const handleToLocationSelect = useCallback((coords: { lat: number; lng: number }, address: string) => {
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

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/20 text-white/80 hover:bg-white/10"
                      onClick={() => {
                        const from = { lat: 12.9352, lng: 77.6245 }
                        const to = { lat: 12.9698, lng: 77.7500 }
                        setFromCoords(from)
                        setToCoords(to)
                        setFromLocation("Koramangala, Bangalore")
                        setToLocation("Whitefield, Bangalore")
                        setMapCenter(from)
                      }}
                    >
                      Try Demo Route
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
                      {showResults && nearbyRiders.length > 0 && (
                        <Badge variant="outline" className="border-blue-500 text-blue-400">
                          🏍️ {nearbyRiders.length} riders nearby
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <MapContainer
                      center={[mapCenter.lat, mapCenter.lng]}
                      zoom={12}
                      style={mapContainerStyle}
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
                      {nearbyRiders.length > 0 && nearbyRiders.map(rider => (
                        <Marker 
                          key={`rider-${rider.id}`}
                          position={[rider.lat, rider.lng]}
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
                        {availableRides.map((ride) => (
                          <Card
                            key={ride.id}
                            className="border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                            onClick={() => navigate(`/ride/${ride.id}`)}
                          >
                            <CardContent className="p-3">
                              <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage src={ride.driver.avatar} />
                                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                                      {ride.driver.name.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <h3 className="font-semibold text-white text-sm">{ride.driver.name}</h3>
                                      <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                        <span className="text-xs text-white/60">{ride.driver.rating}</span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-white/40 mb-1.5">{ride.driver.trips} trips • {ride.carModel}</p>
                                    
                                    <div className="flex items-center gap-2 text-xs text-white/60 mb-1.5">
                                      <MapPin className="w-3 h-3 text-green-500 flex-shrink-0" />
                                      <span className="truncate">{ride.from}</span>
                                      <ChevronRight className="w-3 h-3 flex-shrink-0" />
                                      <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                                      <span className="truncate">{ride.to}</span>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-white/40 flex-wrap">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{ride.departureTime}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Navigation className="w-3 h-3" />
                                        <span>{ride.distance} • {ride.duration}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-3">
                                  <div className="text-right">
                                    <div className="text-xl font-bold text-white">{ride.price}</div>
                                    <p className="text-xs text-white/40">per seat</p>
                                  </div>
                                  <div className="flex sm:flex-col items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="border-white/20 text-white/60 text-xs"
                                    >
                                      {ride.availableSeats} seats
                                    </Badge>
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigate('/messages')
                                      }}
                                    >
                                      Request
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-white/20 text-white/60 hover:text-white hover:bg-white/10"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigate('/messages')
                                      }}
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
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
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
        autoComplete="off"
      />
      {showDropdown && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          onWheel={handleWheel}
          className="absolute left-0 right-0 top-full mt-2 z-[9999] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl backdrop-blur-sm overflow-hidden"
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
                  <div className="flex-1 min-w-0 overflow-hidden">
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