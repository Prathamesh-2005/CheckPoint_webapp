const API_URL = 'http://localhost:8080/api/payments';

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  createdAt?: string;
  status: 'completed' | 'pending' | 'failed';
  category: string;
  rideId?: string;
  bookingId?: string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  vehicleModel?: string;
  vehicleNumber?: string;
  vehicleColor?: string;
  rider?: {
    id: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    profileImageUrl?: string;
    vehicleDetails?: {
      vehicleModel?: string;
      vehicleNumber?: string;
      vehicleColor?: string;
      vehicleType?: string;
    };
  };
  driver?: {
    id: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    profileImageUrl?: string;
    vehicleDetails?: {
      vehicleModel?: string;
      vehicleNumber?: string;
      vehicleColor?: string;
      vehicleType?: string;
    };
  };
  ride?: any;
  booking?: any;
}

class PaymentService {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async createPaymentOrder(rideId: string): Promise<any> {
    console.log('💳 Creating payment order for ride:', rideId);

    const response = await fetch(`${API_URL}/create-order`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ rideId }),
    });

    console.log('📦 Payment order response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Payment order error:', errorText);

      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || errorText);
      } catch (parseError) {
        throw new Error(errorText || 'Failed to create payment order');
      }
    }

    const data = await response.json();
    console.log('✅ Payment order created:', data);
    return data;
  }

  async verifyPayment(data: {
    rideId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    paymentMethod: string;
  }): Promise<any> {
    console.log('✔️ Verifying payment:', data);

    const response = await fetch(`${API_URL}/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        rideId: data.rideId,
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: data.razorpayPaymentId,
        razorpaySignature: data.razorpaySignature,
        paymentMethod: data.paymentMethod,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Verification failed:', errorText);

      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || errorText);
      } catch (parseError) {
        throw new Error(errorText || 'Payment verification failed');
      }
    }

    return response.json();
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    try {
      console.log('📜 Fetching transaction history...');
      
      const response = await fetch(`${API_URL}/history`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        console.error('❌ Failed to fetch transactions:', response.status);
        return [];
      }

      const data = await response.json();
      console.log('✅ Transactions loaded:', data.length);
      console.log('📦 Transaction sample:', data[0]);
      return data;
    } catch (error) {
      console.error('❌ Transaction history error:', error);
      return [];
    }
  }

  async getPendingEarnings(): Promise<{ pendingEarnings: number }> {
    try {
      console.log('💰 Fetching pending earnings...');
      
      const response = await fetch(`${API_URL}/earnings/pending`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        console.error('❌ Failed to fetch earnings:', response.status);
        return { pendingEarnings: 0 };
      }

      const data = await response.json();
      console.log('✅ Earnings loaded:', data);
      return data;
    } catch (error) {
      console.error('❌ Pending earnings error:', error);
      return { pendingEarnings: 0 };
    }
  }
}

export const paymentService = new PaymentService();
