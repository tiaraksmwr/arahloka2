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

function SuperadminDashboard() {
  const [stats, setStats] = useState(null)
  const [pendingUsers, setPendingUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [allPackages, setAllPackages] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const [statsRes, pendingRes, usersRes, pkgsRes, bookingsRes, activityRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/pending-users`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/packages`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/bookings`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/activity`, { headers })
      ])

      setStats(statsRes.data)
      setPendingUsers(pendingRes.data)
      setAllUsers(usersRes.data)
      setAllPackages(pkgsRes.data)
      setAllBookings(bookingsRes.data)
      setActivities(activityRes.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching admin data:', err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login')
      }
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${import.meta.env.VITE_API_URL}/admin/users/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchAllData()
    } catch (err) {
      alert('Failed to approve user')
    }
  }

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${import.meta.env.VITE_API_URL}/admin/users/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchAllData()
    } catch (err) {
      alert('Failed to reject user')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const navItems = [
    { id: 'overview', label: 'Ringkasan', icon: '◫' },
    { id: 'approvals', label: 'Persetujuan', icon: '✓', badge: pendingUsers.length },
    { id: 'users', label: 'Pengguna', icon: '◎' },
    { id: 'packages', label: 'Paket Wisata', icon: '⊡' },
    { id: 'bookings', label: 'Booking', icon: '⊞' }
  ]

  const pageTitles = {
    overview: 'Ringkasan Platform',
    approvals: 'Persetujuan Penyedia',
    users: 'Manajemen Pengguna',
    packages: 'Katalog Paket',
    bookings: 'Transaksi Booking'
  }

  if (loading && !stats) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ marginTop: '16px', color: 'var(--text-gray)', fontWeight: 600 }}>Memuat data dashboard...</p>
    </div>
  )

  return (
    <div className="db-layout">
      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <Link to="/"><ArahLokaLogo /></Link>
          <div className="db-sidebar-role">Superadmin Panel</div>
        </div>

        <nav className="db-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`db-sidebar-link ${activeSection === item.id ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
            >
              <span className="db-sidebar-icon">{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span className="db-sidebar-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-sidebar-user">
            <div className="db-sidebar-avatar">SA</div>
            <div style={{ minWidth: 0 }}>
              <div className="db-sidebar-username">Superadmin</div>
              <div className="db-sidebar-useremail">Control Panel</div>
            </div>
          </div>
          <button onClick={handleLogout} className="db-sidebar-logout">Keluar</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="db-main">
        <div className="db-page-header">
          <div>
            <h1 className="db-page-title">{pageTitles[activeSection]}</h1>
            <p className="db-page-sub">Selamat datang kembali, Superadmin.</p>
          </div>
          <button onClick={fetchAllData} className="btn btn-outline" style={{ padding: '8px 18px', fontSize: '0.84rem' }}>
            Refresh Data
          </button>
        </div>

        {/* Overview */}
        {activeSection === 'overview' && (
          <div className="animate-fade-in">
            <div className="db-stat-grid" style={{ marginBottom: '28px' }}>
              <StatCard label="Total Pengguna" value={stats?.total_users} color="var(--secondary)" icon="👥" />
              <StatCard label="Provider Approved" value={stats?.approved_providers} color="var(--success)" icon="🏢" />
              <StatCard label="Provider Pending" value={stats?.pending_providers} color="var(--warning)" icon="⏳" />
              <StatCard label="Paket Wisata" value={stats?.total_packages} color="var(--primary)" icon="🗺️" />
              <StatCard label="Total Booking" value={stats?.total_bookings} color="#8b5cf6" icon="📅" />
              <StatCard label="Booking Pending" value={stats?.pending_bookings} color="var(--warning)" icon="⏱️" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
              {/* Recent Activities */}
              <div className="db-section">
                <div className="db-section-head">
                  <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem' }}>Aktivitas Terbaru</div>
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activities.slice(0, 8).map((act, i) => (
                    <div key={i} style={{
                      padding: '12px 16px',
                      background: 'var(--bg-surface)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.1rem' }}>
                          {act.text.includes('booking') ? '📅' : act.text.includes('user') ? '👤' : '✨'}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{act.text}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', flexShrink: 0 }}>
                        {new Date(act.created_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text-gray)' }}>Belum ada aktivitas.</p>
                  )}
                </div>
              </div>

              {/* Pending Providers */}
              <div className="db-section">
                <div className="db-section-head">
                  <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem' }}>Penyedia Menunggu</div>
                </div>
                <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                  <div style={{
                    width: '72px', height: '72px',
                    background: 'var(--primary-light)',
                    borderRadius: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem',
                    margin: '0 auto 16px'
                  }}>🏢</div>
                  <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.6 }}>
                    Terdapat <strong style={{ color: 'var(--text-dark)' }}>{pendingUsers.length}</strong> penyedia jasa yang menunggu verifikasi.
                  </p>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-serif)', marginBottom: '20px' }}>
                    {pendingUsers.length}
                  </div>
                  <button onClick={() => setActiveTab('approvals')} className="btn btn-primary" style={{ width: '100%' }}>
                    Kelola Persetujuan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approvals */}
        {activeSection === 'approvals' && (
          <div className="db-section animate-fade-in">
            <div className="db-section-head">
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem' }}>Menunggu Persetujuan</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '2px' }}>Verifikasi profil penyedia sebelum memberikan akses.</div>
              </div>
            </div>
            {pendingUsers.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎉</div>
                <p style={{ color: 'var(--text-gray)' }}>Semua permohonan telah diproses.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Email</th>
                      <th>Tanggal Daftar</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map(user => (
                      <tr key={user.id}>
                        <td><div style={{ fontWeight: 700 }}>{user.name}</div></td>
                        <td style={{ color: 'var(--text-gray)' }}>{user.email}</td>
                        <td style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>
                          {new Date(user.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleApprove(user.id)}
                              className="btn btn-success"
                              style={{ padding: '5px 14px', fontSize: '0.78rem' }}
                            >Setujui</button>
                            <button
                              onClick={() => handleReject(user.id)}
                              className="btn btn-danger"
                              style={{ padding: '5px 14px', fontSize: '0.78rem' }}
                            >Tolak</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {activeSection === 'users' && (
          <div className="db-section animate-fade-in">
            <div className="db-section-head">
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem' }}>Daftar Seluruh Pengguna</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{allUsers.length} pengguna</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama & Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Terdaftar</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{user.email}</div>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          background: user.role === 'tourist' ? '#e3f2fd' : user.role === 'travel_provider' ? '#f3e5f5' : '#fff3e0',
                          color: user.role === 'tourist' ? '#1976d2' : user.role === 'travel_provider' ? '#7b1fa2' : '#e65100',
                          textTransform: 'uppercase'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: user.status === 'approved' ? 'var(--success)' : user.status === 'pending' ? 'var(--warning)' : 'var(--danger)'
                        }}>
                          ● {user.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Packages */}
        {activeSection === 'packages' && (
          <div className="db-section animate-fade-in">
            <div className="db-section-head">
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem' }}>Katalog Paket Wisata</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{allPackages.length} paket</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Paket</th>
                    <th>Lokasi</th>
                    <th>Provider</th>
                    <th>Harga</th>
                    <th>Kuota</th>
                  </tr>
                </thead>
                <tbody>
                  {allPackages.map(pkg => (
                    <tr key={pkg.id}>
                      <td><div style={{ fontWeight: 700 }}>{pkg.title}</div></td>
                      <td><span style={{ fontSize: '0.85rem' }}>📍 {pkg.location}</span></td>
                      <td><div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{pkg.provider_name}</div></td>
                      <td><div style={{ fontWeight: 700, color: 'var(--secondary)' }}>Rp {pkg.price?.toLocaleString('id-ID')}</div></td>
                      <td><span style={{ fontWeight: 600 }}>{pkg.quota} pax</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings */}
        {activeSection === 'bookings' && (
          <div className="db-section animate-fade-in">
            <div className="db-section-head">
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem' }}>Transaksi Booking Platform</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{allBookings.length} transaksi</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Turis</th>
                    <th>Paket & Provider</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{b.tourist_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{b.tourist_email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{b.package_title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-gray)' }}>by {b.provider_name}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{b.travel_date}</td>
                      <td>
                        <span className={`badge badge-${b.status}`}>
                          {b.status === 'accepted' ? 'Diterima' : b.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const StatCard = ({ label, value, color, icon }) => (
  <div className="db-stat-card" style={{ '--stat-color': color }}>
    <div className="db-stat-header">
      <div className="db-stat-label">{label}</div>
      <div className="db-stat-icon" style={{ background: `color-mix(in srgb, ${color} 12%, white)` }}>{icon}</div>
    </div>
    <div className="db-stat-value">{value ?? 0}</div>
  </div>
)

export default SuperadminDashboard
