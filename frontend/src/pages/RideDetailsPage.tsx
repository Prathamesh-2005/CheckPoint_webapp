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
  Car,
  Download,
  ArrowRight,
  Route,
  Fuel,
  CircleDot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { rideService } from "@/services/rideService"
import { bookingService } from "@/services/bookingService"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RideAnimation } from "@/components/RideAnimation"

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    )
    const data = await res.json()
    if (data?.address) {
      const a = data.address
      const parts = [
        a.road || a.neighbourhood || a.suburb || "",
        a.city || a.town || a.village || a.county || "",
        a.state || "",
      ].filter(Boolean)
      return parts.join(", ") || data.display_name || `${lat}, ${lng}`
    }
    return data.display_name || `${lat}, ${lng}`
  } catch {
    return `${lat}, ${lng}`
  }
}

const parseLatLngString = (str: string): { lat: number; lng: number } | null => {
  if (!str) return null
  const match = str.match(/Lat:\s*([-\d.]+),?\s*Lng:\s*([-\d.]+)/i)
  if (match) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
  }
  const plainMatch = str.match(/^([-\d.]+),\s*([-\d.]+)$/)
  if (plainMatch) {
    const lat = parseFloat(plainMatch[1])
    const lng = parseFloat(plainMatch[2])
    if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng }
    }
  }
  return null
}

