import { API_BASE_URL, getAuthHeaders, handleApiError } from '@/config/api'

interface VehicleDetails {
  vehicleModel: string
  vehicleNumber: string
  vehicleColor: string
  isVerified: boolean
}

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  profileImageUrl?: string
  vehicleDetails?: VehicleDetails
}

class UserService {
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  }

  async updateVehicleDetails(details: Omit<VehicleDetails, 'isVerified'>): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/vehicle`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(details),
      })

      if (!response.ok) {
        throw new Error('Failed to update vehicle details')
      }

      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  }

  async getVehicleDetails(): Promise<VehicleDetails | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/vehicle`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch vehicle details')
      }

      const data = await response.json()
      return data.vehicleDetails
    } catch (error) {
      console.error('Failed to fetch vehicle details:', error)
      return null
    }
  }
}

export const userService = new UserService()
