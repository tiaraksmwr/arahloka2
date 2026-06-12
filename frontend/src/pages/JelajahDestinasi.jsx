import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { DashboardLayout } from './RoleDashboards'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=70'

const JelajahDestinasi = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  useEffect(() => {
    if (user.role !== 'tourist') {
      navigate('/login')
    } else {
      fetchData()
    }
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/packages`)
      setPackages(res.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching packages:', err)
      setLoading(false)
    }
  }

  const filtered = packages
    .filter(pkg =>
      pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      return 0
    })

  return (
    <DashboardLayout
      title="Jelajah Destinasi"
      subtitle="Telusuri seluruh paket wisata budaya nusantara dan temukan yang paling cocok untukmu."
      role="tourist"
    >
      <div className="db-section" style={{ marginBottom: '24px', padding: '18px 22px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Cari destinasi atau lokasi..."
          className="input"
          style={{ flex: 1, minWidth: '200px', margin: 0 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="input"
          style={{ width: 'auto', margin: 0, flexShrink: 0 }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="default">Urutkan</option>
          <option value="price-asc">Harga terendah</option>
          <option value="price-desc">Harga tertinggi</option>
        </select>
      </div>

      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px 12px' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700 }}>Semua Paket</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{filtered.length} paket ditemukan</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-gray)' }}>Memuat paket...</div>
      ) : filtered.length === 0 ? (
        <div className="db-section" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-gray)' }}>Tidak ada paket yang cocok.</div>
      ) : (
        <div className="pkg-grid">
          {filtered.map(pkg => (
            <div key={pkg.id} className="pkg-card">
              <div className="pkg-img-wrap">
                <img
                  src={pkg.image_url || FALLBACK_IMG}
                  alt={pkg.title}
                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG }}
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
    </DashboardLayout>
  )
}

export default JelajahDestinasi
