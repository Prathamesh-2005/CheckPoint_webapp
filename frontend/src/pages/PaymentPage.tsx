import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Building2,
  Shield,
  CheckCircle2,
  Smartphone,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { paymentService } from "@/services/paymentService"
import { rideService } from "@/services/rideService"

const paymentMethods = [
  {
    id: "upi",
    name: "UPI",
    description: "Pay using any UPI app",
    icon: Smartphone,
    bg: "bg-purple-500/10",
    color: "text-purple-400",
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, Amex, Rupay",
    icon: CreditCard,
    bg: "bg-blue-500/10",
    color: "text-blue-400",
  },
  {
    id: "wallet",
    name: "Wallet",
    description: "Pay from your wallet balance",
    icon: Wallet,
    bg: "bg-green-500/10",
    color: "text-green-400",
    balance: "500",
  },
  {
    id: "netbanking",
    name: "Net Banking",
    description: "Pay using internet banking",
    icon: Building2,
    bg: "bg-orange-500/10",
    color: "text-orange-400",
  },
]

export function PaymentPage() {
  const navigate = useNavigate()
  const { rideId } = useParams()
  const [selectedMethod, setSelectedMethod] = useState("upi")
  const [isProcessing, setIsProcessing] = useState(false)
  const [rideDetails, setRideDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRideDetails()
  }, [rideId])

  const loadRideDetails = async () => {
    try {
      const data = await rideService.getRideById(rideId!)

      // ✅ Check if ride is completed before allowing payment
      if (data.status !== "COMPLETED") {
        alert("Payment is only available after ride completion")
        navigate(`/ride/${rideId}`)
        return
      }

      setRideDetails(data)
    } catch (error) {
      console.error("Failed to load ride:", error)
      navigate("/my-rides")
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      const orderData = await paymentService.createPaymentOrder(rideId!)

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "CheckPoint",
        description: "Ride Payment",
        handler: async function (response: any) {
          try {
            await paymentService.verifyPayment({
              rideId: rideId!,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentMethod: selectedMethod,
            })
            navigate(`/ride/${rideId}/track`)
          } catch (error) {
            alert("Payment verification failed")
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
      rzp.open()
    } catch (error) {
      alert("Failed to initiate payment")
      setIsProcessing(false)
    }
  }

  if (loading) {
    return null // or a loading spinner
  }

  if (!rideDetails) {
    return null // or a 404 not found page
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white/60 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-white">
                Payment
              </h1>
              <p className="text-xs md:text-sm text-white/40">
                Complete your payment
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto grid gap-6 lg:grid-cols-3">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-lg font-semibold text-white">
                  Select Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <RadioGroup
                  value={selectedMethod}
                  onValueChange={setSelectedMethod}
                >
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`relative flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-all ${
                          selectedMethod === method.id
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${method.bg}`}
                        >
                          <method.icon className={`h-5 w-5 ${method.color}`} />
                        </div>
                        <div className="flex-1">
                          <Label
                            htmlFor={method.id}
                            className="text-white font-medium cursor-pointer"
                          >
                            {method.name}
                          </Label>
                          <p className="text-xs text-white/60">
                            {method.description}
                          </p>
                          {method.id === "wallet" && method.balance && (
                            <p className="text-xs text-green-400 mt-1">
                              Balance: ₹{method.balance}
                            </p>
                          )}
                        </div>
                        {selectedMethod === method.id && (
                          <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-semibold">Secure Payment</span>
                  </div>
                  <p className="text-xs text-white/60">
                    Your payment information is encrypted and secure. We never
                    store your card details.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm sticky top-24">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-base font-semibold text-white">
                  Ride Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-white/40 mb-2">Route</p>
                  <p className="text-sm text-white font-medium mb-1">
                    {rideDetails.from}
                  </p>
                  <p className="text-sm text-white/60 mb-1">to</p>
                  <p className="text-sm text-white font-medium">
                    {rideDetails.to}
                  </p>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Date & Time</span>
                    <span className="text-white">
                      {rideDetails.date}, {rideDetails.time}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Driver</span>
                    <span className="text-white">{rideDetails.driverName}</span>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Base Fare</span>
                    <span>₹250</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Platform Fee</span>
                    <span>₹50</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>GST (18%)</span>
                    <span>₹20</span>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total Amount</span>
                  <span className="text-white">₹{rideDetails.amount}</span>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-4"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ₹${rideDetails.amount}`
                  )}
                </Button>

                <p className="text-xs text-white/40 text-center mt-3">
                  By proceeding, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
