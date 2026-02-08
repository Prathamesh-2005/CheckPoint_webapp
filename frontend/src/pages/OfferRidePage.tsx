import { useState, useCallback, useRef } from "react"
import React from "react"
import { useNavigate } from "react-router-dom"
import {
  MapPin,
  Clock,
  Users,
  IndianRupee,
  Car,
  Plus,
  Loader2,
  X,
  CheckCircle2,
  LocateFixed,
  CalendarIcon,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
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
import { toast } from "sonner"

const locationService = {
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },
  calculateETA: (distance: number): string => {
    const avgSpeed = 40
    const minutes = Math.round((distance / avgSpeed) * 60)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }
}

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

const mapContainerStyle = {
  width: "100%",
  height: "400px",
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
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [hours, setHours] = useState("09")
  const [minutes, setMinutes] = useState("00")
  const [price, setPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fromCoords || !toCoords) {
      toast.error("Please select both locations")
      return
    }

    setIsSubmitting(true)

    try {
      if (!date) {
        toast.error("Please select a date")
        return
      }

      const departureDateTime = new Date(date)
      departureDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      const rideData = {
        startLatitude: fromCoords.lat,
        startLongitude: fromCoords.lng,
        endLatitude: toCoords.lat,
        endLongitude: toCoords.lng,
        departureTime: departureDateTime.toISOString(),
        price: parseFloat(price),
      }

      await rideService.createRide(rideData)
      
      setIsSubmitting(false)
      toast.success("Ride published successfully!", {
        description: "Your ride is now visible to passengers"
      })
      
      setTimeout(() => {
        resetForm()
        navigate("/my-rides")
      }, 1500)
    } catch (error: any) {
      console.error("Failed to create ride:", error)
      toast.error("Failed to create ride", {
        description: error.message || 'Unknown error'
      })
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFromLocation("")
    setToLocation("")
    setFromCoords(null)
    setToCoords(null)
    setRoute([])
    setDate(undefined)
    setHours("09")
    setMinutes("00")
    setPrice("")
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
          toast.success("Location detected")
        },
        (error) => {
          console.error("Error getting location:", error)
          toast.error("Failed to get current location")
          setLoadingLocation(false)
        }
      )
    } else {
      toast.error("Geolocation is not supported by this browser")
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

        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl px-4 md:px-8 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-white">Offer a Ride</h1>
                <p className="text-xs md:text-sm text-white/40">Share your journey and earn money</p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8">
              <form onSubmit={handleSubmit}>
                <div className="max-w-7xl mx-auto">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-6">
                      <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-400" />
                            Route Details
                          </CardTitle>
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

                          {fromCoords && toCoords && (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <div className="p-3 bg-white/5 rounded-lg">
                                <p className="text-xs text-white/40 mb-1">Distance</p>
                                <p className="text-sm font-semibold text-white">
                                  {locationService.calculateDistance(
                                    fromCoords.lat, 
                                    fromCoords.lng, 
                                    toCoords.lat, 
                                    toCoords.lng
                                  ).toFixed(1)} km
                                </p>
                              </div>
                              <div className="p-3 bg-white/5 rounded-lg">
                                <p className="text-xs text-white/40 mb-1">Est. Duration</p>
                                <p className="text-sm font-semibold text-white">
                                  {locationService.calculateETA(
                                    locationService.calculateDistance(
                                      fromCoords.lat, 
                                      fromCoords.lng, 
                                      toCoords.lat, 
                                      toCoords.lng
                                    )
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-blue-400" />
                            Date & Time
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-white/80">Select Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal bg-white/5 border-white/10 hover:bg-white/10 text-white",
                                    !date && "text-white/40"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {date ? format(date, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-zinc-900 border-white/10" align="start" sideOffset={5}>
                                <Calendar
                                  mode="single"
                                  selected={date}
                                  onSelect={setDate}
                                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                  initialFocus
                                  className="rounded-lg border-0"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-white/80">Select Time</Label>
                            <div className="flex gap-2">
                              <Select value={hours} onValueChange={setHours}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                  <SelectValue placeholder="Hour" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 max-h-[200px]">
                                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                                    <SelectItem 
                                      key={hour} 
                                      value={hour.toString().padStart(2, '0')}
                                      className="text-white hover:bg-white/10"
                                    >
                                      {hour.toString().padStart(2, '0')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <span className="text-white/60 text-2xl flex items-center">:</span>
                              <Select value={minutes} onValueChange={setMinutes}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                  <SelectValue placeholder="Min" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 max-h-[200px]">
                                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                                    <SelectItem 
                                      key={minute} 
                                      value={minute.toString().padStart(2, '0')}
                                      className="text-white hover:bg-white/10"
                                    >
                                      {minute.toString().padStart(2, '0')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-xs text-white/40 flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              Selected time: {hours}:{minutes}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                            <IndianRupee className="w-5 h-5 text-blue-400" />
                            Pricing
                          </CardTitle>
                          <CardDescription className="text-xs text-white/40">
                            1 seat available (pillion rider)
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-white/80">Price per Seat</Label>
                            <div className="relative">
                              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                              <Input
                                type="number"
                                placeholder="Enter amount"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                min="0"
                                step="10"
                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                              />
                            </div>
                            <p className="text-xs text-white/40">
                              💡 Suggested: ₹{fromCoords && toCoords ? Math.round(locationService.calculateDistance(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng) * 10) : '0'}
                            </p>
                          </div>
                          
                          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <div className="flex items-start gap-2">
                              <Users className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-blue-400">1 Seat Available</p>
                                <p className="text-xs text-white/60 mt-1">
                                  For bike rides, only 1 passenger seat is available
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Button
                        type="submit"
                        disabled={isSubmitting || !fromLocation || !toLocation || !date || !price}
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

                    <div className="space-y-6">
                      <Card className="border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden">
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
                              <p className="text-white/40 text-xs mb-1">Date</p>
                              <p className="text-white">{date ? format(date, "PPP") : "Not set"}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs mb-1">Time</p>
                              <p className="text-white">{hours}:{minutes}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs mb-1">Seats</p>
                              <p className="text-white">1 Available</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-xs mb-1">Price</p>
                              <p className="text-white font-semibold">₹{price || "0"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </form>
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

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative z-50" ref={dropdownRef}>
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
        <div className="absolute left-0 right-0 top-full mt-2 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl">
          <ScrollArea className="h-[240px]">
            {suggestions.map((item) => (
              <div
                key={item.place_id}
                className="px-3 py-2.5 cursor-pointer hover:bg-white/10 transition-colors flex items-start gap-3 mx-1 rounded-md"
                onClick={() => handleSelect(item)}
              >
                <MapPin className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium break-words">
                    {item.display_name.split(',')[0]}
                  </p>
                  <p className="text-xs text-white/50 break-words line-clamp-1 mt-0.5">
                    {item.display_name.split(',').slice(1).join(',').trim()}
                  </p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}