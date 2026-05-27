import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

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

  if (loading && !stats) return <div className="app" style={{ padding: '2rem' }}>Memuat data dashboard...</div>

  return (
    <div className="app" style={{ background: '#fdfbf0', minHeight: '100vh' }}>
      <nav className="navbar">
        <Link to="/" className="logo">ArahLoka Admin</Link>
        <div className="nav-links">
          <button onClick={handleLogout} className="btn-login" style={{ border: 'none', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', minHeight: 'calc(100vh - 70px)' }}>
        {/* Sidebar */}
        <aside style={{ background: 'var(--deep-green)', color: 'white', padding: '2rem 1rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Dashboard Admin</h2>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Pantau dan kelola ekosistem ArahLoka.</p>
          </div>
          <nav style={{ display: 'grid', gap: '0.5rem' }}>
            {[
              { id: 'overview', label: 'Ringkasan', icon: '📊' },
              { id: 'approvals', label: 'Persetujuan', icon: '✅' },
              { id: 'users', label: 'Pengguna', icon: '👥' },
              { id: 'packages', label: 'Paket Wisata', icon: '🗺️' },
              { id: 'bookings', label: 'Booking', icon: '📅' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeSection === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontWeight: activeSection === tab.id ? 'bold' : 'normal'
                }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ padding: '2rem', overflowY: 'auto' }}>
          {activeSection === 'overview' && (
            <div>
              <h2 style={{ marginBottom: '2rem', color: 'var(--deep-green)' }}>Ringkasan Platform</h2>
              
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard label="Total Pengguna" value={stats?.total_users} color="var(--deep-green)" />
                <StatCard label="Turis" value={stats?.total_tourists} color="#3b82f6" />
                <StatCard label="Penyedia Approved" value={stats?.approved_providers} color="#10b981" />
                <StatCard label="Penyedia Pending" value={stats?.pending_providers} color="#f59e0b" />
                <StatCard label="Paket Wisata" value={stats?.total_packages} color="var(--burnt-orange)" />
                <StatCard label="Total Booking" value={stats?.total_bookings} color="#8b5cf6" />
                <StatCard label="Booking Pending" value={stats?.pending_bookings} color="#f59e0b" />
                <StatCard label="Memory & Story" value={(stats?.total_memory_cards || 0) + (stats?.total_story_challenges || 0)} color="#ec4899" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Recent Activities */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
                  <h3 style={{ marginBottom: '1.5rem', color: 'var(--deep-green)' }}>Aktivitas Terbaru</h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {activities.map((act, i) => (
                      <div key={i} style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem' }}>{act.text}</span>
                        <span style={{ fontSize: '0.75rem', color: '#999' }}>{new Date(act.created_at).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                    {activities.length === 0 && <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Belum ada aktivitas.</p>}
                  </div>
                </div>

                {/* Quick Info */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
                  <h3 style={{ marginBottom: '1.5rem', color: 'var(--deep-green)' }}>Status Penyedia</h3>
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{pendingUsers.length}</div>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>Menunggu Persetujuan</p>
                    <button 
                      onClick={() => setActiveTab('approvals')}
                      style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--burnt-orange)', background: 'transparent', color: 'var(--burnt-orange)', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Lihat Semua
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'approvals' && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--deep-green)' }}>Persetujuan Penyedia Jasa Travel</h3>
              {pendingUsers.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '3rem' }}>Tidak ada pengguna yang menunggu persetujuan.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '1rem 0.5rem' }}>Nama</th>
                        <th style={{ padding: '1rem 0.5rem' }}>Email</th>
                        <th style={{ padding: '1rem 0.5rem' }}>Tgl Daftar</th>
                        <th style={{ padding: '1rem 0.5rem' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUsers.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{user.name}</td>
                          <td style={{ padding: '1rem 0.5rem' }}>{user.email}</td>
                          <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: '#666' }}>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                          <td style={{ padding: '1rem 0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleApprove(user.id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Approve</button>
                              <button onClick={() => handleReject(user.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Reject</button>
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
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--deep-green)' }}>Semua Pengguna</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '1rem 0.5rem' }}>Nama</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Email</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Role</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Tgl Daftar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{user.name}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>{user.email}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: '#f3f4f6' }}>{user.role}</span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', color: user.status === 'approved' ? '#10b981' : user.status === 'pending' ? '#f59e0b' : '#ef4444', fontWeight: 'bold' }}>{user.status}</span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', fontSize: '0.85rem', color: '#666' }}>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'packages' && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--deep-green)' }}>Semua Paket Wisata</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '1rem 0.5rem' }}>Judul Paket</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Lokasi</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Provider</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Harga</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Kuota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPackages.map(pkg => (
                      <tr key={pkg.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold' }}>{pkg.title}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>{pkg.location}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <div style={{ fontSize: '0.9rem' }}>{pkg.provider_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#888' }}>{pkg.provider_email}</div>
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>Rp {pkg.price?.toLocaleString('id-ID')}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>{pkg.quota}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'bookings' && (
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--deep-green)' }}>Seluruh Transaksi Booking</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '1rem 0.5rem' }}>Turis</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Paket & Provider</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Tgl Trip</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Peserta</th>
                      <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <div style={{ fontWeight: 'bold' }}>{b.tourist_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#888' }}>{b.tourist_email}</div>
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <div style={{ fontWeight: 'bold', color: 'var(--burnt-orange)' }}>{b.package_title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>oleh {b.provider_name}</div>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', fontSize: '0.9rem' }}>{b.travel_date}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>{b.participants}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            background: b.status === 'accepted' ? '#d1fae5' : b.status === 'pending' ? '#fef3c7' : '#fee2e2',
                            color: b.status === 'accepted' ? '#065f46' : b.status === 'pending' ? '#92400e' : '#991b1b'
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
          )}
        </main>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, color }) => (
  <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow)', borderTop: `4px solid ${color}` }}>
    <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{label}</p>
    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: color }}>{value || 0}</p>
  </div>
)

export default SuperadminDashboard
