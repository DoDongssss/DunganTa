import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { oauthService } from '@/services/oauth.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

type Status = 'loading' | 'error';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function exchange() {
      // Surface any OAuth-level error from the hash early
      // e.g. /auth/callback#error=access_denied&error_description=...
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const oauthError = hashParams.get('error_description') ?? hashParams.get('error');
      if (oauthError) {
        if (!cancelled) {
          setErrorMsg(decodeURIComponent(oauthError.replace(/\+/g, ' ')));
          setStatus('error');
        }
        return;
      }

      const { userId, session, error } = await oauthService.handleCallback();

      if (cancelled) return;

      if (error || !userId || !session) {
        setErrorMsg(error ?? 'Authentication failed. Please try again.');
        setStatus('error');
        return;
      }

      const user = await authService.getUserProfile(userId);

      if (!user) {
        setErrorMsg('Could not load your profile. Please try again.');
        setStatus('error');
        return;
      }

      // Atomically hydrate the entire auth store so ProtectedRoute
      // sees isAuthenticated: true before the navigate fires
      useAuthStore.setState({
        user,
        session,
        isAuthenticated: true,
        isLoading: false,
      });

      navigate('/home', { replace: true });
    }

    exchange();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-xl shadow-blue-200 animate-pulse">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div className="absolute inset-0 rounded-2xl border-4 border-blue-200 border-t-blue-500 animate-spin" />
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-slate-700">Signing you in…</p>
          <p className="text-sm text-slate-400 mt-1">Setting up your DunganTa account</p>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {['Verifying', 'Profile', 'Done'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
                <span className="text-xs text-slate-400">{step}</span>
              </div>
              {i < 2 && <div className="w-4 h-px bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-10 max-w-md w-full text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Sign-in failed</h2>
          <p className="text-sm text-slate-500 mt-1">{errorMsg}</p>
        </div>
        <button
          onClick={() => navigate('/auth', { replace: true })}
          className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}