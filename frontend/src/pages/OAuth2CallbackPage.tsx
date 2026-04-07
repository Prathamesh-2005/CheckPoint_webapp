import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
        const error = searchParams.get('error');

        console.log('🔍 OAuth Callback - Raw params:', {
          token: token ? 'exists' : 'null',
          userStr: userStr ? 'exists' : 'null',
          error,
          fullUrl: window.location.href
        });

        if (error) {
          throw new Error(decodeURIComponent(error));
        }

        if (!token || !userStr) {
          throw new Error('Invalid OAuth callback - missing token or user data');
        }

        // Decode and parse user data
        const user = JSON.parse(decodeURIComponent(userStr));

        console.log('📦 Parsed user data:', user);
        console.log('🔑 JWT token length:', token.length);

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        console.log('✅ OAuth login successful, stored in localStorage');
        console.log('🔑 Token stored:', localStorage.getItem('token') ? 'yes' : 'no');
        console.log('👤 User stored:', localStorage.getItem('user') ? 'yes' : 'no');

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      } catch (err: any) {
        console.error('❌ OAuth callback failed:', err);
        setError(err.message || 'Authentication failed');
        
        // Redirect to login after error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-5xl mb-4">✕</div>
          <h1 className="text-2xl font-semibold">Authentication Failed</h1>
          <p className="text-white/60">{error}</p>
          <p className="text-sm text-white/40">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
        <h1 className="text-2xl font-semibold">Completing Sign In</h1>
        <p className="text-white/60">Please wait while we set up your account...</p>
      </div>
    </div>
  );
}
