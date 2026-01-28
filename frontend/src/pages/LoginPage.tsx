import { useState, useEffect } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Chrome } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export function LoginPage() {
  const navigate = useNavigate()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await authService.isAuthenticated()
      if (isAuthenticated) {
        console.log('✅ User already logged in, redirecting to dashboard')
        navigate('/dashboard', { replace: true })
      } else {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [navigate])

  // ✅ Show loading spinner while checking auth
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await authService.login({ email, password })
      console.log('✅ Login successful:', response)
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      

      navigate('/dashboard')
    } catch (err: any) {
      console.error('❌ Login failed:', err)
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#18181b] via-[#23272f] to-[#101014] text-white">
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
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert
                  variant="destructive"
                  className="bg-destructive/10 border-destructive/50"
                >
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-foreground"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:bg-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-foreground"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:bg-background"
                    required
                  />
                </div>
                <div className="flex justify-start">
                  <a
                    href="#"
                    className="font-semibold text-white underline underline-offset-4"
                  >
                    Forgot password?
                  </a>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[#18181b] px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground font-semibold py-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Chrome className="w-4 h-4 mr-2" />
                    Continue with Google
                  </>
                )}
              </Button>
              <div className="text-center">
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
                  >
                    Sign up here
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