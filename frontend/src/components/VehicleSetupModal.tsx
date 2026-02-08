import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bike, Loader2, AlertCircle } from "lucide-react"
import { userService } from "@/services/userService"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VehicleSetupModalProps {
  onComplete: () => void
  onSkip: () => void
}

export function VehicleSetupModal({ onComplete, onSkip }: VehicleSetupModalProps) {
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [vehicleColor, setVehicleColor] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const data = await userService.updateVehicleDetails({
        vehicleModel,
        vehicleNumber,
        vehicleColor,
      })
      
      // Update user in localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      user.vehicleDetails = data.vehicleDetails
      localStorage.setItem("user", JSON.stringify(user))

      toast({
        title: "Success!",
        description: "Your vehicle details have been saved.",
      })

      onComplete()
    } catch (error: any) {
      const errorMessage = error.message || "Failed to save vehicle details. Please try again."
      setError(errorMessage)
      console.error("Failed to save vehicle details:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="border-white/10 bg-[#1a1a1a] max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bike className="w-5 h-5 text-blue-400" />
            Add Your Vehicle Details
          </CardTitle>
          <CardDescription className="text-white/60">
            To offer rides, we need your vehicle information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label className="text-white/80">Vehicle Model *</Label>
              <Input
                placeholder="e.g., Honda Activa, Royal Enfield"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Vehicle Number *</Label>
              <Input
                placeholder="e.g., KA-01-AB-1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Color</Label>
              <Input
                placeholder="e.g., Black, Red"
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onSkip}
                disabled={isSubmitting}
                className="flex-1 border-white/20 text-white/60 hover:text-white hover:bg-white/5"
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Continue"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
