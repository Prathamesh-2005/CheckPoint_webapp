import { API_BASE_URL, getAuthHeaders, handleApiError } from '@/config/api';

export interface CreateRideRequest {
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  departureTime: string;
  price: number;
}

export interface Ride {
  id: string;
  driver: {
    id: string;
    firstName: string;
    lastName: string;
  };
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  departureTime: string;
  price: number;
  status: string;
  availableSeats: number;
}

export const rideService = {
  async createRide(data: CreateRideRequest): Promise<Ride> {
    try {
      console.log('🚗 Creating ride with data:', data);
      const response = await fetch(`${API_BASE_URL}/rides`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Create ride error:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to create ride');
      }

      const result = await response.json();
      console.log('✅ Ride created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Create ride exception:', error);
      return handleApiError(error);
    }
  },

  async searchRides(
    startLat: number, 
    startLng: number, 
    destLat: number, 
    destLng: number, 
    radius: number
  ): Promise<Ride[]> {
    try {
      console.log('🔍 Searching rides with:', { 
        pickup: { lat: startLat, lng: startLng }, 
        destination: { lat: destLat, lng: destLng }, 
        radius 
      })
      
      const response = await fetch(
        `${API_BASE_URL}/rides/search?startLat=${startLat}&startLng=${startLng}&destLat=${destLat}&destLng=${destLng}&radius=${radius}`,
        { headers: getAuthHeaders() }
      )

      console.log('Search response status:', response.status)
      
      if (!response.ok) {
        throw new Error('Failed to search rides')
      }

      const result = await response.json()
      console.log('✅ Search results:', result.length, 'rides')
      return result
    } catch (error) {
      console.error('❌ Search rides error:', error)
      return []
    }
  },

  async getRideById(rideId: string): Promise<Ride> {
    try {
      console.log('🎯 Fetching ride details for ID:', rideId);
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}`, {
        headers: getAuthHeaders(),
      });

      console.log('Get ride response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch ride');
      }

      const result = await response.json();
      console.log('✅ Ride details received:', result);
      return result;
    } catch (error) {
      console.error('❌ Get ride error:', error);
      throw error;
    }
  },

  async getMyRides(): Promise<Ride[]> {
    try {
      console.log('👤 Fetching my rides...');
      const response = await fetch(`${API_BASE_URL}/rides/my-rides`, {
        headers: getAuthHeaders(),
      });

      console.log('My rides response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch my rides');
      }

      const result = await response.json();
      console.log('✅ My rides received:', result.length, 'rides');
      console.log('📦 My rides data:', result);
      return result;
    } catch (error) {
      console.error('❌ Get my rides error:', error);
      return [];
    }
  },

  async cancelRide(rideId: string): Promise<Ride> {
    try {
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/cancel`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to cancel ride');
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  async startRide(rideId: string): Promise<any> {
    try {
      console.log('🚗 Starting ride:', rideId)
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/start`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to start ride')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to start ride:', error)
      throw error
    }
  },

  async completeRide(rideId: string): Promise<any> {
    try {
      console.log('🏁 Completing ride:', rideId)
      const response = await fetch(`${API_BASE_URL}/rides/${rideId}/complete`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to complete ride')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to complete ride:', error)
      throw error
    }
  },
};
