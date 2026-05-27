import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke="#CC5500" strokeWidth="2.5"/>
      <path d="M20 6V12M20 28V34M6 20H12M28 20H34" stroke="#CC5500" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12L23 20L20 28L17 20L20 12Z" fill="#CC5500"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
    </svg>
    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', letterSpacing: '-0.5px', fontFamily: "var(--font-serif)" }}>ArahLoka</span>
  </div>
)

const DashboardLayout = ({ title, children, role }) => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="dashboard-layout" style={{ gridTemplateColumns: '260px 1fr' }}>
      <aside className="dashboard-sidebar">
        <div className="mb-8 px-4">
          <Link to="/"><Logo light /></Link>
          <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>{role} PORTAL</p>
        </div>
        
        <div className="sidebar-nav">
          <Link to={role === 'tourist' ? '/tourist' : '/provider'} className="sidebar-link active">
            <span>🏠</span> Dashboard
          </Link>
          {role === 'tourist' && (
            <>
              <Link to="/journey-studio" className="sidebar-link"><span>📸</span> Journey Studio</Link>
              <a href="#explore" className="sidebar-link"><span>🌍</span> Eksplorasi</a>
            </>
          )}
          <a href="#" className="sidebar-link"><span>⚙️</span> Pengaturan</a>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="px-4 mb-4">
            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Login sebagai:</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
          </div>
          <button onClick={handleLogout} className="sidebar-link" style={{ border: 'none', background: 'none', color: 'white', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="mb-8">
          <h2 style={{ fontSize: '2rem' }}>{title}</h2>
          <p className="text-gray">Kelola aktivitas dan perjalanan Anda dengan mudah.</p>
        </header>
        {children}
      </main>
    </div>
  )
}

