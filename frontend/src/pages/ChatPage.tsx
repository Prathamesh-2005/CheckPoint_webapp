import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import {
  Send,
  ArrowLeft,
  Phone,
  MoreVertical,
  Loader2,
  MessageCircle,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  otherUser: { name: string; avatar: string; id: string }
  lastMessage: string
  lastMessageTime?: string
  unreadCount: number
  isOnline?: boolean
}

// ---------------------------------------------------------------------------
// Dump every key of the user object so we can find the real id field.
// ---------------------------------------------------------------------------
function extractUserId(user: any): string {
  if (!user || typeof user !== 'object') {
    console.warn('⚠️ extractUserId: user is null/undefined')
    return ''
  }

  console.group('👤 extractUserId — finding id field')
  console.log('All keys:', Object.keys(user))
  console.log('Full object:', JSON.stringify(user, null, 2))

  const raw =
    user?.id ??
    user?.userId ??
    user?.user_id ??
    user?.sub ??
    user?.memberId ??
    user?.member_id ??
    user?.uuid ??
    user?.uid ??
    user?.accountId ??
    user?.account_id ??
    user?.personId ??
    user?.person_id ??
    ''

  const result = String(raw)
  if (!result) {
    console.warn('⚠️ NONE of the known id fields matched! Check the keys above and tell the developer.')
  } else {
    console.log('✅ Extracted userId:', result)
  }
  console.groupEnd()
  return result
}

const DARK_SCROLLBAR_CSS = `
  .dark-scroll::-webkit-scrollbar,
  .dark-scroll-left::-webkit-scrollbar { width: 6px; }
  .dark-scroll::-webkit-scrollbar-track { background: #0a0a0a; }
  .dark-scroll::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
  .dark-scroll::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
  .dark-scroll-left::-webkit-scrollbar-track { background: #111; }
  .dark-scroll-left::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
  .dark-scroll-left::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
  .dark-scroll, .dark-scroll-left { scrollbar-width: thin; scrollbar-color: #2a2a2a transparent; }
`

