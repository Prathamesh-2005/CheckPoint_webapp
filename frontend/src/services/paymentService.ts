const API_URL = 'http://localhost:8080/api/payments';

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
      throw new Error(errorText || 'Failed to create payment order');
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
      throw new Error(errorText || 'Payment verification failed');
    }

    return response.json();
  }

  async getTransactionHistory(): Promise<any[]> {
    return [];
  }

  async getPendingEarnings(): Promise<{ pendingEarnings: number }> {
    return { pendingEarnings: 0 };
  }
}

export const paymentService = new PaymentService();