const generateReceiptPDF = (ride: any, pickupAddress: string, dropAddress: string) => {
  const driverName = `${ride.driver?.firstName || ""} ${ride.driver?.lastName || ""}`.trim() || "N/A"
  const vehicleModel = ride.driver?.vehicleDetails?.vehicleModel || "N/A"
  const vehicleNumber = ride.driver?.vehicleDetails?.vehicleNumber || "N/A"
  const vehicleColor = ride.driver?.vehicleDetails?.vehicleColor || "N/A"
  const dateStr = new Date(ride.departureTime).toLocaleString("en-IN", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true
  })

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ride Receipt - CheckPoint</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif; background: #ffffff; padding: 20px; color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .receipt { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 2px solid #e5e7eb; }
    .header { background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%); padding: 24px 28px; text-align: center; color: #ffffff; position: relative; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .header::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 16px; background: #ffffff; border-radius: 16px 16px 0 0; }
    .logo { font-size: 26px; font-weight: 900; letter-spacing: -0.8px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .logo-sub { font-size: 12px; opacity: 0.95; font-weight: 600; margin-top: 4px; letter-spacing: 0.5px; }
    .body { padding: 24px 28px; }
    .route-section { background: #f9fafb; border-radius: 12px; padding: 18px; margin-bottom: 18px; position: relative; border: 1px solid #e5e7eb; }
    .route-point { display: flex; align-items: flex-start; gap: 12px; }
    .route-point + .route-point { margin-top: 16px; }
    .route-dot { width: 12px; height: 12px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; border: 2px solid #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .route-dot.pickup { background: #10b981; box-shadow: 0 0 0 4px rgba(16,185,129,0.2); }
    .route-dot.drop { background: #ef4444; box-shadow: 0 0 0 4px rgba(239,68,68,0.2); }
    .route-line { position: absolute; left: 22px; top: 48px; width: 3px; height: 20px; background: linear-gradient(to bottom, #10b981, #ef4444); border-radius: 2px; }
    .route-label { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #6b7280; font-weight: 800; margin-bottom: 3px; }
    .route-address { font-size: 12px; font-weight: 600; color: #1f2937; line-height: 1.4; }
    .section { margin-bottom: 16px; }
    .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 2.5px; color: #6b7280; font-weight: 800; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item .label { font-size: 10px; color: #6b7280; font-weight: 600; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-item .value { font-size: 13px; font-weight: 700; color: #111827; }
    .total { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; background: linear-gradient(135deg, #dbeafe, #e0e7ff); border-radius: 12px; border: 2px solid #93c5fd; margin-top: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .total .label { font-size: 14px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; }
    .total .value { font-size: 26px; font-weight: 900; color: #1d4ed8; }
    .footer { text-align: center; padding: 16px 28px; background: #f9fafb; border-top: 2px solid #e5e7eb; }
    .footer p { font-size: 11px; color: #6b7280; font-weight: 600; }
    .footer .brand { font-weight: 800; color: #374151; margin-top: 4px; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; }
    @media print {
      body { padding: 0; background: white; }
      .receipt { box-shadow: none; border: 1px solid #000; max-width: 100%; }
      @page { margin: 15mm; size: A4 portrait; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="logo">CheckPoint</div>
      <div class="logo-sub">Ride Receipt</div>
    </div>
    <div class="body">
      <div class="route-section">
        <div class="route-point">
          <div class="route-dot pickup"></div>
          <div>
            <div class="route-label">Pickup Location</div>
            <div class="route-address">${pickupAddress}</div>
          </div>
        </div>
        <div class="route-line"></div>
        <div class="route-point">
          <div class="route-dot drop"></div>
          <div>
            <div class="route-label">Drop-off Location</div>
            <div class="route-address">${dropAddress}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Driver Details</div>
        <div class="info-grid">
          <div class="info-item"><div class="label">Driver Name</div><div class="value">${driverName}</div></div>
          <div class="info-item"><div class="label">Vehicle Model</div><div class="value">${vehicleModel}</div></div>
          <div class="info-item"><div class="label">Plate Number</div><div class="value">${vehicleNumber}</div></div>
          <div class="info-item"><div class="label">Vehicle Color</div><div class="value" style="text-transform:capitalize">${vehicleColor}</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Trip Details</div>
        <div class="info-grid">
          <div class="info-item"><div class="label">Date & Time</div><div class="value">${dateStr}</div></div>
          <div class="info-item"><div class="label">Payment Status</div><div class="value" style="text-transform:capitalize">${ride.paymentStatus || "Completed"}</div></div>
          ${ride.platformFee ? `<div class="info-item"><div class="label">Platform Fee</div><div class="value">₹${ride.platformFee.toFixed(2)}</div></div>` : ""}
          ${ride.driverEarnings ? `<div class="info-item"><div class="label">Driver Earnings</div><div class="value">₹${ride.driverEarnings.toFixed(2)}</div></div>` : ""}
        </div>
      </div>

      <div class="total">
        <span class="label">Total Amount</span>
        <span class="value">₹${(ride.price || 0).toFixed(2)}</span>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for riding with CheckPoint!</p>
      <div class="brand">CheckPoint • Safe Rides, Smart Savings</div>
    </div>
  </div>
</body>
</html>`

  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => { printWindow.print() }, 600)
  }
}

export function RideDetailsPage() {
  const navigate = useNavigate()
  const { rideId } = useParams()
  const [isBooking, setIsBooking] = useState(false)
  const [ride, setRide] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [booking, setBooking] = useState<any>(null)
  const [showOwnRideAlert, setShowOwnRideAlert] = useState(false)
  const [alreadyBooked, setAlreadyBooked] = useState(false)
  const [checkingBooking, setCheckingBooking] = useState(true)
  const { toast } = useToast()

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")

  const [pickupAddress, setPickupAddress] = useState<string | null>(null)
  const [dropAddress, setDropAddress] = useState<string | null>(null)

  const isOwnRide = ride?.driver?.id === currentUser?.id

  useEffect(() => {
    loadRideDetails()
  }, [rideId])

  useEffect(() => {
    console.log('🔄 alreadyBooked state changed:', alreadyBooked)
    console.log('🔄 checkingBooking state:', checkingBooking)
    console.log('🔄 isOwnRide:', isOwnRide)
  }, [alreadyBooked, checkingBooking, isOwnRide])

  const loadRideDetails = async () => {
    try {
      const data = await rideService.getRideById(rideId!)
      setRide(data)
      
      console.log('🔍 About to check bookings. Current user:', currentUser)
      console.log('🔍 Current user has ID?', currentUser?.id)
      
      // Check if user has already booked this ride
      if (currentUser?.id) {
        console.log('✅ User has ID, calling checkIfAlreadyBooked')
        await checkIfAlreadyBooked()
      } else {
        console.log('⚠️ No user ID found, skipping booking check')
        setCheckingBooking(false)
      }
    } catch (error) {
      console.error("Failed to load ride:", error)
      setCheckingBooking(false)
    } finally {
      setLoading(false)
    }
  }

  const checkIfAlreadyBooked = async () => {
    try {
      console.log('🔍 Starting booking check for ride:', rideId)
      console.log('👤 Current user:', currentUser)
      
      const bookings = await bookingService.getMyBookings()
      console.log('📋 All bookings received:', bookings)
      
      const hasBooked = bookings.some(
        (b: any) => {
          const bookingRideId = b.ride?.id || b.rideId
          const rideIdMatch = bookingRideId === rideId || String(bookingRideId) === String(rideId)
          const statusMatch = b.status === 'CONFIRMED' || b.status === 'PENDING' || b.status === 'ACCEPTED'
          
          console.log(`Checking booking ${b.id}:`, {
            bookingRideId,
            currentRideId: rideId,
            rideIdMatch,
            status: b.status,
            statusMatch,
            matches: rideIdMatch && statusMatch
          })
          
          return rideIdMatch && statusMatch
        }
      )
      
      console.log('✅ Already booked result:', hasBooked)
      setAlreadyBooked(hasBooked)
    } catch (error) {
      console.error("❌ Failed to check booking status:", error)
    } finally {
      setCheckingBooking(false)
      console.log('✅ Booking check complete')
    }
  }

  useEffect(() => {
    if (!ride) return

    console.log("Ride object:", JSON.stringify(ride, null, 2))

    const resolveAddresses = async () => {
      // Match exact backend field names: startLatitude, startLongitude, endLatitude, endLongitude
      const pLat = ride.startLatitude ?? ride.pickupLat ?? ride.pickupLatitude ?? ride.fromLat ?? ride.sourceLat
      const pLng = ride.startLongitude ?? ride.pickupLng ?? ride.pickupLongitude ?? ride.fromLng ?? ride.sourceLng
      const dLat = ride.endLatitude ?? ride.dropLat ?? ride.dropLatitude ?? ride.toLat ?? ride.destinationLat
      const dLng = ride.endLongitude ?? ride.dropLng ?? ride.dropLongitude ?? ride.toLng ?? ride.destinationLng

      // Resolve pickup
      if (pLat != null && pLng != null) {
        const addr = await reverseGeocode(Number(pLat), Number(pLng))
        setPickupAddress(addr)
      } else {
        const fromStr = ride.from || ride.pickupLocation || ride.source || ride.origin || ""
        const parsed = parseLatLngString(fromStr)
        if (parsed) {
          const addr = await reverseGeocode(parsed.lat, parsed.lng)
          setPickupAddress(addr)
        } else if (fromStr && fromStr.trim()) {
          setPickupAddress(fromStr)
        } else {
          setPickupAddress("Location not available")
        }
      }

      // Resolve drop
      if (dLat != null && dLng != null) {
        const addr = await reverseGeocode(Number(dLat), Number(dLng))
        setDropAddress(addr)
      } else {
        const toStr = ride.to || ride.dropLocation || ride.destination || ""
        const parsed = parseLatLngString(toStr)
        if (parsed) {
          const addr = await reverseGeocode(parsed.lat, parsed.lng)
          setDropAddress(addr)
        } else if (toStr && toStr.trim()) {
          setDropAddress(toStr)
        } else {
          setDropAddress("Location not available")
        }
      }
    }

    resolveAddresses()
  }, [ride])

  const handleBookRide = async () => {
    if (isOwnRide) {
      setShowOwnRideAlert(true)
      return
    }

    if (ride.status === "COMPLETED") {
      toast({ title: "Ride Completed", description: "This ride has already been completed.", variant: "destructive" })
      return
    }

    if (ride.availableSeats === 0) {
      toast({ title: "No Seats Available", description: "This ride is fully booked.", variant: "destructive" })
      return
    }

    setIsBooking(true)
    try {
      const bookingResponse = await bookingService.requestRide(rideId!)
      setBooking(bookingResponse)
      setAlreadyBooked(true) // Mark as booked after successful booking
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        navigate("/my-rides")
      }, 2000)
    } catch (error: any) {
      // Check if error message indicates already booked
      const errorMessage = error.message || ''
      console.log('❌ Booking error caught:', errorMessage)
      
      if (errorMessage.toLowerCase().includes('already booked')) {
        console.log('✅ Detected "already booked" error, updating state')
        setAlreadyBooked(true)
        toast({ 
          title: "Already Booked", 
          description: "You have already booked this ride.", 
          variant: "default" 
        })
      } else {
        toast({ 
          title: "Booking Failed", 
          description: errorMessage || "Failed to book ride", 
          variant: "destructive" 
        })
      }
    } finally {
      setIsBooking(false)
      console.log('🔄 Booking state updated. alreadyBooked:', alreadyBooked)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-500/15 text-green-400 border-green-500/30"
      case "IN_PROGRESS": return "bg-blue-500/15 text-blue-400 border-blue-500/30"
      case "CANCELLED": return "bg-red-500/15 text-red-400 border-red-500/30"
      default: return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-white/40 text-sm">Loading ride details...</p>
        </div>
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] gap-4">
        <AlertCircle className="w-12 h-12 text-white/20" />
        <p className="text-white/60 text-lg">Ride not found</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="border-white/10 text-white/60">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white/60 hover:text-white hover:bg-white/5"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-white">Ride Details</h1>
                <p className="text-xs md:text-sm text-white/40">Review before booking</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(ride.status)} text-sm px-3 py-1`}>
              {ride.status}
            </Badge>
          </div>
        </div>
      </header>

      {/* Route Banner - Horizontal at top */}
      <div className="border-b border-white/5 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-5 pb-2">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5">
            {/* Pickup */}
            <div className="flex-1 w-full">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  <div className="w-3 h-3 rounded-full bg-green-500 ring-[3px] ring-green-500/20" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase tracking-widest text-green-400/80 font-semibold mb-0.5">Pickup</p>
                  <p className="text-white font-medium text-sm leading-tight">
                    {pickupAddress ?? (
                      <span className="flex items-center gap-2 text-white/40">
                        <Loader2 className="w-3 h-3 animate-spin" /> Resolving...
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="md:hidden w-full flex justify-center">
              <div className="w-[2px] h-4 bg-gradient-to-b from-green-500/50 to-red-500/50" />
            </div>

            {/* Drop */}
            <div className="flex-1 w-full">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  <div className="w-3 h-3 rounded-full bg-red-500 ring-[3px] ring-red-500/20" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase tracking-widest text-red-400/80 font-semibold mb-0.5">Drop-off</p>
                  <p className="text-white font-medium text-sm leading-tight">
                    {dropAddress ?? (
                      <span className="flex items-center gap-2 text-white/40">
                        <Loader2 className="w-3 h-3 animate-spin" /> Resolving...
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Price pill */}
            <div className="md:ml-2 flex items-center gap-1.5 bg-white/5 rounded-full px-4 py-2 border border-white/10">
              <span className="text-green-400 font-bold text-sm">₹</span>
              <span className="text-xl font-bold text-white">{ride.price}</span>
              <span className="text-white/40 text-[10px]">/seat</span>
            </div>
          </div>

          {/* Bike animation track */}
          <div className="hidden md:block mt-1 relative">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-gradient-to-r from-green-500/30 via-white/5 to-red-500/30 rounded-full" />
            <RideAnimation />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-5">
            {/* Driver Info */}
            <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
              <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <CardContent className="p-6">
                <div className="flex items-center gap-5">
                  <Avatar>
                    <AvatarImage src={ride.driver?.profileImageUrl} />
                    <AvatarFallback>
                      {ride.driver?.firstName?.[0]}{ride.driver?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-xl font-bold text-white">
                        {ride.driver?.firstName} {ride.driver?.lastName}
                      </h2>
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                      {isOwnRide && (
                        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[11px]">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-white/40">Driver</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full text-white/40 hover:text-white hover:bg-white/5">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full text-white/40 hover:text-white hover:bg-white/5"
                      onClick={() => navigate("/chat")}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            {ride.driver?.vehicleDetails && (
              <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                      <Car className="w-4 h-4 text-blue-400" />
                    </div>
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium">Number</p>
                      <p className="text-white font-bold text-base tracking-wide">
                        {ride.driver.vehicleDetails.vehicleNumber}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium">Model</p>
                      <p className="text-white font-semibold capitalize">
                        {ride.driver.vehicleDetails.vehicleModel}
                      </p>
                    </div>
                    {ride.driver.vehicleDetails.vehicleColor && (
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium">Color</p>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-white/20" style={{
                            backgroundColor: ride.driver.vehicleDetails.vehicleColor.toLowerCase()
                          }} />
                          <p className="text-white font-semibold capitalize">
                            {ride.driver.vehicleDetails.vehicleColor}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium">Verified</p>
                      <Badge variant="outline" className={`text-xs ${
                        ride.driver.vehicleDetails.isVerified
                          ? "bg-green-500/10 text-green-400 border-green-500/30"
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                      }`}>
                        {ride.driver.vehicleDetails.isVerified ? "✅ Verified" : "⏳ Pending"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Route */}
            <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                    <Route className="w-4 h-4 text-purple-400" />
                  </div>
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-500/10" />
                    <div className="w-0.5 flex-1 min-h-[60px] bg-gradient-to-b from-green-500/40 via-white/10 to-red-500/40" />
                    <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/10" />
                  </div>
                  <div className="flex-1 space-y-8">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-green-400/80 font-semibold mb-1.5">Pickup Location</p>
                      <p className="text-white font-medium text-sm leading-relaxed">
                        {pickupAddress ?? (
                          <span className="flex items-center gap-2 text-white/40">
                            <Loader2 className="w-3 h-3 animate-spin" /> Resolving...
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-red-400/80 font-semibold mb-1.5">Drop-off Location</p>
                      <p className="text-white font-medium text-sm leading-relaxed">
                        {dropAddress ?? (
                          <span className="flex items-center gap-2 text-white/40">
                            <Loader2 className="w-3 h-3 animate-spin" /> Resolving...
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                    <Calendar className="w-4 h-4 text-orange-400" />
                  </div>
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium">Date</p>
                    <p className="text-white font-semibold">
                      {new Date(ride.departureTime).toLocaleDateString("en-IN", {
                        weekday: "short", year: "numeric", month: "short", day: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium">Time</p>
                    <p className="text-white font-semibold">
                      {new Date(ride.departureTime).toLocaleTimeString("en-IN", {
                        hour: "2-digit", minute: "2-digit", hour12: true
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium">Status</p>
                    <Badge variant="outline" className={`${getStatusColor(ride.status)} text-xs`}>
                      {ride.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-4 space-y-5">
            <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm sticky top-24 overflow-hidden">
              <div className="h-0.5 w-full bg-gradient-to-r from-green-500 to-blue-500" />
              <CardContent className="p-6 space-y-5">
                {/* Price */}
                <div className="text-center py-2">
                  <p className="text-[11px] uppercase tracking-widest text-white/30 font-medium mb-2">Price per seat</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold text-white">₹{ride.price}</span>
                  </div>
                </div>

                <Separator className="bg-white/5" />

                {ride.status === "COMPLETED" ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                      <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 text-sm font-semibold">Ride Completed</p>
                      <p className="text-white/40 text-xs mt-1">This ride has finished</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full h-11 border-white/10 text-white hover:bg-white/5"
                      onClick={() => generateReceiptPDF(ride, pickupAddress || "N/A", dropAddress || "N/A")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Receipt
                    </Button>
                  </div>
                ) : isOwnRide ? (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                    <Info className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-purple-400 text-sm font-semibold">Your Ride</p>
                    <p className="text-white/40 text-xs mt-1">You can't book your own ride</p>
                  </div>
                ) : alreadyBooked ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                      <CheckCircle2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-blue-400 text-sm font-semibold">Already Booked</p>
                      <p className="text-white/40 text-xs mt-1">You have already booked this ride</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full h-11 border-white/10 text-white hover:bg-white/5"
                      onClick={() => navigate("/my-rides")}
                    >
                      View My Rides
                    </Button>
                  </div>
                ) : checkingBooking ? (
                  <div className="p-4 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto mb-2" />
                    <p className="text-white/40 text-xs">Checking availability...</p>
                  </div>
                ) : (
                  <>
                    <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
                      <div className="flex items-center gap-2.5 text-blue-400 text-sm mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">Available Seats</span>
                      </div>
                      <p className="text-white text-2xl font-bold">{ride.availableSeats}</p>
                    </div>

                    <Button
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
                      onClick={handleBookRide}
                      disabled={isBooking || ride.availableSeats === 0}
                    >
                      {isBooking ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...</>
                      ) : ride.availableSeats === 0 ? (
                        "Fully Booked"
                      ) : (
                        "Book This Ride"
                      )}
                    </Button>
                  </>
                )}

                <Separator className="bg-white/5" />

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <Shield className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Verified driver & safe ride</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Secure payment after completion</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <Navigation className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Real-time ride tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Own Ride AlertDialog */}
      <AlertDialog open={showOwnRideAlert} onOpenChange={setShowOwnRideAlert}>
        <AlertDialogContent className="bg-[#141414] border-white/10 text-white max-w-md p-0 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
          <div className="p-6 pb-2 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 mb-5 ring-1 ring-red-500/20">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <AlertDialogHeader className="space-y-2">
              <AlertDialogTitle className="text-xl font-semibold text-white text-center">
                Can't Book Your Own Ride
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-white/50 text-center leading-relaxed">
                You are the driver of this ride. You cannot book a seat on your own ride.
                Share this ride with others so they can book it!
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="p-6 pt-4">
            <AlertDialogAction className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium h-11 rounded-lg">
              Got It
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="border-green-500/30 bg-[#141414] max-w-md w-full overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
            <CardContent className="p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15 mx-auto mb-5 ring-1 ring-green-500/20">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Booking Confirmed!</h3>
              <p className="text-white/50 mb-6 text-sm">Your ride has been booked successfully. The driver will contact you shortly.</p>
              <Button
                onClick={() => navigate("/my-rides")}
                className="w-full h-11 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold"
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
