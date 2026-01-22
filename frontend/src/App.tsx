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

function App() {
  return (
    <div className="dark">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/search" element={<FindRidePage />} />
          <Route path="/offer" element={<OfferRidePage />} />
          <Route path="/my-rides" element={<MyRidesPage />} />
          <Route path="/settings" element={<ProfilePage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/messages" element={<ChatPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App