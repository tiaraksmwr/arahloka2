import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const Logo = ({ light = false }) => (
  <div className="flex items-center gap-2">
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke={light ? "white" : "#CC5500"} strokeWidth="2.5"/>
      <path d="M20 6V12M20 28V34M6 20H12M28 20H34" stroke={light ? "white" : "#CC5500"} strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12L23 20L20 28L17 20L20 12Z" fill={light ? "white" : "#CC5500"}/>
      <circle cx="20" cy="20" r="3" fill={light ? "var(--secondary)" : "white"}/>
    </svg>
    <span style={{ 
      fontSize: '1.5rem', 
      fontWeight: '800', 
      color: light ? 'white' : 'var(--text-dark)', 
      letterSpacing: '-1px', 
      fontFamily: "var(--font-serif)" 
    }}>ArahLoka</span>
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
    navigate('/login')
  }

  if (loading && !stats) return <div className="flex justify-center items-center h-screen">
    <div className="text-center">
      <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>🌍</div>
      <p style={{ fontWeight: 600, color: 'var(--text-gray)' }}>Memuat data dashboard...</p>
    </div>
  </div>

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="mb-8 px-4">
          <Logo light />
          <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem', fontWeight: 500 }}>ADMIN CONTROL PANEL</p>
        </div>
        
        <nav className="sidebar-nav">
          {[
            { id: 'overview', label: 'Ringkasan', icon: '📊' },
            { id: 'approvals', label: 'Persetujuan', icon: '✅', badge: pendingUsers.length },
            { id: 'users', label: 'Pengguna', icon: '👥' },
            { id: 'packages', label: 'Paket Wisata', icon: '🗺️' },
            { id: 'bookings', label: 'Booking', icon: '📅' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sidebar-link ${activeSection === tab.id ? 'active' : ''}`}
              style={{ border: 'none', background: 'none', color: 'white', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ fontSize: '1.25rem' }}>{tab.icon}</span>
              <span style={{ flex: 1 }}>{tab.label}</span>
              {tab.badge > 0 && (
                <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} className="sidebar-link" style={{ border: 'none', background: 'none', color: 'white', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
            <span>🚪</span> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              {activeSection === 'overview' ? 'Ringkasan Platform' : 
               activeSection === 'approvals' ? 'Persetujuan Penyedia' :
               activeSection === 'users' ? 'Manajemen Pengguna' :
               activeSection === 'packages' ? 'Katalog Paket' : 'Daftar Booking'}
            </h2>
            <p className="text-gray" style={{ fontSize: '0.95rem' }}>Selamat datang kembali, Superadmin.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchAllData} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>🔄 Refresh Data</button>
          </div>
        </header>

        {activeSection === 'overview' && (
          <div className="animate-fade-in">
            {/* Stats Grid */}
            <div className="stat-grid">
              <StatCard label="Total Pengguna" value={stats?.total_users} color="var(--secondary)" icon="👥" />
              <StatCard label="Penyedia Approved" value={stats?.approved_providers} color="#10b981" icon="🏢" />
              <StatCard label="Penyedia Pending" value={stats?.pending_providers} color="#f59e0b" icon="⏳" />
              <StatCard label="Paket Wisata" value={stats?.total_packages} color="var(--primary)" icon="🗺️" />
              <StatCard label="Total Booking" value={stats?.total_bookings} color="#8b5cf6" icon="📅" />
              <StatCard label="Booking Pending" value={stats?.pending_bookings} color="#f59e0b" icon="🕒" />
            </div>

            <div className="grid grid-cols-1" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
              {/* Recent Activities */}
              <div className="card p-8">
                <h3 className="mb-6">Aktivitas Terbaru</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {activities.slice(0, 8).map((act, i) => (
                    <div key={i} className="flex justify-between items-center" style={{ padding: '1rem', background: '#fcfcfc', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                      <div className="flex items-center gap-4">
                        <span style={{ fontSize: '1.25rem' }}>{act.text.includes('booking') ? '📅' : act.text.includes('user') ? '👤' : '✨'}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{act.text}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{new Date(act.created_at).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                  {activities.length === 0 && <p className="text-center p-8 text-gray">Belum ada aktivitas.</p>}
                </div>
              </div>

              {/* Quick Summary Card */}
              <div className="card p-8 flex flex-col items-center justify-center text-center">
                <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '2.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>🏢</div>
                <h3>Penyedia Menunggu</h3>
                <p className="text-gray mb-6">Terdapat {pendingUsers.length} penyedia jasa yang menunggu verifikasi Anda.</p>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.5rem' }}>{pendingUsers.length}</div>
                <button 
                  onClick={() => setActiveTab('approvals')}
                  className="btn btn-primary w-full"
                >
                  Kelola Persetujuan
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'approvals' && (
          <div className="card animate-fade-in">
            <div className="p-8 border-b">
              <h3 className="mb-2">Menunggu Persetujuan</h3>
              <p className="text-gray text-sm">Verifikasi dokumen dan profil penyedia jasa sebelum memberikan akses.</p>
            </div>
            {pendingUsers.length === 0 ? (
              <div className="p-12 text-center">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <p className="text-gray">Semua permohonan telah diproses.</p>
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
                        <td>{user.email}</td>
                        <td className="text-gray" style={{ fontSize: '0.85rem' }}>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleApprove(user.id)} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', background: 'var(--success)', boxShadow: 'none' }}>Setujui</button>
                            <button onClick={() => handleReject(user.id)} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Tolak</button>
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

        {activeSection === 'users' && (
          <div className="card animate-fade-in">
            <div className="p-8">
              <h3 className="mb-4">Daftar Seluruh Pengguna</h3>
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
                            padding: '4px 12px', 
                            borderRadius: '20px', 
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
                            fontSize: '0.85rem', 
                            fontWeight: 700,
                            color: user.status === 'approved' ? 'var(--success)' : user.status === 'pending' ? 'var(--warning)' : 'var(--danger)'
                          }}>
                            ● {user.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-gray" style={{ fontSize: '0.85rem' }}>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'packages' && (
          <div className="card animate-fade-in">
            <div className="p-8">
              <h3 className="mb-4">Katalog Paket Wisata</h3>
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
                        <td>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{pkg.provider_name}</div>
                        </td>
                        <td><div style={{ fontWeight: 700, color: 'var(--secondary)' }}>Rp {pkg.price?.toLocaleString('id-ID')}</div></td>
                        <td><span style={{ fontWeight: 600 }}>{pkg.quota} pax</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'bookings' && (
          <div className="card animate-fade-in">
            <div className="p-8">
              <h3 className="mb-4">Transaksi Booking Platform</h3>
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
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{b.tourist_email}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{b.package_title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>by {b.provider_name}</div>
                        </td>
                        <td><div style={{ fontSize: '0.85rem' }}>{b.travel_date}</div></td>
                        <td>
                          <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '6px', 
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            background: b.status === 'accepted' ? '#dcfce7' : b.status === 'pending' ? '#fef3c7' : '#fee2e2',
                            color: b.status === 'accepted' ? '#166534' : b.status === 'pending' ? '#92400e' : '#991b1b'
                          }}>
                            {b.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const StatCard = ({ label, value, color, icon }) => (
  <div className="stat-card" style={{ borderTopColor: color }}>
    <div className="flex justify-between items-start mb-4">
      <div style={{ color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '1.5rem' }}>{icon}</div>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 900, color: color }}>{value || 0}</div>
  </div>
)

export default SuperadminDashboard
