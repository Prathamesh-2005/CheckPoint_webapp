import Lottie from "lottie-react"
import bikeAnimation from "@/assets/Bike Riding.json"

export function RideAnimation() {
  return (
    <div className="relative w-full overflow-hidden h-14">
      <div className="absolute top-0 left-0 animate-ride-once">
        <Lottie
          animationData={bikeAnimation}
          loop={false}
          autoplay
          style={{ width: 80, height: 56 }}
        />
      </div>
    </div>
  )
}
