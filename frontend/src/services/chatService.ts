import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const API_BASE_URL = 'http://localhost:8080/api'
const WS_URL = 'http://localhost:8080/ws'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  }
}

let stompClient: Client | null = null

export const chatService = {
  connect(onMessageReceived: (message: any) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new SockJS(WS_URL)
      stompClient = new Client({
        webSocketFactory: () => socket as any,
        connectHeaders: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        debug: (str) => console.log('🔌 STOMP:', str),
        onConnect: () => {
          console.log('✅ Chat WebSocket connected')
          resolve()
        },
        onStompError: (frame) => {
          console.error('❌ STOMP error:', frame)
          reject(frame)
        },
      })

      stompClient.activate()
    })
  },

  subscribe(bookingId: string, callback: (message: any) => void) {
    if (!stompClient?.connected) {
      console.error('❌ STOMP client not connected')
      return
    }

    const subscription = stompClient.subscribe(
      `/topic/chat/${bookingId}`,
      (message) => {
        const parsedMessage = JSON.parse(message.body)
        console.log('📨 Message received:', parsedMessage)
        callback(parsedMessage)
      }
    )

    return subscription
  },

  sendMessage(bookingId: string, message: string) {
    if (!stompClient?.connected) {
      console.error('❌ Cannot send message: STOMP client not connected')
      return
    }

    const payload = {
      bookingId,
      message,
    }

    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(payload),
    })

    console.log('📤 Message sent:', payload)
  },

  async getChatHistory(bookingId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history/${bookingId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch chat history')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch chat history:', error)
      throw error
    }
  },

  disconnect() {
    if (stompClient) {
      stompClient.deactivate()
      stompClient = null
      console.log('🔌 Chat WebSocket disconnected')
    }
  },
}
