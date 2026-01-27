import { API_BASE_URL, getAuthHeaders, handleApiError } from '@/config/api';

export interface LocationUpdate {
  rideId: string;
  latitude: number;
  longitude: number;
}

export const locationService = {
  async updateLocation(data: LocationUpdate): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/location/update`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update location');
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getDriverLocation(rideId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/location/driver/${rideId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to get driver location');
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getPassengerLocation(rideId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/location/passenger/${rideId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to get passenger location');
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
};
