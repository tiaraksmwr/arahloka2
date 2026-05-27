import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const DashboardLayout = ({ title, children }) => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">ArahLoka</Link>
        <div className="nav-links">
          <span>Halo, {user.name}</span>
          <button onClick={handleLogout} className="btn-login" style={{ border: 'none', cursor: 'pointer', background: 'none' }}>Logout</button>
        </div>
      </nav>
      <section className="section" style={{ padding: '2rem' }}>
        <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>{title}</h2>
        {children}
      </section>
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
      pending: { bg: '#fef3c7', color: '#92400e', label: 'Menunggu Konfirmasi' },
      accepted: { bg: '#d1fae5', color: '#065f46', label: 'Diterima' },
      rejected: { bg: '#fee2e2', color: '#991b1b', label: 'Ditolak' }
    }
    const style = styles[status] || styles.pending
    return (
      <span style={{ 
        padding: '0.25rem 0.75rem', 
        borderRadius: '9999px', 
        fontSize: '0.75rem', 
        fontWeight: 'bold',
        backgroundColor: style.bg,
        color: style.color,
        textTransform: 'capitalize'
      }}>
        {style.label}
      </span>
    )
  }

  return (
    <DashboardLayout title="Dashboard Turis">
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="main-content">
          <div style={{ marginBottom: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Cari Paket Wisata</h3>
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama atau lokasi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          <h3 style={{ marginBottom: '1.5rem' }}>Eksplorasi Budaya</h3>
          {loading ? <p>Memuat paket...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filteredPackages.map(pkg => (
                <div key={pkg.id} className="package-card" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                  <img src={pkg.image_url || 'https://via.placeholder.com/400x200'} alt={pkg.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ padding: '1.25rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--burnt-orange)', fontWeight: 'bold' }}>{pkg.location}</span>
                    <h4 style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}>{pkg.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.5rem 0', height: '3rem', overflow: 'hidden' }}>{pkg.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--deep-green)' }}>Rp {pkg.price.toLocaleString('id-ID')}</span>
                      <button 
                        onClick={() => navigate(`/packages/${pkg.id}`)}
                        className="btn-login" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar">
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Setelah Perjalanan</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>Abadikan perjalanan Anda. Buat Memory Lane Card atau bagikan cerita budaya Anda.</p>
            <button 
              onClick={() => navigate('/journey-studio')}
              className="btn-register" 
              style={{ width: '100%', border: 'none', cursor: 'pointer', textAlign: 'center' }}
            >
              Buka Journey Studio
            </button>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow)', position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Booking Saya</h3>
            {loading ? <p>Memuat booking...</p> : bookings.length === 0 ? <p style={{ fontSize: '0.9rem', color: '#666' }}>Belum ada booking.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map(booking => (
                  <div key={booking.id} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', background: booking.status === 'pending' ? '#fffbeb' : 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                      <h5 style={{ margin: 0 }}>{booking.title}</h5>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.2rem 0' }}>📅 {booking.travel_date}</p>
                    <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.2rem 0' }}>👥 {booking.participants} Peserta</p>
                    <p style={{ fontWeight: 'bold', fontSize: '0.85rem', marginTop: '0.5rem' }}>Rp {(booking.price * booking.participants).toLocaleString('id-ID')}</p>
                    
                    {booking.status === 'pending' && (
                      <p style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        Booking sedang menunggu konfirmasi penyedia. Silakan cek kembali secara berkala.
                      </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                      <button 
                        onClick={() => navigate(`/trip-planner/${booking.id}`)}
                        disabled={booking.status === 'rejected'}
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          borderRadius: '6px', 
                          border: '1px solid var(--burnt-orange)', 
                          background: 'transparent', 
                          color: 'var(--burnt-orange)', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold',
                          cursor: booking.status === 'rejected' ? 'not-allowed' : 'pointer',
                          opacity: booking.status === 'rejected' ? 0.5 : 1
                        }}
                        title={booking.status === 'rejected' ? 'Persiapan trip tidak tersedia untuk booking yang ditolak.' : ''}
                      >
                        {booking.status === 'rejected' ? 'Persiapan Tidak Tersedia' : 'Persiapan Trip'}
                      </button>

                      {booking.status === 'accepted' && (
                        <button 
                          onClick={() => navigate('/journey-studio')}
                          style={{ 
                            width: '100%', 
                            padding: '0.5rem', 
                            borderRadius: '6px', 
                            background: 'var(--deep-green)', 
                            color: 'white', 
                            border: 'none',
                            fontSize: '0.8rem', 
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          📸 Buat Memory Card
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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

  const stats = {
    total: packages.length,
    bookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    avgPrice: packages.length > 0 ? packages.reduce((acc, p) => acc + p.price, 0) / packages.length : 0
  }

  return (
    <DashboardLayout title="Dashboard Penyedia Jasa Travel">
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
          <h4 style={{ color: '#666', fontSize: '0.9rem' }}>Paket Saya</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--burnt-orange)' }}>{stats.total}</p>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
          <h4 style={{ color: '#666', fontSize: '0.9rem' }}>Booking Masuk</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--deep-green)' }}>{stats.bookings}</p>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
          <h4 style={{ color: '#666', fontSize: '0.9rem' }}>Booking Pending</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pendingBookings}</p>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
          <h4 style={{ color: '#666', fontSize: '0.9rem' }}>Status Akun</h4>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>{user.status?.toUpperCase()}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <div className="booking-section" style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Booking Masuk</h3>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>* Booking akan muncul di sini jika turis memesan paket yang Anda buat.</p>
          </div>
          {loading ? <p>Memuat booking...</p> : bookings.length === 0 ? <p style={{ color: '#888', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', textAlign: 'center' }}>Belum ada booking masuk untuk paket Anda.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '1rem 0.5rem' }}>Turis</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Paket</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Tanggal</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Peserta</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{booking.tourist_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{booking.tourist_email}</div>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>{booking.package_title}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{booking.travel_date}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{booking.participants}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          background: booking.status === 'pending' ? '#fef3c7' : booking.status === 'accepted' ? '#d1fae5' : '#fee2e2',
                          color: booking.status === 'pending' ? '#92400e' : booking.status === 'accepted' ? '#065f46' : '#991b1b'
                        }}>
                          {booking.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        {booking.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleBookingStatus(booking.id, 'accepted')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Terima</button>
                            <button onClick={() => handleBookingStatus(booking.id, 'rejected')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Tolak</button>
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

        <div className="form-container" style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Paket' : 'Tambah Paket Baru'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nama Paket</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Lokasi</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Durasi</label>
                <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} placeholder="e.g. 3 Hari 2 Malam" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Harga (Rp)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Kuota</label>
                <input type="number" name="quota" value={formData.quota} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Deskripsi</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'none' }}></textarea>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Latitude</label>
                <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleInputChange} placeholder="e.g. -7.7956" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Longitude</label>
                <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleInputChange} placeholder="e.g. 110.3695" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>* Opsional, digunakan untuk menampilkan cuaca destinasi.</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Gambar Paket</label>
              <input type="file" onChange={handleFileUpload} accept="image/*" style={{ marginBottom: '0.5rem' }} />
              {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--burnt-orange)' }}>Mengunggah...</p>}
              {formData.image_url && <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginTop: '0.5rem' }} />}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-register" style={{ flex: 2, border: 'none', cursor: 'pointer' }}>
                {editingId ? 'Simpan Perubahan' : 'Tambah Paket'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({ title: '', location: '', description: '', duration: '', price: '', quota: '', image_url: '' }) }} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="packages-list">
        <h3 style={{ marginBottom: '1.5rem' }}>Paket Saya</h3>
        {loading ? <p>Memuat paket...</p> : packages.length === 0 ? <p>Belum ada paket yang ditambahkan.</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {packages.map(pkg => (
              <div key={pkg.id} className="package-card" style={{ display: 'flex', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                <img src={pkg.image_url || 'https://via.placeholder.com/150'} alt={pkg.title} style={{ width: '150px', height: '100%', objectFit: 'cover' }} />
                <div style={{ padding: '1rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--burnt-orange)', fontWeight: 'bold' }}>{pkg.location}</span>
                      <h4 style={{ margin: '0.2rem 0' }}>{pkg.title}</h4>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(pkg)} style={{ background: '#f3f4f6', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                      <button onClick={() => handleDelete(pkg.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Hapus</button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.5rem 0' }}>{pkg.description?.substring(0, 80)}...</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{pkg.duration} | Kuota: {pkg.quota}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>Rp {pkg.price.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