export const TouristDashboard = () => {
  const [packages, setPackages] = useState([])
  const [bookings, setBookings] = useState([])
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
      const [pkgsRes, bookingsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/packages`),
        axios.get(`${import.meta.env.VITE_API_URL}/bookings/my`, {
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

  const filteredPackages = packages.filter(pkg => 
    pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fffbeb', color: '#92400e', label: 'Menunggu' },
      accepted: { bg: '#dcfce7', color: '#166534', label: 'Diterima' },
      rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Ditolak' }
    }
    const style = styles[status] || styles.pending
    return (
      <span style={{ 
        padding: '4px 10px', 
        borderRadius: '6px', 
        fontSize: '0.7rem', 
        fontWeight: 800,
        backgroundColor: style.bg,
        color: style.color,
        textTransform: 'uppercase'
      }}>
        {style.label}
      </span>
    )
  }

  return (
    <DashboardLayout title="Eksplorasi Budaya" role="Tourist">
      <div className="grid" style={{ gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        <div>
          <div className="card p-6 mb-8 flex gap-4 items-center">
            <div style={{ flex: 1 }}>
              <input 
                type="text" 
                placeholder="Cari destinasi atau paket budaya..." 
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-primary">Cari 🔍</button>
          </div>

          <h3 className="mb-6">Paket Wisata Pilihan</h3>
          {loading ? <p>Memuat paket...</p> : (
            <div className="grid grid-cols-2 gap-6">
              {filteredPackages.map(pkg => (
                <div key={pkg.id} className="card overflow-hidden">
                  <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                    <img src={pkg.image_url || 'https://via.placeholder.com/400x200'} alt={pkg.title} className="w-full h-full" style={{ objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.9)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                      📍 {pkg.location}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="mb-2" style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 800 }}>{pkg.title}</h4>
                    <p className="text-gray mb-6" style={{ fontSize: '0.9rem', height: '2.7rem', overflow: 'hidden' }}>{pkg.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Harga</p>
                        <p style={{ fontWeight: 800, color: 'var(--secondary)' }}>Rp {pkg.price.toLocaleString('id-ID')}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/packages/${pkg.id}`)}
                        className="btn btn-outline" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
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

        <aside>
          <div className="card p-6 mb-8" style={{ background: 'var(--secondary)', color: 'white' }}>
            <h3 className="mb-2" style={{ color: 'white' }}>Journey Studio</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>Abadikan momen berharga dan bagikan kisah budaya Anda.</p>
            <button 
              onClick={() => navigate('/journey-studio')}
              className="btn btn-primary w-full"
              style={{ background: 'white', color: 'var(--secondary)' }}
            >
              Buka Studio 📸
            </button>
          </div>

          <div className="card p-6">
            <h3 className="mb-6">Booking Saya</h3>
            {loading ? <p>Memuat...</p> : bookings.length === 0 ? <p className="text-gray text-center p-8">Belum ada booking.</p> : (
              <div className="flex flex-col gap-4">
                {bookings.map(booking => (
                  <div key={booking.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '16px', background: booking.status === 'pending' ? 'var(--primary-light)' : 'white' }}>
                    <div className="flex justify-between items-start mb-2">
                      <h5 style={{ margin: 0, fontWeight: 800 }}>{booking.title}</h5>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>
                      <p>📅 {booking.travel_date}</p>
                      <p>👥 {booking.participants} Orang</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => navigate(`/trip-planner/${booking.id}`)}
                        disabled={booking.status === 'rejected'}
                        className="btn btn-outline w-full"
                        style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                      >
                        Persiapan Trip
                      </button>
                      {booking.status === 'accepted' && (
                        <button 
                          onClick={() => navigate('/journey-studio')}
                          className="btn btn-primary w-full"
                          style={{ fontSize: '0.8rem', padding: '0.5rem' }}
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
        </aside>
      </div>
    </DashboardLayout>
  )
}

export const ProviderDashboard = () => {
  const [packages, setPackages] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    duration: '',
    price: '',
    quota: '',
    image_url: '',
    latitude: '',
    longitude: ''
  })
  const [uploading, setUploading] = useState(false)
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const data = new FormData()
    data.append('image', file)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      })
      setFormData({ ...formData, image_url: response.data.image_url })
      setUploading(false)
    } catch (err) {
      alert('Upload failed')
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/packages/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        alert('Paket berhasil diperbarui')
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/packages`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        alert('Paket berhasil ditambahkan')
      }
      setEditingId(null)
      setFormData({
        title: '',
        location: '',
        description: '',
        duration: '',
        price: '',
        quota: '',
        image_url: '',
        latitude: '',
        longitude: ''
      })
      fetchData()
    } catch (err) {
      alert('Gagal menyimpan paket')
    }
  }

  const handleEdit = (pkg) => {
    setEditingId(pkg.id)
    setFormData({
      title: pkg.title,
      location: pkg.location,
      description: pkg.description,
      duration: pkg.duration,
      price: pkg.price,
      quota: pkg.quota,
      image_url: pkg.image_url,
      latitude: pkg.latitude || '',
      longitude: pkg.longitude || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus paket ini?')) return
    const token = localStorage.getItem('token')
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchData()
    } catch (err) {
      alert('Gagal menghapus paket')
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

  const stats = [
    { label: 'Paket Aktif', value: packages.length, color: 'var(--primary)', icon: '🗺️' },
    { label: 'Total Booking', value: bookings.length, color: 'var(--secondary)', icon: '📅' },
    { label: 'Booking Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'var(--warning)', icon: '🕒' },
    { label: 'Status Akun', value: user.status?.toUpperCase(), color: '#10b981', icon: '🛡️' }
  ]

  return (
    <DashboardLayout title="Manajemen Travel" role="Provider">
      <div className="stat-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ borderTopColor: s.color }}>
            <div className="flex justify-between items-start mb-4">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 700 }}>{s.label}</span>
              <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card p-8">
          <div className="mb-6">
            <h3>Booking Masuk</h3>
            <p className="text-gray text-sm">Kelola pesanan dari para turis.</p>
          </div>
          {loading ? <p>Memuat...</p> : bookings.length === 0 ? <p className="text-center p-8 text-gray">Belum ada booking.</p> : (
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
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{booking.travel_date}</div>
                      </td>
                      <td><div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{booking.package_title}</div></td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.65rem', 
                          fontWeight: 800,
                          background: booking.status === 'pending' ? '#fffbeb' : booking.status === 'accepted' ? '#dcfce7' : '#fee2e2',
                          color: booking.status === 'pending' ? '#92400e' : booking.status === 'accepted' ? '#166534' : '#991b1b'
                        }}>
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {booking.status === 'pending' && (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleBookingStatus(booking.id, 'accepted')} className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', background: 'var(--success)' }}>✔</button>
                            <button onClick={() => handleBookingStatus(booking.id, 'rejected')} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>✖</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-8">
          <h3 className="mb-6">{editingId ? 'Edit Paket' : 'Tambah Paket Baru'}</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Judul Paket</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="input" placeholder="e.g. Ritual Kejawen Yogyakarta" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Lokasi</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} required className="input" placeholder="Kota/Daerah" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Durasi</label>
                <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} required className="input" placeholder="e.g. 3H 2M" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Harga (Rp)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="input" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Kuota</label>
                <input type="number" name="quota" value={formData.quota} onChange={handleInputChange} required className="input" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Gambar Paket</label>
              <input type="file" onChange={handleFileUpload} accept="image/*" style={{ fontSize: '0.8rem' }} />
              {uploading && <p style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>Mengunggah...</p>}
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.8rem' }}>
              {editingId ? 'Simpan Perubahan' : 'Publish Paket 🚀'}
            </button>
            {editingId && (
              <button type="button" onClick={() => setEditingId(null)} className="btn btn-outline w-full" style={{ padding: '0.8rem' }}>Batal</button>
            )}
          </form>
        </div>
      </div>

      <h3 className="mb-6">Katalog Paket Saya</h3>
      <div className="grid grid-cols-2 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className="card p-6 flex gap-6 items-center">
            <img src={pkg.image_url || 'https://via.placeholder.com/100'} alt={pkg.title} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px' }} />
            <div style={{ flex: 1 }}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{pkg.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>📍 {pkg.location} | 👥 {pkg.quota} PAX</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(pkg)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Edit</button>
                  <button onClick={() => handleDelete(pkg.id)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.7rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Hapus</button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>Rp {pkg.price.toLocaleString('id-ID')}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{pkg.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
