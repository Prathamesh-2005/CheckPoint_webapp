import { useState, useRef, useEffect } from "react"
import {
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Search,
  ArrowLeft,
  MapPin,
  Clock,
  CheckCheck,
  Check,
  Smile,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
  status: "sent" | "delivered" | "read"
  type: "text" | "location" | "ride"
}

interface Chat {
  id: string
  userId: string
  userName: string
  userAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  online: boolean
  rideInfo?: {
    from: string
    to: string
    time: string
  }
}

const mockChats: Chat[] = [
  {
    id: "1",
    userId: "user1",
    userName: "Priya Sharma",
    userAvatar: "",
    lastMessage: "Thanks! See you at 5:30 PM",
    lastMessageTime: "2m ago",
    unreadCount: 2,
    online: true,
    rideInfo: {
      from: "Indiranagar",
      to: "Whitefield",
      time: "Today, 5:30 PM",
    },
  },
  {
    id: "2",
    userId: "user2",
    userName: "Rahul Kumar",
    userAvatar: "",
    lastMessage: "I'm 5 minutes away",
    lastMessageTime: "15m ago",
    unreadCount: 0,
    online: true,
    rideInfo: {
      from: "Koramangala",
      to: "HSR Layout",
      time: "Today, 6:00 PM",
    },
  },
  {
    id: "3",
    userId: "user3",
    userName: "Vikram Singh",
    userAvatar: "",
    lastMessage: "Thank you for the ride!",
    lastMessageTime: "1h ago",
    unreadCount: 0,
    online: false,
  },
]

const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "user1",
    text: "Hi! I just booked your ride to Whitefield",
    timestamp: "10:30 AM",
    status: "read",
    type: "text",
  },
  {
    id: "2",
    senderId: "me",
    text: "Great! I'll pick you up at Indiranagar Metro Station",
    timestamp: "10:32 AM",
    status: "read",
    type: "text",
  },
  {
    id: "3",
    senderId: "user1",
    text: "Perfect! What time should I be ready?",
    timestamp: "10:33 AM",
    status: "read",
    type: "text",
  },
  {
    id: "4",
    senderId: "me",
    text: "5:30 PM sharp. Please be on time 🙂",
    timestamp: "10:35 AM",
    status: "read",
    type: "text",
  },
  {
    id: "5",
    senderId: "user1",
    text: "Thanks! See you at 5:30 PM",
    timestamp: "10:36 AM",
    status: "delivered",
    type: "text",
  },
]

export function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(mockChats[0])
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showChatList, setShowChatList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: "me",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
      type: "text",
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const filteredChats = mockChats.filter(chat =>
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getMessageStatus = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-4 h-4 text-white/40" />
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-white/40" />
      case "read":
        return <CheckCheck className="w-4 h-4 text-blue-400" />
      default:
        return null
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden">
        <AppSidebar />

        <main className="flex-1 flex h-screen overflow-hidden">
          {/* Chat List */}
          <div className={`${showChatList ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 border-r border-white/5 flex-col bg-[#0a0a0a] h-screen overflow-hidden`}>
            {/* Chat List Header */}
            <div className="flex-shrink-0 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl px-4 py-4">
              <h1 className="text-xl font-semibold text-white mb-3">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Scrollable Chat List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setSelectedChat(chat)
                      setShowChatList(false)
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-all mb-2 ${
                      selectedChat?.id === chat.id
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={chat.userAvatar} />
                          <AvatarFallback className="bg-blue-600 text-white">
                            {chat.userName.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        {chat.online && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#0a0a0a]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-white truncate">{chat.userName}</h3>
                          <span className="text-xs text-white/40 flex-shrink-0">{chat.lastMessageTime}</span>
                        </div>
                        <p className="text-xs text-white/60 truncate mb-1">{chat.lastMessage}</p>
                        {chat.rideInfo && (
                          <div className="flex items-center gap-1 text-xs text-white/40">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{chat.rideInfo.from} → {chat.rideInfo.to}</span>
                          </div>
                        )}
                      </div>
                      {chat.unreadCount > 0 && (
                        <Badge className="bg-blue-600 text-white text-xs h-5 min-w-5 flex items-center justify-center flex-shrink-0">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          {selectedChat ? (
            <div className={`${showChatList ? 'hidden' : 'flex'} md:flex flex-1 flex-col bg-[#0a0a0a] h-screen overflow-hidden`}>
              {/* Fixed Chat Header */}
              <div className="flex-shrink-0 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden flex-shrink-0"
                        onClick={() => setShowChatList(true)}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedChat.userAvatar} />
                          <AvatarFallback className="bg-blue-600 text-white text-sm">
                            {selectedChat.userName.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        {selectedChat.online && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#0a0a0a]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white truncate">{selectedChat.userName}</h3>
                        <p className="text-xs text-white/60">
                          {selectedChat.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                        <Video className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                {selectedChat.rideInfo && (
                  <div className="px-4 pb-4">
                    <Card className="border-white/10 bg-blue-500/10">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 text-xs text-white/80 flex-wrap">
                          <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{selectedChat.rideInfo.from} → {selectedChat.rideInfo.to}</span>
                          <Separator orientation="vertical" className="h-4 bg-white/20" />
                          <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span>{selectedChat.rideInfo.time}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Scrollable Messages Area */}
              <div className="flex-1 overflow-y-auto p-4" style={{ scrollBehavior: 'smooth' }}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          message.senderId === 'me'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-white'
                        } rounded-2xl px-4 py-2 shadow-lg`}
                      >
                        <p className="text-sm break-words">{message.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs opacity-70">{message.timestamp}</span>
                          {message.senderId === 'me' && getMessageStatus(message.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Fixed Message Input */}
              <div className="flex-shrink-0 border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white/60 hover:text-white flex-shrink-0">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <div className="relative flex-1">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-[#0a0a0a]">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Select a chat</h3>
                <p className="text-sm text-white/60">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
