import { useState, useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  Send,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Image as ImageIcon,
  Paperclip,
  Loader2,
  MessageCircle,
  Search,
  Smile,
  Mic,
  Check,
  CheckCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { chatService } from "@/services/chatService"
import { bookingService } from "@/services/bookingService"

interface Message {
  messageId: string
  senderId: string
  message: string
  sentAt: string
  status?: 'sending' | 'sent' | 'delivered' | 'read'
}

interface Conversation {
  bookingId: string
  rideId: string
  otherUser: {
    name: string
    avatar: string
    id: string
  }
  lastMessage: string
  lastMessageTime?: string
  unreadCount: number
  isOnline?: boolean
}

export function ChatPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load all conversations from bookings
  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const bookings = await bookingService.getMyBookings()
      
      console.log('📦 Raw bookings data:', bookings)
      
      const convos = bookings
        .filter((b: any) => b.status === 'ACCEPTED' || b.status === 'CONFIRMED')
        .map((b: any) => {
          console.log('Processing booking:', b)
          
          const isDriver = currentUser.id === b.ride?.driver?.id
          
          let otherUserName = ''
          let otherUserAvatar = ''
          let otherUserId = null
          
          if (isDriver) {
            const passenger = b.passenger
            console.log('Driver view - Passenger data:', passenger)
            
            if (passenger) {
              otherUserName = `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim()
              otherUserAvatar = passenger.profileImageUrl || ''
              otherUserId = passenger.id
            }
          } else {
            const driver = b.ride?.driver
            console.log('Passenger view - Driver data:', driver)
            
            if (driver) {
              otherUserName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
              otherUserAvatar = driver.profileImageUrl || ''
              otherUserId = driver.id
            }
          }
          
          console.log('Extracted name:', otherUserName)
          console.log('Extracted avatar:', otherUserAvatar)
          
          if (!otherUserName) {
            otherUserName = isDriver ? 'Passenger' : 'Driver'
          }

          return {
            bookingId: b.bookingId || b.id,
            rideId: b.rideId || b.ride?.id,
            otherUser: {
              id: otherUserId,
              name: otherUserName,
              avatar: otherUserAvatar,
            },
            lastMessage: '',
            lastMessageTime: '',
            unreadCount: 0,
            isOnline: false,
          }
        })
      
      console.log('✅ Final conversations:', convos)
      setConversations(convos)
      
      const bookingIdFromUrl = searchParams.get('bookingId')
      if (bookingIdFromUrl && convos.length > 0) {
        setSelectedConversation(bookingIdFromUrl)
        await loadChatHistory(bookingIdFromUrl)
      } else if (convos.length > 0) {
        setSelectedConversation(convos[0].bookingId)
        await loadChatHistory(convos[0].bookingId)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChatHistory = async (bookingId: string) => {
    try {
      const history = await chatService.getChatHistory(bookingId)
      console.log('📜 Chat history loaded:', history)
      setMessages(history || [])
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error('Failed to load chat history:', error)
      setMessages([])
    }
  }

useEffect(() => {
  if (!selectedConversation) return

  let unsubscribe: (() => void) | undefined

  const setupChat = async () => {
    try {
      await loadChatHistory(selectedConversation)
      
      unsubscribe = await chatService.subscribeToChat(selectedConversation, (message) => {
        setMessages(prev => {
          const isDuplicate = prev.some(m => m.messageId === message.messageId)
          if (isDuplicate) return prev
          return [...prev, message]
        })
        setTimeout(scrollToBottom, 100)
      })
    } catch (error) {
      console.error('Chat setup failed:', error)
    }
  }

  setupChat()

  return () => {
    if (unsubscribe) unsubscribe()
  }
}, [selectedConversation])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setSending(true)

    try {
      await chatService.sendMessage(selectedConversation, messageText)
    } catch (error) {
      console.error('Failed to send message:', error)
      setNewMessage(messageText)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const selectedConvo = conversations.find(c => c.bookingId === selectedConversation)

  const filteredConversations = conversations.filter(c => 
    c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (loading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-[#0a0a0a]">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#0a0a0a]">
        <AppSidebar />

        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="lg:hidden sticky top-0 z-10 border-b border-white/5 bg-[#111]/95 backdrop-blur-xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-white">Messages</h1>
                <p className="text-xs text-white/40">Chat with drivers and passengers</p>
              </div>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            <aside className={`
              ${selectedConversation ? 'hidden lg:flex' : 'flex'} 
              flex-col w-full lg:w-96 border-r border-white/5 bg-[#111]
            `}>
              <div className="flex-shrink-0 p-4 border-b border-white/5">
                <h2 className="text-xl font-semibold text-white mb-3">Chats</h2>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-16 px-4">
                      <MessageCircle className="w-16 h-16 text-white/10 mx-auto mb-4" />
                      <p className="text-white/60 text-sm font-medium mb-1">
                        {searchQuery ? 'No conversations found' : 'No conversations yet'}
                      </p>
                      <p className="text-white/40 text-xs">
                        {searchQuery ? 'Try a different search' : 'Book a ride to start chatting'}
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((convo) => (
                      <div
                        key={convo.bookingId}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all mb-1
                          ${selectedConversation === convo.bookingId 
                            ? 'bg-blue-500/20 border border-blue-500/30' 
                            : 'hover:bg-white/5 border border-transparent'
                          }
                        `}
                        onClick={() => {
                          setSelectedConversation(convo.bookingId)
                          loadChatHistory(convo.bookingId)
                        }}
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-12 w-12 ring-2 ring-white/10">
                            <AvatarImage src={convo.otherUser.avatar} />
                            <AvatarFallback className="bg-blue-600 text-white font-semibold">
                              {convo.otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {convo.otherUser.name}
                          </p>
                          <p className="text-xs text-white/40 truncate">
                            Tap to chat
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </aside>

            <div className={`
              ${!selectedConversation ? 'hidden lg:flex' : 'flex'} 
              flex-1 flex-col overflow-hidden bg-[#0a0a0a]
            `}>
              {selectedConvo ? (
                <>
                  <header className="flex-shrink-0 border-b border-white/5 bg-[#111]/95 backdrop-blur-xl">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="lg:hidden text-white hover:bg-white/10"
                          onClick={() => setSelectedConversation(null)}
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </Button>
                        
                        <Avatar className="h-10 w-10 ring-2 ring-white/10 flex-shrink-0">
                          <AvatarImage src={selectedConvo.otherUser.avatar} />
                          <AvatarFallback className="bg-blue-600 text-white font-semibold">
                            {selectedConvo.otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {selectedConvo.otherUser.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hidden sm:flex">
                          <Phone className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </header>

                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto bg-[#0a0a0a]"
                  >
                    <div className="max-w-4xl mx-auto px-4 py-6">
                      {messages.length === 0 ? (
                        <div className="text-center py-16">
                          <MessageCircle className="w-16 h-16 text-white/10 mx-auto mb-4" />
                          <p className="text-white/60 text-sm">No messages yet</p>
                          <p className="text-white/40 text-xs mt-1">Start the conversation!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {messages.map((msg) => {
                            const isOwn = msg.senderId === currentUser.id
                            
                            return (
                              <div 
                                key={msg.messageId} 
                                className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                              >
                                <div className={`
                                  max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg
                                `}>
                                  <div className={`
                                    rounded-2xl px-4 py-2.5 shadow-lg
                                    ${isOwn 
                                      ? 'bg-blue-600 text-white rounded-br-md' 
                                      : 'bg-white/10 backdrop-blur-sm text-white border border-white/5 rounded-bl-md'
                                    }
                                  `}>
                                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                      {msg.message}
                                    </p>
                                    

                                    <div className={`
                                      flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}
                                      >
                                      <span className={`
                                        text-xs ${isOwn ? 'text-white/70' : 'text-white/40'}`}
                                        >
                                        {formatMessageTime(msg.sentAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>
                  </div>

                  <footer className="flex-shrink-0 border-t border-white/5 bg-[#111] p-4">
                    <div className="max-w-4xl mx-auto">
                      <div className="flex items-end gap-2">
                        <div className="flex-1 relative">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="
                              bg-white/5 border-white/10 text-white placeholder:text-white/40 
                              focus:border-blue-500/50 focus:ring-blue-500/20
                              rounded-full px-6 py-6
                            "
                            disabled={sending}
                          />
                        </div>

                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sending}
                          size="icon"
                          className="
                            bg-blue-600 hover:bg-blue-700
                            text-white shadow-lg
                            disabled:opacity-50 disabled:cursor-not-allowed
                            flex-shrink-0 h-12 w-12 rounded-full
                          "
                        >
                          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                      </div>
                    </div>
                  </footer>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <MessageCircle className="w-24 h-24 text-blue-500/30 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-white/50 text-sm">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}