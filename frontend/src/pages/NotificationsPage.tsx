import { useState } from "react"
import {
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  Car,
  MapPin,
  User,
  DollarSign,
  AlertCircle,
  Info,
  Trash2,
  MoreVertical,
  Filter,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

interface Notification {
  id: string
  type: "ride_request" | "booking_confirmed" | "ride_started" | "ride_completed" | "payment" | "system" | "alert"
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: "low" | "medium" | "high"
  actionRequired?: boolean
  metadata?: {
    rideId?: string
    userName?: string
    userAvatar?: string
    amount?: string
    location?: string
  }
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "ride_request",
    title: "New Ride Request",
    message: "Priya Sharma wants to book your ride from Indiranagar to Whitefield",
    timestamp: "2 mins ago",
    read: false,
    priority: "high",
    actionRequired: true,
    metadata: {
      rideId: "R123",
      userName: "Priya Sharma",
      userAvatar: "",
      location: "Indiranagar → Whitefield",
    },
  },
  {
    id: "2",
    type: "booking_confirmed",
    title: "Booking Confirmed",
    message: "Your ride with Rahul Kumar has been confirmed for 5:30 PM",
    timestamp: "15 mins ago",
    read: false,
    priority: "high",
    metadata: {
      rideId: "R124",
      userName: "Rahul Kumar",
      userAvatar: "",
      location: "Koramangala → HSR Layout",
    },
  },
  {
    id: "3",
    type: "ride_started",
    title: "Ride Started",
    message: "Your driver has started the ride. Track live location",
    timestamp: "1 hour ago",
    read: true,
    priority: "medium",
    metadata: {
      rideId: "R125",
      userName: "Vikram Singh",
      location: "MG Road",
    },
  },
  {
    id: "4",
    type: "payment",
    title: "Payment Received",
    message: "You received ₹320 for ride from Indiranagar to Whitefield",
    timestamp: "2 hours ago",
    read: true,
    priority: "medium",
    metadata: {
      amount: "₹320",
      rideId: "R126",
    },
  },
  {
    id: "5",
    type: "ride_completed",
    title: "Ride Completed",
    message: "Your ride has been completed successfully. Please rate your experience",
    timestamp: "3 hours ago",
    read: true,
    priority: "low",
    actionRequired: true,
    metadata: {
      rideId: "R127",
      userName: "Amit Patel",
    },
  },
  {
    id: "6",
    type: "alert",
    title: "Verification Required",
    message: "Please complete your KYC verification to continue offering rides",
    timestamp: "1 day ago",
    read: false,
    priority: "high",
    actionRequired: true,
  },
  {
    id: "7",
    type: "system",
    title: "New Features Available",
    message: "Check out our new live chat feature for better communication",
    timestamp: "2 days ago",
    read: true,
    priority: "low",
  },
]

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const unreadCount = notifications.filter(n => !n.read).length

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "unread") return !notification.read && matchesSearch
    if (activeTab === "important") return notification.priority === "high" && matchesSearch
    
    return matchesSearch
  })

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ride_request":
        return <Car className="w-5 h-5 text-blue-400" />
      case "booking_confirmed":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case "ride_started":
        return <MapPin className="w-5 h-5 text-purple-400" />
      case "ride_completed":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case "payment":
        return <DollarSign className="w-5 h-5 text-yellow-400" />
      case "alert":
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case "system":
        return <Info className="w-5 h-5 text-cyan-400" />
      default:
        return <Bell className="w-5 h-5 text-white/60" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "ride_request":
        return "bg-blue-500/10 border-blue-500/20"
      case "booking_confirmed":
        return "bg-green-500/10 border-green-500/20"
      case "ride_started":
        return "bg-purple-500/10 border-purple-500/20"
      case "ride_completed":
        return "bg-green-500/10 border-green-500/20"
      case "payment":
        return "bg-yellow-500/10 border-yellow-500/20"
      case "alert":
        return "bg-red-500/10 border-red-500/20"
      case "system":
        return "bg-cyan-500/10 border-cyan-500/20"
      default:
        return "bg-white/5 border-white/10"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="outline" className="border-red-500/50 bg-red-500/10 text-red-400 text-xs">High</Badge>
      case "medium":
        return <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-400 text-xs">Medium</Badge>
      case "low":
        return <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-400 text-xs">Low</Badge>
      default:
        return null
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#0a0a0a]">
        <AppSidebar />

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-400">
                      {unreadCount} new
                    </Badge>
                  )}
                </h1>
                <p className="text-xs md:text-sm text-white/40">Stay updated with your ride activities</p>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="border-white/10 text-white/60 hover:text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>
          </header>

          <div className="p-4 md:p-6 lg:p-8">
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold text-white">All Notifications</CardTitle>
                    <CardDescription className="text-xs text-white/40">
                      {filteredNotifications.length} notifications
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-9"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <div className="p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-white/5 border border-white/10 p-1 w-full sm:w-auto mb-4">
                    <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                      Unread {unreadCount > 0 && `(${unreadCount})`}
                    </TabsTrigger>
                    <TabsTrigger value="important" className="data-[state=active]:bg-blue-600 text-xs sm:text-sm">
                      Important
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-0">
                    <ScrollArea className="h-[calc(100vh-340px)]">
                      <div className="space-y-3 pr-4">
                        {filteredNotifications.length === 0 ? (
                          <Card className="border-white/5 bg-white/5">
                            <CardContent className="p-12 text-center">
                              <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" />
                              <p className="text-white/60">No notifications found</p>
                              <p className="text-sm text-white/40 mt-1">You're all caught up!</p>
                            </CardContent>
                          </Card>
                        ) : (
                          filteredNotifications.map((notification) => (
                            <Card
                              key={notification.id}
                              className={`border ${getNotificationBg(notification.type)} transition-all ${
                                !notification.read ? "ring-1 ring-blue-500/30" : ""
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${getNotificationBg(notification.type)}`}>
                                    {getNotificationIcon(notification.type)}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-sm font-semibold text-white">{notification.title}</h3>
                                        {!notification.read && (
                                          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                        )}
                                        {getPriorityBadge(notification.priority)}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {!notification.read && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => markAsRead(notification.id)}
                                            className="h-7 w-7 text-white/40 hover:text-white"
                                          >
                                            <CheckCircle2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => deleteNotification(notification.id)}
                                          className="h-7 w-7 text-white/40 hover:text-red-400"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>

                                    <p className="text-sm text-white/80 mb-2">{notification.message}</p>

                                    {notification.metadata && (
                                      <div className="flex items-center gap-3 text-xs text-white/60 mb-2 flex-wrap">
                                        {notification.metadata.userName && (
                                          <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            <span>{notification.metadata.userName}</span>
                                          </div>
                                        )}
                                        {notification.metadata.location && (
                                          <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            <span>{notification.metadata.location}</span>
                                          </div>
                                        )}
                                        {notification.metadata.amount && (
                                          <div className="flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            <span>{notification.metadata.amount}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1 text-xs text-white/40">
                                        <Clock className="w-3 h-3" />
                                        <span>{notification.timestamp}</span>
                                      </div>

                                      {notification.actionRequired && (
                                        <div className="flex gap-2">
                                          <Button size="sm" variant="outline" className="h-7 border-white/20 text-white/60 hover:text-white">
                                            Decline
                                          </Button>
                                          <Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700 text-white">
                                            Accept
                                          </Button>
                                        </div>
                                      )}
                                    </div>
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
        </main>
      </div>
    </SidebarProvider>
  )
}
