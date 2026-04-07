import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { authService } from "@/services/authService"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Lottie from "lottie-react"
import checkpointAnimation from "../assets/checkpoint-lottie.json"
import TextPressure from "../components/ui/TextPressure"
import { Spinner } from "@/components/ui/spinner"

export function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirm) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      await authService.register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      })
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#18181b] via-[#23272f] to-[#101014] text-white">
      {/* Left Section */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-[#18181b] relative overflow-hidden">
        <div className="flex flex-col items-center justify-center h-full w-full px-8">
          <div className="mb-4 mt-24 w-full flex justify-center">
            <TextPressure
              text="CheckPoint"
              flex={true}
              alpha={false}
              stroke={false}
              width={false}
              weight={true}
              italic={false}
              textColor="currentColor"
              minFontSize={36}
              className="text-5xl font-extrabold tracking-normal"
            />
          </div>
          <p className="text-pink-300 font-semibold text-lg mb-2 text-center">
            Secure. Fast. Reliable.
          </p>
          <p className="text-lg text-gray-300 mb-6 text-center">
            Your trusted ride sharing platform.
          </p>
          <div className="flex justify-center mb-4">
            <Lottie
              animationData={checkpointAnimation}
              loop={true}
              style={{ width: 350, height: 350 }}
            />
          </div>
        </div>
      </div>
      {/* Right Section */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-[#18181b] border border-gray-800 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">
                Create your account
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your details below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="text-sm text-red-400">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-200 mb-1">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="First name"
                      required
                      value={form.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-200 mb-1">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Last name"
                      required
                      value={form.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input
                    id="confirm"
                    name="confirm"
                    type="password"
                    placeholder="Confirm Password"
                    required
                    value={form.confirm}
                    onChange={handleChange}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full" 
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign up with Google
              </Button>
              <div className="text-center">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </CardContent>
            <CardFooter />
          </Card>
          <div className="text-center mt-6">
            <p className="text-muted-foreground text-sm">
              ©2025 CheckPoint. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
