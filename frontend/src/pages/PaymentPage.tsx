import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2, IndianRupee, Star, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { paymentService } from "@/services/paymentService"
import { rideService } from "@/services/rideService"
import { bookingService } from "@/services/bookingService"
import { useToast } from "@/hooks/use-toast"
import { toast as sonnerToast } from "sonner"

export function PaymentPage() {
  const navigate = useNavigate()
  const { rideId } = useParams()
  const [rideDetails, setRideDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadRideDetails()

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [rideId])

  const loadRideDetails = async () => {
    try {
      const data = await rideService.getRideById(rideId!)

      if (data.status !== "COMPLETED") {
        toast({
          title: "Payment Not Available",
          description: "Payment is only available after ride completion",
          variant: "destructive",
        })
        navigate(`/ride/${rideId}/track`)
        return
      }

      if (data.paymentStatus === "COMPLETED") {
        toast({
          title: "Payment Already Completed",
          description: "This ride has already been paid for",
        })
        navigate("/my-rides")
        return
      }

      setRideDetails(data)
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load ride details",
        variant: "destructive",
      })
      navigate("/my-rides")
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      const orderData = await paymentService.createPaymentOrder(rideId!)

      const user = JSON.parse(localStorage.getItem("user") || "{}")

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "Checkpoint",
        description: "Ride Payment",
        image: "https://cdn-icons-png.flaticon.com/512/3448/3448636.png",
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        theme: {
          color: "#3b82f6",
        },
        handler: async function (response: any) {
          try {
            await paymentService.verifyPayment({
              rideId: rideId!,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentMethod: "UPI",
            })

            // Calculate total for toast message
            const platformFeeCalc = rideDetails.price * 0.1
            const gstCalc = rideDetails.price * 0.18
            const totalAmountCalc = (rideDetails.price + platformFeeCalc + gstCalc).toFixed(2)

            sonnerToast.success('Payment Successful! 🎉', {
              description: `₹${totalAmountCalc} paid successfully. Thank you for your ride!`,
              duration: 5000,
            })
            
            setTimeout(() => navigate("/my-rides"), 2000)
          } catch (error: any) {
            console.error('Verification error:', error)
            sonnerToast.error('Verification Failed', {
              description: 'Payment verification failed. Please contact support.',
            })
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
          },
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        sonnerToast.error('Payment Failed', {
          description: response.error.description || 'Transaction could not be completed',
        })
        setIsProcessing(false)
      })
      
      rzp.open()
    } catch (err: any) {
      let errorMessage = "Failed to initiate payment"
      
      try {
        if (typeof err.message === 'string') {
          const parsed = JSON.parse(err.message)
          errorMessage = parsed.message || errorMessage
        } else {
          errorMessage = err.message || errorMessage
        }
      } catch {
        errorMessage = err.message || errorMessage
      }
      
      sonnerToast.error('Payment Error', {
        description: errorMessage,
      })
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!rideDetails) {
    return <div className="text-white text-center mt-20">Ride not found</div>
  }

  const platformFee = rideDetails.price * 0.1
  const gst = rideDetails.price * 0.18
  const totalAmount = (rideDetails.price + platformFee + gst).toFixed(2)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-white/5 p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="text-white" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-white">Complete Payment</h1>
          <p className="text-sm text-white/40">Powered by Razorpay</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Card className="bg-white/5 border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Ride Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-2 text-white/60">
              <Clock className="w-4 h-4" />
              {new Date(rideDetails.departureTime).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <MapPin className="w-4 h-4 text-green-500" />
              Start: {rideDetails.startLatitude.toFixed(3)}, {rideDetails.startLongitude.toFixed(3)}
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <MapPin className="w-4 h-4 text-red-500" />
              End: {rideDetails.endLatitude.toFixed(3)}, {rideDetails.endLongitude.toFixed(3)}
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <Star className="w-4 h-4 fill-yellow-400" />
              Driver: {rideDetails.driver.firstName} {rideDetails.driver.lastName}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Ride Fare</span>
              <span className="text-white">₹{rideDetails.price}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Platform Fee (10%)</span>
              <span className="text-white">₹{platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>GST (18%)</span>
              <span className="text-white">₹{gst.toFixed(2)}</span>
            </div>

            <Separator className="bg-white/10" />

            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total</span>
              <span className="text-blue-400">₹{totalAmount}</span>
            </div>

            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Opening Razorpay...
                </>
              ) : (
                <>
                  <IndianRupee className="w-5 h-5 mr-2" />
                  Pay with Razorpay
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
