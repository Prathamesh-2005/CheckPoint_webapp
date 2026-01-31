import { API_BASE_URL, getAuthHeaders, handleApiError } from '@/config/api';

interface LocationAddress {
  placeName: string;
  fullAddress: string;
  city: string;
  state: string;
}

class LocationService {
  private cache = new Map<string, LocationAddress>();
  private simulatedPositions = new Map<string, { lat: number; lng: number; step: number }>();

  async getAddress(lat: number, lng: number): Promise<LocationAddress> {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'RideShareApp/1.0', // Nominatim requires a user agent
          },
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();

      const address: LocationAddress = {
        placeName: this.extractPlaceName(data),
        fullAddress: this.formatAddress(data),
        city: data.address?.city || data.address?.town || data.address?.village || '',
        state: data.address?.state || '',
      };

      this.cache.set(key, address);
      return address;
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        placeName: 'Unknown Location',
        fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: '',
        state: '',
      };
    }
  }

  private extractPlaceName(data: any): string {
    const address = data.address;
    return (
      address?.amenity ||
      address?.shop ||
      address?.building ||
      address?.road ||
      address?.neighbourhood ||
      address?.suburb ||
      'Unknown Place'
    );
  }

  private formatAddress(data: any): string {
    const addr = data.address;
    const parts = [
      addr?.road,
      addr?.neighbourhood || addr?.suburb,
      addr?.city || addr?.town || addr?.village,
      addr?.state,
    ].filter(Boolean);

    return parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(', ') || 'Address not available';
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = (
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    );
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLon = this.deg2rad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(this.deg2rad(lat2));
    const x = (
      Math.cos(this.deg2rad(lat1)) * Math.sin(this.deg2rad(lat2)) -
      Math.sin(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.cos(dLon)
    );
    return (this.rad2deg(Math.atan2(y, x)) + 360) % 360;
  }

  private rad2deg(rad: number): number {
    return rad * (180 / Math.PI);
  }

  calculateETA(distanceKm: number, speedKmh: number = 40): string {
    const hours = distanceKm / speedKmh;
    const minutes = Math.round(hours * 60);

    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${minutes} min`;

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  }

  /**
   * Simulate smooth driver movement towards a target
   * This creates a stable, predictable movement pattern instead of random jumps
   */
  simulateDriverMovement(
    rideId: string,
    currentLat: number,
    currentLng: number,
    targetLat: number,
    targetLng: number,
    status: string
  ): { lat: number; lng: number } {
    // Get or initialize simulation state for this ride
    if (!this.simulatedPositions.has(rideId)) {
      this.simulatedPositions.set(rideId, {
        lat: currentLat,
        lng: currentLng,
        step: 0
      });
    }

    const simState = this.simulatedPositions.get(rideId)!;
    
    // Calculate distance to target
    const distance = this.calculateDistance(
      simState.lat,
      simState.lng,
      targetLat,
      targetLng
    );

    // If very close to target (within 50m), stop moving
    if (distance < 0.05) {
      return { lat: simState.lat, lng: simState.lng };
    }

    // Calculate movement step (move ~100-200 meters per update)
    const stepSize = 0.002; // roughly 200m in degrees
    const bearing = this.calculateBearing(
      simState.lat,
      simState.lng,
      targetLat,
      targetLng
    );

    // Calculate new position along the bearing
    const newLat = simState.lat + (stepSize * Math.cos(this.deg2rad(bearing)));
    const newLng = simState.lng + (stepSize * Math.sin(this.deg2rad(bearing)));

    // Update simulation state
    simState.lat = newLat;
    simState.lng = newLng;
    simState.step++;

    return { lat: newLat, lng: newLng };
  }

  /**
   * Reset simulation for a ride (useful when ride status changes)
   */
  resetSimulation(rideId: string): void {
    this.simulatedPositions.delete(rideId);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    this.simulatedPositions.clear();
  }
}

export const locationService = new LocationService();