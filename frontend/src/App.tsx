import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FindRidePage } from "./pages/FindRidePage";
import { OfferRidePage } from "./pages/OfferRidePage";
import { MyRidesPage } from "./pages/MyRidesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { WalletPage } from "./pages/WalletPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ChatPage } from "./pages/ChatPage";
import { HelpPage } from "./pages/HelpPage";
import { RideDetailsPage } from "./pages/RideDetailsPage";
import { PaymentPage } from "./pages/PaymentPage";
import { LiveTrackingPage } from "./pages/LiveTrackingPage";
import { useEffect } from 'react';
import { notificationService } from './services/notificationService';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    notificationService.requestPermission();
    
    const token = localStorage.getItem('token');
    if (token) {
      notificationService.connect(token);
      
      return () => {
        notificationService.disconnect();
      };
    }
  }, []);

  return (
    <div className="dark">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
    
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><FindRidePage /></ProtectedRoute>} />
          <Route path="/offer" element={<ProtectedRoute><OfferRidePage /></ProtectedRoute>} />
          <Route path="/my-rides" element={<ProtectedRoute><MyRidesPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
          <Route path="/ride/:rideId" element={<ProtectedRoute><RideDetailsPage /></ProtectedRoute>} />
          <Route path="/ride/:rideId/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/ride/:rideId/track" element={<ProtectedRoute><LiveTrackingPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App