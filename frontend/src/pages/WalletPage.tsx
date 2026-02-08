import { useState, useEffect } from "react"
import {
  Wallet,
  Download,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { AppSidebar } from "@/components/AppSidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { paymentService, type Transaction } from "@/services/paymentService"
import { rideService } from "@/services/rideService"
import { bookingService } from "@/services/bookingService"
import { toast } from "sonner"

// Reverse geocoding helper function (same as RideDetailsPage)
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

export function WalletPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [transactions, setTransactions] = useState<any[]>([])
  const [pendingEarnings, setPendingEarnings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [walletBalance, setWalletBalance] = useState(0)

  useEffect(() => {
    loadTransactions()
    loadEarnings()
  }, [])

  const generateTransactionReceipt = async (transaction: any) => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
    const userName = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || "User"
    
    // Fetch ride details if rideId is available
    let rideDetails = transaction.ride || null
    let pickupAddress = "N/A"
    let dropAddress = "N/A"
    
    if (transaction.rideId && !rideDetails) {
      try {
        console.log('🔍 Fetching ride details for transaction:', transaction.rideId)
        rideDetails = await rideService.getRideById(transaction.rideId)
      } catch (error) {
        console.error('Failed to fetch ride details:', error)
      }
    }
    
    // Get addresses from ride details with reverse geocoding
    if (rideDetails) {
      try {
        if (rideDetails.startLatitude != null && rideDetails.startLongitude != null) {
          pickupAddress = await reverseGeocode(rideDetails.startLatitude, rideDetails.startLongitude)
        }
        if (rideDetails.endLatitude != null && rideDetails.endLongitude != null) {
          dropAddress = await reverseGeocode(rideDetails.endLatitude, rideDetails.endLongitude)
        }
      } catch (error) {
        console.error('Geocoding failed:', error)
      }
    }
    
    const dateStr = new Date(transaction.date || transaction.createdAt || rideDetails?.departureTime).toLocaleString("en-IN", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true
    })

    // Extract driver information (prioritize from rideDetails)
    const driver = rideDetails?.driver || transaction.driver || transaction.rider || {}
    const driverName = `${driver.firstName || ""} ${driver.lastName || ""}`.trim() || "N/A"
    const vehicleDetails = driver.vehicleDetails || {}
    const vehicleModel = vehicleDetails.vehicleModel || "N/A"
    const vehicleNumber = vehicleDetails.vehicleNumber || "N/A"
    const vehicleColor = vehicleDetails.vehicleColor || "N/A"

    console.log('🧾 Generating receipt with data:', {
      transactionId: transaction.id,
      rideId: transaction.rideId,
      hasRideDetails: !!rideDetails,
      driverName,
      vehicleModel,
      pickupAddress,
      dropAddress
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
      ${rideDetails && (pickupAddress !== 'N/A' || dropAddress !== 'N/A') ? `
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
      ` : transaction.description ? `
      <div class="route-section">
        <div class="route-point">
          <div>
            <div class="route-label">Transaction Details</div>
            <div class="route-address">${transaction.description}</div>
          </div>
        </div>
      </div>
      ` : ''}

      ${driverName !== 'N/A' || vehicleModel !== 'N/A' ? `
      <div class="section">
        <div class="section-title">Driver Details</div>
        <div class="info-grid">
          <div class="info-item"><div class="label">Driver Name</div><div class="value">${driverName}</div></div>
          <div class="info-item"><div class="label">Vehicle Model</div><div class="value">${vehicleModel}</div></div>
          <div class="info-item"><div class="label">Plate Number</div><div class="value">${vehicleNumber}</div></div>
          <div class="info-item"><div class="label">Vehicle Color</div><div class="value" style="text-transform:capitalize">${vehicleColor}</div></div>
        </div>
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Trip Details</div>
        <div class="info-grid">
          <div class="info-item"><div class="label">Date & Time</div><div class="value">${dateStr}</div></div>
          <div class="info-item"><div class="label">Payment Status</div><div class="value" style="text-transform:capitalize">${rideDetails?.paymentStatus || transaction.status || 'Completed'}</div></div>
          ${rideDetails?.platformFee ? `<div class="info-item"><div class="label">Platform Fee</div><div class="value">₹${rideDetails.platformFee.toFixed(2)}</div></div>` : transaction.category ? `<div class="info-item"><div class="label">Category</div><div class="value" style="text-transform:capitalize">${transaction.category}</div></div>` : ''}
          ${rideDetails?.driverEarnings ? `<div class="info-item"><div class="label">Driver Earnings</div><div class="value">₹${rideDetails.driverEarnings.toFixed(2)}</div></div>` : ''}
        </div>
      </div>

      <div class="total">
        <span class="label">Total Amount</span>
        <span class="value">₹${(rideDetails?.price || transaction.amount || 0).toFixed(2)}</span>
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

  const loadTransactions = async () => {
    try {
      const data = await paymentService.getTransactionHistory()
      setTransactions(data)
      
      // Calculate totals from transactions
      const credits = data
        .filter((t: any) => t.type === 'credit')
        .reduce((sum: number, t: any) => sum + t.amount, 0)
      
      const debits = data
        .filter((t: any) => t.type === 'debit')
        .reduce((sum: number, t: any) => sum + t.amount, 0)
      
      setTotalEarnings(credits)
      setTotalSpent(debits)
      setWalletBalance(credits - debits)
      
      toast.success('Transactions loaded', {
        description: `${data.length} transactions found`
      })
    } catch (error) {
      console.error("Failed to load transactions:", error)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const loadEarnings = async () => {
    try {
      const data = await paymentService.getPendingEarnings()
      setPendingEarnings(data.pendingEarnings)
    } catch (error) {
      console.error("Failed to load earnings:", error)
      toast.error('Failed to load earnings')
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = searchQuery === '' || 
      (transaction.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.riderName || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "credit") return transaction.type === "credit" && matchesSearch
    if (activeTab === "debit") return transaction.type === "debit" && matchesSearch
    
    return matchesSearch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-500/50 bg-green-500/10 text-green-400"
      case "pending":
        return "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
      case "failed":
        return "border-red-500/50 bg-red-500/10 text-red-400"
      default:
        return "border-white/20 bg-white/5 text-white/60"
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#0a0a0a]">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <Wallet className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Wallet</h1>
                  <p className="text-xs text-white/50">Track earnings & payments</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadTransactions}
                disabled={loading}
                className="h-9 border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" /> Refresh</>
                )}
              </Button>
            </div>
          </header>

          <div className="p-3 md:p-4 lg:p-5">
            <div className="max-w-6xl mx-auto">
              {/* Transactions Section */}
              <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm">
                <CardHeader className="pb-4 border-b border-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-bold text-white">Transactions</CardTitle>
                      <CardDescription className="text-sm text-white/50 mt-1">
                        {loading ? 'Loading...' : `${filteredTransactions.length} transactions found`}
                      </CardDescription>
                    </div>
                    <div className="relative w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-3 h-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                </CardHeader>

                  <div className="p-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="bg-white/5 border border-white/10 p-1 w-full sm:w-auto mb-4 h-10">
                        <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 text-sm h-8 data-[state=active]:text-white px-6">
                          All Transactions
                        </TabsTrigger>
                        <TabsTrigger value="credit" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-500 text-sm h-8 data-[state=active]:text-white px-6">
                          Credits
                        </TabsTrigger>
                        <TabsTrigger value="debit" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 text-sm h-8 data-[state=active]:text-white px-6">
                          Debits
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value={activeTab} className="mt-0">
                        <ScrollArea className="h-[calc(100vh-300px)]">
                          <div className="space-y-3 pr-4">
                            {loading ? (
                              <Card className="border-white/5 bg-white/[0.03]">
                                <CardContent className="p-12 text-center">
                                  <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-3" />
                                  <p className="text-base text-white/60 font-semibold">Loading transactions...</p>
                                </CardContent>
                              </Card>
                            ) : filteredTransactions.length === 0 ? (
                              <Card className="border-white/5 bg-white/[0.03]">
                                <CardContent className="p-12 text-center">
                                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 mx-auto mb-4">
                                    <Wallet className="w-8 h-8 text-blue-400" />
                                  </div>
                                  <p className="text-base text-white/70 font-semibold mb-2">
                                    {searchQuery ? 'No matching transactions' : 'No transactions yet'}
                                  </p>
                                  <p className="text-sm text-white/40">
                                    {searchQuery ? 'Try different search terms' : 'Your transactions will appear here'}
                                  </p>
                                </CardContent>
                              </Card>
                            ) : (
                              filteredTransactions.map((transaction) => (
                                <Card
                                  key={transaction.id}
                                  className="border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10 transition-all"
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {(transaction.riderName || transaction.rider || transaction.driver || transaction.ride?.driver) ? (
                                          <Avatar className="h-10 w-10 border border-white/10 flex-shrink-0">
                                            <AvatarImage src={transaction.rider?.profileImageUrl || transaction.driver?.profileImageUrl || transaction.ride?.driver?.profileImageUrl} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white text-sm">
                                              {(
                                                transaction.riderName?.charAt(0) || 
                                                transaction.rider?.firstName?.charAt(0) || 
                                                transaction.driver?.firstName?.charAt(0) || 
                                                transaction.ride?.driver?.firstName?.charAt(0) || 
                                                "U"
                                              ).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                        ) : (
                                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 border ${
                                            transaction.type === "credit" 
                                              ? "bg-green-500/10 border-green-500/20" 
                                              : "bg-red-500/10 border-red-500/20"
                                          }`}>
                                            {transaction.type === "credit" ? (
                                              <ArrowDownLeft className="h-5 w-5 text-green-400" />
                                            ) : (
                                              <ArrowUpRight className="h-5 w-5 text-red-400" />
                                            )}
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-white mb-1 truncate">
                                            {transaction.description || 'Transaction'}
                                          </p>
                                          <div className="flex items-center gap-2 text-xs text-white/60">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{new Date(transaction.date || transaction.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            {(transaction.riderName || 
                                              (transaction.rider && `${transaction.rider.firstName} ${transaction.rider.lastName}`.trim()) ||
                                              (transaction.driver && `${transaction.driver.firstName} ${transaction.driver.lastName}`.trim()) ||
                                              (transaction.ride?.driver && `${transaction.ride.driver.firstName} ${transaction.ride.driver.lastName}`.trim())) && (
                                              <>
                                                <span>•</span>
                                                <span className="truncate">
                                                  {transaction.riderName || 
                                                   `${transaction.rider?.firstName || transaction.driver?.firstName || transaction.ride?.driver?.firstName || ''} ${transaction.rider?.lastName || transaction.driver?.lastName || transaction.ride?.driver?.lastName || ''}`.trim()}
                                                </span>
                                              </>
                                            )}
                                          </div>
                                          {(transaction.vehicleModel || transaction.vehicleNumber || 
                                            transaction.rider?.vehicleDetails || transaction.driver?.vehicleDetails || 
                                            transaction.ride?.driver?.vehicleDetails) && (
                                            <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                                              <span>
                                                {transaction.vehicleModel || 
                                                 transaction.rider?.vehicleDetails?.vehicleModel || 
                                                 transaction.driver?.vehicleDetails?.vehicleModel ||
                                                 transaction.ride?.driver?.vehicleDetails?.vehicleModel}
                                              </span>
                                              {(transaction.vehicleNumber || 
                                                transaction.rider?.vehicleDetails?.vehicleNumber || 
                                                transaction.driver?.vehicleDetails?.vehicleNumber ||
                                                transaction.ride?.driver?.vehicleDetails?.vehicleNumber) && (
                                                <>
                                                  <span>•</span>
                                                  <span>
                                                    {transaction.vehicleNumber || 
                                                     transaction.rider?.vehicleDetails?.vehicleNumber || 
                                                     transaction.driver?.vehicleDetails?.vehicleNumber ||
                                                     transaction.ride?.driver?.vehicleDetails?.vehicleNumber}
                                                  </span>
                                                </>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${
                                          transaction.type === "credit" 
                                            ? "bg-green-500/10 border-green-500/20 text-green-400" 
                                            : "bg-red-500/10 border-red-500/20 text-red-400"
                                        }`}>
                                          {transaction.type === "credit" ? (
                                            <><ArrowDownLeft className="h-3 w-3" /> Credit</>
                                          ) : (
                                            <><ArrowUpRight className="h-3 w-3" /> Debit</>
                                          )}
                                        </div>
                                        <Badge variant="outline" className={`text-xs h-6 px-2 ${getStatusColor(transaction.status)}`}>
                                          {transaction.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                          {transaction.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                          {transaction.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                                          <span className="capitalize">{transaction.status}</span>
                                        </Badge>
                                        <p className={`text-lg font-bold flex-shrink-0 ${
                                          transaction.type === "credit" 
                                            ? "text-green-400" 
                                            : "text-red-400"
                                        }`}>
                                          {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount}
                                        </p>
                                        <HoverCard>
                                          <HoverCardTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={async () => {
                                                try {
                                                  toast.loading('Generating receipt...', { id: 'receipt-gen' })
                                                  await generateTransactionReceipt(transaction)
                                                  toast.success('Receipt generated!', { id: 'receipt-gen' })
                                                } catch (error) {
                                                  console.error('Failed to generate receipt:', error)
                                                  toast.error('Failed to generate receipt', { id: 'receipt-gen' })
                                                }
                                              }}
                                              className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0"
                                            >
                                              <FileText className="h-4 w-4" />
                                            </Button>
                                          </HoverCardTrigger>
                                          <HoverCardContent className="w-64 bg-[#1a1a1a] border-white/10">
                                            <div className="space-y-2">
                                              <h4 className="text-sm font-semibold text-white">Download Receipt</h4>
                                              <p className="text-xs text-white/60">
                                                Generate and download a detailed PDF receipt for this transaction with full ride details.
                                              </p>
                                            </div>
                                          </HoverCardContent>
                                        </HoverCard>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </Card>
              </div>
            </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
