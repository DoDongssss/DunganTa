import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

/* ─── Dummy data ─────────────────────────────────────────── */
interface Ride {
  id: string;
  driver: { name: string; avatar: string; rating: number; trips: number };
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  seatsLeft: number;
  fare: number;
  tags: string[];
  distance: string;
  duration: string;
}

const DUMMY_RIDES: Ride[] = [
  {
    id: '1',
    driver: { name: 'Maria Santos', avatar: 'MS', rating: 4.9, trips: 142 },
    from: 'Koronadal City Hall',
    to: 'General Santos Airport',
    date: 'Today',
    time: '08:30 AM',
    seats: 4,
    seatsLeft: 2,
    fare: 120,
    tags: ['A/C', 'Non-smoking'],
    distance: '48 km',
    duration: '55 min',
  },
  {
    id: '2',
    driver: { name: 'Jose Reyes', avatar: 'JR', rating: 4.7, trips: 89 },
    from: 'SM City GenSan',
    to: 'Tacurong City Plaza',
    date: 'Today',
    time: '09:00 AM',
    seats: 3,
    seatsLeft: 1,
    fare: 80,
    tags: ['Pets OK', 'Music'],
    distance: '31 km',
    duration: '40 min',
  },
  {
    id: '3',
    driver: { name: 'Ana Cruz', avatar: 'AC', rating: 5.0, trips: 201 },
    from: 'Marbel Public Market',
    to: 'Kidapawan City',
    date: 'Tomorrow',
    time: '06:00 AM',
    seats: 4,
    seatsLeft: 3,
    fare: 150,
    tags: ['A/C', 'Early Bird'],
    distance: '62 km',
    duration: '1 hr 10 min',
  },
  {
    id: '4',
    driver: { name: 'Ramon Dela Torre', avatar: 'RD', rating: 4.8, trips: 55 },
    from: 'Surallah Town Center',
    to: 'Lake Sebu',
    date: 'Tomorrow',
    time: '07:30 AM',
    seats: 4,
    seatsLeft: 4,
    fare: 60,
    tags: ['Scenic Route'],
    distance: '19 km',
    duration: '30 min',
  },
  {
    id: '5',
    driver: { name: 'Liza Abad', avatar: 'LA', rating: 4.6, trips: 33 },
    from: 'Gensan Fish Port',
    to: 'Polomolok Public Market',
    date: 'Mar 29',
    time: '05:00 AM',
    seats: 3,
    seatsLeft: 2,
    fare: 55,
    tags: ['Early AM'],
    distance: '22 km',
    duration: '28 min',
  },
];

const STATS = [
  { label: 'Rides Shared', value: '2,841', icon: '🚗', color: 'bg-blue-50 text-blue-600' },
  { label: 'CO₂ Saved', value: '1.2 T', icon: '🌿', color: 'bg-green-50 text-green-600' },
  { label: 'Users', value: '934', icon: '👥', color: 'bg-violet-50 text-violet-600' },
  { label: 'Avg. Fare', value: '₱93', icon: '💸', color: 'bg-amber-50 text-amber-600' },
];

