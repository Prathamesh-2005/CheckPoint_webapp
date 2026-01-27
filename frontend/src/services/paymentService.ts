import { API_BASE_URL, getAuthHeaders, handleApiError } from '@/config/api';

export interface RazorpayOrder {
  orderId: string;
  amount: string;
  currency: string;
  key: string;
  rideId: string;
}

export interface VerifyPaymentRequest {
  rideId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentMethod: string;
}

export const paymentService = {
  async createPaymentOrder(rideId: string): Promise<RazorpayOrder> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rideId }),
      });

      if (!response.ok) throw new Error('Failed to create payment order');
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  async verifyPayment(data: VerifyPaymentRequest): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Payment verification failed');
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getTransactionHistory(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/history`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to get transaction history');
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getPendingEarnings(): Promise<{ pendingEarnings: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/earnings/pending`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to get earnings');
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  },
};
