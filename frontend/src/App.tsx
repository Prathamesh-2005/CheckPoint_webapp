import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FindRidePage } from "./pages/FindRidePage";
import { OfferRidePage } from "./pages/OfferRidePage";
import { MyRidesPage } from "./pages/MyRidesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { WalletPage } from "./pages/WalletPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ChatPage } from "./pages/ChatPage";
import { RideDetailsPage } from "./pages/RideDetailsPage";
import { PaymentPage } from "./pages/PaymentPage";
import { LiveTrackingPage } from "./pages/LiveTrackingPage";
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { notificationService } from './services/notificationService';
import { authService } from './services/authService';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster"

function App() {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      notificationService.requestPermission();
      
      const token = localStorage.getItem('token');
      if (token) {
        const isValid = await authService.isAuthenticated();
        if (isValid) {
          notificationService.connect(token)
        }
      }
      
      setTimeout(() => setInitializing(false), 300)
    }
    
    initApp()
    
    return () => {
      notificationService.disconnect()
    }
  }, []);

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading CheckPoint...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dark">
      <Router>
        <Routes>
          {/* Root redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/find-ride" element={<ProtectedRoute><FindRidePage /></ProtectedRoute>} />
          <Route path="/offer-ride" element={<ProtectedRoute><OfferRidePage /></ProtectedRoute>} />
          <Route path="/my-rides" element={<ProtectedRoute><MyRidesPage /></ProtectedRoute>} />
          <Route path="/ride/:rideId" element={<ProtectedRoute><RideDetailsPage /></ProtectedRoute>} />
          <Route path="/ride/:rideId/track" element={<ProtectedRoute><LiveTrackingPage /></ProtectedRoute>} />
          <Route path="/ride/:rideId/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        </Routes>
      </Router>
      <Toaster />
    </div>
  )
}

export default App