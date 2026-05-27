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
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  useEffect(() => {
    if (user.role !== 'tourist') navigate('/login')
  }, [user, navigate])

  return (
    <DashboardLayout title="Dashboard Tourist">
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <p>Selamat datang di ArahLoka! Temukan keindahan budaya Indonesia di sini.</p>
      </div>
    </DashboardLayout>
  )
}

export const ProviderDashboard = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    duration: '',
    price: '',
    quota: '',
    image_url: ''
  })
  const [uploading, setUploading] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  useEffect(() => {
    if (user.role !== 'travel_provider') {
      navigate('/login')
    } else {
      fetchPackages()
    }
  }, [user, navigate])

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/provider/packages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPackages(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching packages:', err)
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
        image_url: ''
      })
      fetchPackages()
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
      image_url: pkg.image_url
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
      fetchPackages()
    } catch (err) {
      alert('Gagal menghapus paket')
    }
  }

  const stats = {
    total: packages.length,
    quota: packages.reduce((acc, p) => acc + (p.quota || 0), 0),
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
          <h4 style={{ color: '#666', fontSize: '0.9rem' }}>Total Kuota</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--deep-green)' }}>{stats.quota}</p>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
          <h4 style={{ color: '#666', fontSize: '0.9rem' }}>Harga Rata-rata</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Rp {stats.avgPrice.toLocaleString('id-ID')}</p>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
          <h4 style={{ color: '#666', fontSize: '0.9rem' }}>Status Akun</h4>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>{user.status?.toUpperCase()}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
        <div className="form-container" style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow)', position: 'sticky', top: '100px' }}>
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

        <div className="packages-list">
          <h3 style={{ marginBottom: '1.5rem' }}>Paket Saya</h3>
          {loading ? <p>Memuat paket...</p> : packages.length === 0 ? <p>Belum ada paket yang ditambahkan.</p> : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
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
      </div>
    </DashboardLayout>
  )
}
