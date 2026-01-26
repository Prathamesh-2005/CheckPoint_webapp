import { useState, useCallback, useRef } from "react"
import React from "react"
import { useNavigate } from "react-router-dom"
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  Car,
  Plus,
  Loader2,
  X,
  CheckCircle2,
  LocateFixed,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ModeToggle } from "@/components/mode-toggle"
import { rideService } from "@/services/rideService"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

const mapContainerStyle = {
  width: "100%",
  height: "350px",
}

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
}

export function OfferRidePage() {
  const navigate = useNavigate()
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [route, setRoute] = useState<Array<[number, number]>>([])
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [price, setPrice] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [stops, setStops] = useState<string[]>([])
  const [newStop, setNewStop] = useState("")
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)

  const mapRef = useRef<L.Map | null>(null)

  const handleFromLocationSelect = useCallback((coords: { lat: number; lng: number }, address: string) => {
    setFromCoords(coords)
    setMapCenter(coords)
    setFromLocation(address)
    if (toCoords) {
      fetchRoute(coords, toCoords)
    }
  }, [toCoords])

  const handleToLocationSelect = useCallback((coords: { lat: number; lng: number }, address: string) => {
    setToCoords(coords)
    setToLocation(address)
    if (fromCoords) {
      fetchRoute(fromCoords, coords)
    }
  }, [fromCoords])

  const fetchRoute = useCallback((from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    setIsLoadingRoute(true)
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
          setRoute(coords)
        }
        setIsLoadingRoute(false)
      })
      .catch((error) => {
        console.error("Error fetching route:", error)
        setIsLoadingRoute(false)
      })
  }, [])

  const addStop = () => {
    if (newStop.trim()) {
      setStops([...stops, newStop])
      setNewStop("")
    }
  }

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fromCoords || !toCoords) {
      alert("Please select both locations")
      return
    }

    setIsSubmitting(true)

    try {
      const rideData = {
        startLatitude: fromCoords.lat,
        startLongitude: fromCoords.lng,
        endLatitude: toCoords.lat,
        endLongitude: toCoords.lng,
        departureTime: `${date}T${time}:00`,
        price: parseFloat(price),
      }

      console.log('Submitting ride data:', rideData);

      await rideService.createRide(rideData)
      
      setIsSubmitting(false)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        resetForm()
        navigate("/my-rides")
      }, 2000)
    } catch (error: any) {
      console.error("Failed to create ride:", error)
      alert(`Failed to create ride: ${error.message || 'Unknown error'}`)
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFromLocation("")
    setToLocation("")
    setFromCoords(null)
    setToCoords(null)
    setRoute([])
    setDate("")
    setTime("")
    setPrice("")
    setVehicleModel("")
    setVehicleNumber("")
    setNotes("")
    setStops([])
  }

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
          alert("Failed to get current location")
          setLoadingLocation(false)
        }
      )
    } else {
      alert("Geolocation is not supported by this browser")
      setLoadingLocation(false)
    }
  }

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
                <h1 className="text-xl md:text-2xl font-semibold text-white">Offer a Ride</h1>
                <p className="text-xs md:text-sm text-white/40">Share your journey and earn money</p>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-6 lg:p-8">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7 space-y-6">
                  <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        Route Details
                      </CardTitle>
                      <CardDescription className="text-xs text-white/40">
                        Define your journey route
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-white/80">Starting Point</Label>
                        <PlacesAutocomplete
                          value={fromLocation}
                          onChange={setFromLocation}
                          onSelect={handleFromLocationSelect}
                          placeholder="Enter starting location"
                          icon={<MapPin className="w-4 h-4 text-green-500" />}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          onClick={handleGetCurrentLocation}
                          disabled={loadingLocation}
                        >
                          {loadingLocation ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
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
                        <Label className="text-sm text-white/80">Destination</Label>
                        <PlacesAutocomplete
                          value={toLocation}
                          onChange={setToLocation}
                          onSelect={handleToLocationSelect}
                          placeholder="Enter destination"
                          icon={<MapPin className="w-4 h-4 text-red-500" />}
                        />
                      </div>

                      {isLoadingRoute && (
                        <div className="flex items-center gap-2 text-xs text-blue-400">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Loading route...</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm text-white/80">Stops (Optional)</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a stop"
                            value={newStop}
                            onChange={(e) => setNewStop(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStop())}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={addStop}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        {stops.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {stops.map((stop, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="border-white/20 text-white/70 bg-white/5 pl-2 pr-1 py-1"
                              >
                                {stop}
                                <button
                                  type="button"
                                  onClick={() => removeStop(index)}
                                  className="ml-1 hover:bg-white/10 rounded-full p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        Date & Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-white/80">Date</Label>
                          <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-white/80">Time</Label>
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                            className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                        <Car className="w-5 h-5 text-blue-400" />
                        Bike Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-white/80">Bike Model</Label>
                        <Input
                          placeholder="e.g., Royal Enfield Classic 350"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-white/80">Registration Number</Label>
                        <Input
                          placeholder="e.g., KA 01 AB 1234"
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value)}
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-white">Pricing</CardTitle>
                      <CardDescription className="text-xs text-white/40">
                        1 seat available (pillion rider)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-white/80">Price for Ride</Label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-white">Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Add any additional information for passengers (e.g., helmet available, luggage space, etc.)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 resize-none"
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <Card className="border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden sticky top-24">
                    <CardHeader className="p-3 border-b border-white/5">
                      <CardTitle className="text-sm font-semibold text-white">Route Preview</CardTitle>
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
                        {fromCoords && <Marker position={[fromCoords.lat, fromCoords.lng]} />}
                        {toCoords && <Marker position={[toCoords.lat, toCoords.lng]} />}
                        {route.length > 0 && (
                          <Polyline positions={route} pathOptions={{ color: "blue", weight: 4 }} />
                        )}
                      </MapContainer>
                    </CardContent>
                  </Card>

                  <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-white">Ride Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white/40 text-xs mb-0.5">From</p>
                            <p className="text-white break-words">{fromLocation || "Not set"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white/40 text-xs mb-0.5">To</p>
                            <p className="text-white break-words">{toLocation || "Not set"}</p>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-white/10" />

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-white/40 text-xs mb-1">Date & Time</p>
                          <p className="text-white">{date && time ? `${date} ${time}` : "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs mb-1">Bike</p>
                          <p className="text-white truncate">{vehicleModel || "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs mb-1">Seats</p>
                          <p className="text-white">1 Available</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs mb-1">Price</p>
                          <p className="text-white">₹{price || "0"}</p>
                        </div>
                      </div>

                      {stops.length > 0 && (
                        <>
                          <Separator className="bg-white/10" />
                          <div>
                            <p className="text-white/40 text-xs mb-2">Stops</p>
                            <div className="space-y-1">
                              {stops.map((stop, index) => (
                                <p key={index} className="text-white text-sm">• {stop}</p>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !fromLocation || !toLocation || !date || !time || !price}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Publishing Ride...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Publish Ride
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </main>

        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="border-green-500/50 bg-[#1a1a1a] max-w-md mx-4">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Ride Published!</h3>
                <p className="text-white/60">Your ride has been successfully published and is now visible to passengers.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SidebarProvider>
  )
}

interface PlacesAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (coords: { lat: number; lng: number }, address: string) => void
  placeholder: string
  icon?: React.ReactNode
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder,
  icon,
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    if (val.length > 2) {
      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=5`)
          .then((res) => res.json())
          .then((data) => {
            setSuggestions(data)
            setShowDropdown(true)
            setIsSearching(false)
          })
          .catch(() => {
            setIsSearching(false)
          })
      }, 500)
    } else {
      setSuggestions([])
      setShowDropdown(false)
      setIsSearching(false)
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

  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">{icon}</div>}
        <Input
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          className={`${icon ? 'pl-10' : ''} bg-white/5 border-white/10 text-white placeholder:text-white/40`}
          autoComplete="off"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-400" />
        )}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          onWheel={handleWheel}
          className="fixed left-0 right-0 mt-2 z-[9999] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl backdrop-blur-sm overflow-hidden max-w-full" 
          style={{
            top: 'calc(100% + 0.5rem)',
            position: 'absolute'
          }}
        >
          <div className="max-h-64 overflow-y-auto">
            <div className="p-2">
              {suggestions.map((item) => (
                <div
                  key={item.place_id}
                  className="px-3 py-3 cursor-pointer hover:bg-white/10 transition-colors flex items-start gap-3 rounded-md mb-1"
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
