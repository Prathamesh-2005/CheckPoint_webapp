import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    console.log('🔒 ProtectedRoute: Checking authentication...');
    const authenticated = authService.isAuthenticated();
    setIsAuth(authenticated);
    setIsChecking(false);
    console.log('🔒 ProtectedRoute: Auth check complete:', authenticated);
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!isAuth) {
    console.log('🔒 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('🔒 ProtectedRoute: Authenticated, rendering children');
  return <>{children}</>;
}
