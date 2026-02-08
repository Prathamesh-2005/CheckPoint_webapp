import { useState, useEffect } from "react"
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
  Loader2,
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
import { notificationService } from "@/services/notificationService"
import { bookingService } from "@/services/bookingService"
import { toast } from "sonner"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  rideId?: string
  bookingId?: string
  actionRequired?: boolean
  priority?: string
  metadata?: {
    userName?: string
    location?: string
    amount?: string
  }
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [processingBooking, setProcessingBooking] = useState<string | null>(null)

  useEffect(() => {
    loadNotifications()
    
    // Listen for real-time notifications
    const unsubscribe = notificationService.onNotification((notification) => {
      setNotifications(prev => [notification as any, ...prev])
    })
    
    return () => unsubscribe()
  }, [])

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications()
      
      // Check booking status for each notification with actionRequired
      const processedNotifications = await Promise.all(
        data.map(async (notification: any) => {
          if (notification.actionRequired && notification.bookingId) {
            try {
              // Try to get booking status
              const bookings = await bookingService.getMyBookings()
              const booking = bookings.find((b: any) => b.id === notification.bookingId)
              
              // If booking is already ACCEPTED, CONFIRMED, or REJECTED, hide action buttons
              if (booking && ['ACCEPTED', 'CONFIRMED', 'REJECTED', 'CANCELLED'].includes(booking.status)) {
                console.log(`🔍 Booking ${notification.bookingId} already processed: ${booking.status}`)
                return { ...notification, actionRequired: false }
              }
            } catch (error) {
              console.error('Failed to check booking status:', error)
            }
          }
          return notification
        })
      )
      
      setNotifications(processedNotifications as any)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      toast.success('Marked as read')
    } catch (error) {
      console.error('Failed to mark as read:', error)
      toast.error('Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.error('Notification deleted', {
        description: 'The notification has been removed.'
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const handleAcceptBooking = async (bookingId: string, notificationId: string) => {
    setProcessingBooking(bookingId)
    
    try {
      await bookingService.acceptBooking(bookingId)
      // ✅ Remove notification immediately after successful acceptance
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      toast.success('Booking Accepted!', {
        description: 'The ride request has been confirmed successfully.'
      })
    } catch (error: any) {
      console.error('Accept booking error:', error)
      const errorMessage = error.message?.toLowerCase() || ''
      
      // Check for already processed errors with multiple possible messages
      if (errorMessage.includes('already') && (
          errorMessage.includes('accepted') || 
          errorMessage.includes('confirmed') ||
          errorMessage.includes('processed')
        )) {
        // Remove notification if already processed
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        toast.info('Already Processed', {
          description: 'This booking was already confirmed.'
        })
      } else {
        toast.error('Failed to Accept', {
          description: error.message || 'Could not accept the booking request.'
        })
      }
    } finally {
      setProcessingBooking(null)
    }
  }

  const handleRejectBooking = async (bookingId: string, notificationId: string) => {
    setProcessingBooking(bookingId)
    
    try {
      await bookingService.rejectBooking(bookingId)
      // ✅ Remove notification immediately after successful rejection
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      toast.success('Booking Declined', {
        description: 'The ride request has been declined.'
      })
    } catch (error: any) {
      console.error('Reject booking error:', error)
      const errorMessage = error.message?.toLowerCase() || ''
      
      // Check for already processed errors
      if (errorMessage.includes('already') && (
          errorMessage.includes('rejected') || 
          errorMessage.includes('confirmed') ||
          errorMessage.includes('processed') ||
          errorMessage.includes('accepted')
        )) {
        // Remove notification if already processed
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        toast.info('Already Processed', {
          description: 'This booking was already handled.'
        })
      } else {
        toast.error('Failed to Decline', {
          description: error.message || 'Could not decline the booking request.'
        })
      }
    } finally {
      setProcessingBooking(null)
    }
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

  const getPriorityBadge = (priority?: string) => {
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
          <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl px-4 md:px-8 py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                  <BellRing className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    Notifications
                    {unreadCount > 0 && (
                      <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-400 animate-pulse">
                        {unreadCount} new
                      </Badge>
                    )}
                  </h1>
                  <p className="text-xs md:text-sm text-white/50 mt-0.5">Stay updated with your ride activities</p>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>
          </header>

          <div className="p-4 md:p-6 lg:p-8">
            <Card className="border-white/5 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="pb-4 border-b border-white/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold text-white">All Notifications</CardTitle>
                    <CardDescription className="text-xs text-white/50 mt-1">
                      {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
                      {searchQuery && ` matching "${searchQuery}"`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <div className="p-5">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-white/5 border border-white/10 p-1 w-full sm:w-auto mb-5">
                    <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 text-xs sm:text-sm data-[state=active]:text-white">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 text-xs sm:text-sm data-[state=active]:text-white">
                      Unread {unreadCount > 0 && <Badge className="ml-1.5 h-5 px-1.5 bg-blue-400 text-white text-[10px]">{unreadCount}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="important" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 text-xs sm:text-sm data-[state=active]:text-white">
                      Important
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-0">
                    <ScrollArea className="h-[calc(100vh-340px)]">
                      <div className="space-y-3 pr-4">
                        {loading ? (
                          <Card className="border-white/5 bg-white/[0.03]">
                            <CardContent className="p-12 text-center">
                              <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-3" />
                              <p className="text-white/60">Loading notifications...</p>
                            </CardContent>
                          </Card>
                        ) : filteredNotifications.length === 0 ? (
                          <Card className="border-white/5 bg-white/[0.03]">
                            <CardContent className="p-16 text-center">
                              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 mx-auto mb-4">
                                <Bell className="w-10 h-10 text-blue-400" />
                              </div>
                              <p className="text-white/70 font-semibold text-lg mb-1">
                                {searchQuery ? 'No matching notifications' : 'No notifications found'}
                              </p>
                              <p className="text-sm text-white/40">
                                {searchQuery ? 'Try a different search term' : "You're all caught up!"}
                              </p>
                            </CardContent>
                          </Card>
                        ) : (
                          filteredNotifications.map((notification) => (
                            <Card
                              key={notification.id}
                              className={`border ${getNotificationBg(notification.type)} transition-all hover:border-white/20 ${
                                !notification.read ? "ring-2 ring-blue-500/40" : ""
                              }`}
                            >
                              <CardContent className="p-5">
                                <div className="flex items-start gap-3">
                                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${getNotificationBg(notification.type)}`}>
                                    {getNotificationIcon(notification.type)}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-base font-bold text-white">{notification.title}</h3>
                                        {!notification.read && (
                                          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
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

                                    <p className="text-sm text-white/70 leading-relaxed mb-3">{notification.message}</p>

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
                                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                                      </div>

                                      {notification.actionRequired && notification.bookingId && (
                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-8 px-4 border-white/20 text-white/70 hover:text-white hover:bg-red-500/10 hover:border-red-500/30"
                                            onClick={() => handleRejectBooking(notification.bookingId!, notification.id)}
                                            disabled={processingBooking === notification.bookingId}
                                          >
                                            {processingBooking === notification.bookingId ? (
                                              <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Processing</>
                                            ) : (
                                              'Decline'
                                            )}
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            className="h-8 px-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold shadow-lg shadow-green-500/20"
                                            onClick={() => handleAcceptBooking(notification.bookingId!, notification.id)}
                                            disabled={processingBooking === notification.bookingId}
                                          >
                                            {processingBooking === notification.bookingId ? (
                                              <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Processing</>
                                            ) : (
                                              'Accept'
                                            )}
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
