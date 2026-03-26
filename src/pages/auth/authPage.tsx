import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import type { AuthView } from '@/types/auth.type';

/* ─── Validation schemas ─────────────────────────────────── */
const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const signUpSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

/* ─── Illustration SVG ───────────────────────────────────── */
function RiderIllustration() {
  return (
    <svg viewBox="0 0 340 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
      {/* Road */}
      <ellipse cx="170" cy="285" rx="130" ry="18" fill="#C7D9F5" opacity="0.5" />
      {/* Car body */}
      <rect x="60" y="200" width="220" height="75" rx="22" fill="#4A8EF5" />
      <rect x="90" y="165" width="160" height="60" rx="18" fill="#6AA3F7" />
      {/* Windows */}
      <rect x="100" y="172" width="60" height="46" rx="10" fill="#C9DFFE" opacity="0.85" />
      <rect x="170" y="172" width="68" height="46" rx="10" fill="#C9DFFE" opacity="0.85" />
      {/* Door line */}
      <line x1="167" y1="200" x2="167" y2="275" stroke="#3A7AE4" strokeWidth="2" />
      {/* Wheels */}
      <circle cx="108" cy="278" r="24" fill="#2B5BAD" />
      <circle cx="108" cy="278" r="14" fill="#EEF4FF" />
      <circle cx="108" cy="278" r="5" fill="#4A8EF5" />
      <circle cx="232" cy="278" r="24" fill="#2B5BAD" />
      <circle cx="232" cy="278" r="14" fill="#EEF4FF" />
      <circle cx="232" cy="278" r="5" fill="#4A8EF5" />
      {/* Headlight */}
      <ellipse cx="278" cy="232" rx="10" ry="7" fill="#FFF176" opacity="0.9" />
      {/* Person in car */}
      <circle cx="135" cy="190" r="16" fill="#FBBF7C" />
      <rect x="120" y="204" width="30" height="22" rx="8" fill="#4A8EF5" />
      {/* Pin / location marker */}
      <path d="M210 60 C210 40 240 40 240 60 C240 78 225 95 225 95 C225 95 210 78 210 60Z" fill="#FF6B6B" />
      <circle cx="225" cy="60" r="8" fill="white" />
      {/* Dotted path */}
      <path d="M140 130 Q170 100 210 80" stroke="#4A8EF5" strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" />
      {/* People icons (passengers) */}
      <circle cx="90" cy="120" r="13" fill="#A5C8FF" />
      <rect x="78" y="131" width="24" height="18" rx="6" fill="#6AA3F7" />
      <circle cx="130" cy="108" r="13" fill="#FBBF7C" />
      <rect x="118" y="119" width="24" height="18" rx="6" fill="#F97316" opacity="0.8" />
      {/* Stars / sparkle */}
      <circle cx="265" cy="120" r="4" fill="#FDE68A" />
      <circle cx="55" cy="160" r="3" fill="#FDE68A" />
      <circle cx="300" cy="185" r="3" fill="#A5C8FF" />
    </svg>
  );
}

/* ─── Input component ────────────────────────────────────── */
function Field({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase">
        {label}
      </label>
      <input
        {...props}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder:text-slate-300 bg-slate-50 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white
          ${error ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200'}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ─── Login form ─────────────────────────────────────────── */
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const { forgotPassword } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    const err = await login(data);
    if (err) { setServerError(err); return; }
    navigate('/dashboard');
  };

  const handleForgot = async () => {
    if (!forgotEmail) return;
    const err = await forgotPassword(forgotEmail);
    setForgotMsg(err ?? 'Check your email for reset instructions!');
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-400">
          Don't have an account?{' '}
          <button onClick={onSwitch} className="text-blue-500 font-semibold hover:underline">
            Sign up, it's free!
          </button>
        </p>
      </div>

      {serverError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" {...register('rememberMe')} />
              <div className="w-9 h-5 bg-slate-200 rounded-full peer-checked:bg-blue-500 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-sm text-slate-500">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => setShowForgot(!showForgot)}
            className="text-sm text-blue-500 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {showForgot && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-2">
            <p className="text-xs text-blue-600 font-medium">Enter your email to reset your password</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="button"
                onClick={handleForgot}
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send
              </button>
            </div>
            {forgotMsg && <p className="text-xs text-blue-700">{forgotMsg}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[.98] text-white font-semibold text-sm tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Signing in…
            </span>
          ) : 'LOGIN'}
        </button>
      </form>
    </div>
  );
}

/* ─── Sign-up form ───────────────────────────────────────── */
function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: SignUpForm) => {
    setServerError('');
    const err = await signUp(data);
    if (err) { setServerError(err); return; }
    navigate('/dashboard');
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create account</h2>
        <p className="mt-1 text-sm text-slate-400">
          Already have an account?{' '}
          <button onClick={onSwitch} className="text-blue-500 font-semibold hover:underline">
            Log in
          </button>
        </p>
      </div>

      {serverError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field
          label="Full Name"
          type="text"
          placeholder="Juan dela Cruz"
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Field
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Field
          label="Phone (optional)"
          type="tel"
          placeholder="+63 9XX XXX XXXX"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Field
            label="Confirm"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <p className="text-xs text-slate-400">
          By signing up, you agree to our{' '}
          <a href="#" className="text-blue-500 hover:underline">Terms</a> &amp;{' '}
          <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-[.98] text-white font-semibold text-sm tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Creating account…
            </span>
          ) : 'CREATE ACCOUNT'}
        </button>
      </form>
    </div>
  );
}

/* ─── Main Auth Page ─────────────────────────────────────── */
export default function AuthPage() {
  const [view, setView] = useState<AuthView>('login');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden flex min-h-[560px]">

        {/* ── Left Panel ── */}
        <div className="hidden md:flex flex-col justify-between w-[45%] bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 p-10 relative overflow-hidden">
          {/* Blobs */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-blue-200/40 blur-2xl" />
          <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full bg-indigo-200/30 blur-2xl" />

          {/* Logo */}
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-300">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <span className="text-lg font-extrabold text-slate-800 tracking-tight">DunganTa</span>
          </div>

          {/* Illustration */}
          <div className="relative z-10 py-4">
            <RiderIllustration />
          </div>

          {/* Tagline */}
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold text-slate-800 leading-tight">
              We Go Together
            </h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Post a ride, find passengers, and split the fare — all in one place. Smart matching, real-time updates, and safe travel.
            </p>

            {/* Trust badges */}
            <div className="mt-5 flex gap-4">
              {[
                { icon: '🚗', label: 'Share Rides' },
                { icon: '💸', label: 'Split Fares' },
                { icon: '📍', label: 'Live Tracking' },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1">
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-10">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <span className="text-base font-extrabold text-slate-800">DunganTa</span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-8 self-start">
            {(['login', 'signup'] as AuthView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  view === v
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {v === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <div
            key={view}
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {view === 'login'
              ? <LoginForm onSwitch={() => setView('signup')} />
              : <SignUpForm onSwitch={() => setView('login')} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}