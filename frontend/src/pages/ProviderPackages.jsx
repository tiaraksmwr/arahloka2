import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { DashboardLayout } from './RoleDashboards'

const emptyForm = {
  title: '',
  location: '',
  description: '',
  duration: '',
  price: '',
  quota: '',
  image_url: '',
  latitude: '',
  longitude: ''
}

const ProviderPackages = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  useEffect(() => {
    if (user.role !== 'travel_provider') {
      navigate('/login')
    } else {
      fetchPackages()
    }
  }, [])

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/provider/packages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPackages(res.data)
    } catch (err) {
      console.error('Error fetching packages:', err)
    } finally {
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
      setFormData(prev => ({ ...prev, image_url: response.data.image_url }))
    } catch (err) {
      alert('Upload gambar gagal')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData(emptyForm)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
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
      resetForm()
      fetchPackages()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan paket')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (pkg) => {
    setEditingId(pkg.id)
    setFormData({
      title: pkg.title || '',
      location: pkg.location || '',
      description: pkg.description || '',
      duration: pkg.duration || '',
      price: pkg.price || '',
      quota: pkg.quota || '',
      image_url: pkg.image_url || '',
      latitude: pkg.latitude || '',
      longitude: pkg.longitude || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus paket ini? Booking yang sudah ada tidak akan ikut terhapus.')) return
    const token = localStorage.getItem('token')
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPackages()
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus paket')
    }
  }

  const filtered = packages.filter(p =>
    !search ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout
      title="Kelola Paket"
      subtitle="Tambah, edit, dan kelola katalog paket wisata budaya Anda di satu tempat."
      role="provider"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        {/* Left: Catalog */}
        <div>
          <div className="db-section" style={{ marginBottom: '20px', padding: '14px 18px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Cari paket berdasarkan judul atau lokasi..."
              className="input"
              style={{ flex: 1, margin: 0 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={{ flexShrink: 0, fontSize: '0.78rem', color: 'var(--text-gray)', fontWeight: 700 }}>
              {filtered.length} / {packages.length} paket
            </div>
          </div>

          <div className="db-section">
            <div className="db-section-head">
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem' }}>Katalog Paket Saya</div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-gray)' }}>Klik Edit untuk mengubah, Hapus untuk menghapus.</span>
            </div>
            <div style={{ padding: '18px' }}>
              {loading ? (
                <p style={{ padding: '32px', textAlign: 'center', color: 'var(--text-gray)' }}>Memuat...</p>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.4rem', marginBottom: '10px' }}>🗺️</div>
                  <p style={{ color: 'var(--text-gray)' }}>
                    {packages.length === 0
                      ? 'Belum ada paket. Tambahkan paket pertama Anda di kanan.'
                      : 'Tidak ada paket yang cocok dengan pencarian.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {filtered.map(pkg => (
                    <div key={pkg.id} style={{
                      background: 'var(--bg-surface)',
                      borderRadius: '14px',
                      border: editingId === pkg.id ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <div style={{ position: 'relative', height: '140px', background: '#eee' }}>
                        <img
                          src={pkg.image_url || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=70'}
                          alt={pkg.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=70' }}
                        />
                        {(!pkg.latitude || !pkg.longitude) && (
                          <span style={{
                            position: 'absolute', top: '8px', right: '8px',
                            background: 'rgba(0,0,0,0.6)', color: 'white',
                            fontSize: '0.65rem', fontWeight: 700,
                            padding: '3px 8px', borderRadius: '999px'
                          }}>
                            🛰️ koordinat otomatis
                          </span>
                        )}
                      </div>
                      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>{pkg.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: '8px' }}>
                          📍 {pkg.location} · ⏱ {pkg.duration} · 👥 {pkg.quota} pax
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '0.92rem', marginBottom: '12px' }}>
                          Rp {Number(pkg.price || 0).toLocaleString('id-ID')}
                        </div>
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleEdit(pkg)} className="btn btn-outline" style={{ flex: 1, padding: '6px', fontSize: '0.76rem' }}>Edit</button>
                          <button onClick={() => handleDelete(pkg.id)} className="btn btn-danger" style={{ flex: 1, padding: '6px', fontSize: '0.76rem' }}>Hapus</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="db-section" style={{ position: 'sticky', top: '20px' }}>
          <div className="db-section-head">
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem' }}>
                {editingId ? `Edit Paket #${editingId}` : 'Tambah Paket Baru'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-gray)', marginTop: '2px' }}>
                {editingId ? 'Perubahan akan langsung tampil di katalog.' : 'Lengkapi data, koordinat opsional.'}
              </div>
            </div>
          </div>
          <div style={{ padding: '18px 20px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Judul Paket</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="input" placeholder="e.g. Ritual Kejawen Yogyakarta" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Lokasi</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} required className="input" placeholder="Kota/Daerah - mis. Ubud, Bali" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Durasi</label>
                  <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} required className="input" placeholder="3 Hari 2 Malam" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Kuota (pax)</label>
                  <input type="number" min="0" name="quota" value={formData.quota} onChange={handleInputChange} required className="input" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Harga / orang (Rp)</label>
                <input type="number" min="0" name="price" value={formData.price} onChange={handleInputChange} required className="input" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Deskripsi</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required className="input" rows="3" style={{ resize: 'vertical' }} placeholder="Deskripsi singkat paket..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Latitude</label>
                  <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleInputChange} className="input" placeholder="(opsional)" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Longitude</label>
                  <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleInputChange} className="input" placeholder="(opsional)" />
                </div>
              </div>
              <small style={{ color: 'var(--text-light)', fontSize: '0.72rem', marginTop: '-6px' }}>
                Kosongkan koordinat → sistem akan menebak dari nama lokasi untuk widget cuaca.
              </small>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gambar Paket</label>
                <input type="file" onChange={handleFileUpload} accept="image/*" style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }} />
                {uploading && <p style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: '4px' }}>Mengunggah...</p>}
                {formData.image_url && !uploading && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '4px' }}>✓ Gambar siap.</p>
                )}
              </div>
              <button type="submit" disabled={saving || uploading} className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '4px' }}>
                {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Publish Paket'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn btn-ghost" style={{ width: '100%' }}>
                  Batal Edit
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ProviderPackages
