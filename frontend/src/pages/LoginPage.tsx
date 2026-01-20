import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    // TODO: Replace with real API call
    setTimeout(() => {
      setLoading(false)
      if (email === "test@test.com" && password === "password") {
        navigate("/")
      } else {
        setError("Invalid credentials")
      }
    }, 1000)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#18181b] via-[#23272f] to-[#101014] text-white">
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-[#18181b] relative overflow-hidden">
        <div className="relative z-10 text-center px-8">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-blue-300 drop-shadow-lg">
            CheckPoint
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Your trusted ride sharing platform.
            <br />
            <span className="text-pink-300 font-semibold">
              Secure. Fast. Reliable.
            </span>
          </p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-sm bg-[#18181b] border border-gray-800 shadow-xl">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
            <CardAction>
              <Button variant="link" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                {error && (
                  <div className="text-sm text-red-400">{error}</div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-200 mb-1">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-200 mb-1">
                      Password
                    </Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                     placeholder="Password"
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <CardFooter className="flex-col gap-2 mt-6 px-0">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                <Button variant="outline" className="w-full" type="button">
                  Login with Google
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
