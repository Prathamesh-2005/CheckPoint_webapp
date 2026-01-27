import { API_BASE_URL, getAuthHeaders, handleApiError } from '@/config/api';

export interface Booking {
  id: string;
  ride: any;
  passenger: any;
  status: string;
  createdAt: string;
}

export const bookingService = {
  async requestRide(rideId: string): Promise<any> {
    try {
      console.log('📝 Requesting ride booking for:', rideId);

      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      console.log('Booking response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Booking error:', errorData);
        throw new Error(errorData.message || 'Failed to request ride');
      }

      const result = await response.json();
      console.log('✅ Booking successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Booking exception:', error);
      throw error;
    }
  },

  async getMyBookings(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      throw error;
    }
  },

  async updateBookingStatus(
    bookingId: string,
    status: 'ACCEPTED' | 'REJECTED'
  ): Promise<Booking> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update booking');
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  async acceptBooking(bookingId: string): Promise<any> {
    try {
      console.log('✅ Accepting booking:', bookingId);

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Accept booking error:', errorData);
        throw new Error(errorData.message || 'Failed to accept booking');
      }

      const result = await response.json();
      console.log('✅ Booking accepted:', result);
      return result;
    } catch (error) {
      console.error('❌ Accept booking exception:', error);
      throw error;
    }
  },

  async rejectBooking(bookingId: string): Promise<any> {
    try {
      console.log('❌ Rejecting booking:', bookingId);

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'REJECTED' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Reject booking error:', errorData);
        throw new Error(errorData.message || 'Failed to reject booking');
      }

      const result = await response.json();
      console.log('✅ Booking rejected:', result);
      return result;
    } catch (error) {
      console.error('❌ Reject booking exception:', error);
      throw error;
    }
  },
};