/* ─── Avatar ─────────────────────────────────────────────── */
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-rose-500', 'bg-cyan-500',
];
function Avatar({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' | 'lg' }) {
  const color = AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length];
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

/* ─── Star rating ────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      <svg className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
      <span className="text-xs font-semibold text-slate-700">{rating.toFixed(1)}</span>
    </span>
  );
}

/* ─── Ride Card ──────────────────────────────────────────── */
function RideCard({ ride }: { ride: Ride }) {
  const [joined, setJoined] = useState(false);
  const pct = ((ride.seats - ride.seatsLeft) / ride.seats) * 100;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
      {/* Top bar accent */}
      <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-400" />

      <div className="p-5 space-y-4">
        {/* Driver */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar initials={ride.driver.avatar} />
            <div>
              <p className="text-sm font-semibold text-slate-800">{ride.driver.name}</p>
              <div className="flex items-center gap-2">
                <Stars rating={ride.driver.rating} />
                <span className="text-[11px] text-slate-400">{ride.driver.trips} trips</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-extrabold text-blue-600">₱{ride.fare}</p>
            <p className="text-[11px] text-slate-400">per seat</p>
          </div>
        </div>

        {/* Route */}
        <div className="flex gap-3 items-stretch">
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100" />
            <div className="w-px flex-1 bg-slate-200 min-h-[20px]" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-400 ring-2 ring-red-100" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="bg-slate-50 rounded-xl px-3 py-2">
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">From</p>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{ride.from}</p>
            </div>
            <div className="bg-slate-50 rounded-xl px-3 py-2">
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">To</p>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{ride.to}</p>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            {ride.date}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {ride.time}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            {ride.distance}
          </span>
          <span className="ml-auto text-slate-400">{ride.duration}</span>
        </div>

        {/* Seats progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Seats available</span>
            <span className={`font-semibold ${ride.seatsLeft === 1 ? 'text-red-500' : 'text-slate-700'}`}>
              {ride.seatsLeft}/{ride.seats}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {ride.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-semibold">
              {tag}
            </span>
          ))}
        </div>

        {/* Action */}
        <button
          onClick={() => setJoined(!joined)}
          disabled={ride.seatsLeft === 0}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[.98]
            ${joined
              ? 'bg-green-50 text-green-600 border border-green-200'
              : ride.seatsLeft === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-200'
            }`}
        >
          {joined ? '✓ Ride Joined!' : ride.seatsLeft === 0 ? 'Full' : 'Join Ride'}
        </button>
      </div>
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar({ onPostRide }: { onPostRide: () => void }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  return (
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-md shadow-blue-200">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <span className="text-base font-extrabold text-slate-800 tracking-tight hidden sm:block">DunganTa</span>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-md relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Where are you going?"
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onPostRide}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Post Ride
          </button>

          {/* Notifications */}
          <button className="relative w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors">
            <svg className="w-4.5 h-4.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
          </button>

          {/* Avatar dropdown */}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
              <Avatar initials={initials} size="sm" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user?.full_name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                {[
                  { label: 'My Profile', icon: '👤' },
                  { label: 'My Rides', icon: '🚗' },
                  { label: 'Messages', icon: '💬' },
                  { label: 'Settings', icon: '⚙️' },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => { setMenuOpen(false); logout(); navigate('/auth'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <span>🚪</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ─── Post Ride Modal (stub) ─────────────────────────────── */
function PostRideModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-800">Post a Ride</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Pickup Location', placeholder: 'e.g. Koronadal City Hall', icon: '📍' },
            { label: 'Destination', placeholder: 'e.g. General Santos Airport', icon: '🏁' },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{f.label}</label>
              <div className="mt-1 flex items-center gap-2 px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-blue-300 focus-within:bg-white transition-all">
                <span className="text-base">{f.icon}</span>
                <input className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none" placeholder={f.placeholder} />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Date', type: 'date', icon: '📅' },
              { label: 'Time', type: 'time', icon: '🕐' },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{f.label}</label>
                <input type={f.type} className="mt-1 w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Seats Available</label>
              <input type="number" min={1} max={8} defaultValue={3} className="mt-1 w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fare / Seat (₱)</label>
              <input type="number" min={0} placeholder="0" className="mt-1 w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-200"
        >
          Post Ride 🚗
        </button>
      </div>
    </div>
  );
}

/* ─── HomePage ───────────────────────────────────────────── */
export default function HomePage() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  const [showPostModal, setShowPostModal] = useState(false);

  const firstName = user?.full_name?.split(' ')[0] ?? 'Rider';

  const filtered = DUMMY_RIDES.filter((r) => {
    if (filter === 'today') return r.date === 'Today';
    if (filter === 'tomorrow') return r.date === 'Tomorrow';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onPostRide={() => setShowPostModal(true)} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Hero greeting ── */}
        <section className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl overflow-hidden p-8 text-white shadow-xl shadow-blue-200">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />
          <div className="absolute top-4 right-28 w-20 h-20 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <p className="text-blue-200 text-sm font-medium">Good morning 👋</p>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Hello, {firstName}!
              </h1>
              <p className="text-blue-100 text-sm max-w-xs leading-relaxed">
                Ready to share a ride? Find passengers going your way and split the cost.
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowPostModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-white text-blue-600 font-bold text-sm rounded-2xl hover:bg-blue-50 transition-colors shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Post a Ride
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm rounded-2xl transition-colors backdrop-blur-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Find a Ride
              </button>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-lg flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-800 leading-tight">{s.value}</p>
                <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Ride feed ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-extrabold text-slate-800">Available Rides</h2>

            {/* Filter tabs */}
            <div className="flex gap-1 p-1 bg-white border border-slate-100 rounded-xl shadow-sm">
              {(['all', 'today', 'tomorrow'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${
                    filter === f
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
              <div className="text-4xl mb-3">🚗</div>
              <p className="font-semibold">No rides found</p>
              <p className="text-sm mt-1">Try a different filter or post your own ride</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── Mobile FAB ── */}
      <button
        onClick={() => setShowPostModal(true)}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-300 flex items-center justify-center transition-all active:scale-95 z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
      </button>

      {/* ── Post Ride Modal ── */}
      {showPostModal && (
        <div onClick={() => setShowPostModal(false)}>
          <PostRideModal onClose={() => setShowPostModal(false)} />
        </div>
      )}
    </div>
  );
}