export function ChatPage() {
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
  const currentUserId = extractUserId(currentUser)

  useEffect(() => { scrollToBottom() }, [messages])
  useEffect(() => { loadConversations() }, [])

  const loadConversations = async () => {
    try {
      const bookings = await bookingService.getMyBookings()
      console.log('📦 Raw bookings:', bookings)

      const convos = bookings
        .filter((b: any) => b.status === 'ACCEPTED' || b.status === 'CONFIRMED')
        .map((b: any) => {
          const isDriver = currentUserId !== '' && currentUserId === String(b.ride?.driver?.id ?? '')

          let otherUserName = ''
          let otherUserAvatar = ''
          let otherUserId = ''

          if (isDriver) {
            const p = b.passenger
            if (p) {
              otherUserName = `${p.firstName || ''} ${p.lastName || ''}`.trim()
              otherUserAvatar = p.profileImageUrl || ''
              otherUserId = String(p.id ?? '')
            }
          } else {
            const d = b.ride?.driver
            if (d) {
              otherUserName = `${d.firstName || ''} ${d.lastName || ''}`.trim()
              otherUserAvatar = d.profileImageUrl || ''
              otherUserId = String(d.id ?? '')
            }
          }

          if (!otherUserName) otherUserName = isDriver ? 'Passenger' : 'Driver'

          return {
            bookingId: b.bookingId || b.id,
            rideId: b.rideId || b.ride?.id,
            otherUser: { id: otherUserId, name: otherUserName, avatar: otherUserAvatar },
            lastMessage: '',
            lastMessageTime: '',
            unreadCount: 0,
            isOnline: false,
          }
        })

      console.log('✅ Conversations:', convos)
      setConversations(convos)

      const firstId = searchParams.get('bookingId') ?? (convos.length > 0 ? convos[0].bookingId : null)
      if (firstId) {
        setSelectedConversation(firstId)
        await loadChatHistory(firstId)
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadChatHistory = async (bookingId: string) => {
    try {
      const history = await chatService.getChatHistory(bookingId)
      console.log('📜 Chat history:', history)

      if (history?.length > 0) {
        const s = history[0]
        console.group('🔍 senderId match check')
        console.log('currentUserId:', `"${currentUserId}"`, `(${typeof currentUserId})`)
        console.log('msg.senderId: ', `"${s.senderId}"`, `(${typeof s.senderId})`)
        console.log('String match?: ', String(s.senderId) === currentUserId)
        console.groupEnd()
      }

      setMessages(history || [])
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      console.error('Failed to load chat history:', err)
      setMessages([])
    }
  }

  useEffect(() => {
    if (!selectedConversation) return
    let unsubscribe: (() => void) | undefined

    const setup = async () => {
      try {
        await loadChatHistory(selectedConversation)
        unsubscribe = await chatService.subscribeToChat(selectedConversation, (msg) => {
          setMessages(prev => {
            if (prev.some(m => m.messageId === msg.messageId)) return prev
            return [...prev, msg]
          })
          setTimeout(scrollToBottom, 100)
        })
      } catch (err) {
        console.error('Chat setup failed:', err)
      }
    }

    setup()
    return () => { if (unsubscribe) unsubscribe() }
  }, [selectedConversation])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return
    const text = newMessage.trim()
    setNewMessage("")
    setSending(true)
    try {
      await chatService.sendMessage(selectedConversation, text)
    } catch (err) {
      console.error('Failed to send:', err)
      setNewMessage(text)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() }
  }

  const selectedConvo = conversations.find(c => c.bookingId === selectedConversation)
  const filteredConversations = conversations.filter(c =>
    c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatMessageTime = (ts: string) => {
    const date = new Date(ts)
    const diff = (Date.now() - date.getTime()) / 3_600_000
    if (diff < 24) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    if (diff < 48) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-[#0a0a0a]">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <>
      <style>{DARK_SCROLLBAR_CSS}</style>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden">
          <AppSidebar />

          <main className="flex flex-col flex-1 overflow-hidden">
            {/* Mobile header */}
            <header className="lg:hidden flex-shrink-0 border-b border-white/5 bg-[#111]/95 backdrop-blur-xl px-4 py-3">
              <h1 className="text-lg font-semibold text-white">Messages</h1>
              <p className="text-xs text-white/40">Chat with drivers and passengers</p>
            </header>

            <div className="flex flex-1 overflow-hidden">

              {/* LEFT: Conversation list */}
              <aside className={`
                ${selectedConversation ? 'hidden lg:flex' : 'flex'}
                flex-col w-full lg:w-96 border-r border-white/5 bg-[#111] overflow-hidden
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

                <div className="flex-1 overflow-y-auto dark-scroll-left">
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
                          <Avatar className="h-12 w-12 ring-2 ring-white/10 flex-shrink-0">
                            <AvatarImage src={convo.otherUser.avatar} />
                            <AvatarFallback className="bg-blue-600 text-white font-semibold">
                              {convo.otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{convo.otherUser.name}</p>
                            <p className="text-xs text-white/40 truncate">Tap to chat</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </aside>

              {/* RIGHT: Chat pane */}
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
                            variant="ghost" size="icon"
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
                          <p className="text-sm font-semibold text-white truncate flex-1 min-w-0">
                            {selectedConvo.otherUser.name}
                          </p>
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
                      className="flex-1 overflow-y-auto dark-scroll bg-[#0a0a0a]"
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
                              const isOwn = currentUserId !== '' && String(msg.senderId) === currentUserId
                              return (
                                <div
                                  key={msg.messageId}
                                  className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                  <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
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
                                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-white/40'}`}>
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
                      <div className="max-w-4xl mx-auto flex items-end gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-full px-6 py-6"
                          disabled={sending}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sending}
                          size="icon"
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:opacity-50 flex-shrink-0 h-12 w-12 rounded-full"
                        >
                          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </Button>
                      </div>
                    </footer>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                      <MessageCircle className="w-24 h-24 text-blue-500/30 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                      <p className="text-white/50 text-sm">Choose a conversation from the list to start messaging</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  )
}