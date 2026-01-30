import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const API_URL = 'http://localhost:8080'

class ChatService {
  private stompClient: Client | null = null
  private connected: boolean = false
  private subscriptions: Map<string, any> = new Map()
  private connectionPromise: Promise<void> | null = null

  connect(): Promise<void> {
    if (this.connected && this.stompClient) {
      return Promise.resolve()
    }

    if (this.connectionPromise) {
      return this.connectionPromise
    }

    const token = localStorage.getItem('token')
    if (!token) {
      return Promise.reject(new Error('No auth token'))
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(`${API_URL}/ws`),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        onConnect: () => {
          this.connected = true
          this.connectionPromise = null
          resolve()
        },
        onDisconnect: () => {
          this.connected = false
        },
        onStompError: (frame) => {
          this.connectionPromise = null
          reject(new Error(frame.headers['message']))
        },
      })

      this.stompClient.activate()
    })

    return this.connectionPromise
  }

  async subscribeToChat(bookingId: string, onMessage: (message: any) => void): Promise<() => void> {
    await this.connect()

    if (!this.stompClient || !this.connected) {
      throw new Error('Not connected')
    }

    const topic = `/topic/chat/${bookingId}`
    
    const existingSub = this.subscriptions.get(bookingId)
    if (existingSub) {
      existingSub.unsubscribe()
    }

    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body)
        onMessage(payload)
      } catch (error) {
        console.error('Parse error:', error)
      }
    })

    this.subscriptions.set(bookingId, subscription)

    return () => {
      subscription.unsubscribe()
      this.subscriptions.delete(bookingId)
    }
  }

  async sendMessage(bookingId: string, message: string) {
    await this.connect()

    if (!this.stompClient || !this.connected) {
      throw new Error('Not connected')
    }

    this.stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ bookingId, message }),
    })
  }

  async getChatHistory(bookingId: string) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/api/chat/history/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch history')
    }

    return response.json()
  }

  disconnect() {
    if (this.stompClient) {
      this.subscriptions.forEach((sub) => sub.unsubscribe())
      this.subscriptions.clear()
      this.stompClient.deactivate()
      this.connected = false
    }
  }
}

export const chatService = new ChatService()