import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_BASE_URL = 'http://localhost:8080/api';
const WS_URL = 'http://localhost:8080/ws';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  rideId?: string;
  bookingId?: string;
}

class NotificationService {
  private client: Client | null = null;
  private listeners: ((notification: Notification) => void)[] = [];

  requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  connect(token: string) {
    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log('✅ WebSocket connected');
        this.subscribeToNotifications();
      },
      onStompError: (frame) => {
        console.error('❌ WebSocket error:', frame);
      },
    });

    this.client.activate();
  }

  private subscribeToNotifications() {
    if (!this.client) return;

    this.client.subscribe('/user/queue/notifications', (message) => {
      const notification: Notification = JSON.parse(message.body);
      console.log('🔔 New notification:', notification);

      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
        });
      }

      // Notify all listeners
      this.listeners.forEach(listener => listener(notification));
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }

  onNotification(callback: (notification: Notification) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async getNotifications(): Promise<Notification[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/notifications/unread`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch unread notifications');
    return await response.json();
  }

  async markAsRead(notificationId: string): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to mark notification as read');
  }

  async markAllAsRead(): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to mark all as read');
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to delete notification');
  }
}

export const notificationService = new NotificationService();
