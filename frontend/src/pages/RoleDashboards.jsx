import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const ArahLokaLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke="#B8501C" strokeWidth="2.5"/>
      <path d="M20 6V12M20 28V34M6 20H12M28 20H34" stroke="#B8501C" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12L23 20L20 28L17 20L20 12Z" fill="#B8501C"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
    </svg>
    <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-dark)', letterSpacing: '-0.5px', fontFamily: 'var(--font-serif)' }}>ArahLoka</span>
  </div>
)

const svgBase = { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

const ICONS = {
  dashboard: (
    <svg {...svgBase}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
  ),
  compass: (
    <svg {...svgBase}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
  ),
  calendar: (
    <svg {...svgBase}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
  ),
  map: (
    <svg {...svgBase}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
  ),
  camera: (
    <svg {...svgBase}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
  ),
  settings: (
    <svg {...svgBase}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
  ),
}

export const DashboardLayout = ({ title, subtitle, children, role }) => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const navLinks = role === 'tourist'
    ? [
        { to: '/tourist', label: 'Dashboard', icon: ICONS.dashboard },
        { to: '/destinasi', label: 'Jelajah Destinasi', icon: ICONS.compass },
        { to: '/bookings', label: 'Booking Saya', icon: ICONS.calendar },
        { to: '/trips', label: 'Trip Planner', icon: ICONS.map },
        { to: '/journey-studio', label: 'Journey Studio', icon: ICONS.camera },
      ]
    : [
        { to: '/provider', label: 'Dashboard', icon: ICONS.dashboard },
        { to: '/provider/packages', label: 'Kelola Paket', icon: ICONS.map },
      ]

  return (
    <div className="db-layout">
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <Link to="/"><ArahLokaLogo /></Link>
          <div className="db-sidebar-role">{role === 'tourist' ? 'Tourist Portal' : 'Provider Portal'}</div>
        </div>

        <nav className="db-sidebar-nav">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`db-sidebar-link ${window.location.pathname === link.to ? 'active' : ''}`}
            >
              <span className="db-sidebar-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
          <Link
            to="/pengaturan"
            className={`db-sidebar-link ${window.location.pathname === '/pengaturan' ? 'active' : ''}`}
          >
            <span className="db-sidebar-icon">{ICONS.settings}</span>
            Pengaturan
          </Link>
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-sidebar-user">
            <div className="db-sidebar-avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="db-sidebar-username">{user.name}</div>
              <div className="db-sidebar-useremail">{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="db-sidebar-logout">
            Keluar
          </button>
        </div>
      </aside>

      <main className="db-main">
        <div className="db-page-header">
          <div>
            <h1 className="db-page-title">{title}</h1>
            {subtitle && <p className="db-page-sub">{subtitle}</p>}
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}

export const TouristDashboard = () => {
  const [packages, setPackages] = useState([])
  const [bookings, setBookings] = useState([])
  const [memoryCount, setMemoryCount] = useState(0)
  const [storyCount, setStoryCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  useEffect(() => {
    if (user.role !== 'tourist') {
      navigate('/login')
    } else {
      fetchData()
    }
  }, [user, navigate])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      const [pkgsRes, bookingsRes, memRes, storyRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/packages`),
        axios.get(`${import.meta.env.VITE_API_URL}/bookings/my`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/memory-cards/my`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/story-challenges`)
      ])
      setPackages(pkgsRes.data)
      setBookings(bookingsRes.data)
      setMemoryCount(memRes.data.length)
      setStoryCount(storyRes.data.filter(s => s.user_id === user.id).length)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setLoading(false)
    }
  }

  const filteredPackages = packages.filter(pkg =>
    pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusLabel = { pending: 'Menunggu', accepted: 'Diterima', rejected: 'Ditolak' }

  return (
    <DashboardLayout
      title="Eksplorasi Budaya"
      subtitle={`Selamat datang, ${user.name}. Temukan destinasi budaya terbaik.`}
      role="tourist"
    >
      {/* Summary stats */}
      <div className="db-stat-grid">
        {[
          { label: 'Paket Tersedia', value: packages.length, icon: '🧭', color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Total Booking', value: bookings.length, icon: '🎫', color: 'var(--accent-dark)', bg: 'var(--accent-light)' },
          { label: 'Trip Diterima', value: bookings.filter(b => b.status === 'accepted').length, icon: '✅', color: 'var(--secondary)', bg: 'var(--secondary-light)' },
          { label: 'Menunggu Konfirmasi', value: bookings.filter(b => b.status === 'pending').length, icon: '⏳', color: 'var(--warning)', bg: 'var(--warning-light)' },
        ].map(stat => (
          <div key={stat.label} className="db-stat-card" style={{ '--stat-color': stat.color }}>
            <div className="db-stat-header">
              <span className="db-stat-label">{stat.label}</span>
              <span className="db-stat-icon" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</span>
            </div>
            <div className="db-stat-value">{loading ? '–' : stat.value}</div>
          </div>
        ))}
      </div>

      {/* Challenge Berhadiah */}
      {(() => {
        const completedTrips = bookings.filter(b => b.completed_at).length
        const challenges = [
          {
            id: 'trip-maestro',
            title: 'Trip Maestro Nusantara',
            desc: 'Selesaikan 3 perjalanan budaya untuk membuktikan dirimu sang penjelajah.',
            theme: 'Petualang Sejati',
            current: completedTrips,
            target: 3,
            reward: 'Voucher trip Rp 500.000',
            icon: '🏆',
            gradient: 'linear-gradient(135deg, #b8501c 0%, #f7b733 100%)'
          },
          {
            id: 'storyteller',
            title: 'Storyteller of the Archipelago',
            desc: 'Bagikan 5 kisah budaya autentik di Community Story.',
            theme: 'Pencerita Budaya',
            current: storyCount,
            target: 5,
            reward: 'Merchandise eksklusif ArahLoka',
            icon: '📖',
            gradient: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)'
          },
          {
            id: 'memory-keeper',
            title: 'Memory Keeper Champion',
            desc: 'Kumpulkan 10 Memory Lane Card dari beragam destinasi.',
            theme: 'Kolektor Kenangan',
            current: memoryCount,
            target: 10,
            reward: 'Photobook digital premium',
            icon: '📸',
            gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
          }
        ]
        return (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px', padding: '0 4px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  ✨ Challenge Berhadiah
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-gray)' }}>
                  Selesaikan challenge bertema budaya untuk mendapatkan hadiah eksklusif.
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700 }}>
                {challenges.filter(c => c.current >= c.target).length} / {challenges.length} selesai
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {challenges.map(c => {
                const pct = Math.min(100, Math.round((c.current / c.target) * 100))
                const done = c.current >= c.target
                return (
                  <div key={c.id} style={{
                    position: 'relative',
                    borderRadius: '20px',
                    padding: '22px 22px 18px',
                    color: 'white',
                    background: c.gradient,
                    boxShadow: 'var(--shadow-card)',
                    overflow: 'hidden'
                  }}>
                    {done && (
                      <span style={{
                        position: 'absolute', top: '14px', right: '14px',
                        background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)',
                        padding: '4px 10px', borderRadius: '999px',
                        fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.5px'
                      }}>SELESAI ✓</span>
                    )}
                    <div style={{ fontSize: '2rem', marginBottom: '6px' }}>{c.icon}</div>
                    <div style={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: '1px', opacity: 0.85, textTransform: 'uppercase' }}>
                      {c.theme}
                    </div>
                    <h4 style={{ color: 'white', fontFamily: 'var(--font-serif)', fontSize: '1.1rem', margin: '4px 0 8px' }}>
                      {c.title}
                    </h4>
                    <p style={{ fontSize: '0.82rem', opacity: 0.92, lineHeight: 1.55, marginBottom: '14px', minHeight: '44px' }}>
                      {c.desc}
                    </p>
                    {/* Progress */}
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, marginBottom: '4px' }}>
                        <span>Progress</span>
                        <span>{c.current} / {c.target}</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%',
                          background: 'rgba(255,255,255,0.9)',
                          borderRadius: '999px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                    {/* Reward */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '12px',
                      fontSize: '0.78rem', fontWeight: 700
                    }}>
                      <span>🎁</span><span>Hadiah: {c.reward}</span>
                    </div>
                    <button
                      onClick={() => navigate('/journey-studio')}
                      style={{
                        marginTop: '12px', width: '100%',
                        background: 'rgba(255,255,255,0.95)',
                        color: '#231308', border: 'none',
                        padding: '9px', borderRadius: '12px',
                        fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer'
                      }}
                    >
                      {done ? 'Klaim di Journey Studio' : 'Lanjutkan Challenge →'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Left: Package Explorer */}
        <div>
          {/* Search */}
          <div className="db-section" style={{ marginBottom: '24px', padding: '18px 22px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Cari destinasi atau paket budaya..."
              className="input"
              style={{ flex: 1, margin: 0 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary" style={{ flexShrink: 0, alignSelf: 'stretch', padding: '0 24px', borderRadius: 'var(--radius-lg)' }}>Cari</button>
          </div>

          {/* Packages */}
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px 12px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700 }}>Paket Wisata Pilihan</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{filteredPackages.length} paket tersedia</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-gray)' }}>Memuat paket...</div>
          ) : (
            <div className="pkg-grid">
              {filteredPackages.map(pkg => (
                <div key={pkg.id} className="pkg-card">
                  <div className="pkg-img-wrap">
                    <img
                      src={pkg.image_url || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=70'}
                      alt={pkg.title}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=70' }}
                    />
                    <span className="pkg-loc-badge">📍 {pkg.location}</span>
                  </div>
                  <div className="pkg-body">
                    <div className="pkg-title">{pkg.title}</div>
                    <div className="pkg-desc">{pkg.description}</div>
                    <div className="pkg-footer">
                      <div>
                        <div className="pkg-price-label">Harga / orang</div>
                        <div className="pkg-price">Rp {pkg.price.toLocaleString('id-ID')}</div>
                      </div>
                      <button
                        onClick={() => navigate(`/packages/${pkg.id}`)}
                        className="btn btn-outline"
                        style={{ padding: '6px 16px', fontSize: '0.82rem' }}
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <aside>
          {/* Journey Studio Promo */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-deep) 100%)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '20px',
            color: 'white'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '8px' }}>Feature</div>
            <h3 style={{ color: 'white', fontSize: '1.15rem', marginBottom: '8px', fontFamily: 'var(--font-serif)' }}>Journey Studio</h3>
            <p style={{ fontSize: '0.84rem', opacity: 0.85, lineHeight: 1.6, marginBottom: '18px' }}>Abadikan dan bagikan kisah budaya dari perjalanan Anda.</p>
            <button
              onClick={() => navigate('/journey-studio')}
              className="btn"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', width: '100%', backdropFilter: 'blur(8px)', fontWeight: 700 }}
            >
              Buka Studio 📸
            </button>
          </div>

          {/* My Bookings */}
          <div className="db-section">
            <div className="db-section-head">
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)' }}>Booking Saya</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '2px' }}>{bookings.length} perjalanan</div>
              </div>
            </div>
            <div style={{ padding: '16px' }}>
              {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-gray)', padding: '24px 0', fontSize: '0.85rem' }}>Memuat...</p>
              ) : bookings.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-gray)', padding: '24px 0', fontSize: '0.85rem' }}>Belum ada booking.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {bookings.map(booking => (
                    <div key={booking.id} className={`booking-card ${booking.status}`}>
                      <div className="booking-card-header">
                        <div className="booking-title">{booking.title}</div>
                        <span className={`badge ${booking.completed_at ? 'badge-completed' : `badge-${booking.status}`}`}>{booking.completed_at ? 'Selesai' : statusLabel[booking.status]}</span>
                      </div>
                      <div className="booking-meta">
                        <p>📅 {booking.travel_date}</p>
                        <p>👥 {booking.participants} orang</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                        <button
                          onClick={() => navigate(`/trip-planner/${booking.id}`)}
                          disabled={booking.status === 'rejected'}
                          className="btn btn-outline"
                          style={{ width: '100%', padding: '6px', fontSize: '0.78rem' }}
                        >
                          Persiapan Trip
                        </button>
                        {booking.completed_at && (
                          <button
                            onClick={() => navigate('/journey-studio')}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '6px', fontSize: '0.78rem' }}
                          >
                            Buat Memory Card
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  )
}

export const ProviderDashboard = () => {
  const [packages, setPackages] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  useEffect(() => {
    if (user.role !== 'travel_provider') {
      navigate('/login')
    } else {
      fetchData()
    }
  }, [user, navigate])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [pkgsRes, bookingsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/provider/packages`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/bookings/provider`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      setPackages(pkgsRes.data)
      setBookings(bookingsRes.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setLoading(false)
    }
  }

  const handleBookingStatus = async (id, status) => {
    const token = localStorage.getItem('token')
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchData()
    } catch (err) {
      alert('Gagal memperbarui status booking')
    }
  }

  const handleCompleteBooking = async (id) => {
    const token = localStorage.getItem('token')
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/bookings/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyelesaikan trip')
    }
  }

  const stats = [
    { label: 'Paket Aktif', value: packages.length, color: 'var(--primary)', icon: '🗺️' },
    { label: 'Total Booking', value: bookings.length, color: 'var(--secondary)', icon: '📅' },
    { label: 'Booking Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'var(--warning)', icon: '⏳' },
    { label: 'Status Akun', value: user.status?.toUpperCase(), color: 'var(--success)', icon: '✅' }
  ]

  return (
    <DashboardLayout
      title="Manajemen Travel"
      subtitle={`Halo, ${user.name}. Kelola paket dan pesanan Anda.`}
      role="provider"
    >
      {/* Stats */}
      <div className="db-stat-grid" style={{ marginBottom: '28px' }}>
        {stats.map((s, i) => (
          <div key={i} className="db-stat-card" style={{ '--stat-color': s.color }}>
            <div className="db-stat-header">
              <div className="db-stat-label">{s.label}</div>
              <div className="db-stat-icon" style={{ background: `color-mix(in srgb, ${s.color} 10%, white)` }}>{s.icon}</div>
            </div>
            <div className="db-stat-value">{s.value ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Bookings (main) */}
      <div style={{ marginBottom: '28px' }}>
        <div className="db-section">
          <div className="db-section-head">
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem' }}>Booking Masuk</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '2px' }}>Kelola pesanan dari para turis</div>
            </div>
          </div>
          <div style={{ padding: '0 4px' }}>
            {loading ? (
              <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text-gray)' }}>Memuat...</p>
            ) : bookings.length === 0 ? (
              <p style={{ padding: '32px', textAlign: 'center', color: 'var(--text-gray)' }}>Belum ada booking.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Turis</th>
                      <th>Paket</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{booking.tourist_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{booking.travel_date}</div>
                        </td>
                        <td style={{ fontSize: '0.9rem' }}>{booking.package_title}</td>
                        <td>
                          {booking.completed_at ? (
                            <span className="badge badge-completed">Selesai</span>
                          ) : (
                            <span className={`badge badge-${booking.status}`}>
                              {booking.status === 'pending' ? 'Menunggu' : booking.status === 'accepted' ? 'Diterima' : 'Ditolak'}
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {booking.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleBookingStatus(booking.id, 'accepted')}
                                className="btn btn-success"
                                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                              >Setujui</button>
                              <button
                                onClick={() => handleBookingStatus(booking.id, 'rejected')}
                                className="btn btn-danger"
                                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                              >Tolak</button>
                            </div>
                          )}
                          {booking.status === 'accepted' && !booking.completed_at && (
                            <button
                              onClick={() => handleCompleteBooking(booking.id)}
                              className="btn btn-primary"
                              style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                            >Tandai Selesai</button>
                          )}
                          {booking.completed_at && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>✓ Selesai</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Package preview + CTA to dedicated page */}
      <div className="db-section">
        <div className="db-section-head">
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem' }}>Paket Terbaru Anda</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '2px' }}>{packages.length} paket aktif · ringkasan 4 terakhir</div>
          </div>
          <button onClick={() => navigate('/provider/packages')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
            Kelola Paket →
          </button>
        </div>
        <div style={{ padding: '16px' }}>
          {loading ? (
            <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text-gray)' }}>Memuat...</p>
          ) : packages.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: '10px' }}>🗺️</div>
              <p style={{ color: 'var(--text-gray)', marginBottom: '14px' }}>Belum ada paket. Mulai dengan menambah paket pertama Anda.</p>
              <button onClick={() => navigate('/provider/packages')} className="btn btn-primary" style={{ padding: '8px 20px' }}>
                Tambah Paket
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
              {packages.slice(0, 4).map(pkg => (
                <div key={pkg.id} style={{
                  background: 'var(--bg-surface)',
                  borderRadius: '14px',
                  border: '1px solid var(--border-light)',
                  overflow: 'hidden'
                }}>
                  <img
                    src={pkg.image_url || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=70'}
                    alt={pkg.title}
                    style={{ width: '100%', height: '110px', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=70' }}
                  />
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.86rem', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pkg.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginBottom: '6px' }}>📍 {pkg.location}</div>
                    <div style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '0.88rem' }}>Rp {Number(pkg.price || 0).toLocaleString('id-ID')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
