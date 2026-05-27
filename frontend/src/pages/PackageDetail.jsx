import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const PackageDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingData, setBookingData] = useState({
    travel_date: '',
    participants: 1,
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/packages/${id}`)
        setPkg(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching package:', err)
        setLoading(false)
      }
    }
    fetchPackage()
  }, [id])

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    if (!user.id) {
      alert('Silakan login sebagai turis untuk melakukan booking')
      navigate('/login')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${import.meta.env.VITE_API_URL}/bookings`, {
        package_id: id,
        ...bookingData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Booking berhasil dikirim! Menunggu persetujuan penyedia jasa.')
      navigate('/tourist')
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal melakukan booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="app" style={{ padding: '2rem' }}>Memuat...</div>
  if (!pkg) return <div className="app" style={{ padding: '2rem' }}>Paket tidak ditemukan. <Link to="/">Kembali</Link></div>

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">ArahLoka</Link>
        <div className="nav-links">
          {user.id ? (
            <Link to={user.role === 'tourist' ? '/tourist' : user.role === 'travel_provider' ? '/provider' : '/admin'} className="btn-login">Dashboard</Link>
          ) : (
            <Link to="/login" className="btn-login">Login</Link>
          )}
        </div>
      </nav>

      <div className="section" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--burnt-orange)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ← Kembali
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          <div className="package-info">
            <img 
              src={pkg.image_url || 'https://via.placeholder.com/800x400'} 
              alt={pkg.title} 
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ color: 'var(--burnt-orange)', fontWeight: 'bold', fontSize: '1.1rem' }}>{pkg.location}</span>
                <h1 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>{pkg.title}</h1>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Mulai dari</p>
                <h2 style={{ color: 'var(--deep-green)', fontSize: '1.8rem' }}>Rp {pkg.price.toLocaleString('id-ID')}</h2>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', margin: '2rem 0', padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.2rem' }}>DURASI</p>
                <p style={{ fontWeight: 'bold' }}>{pkg.duration}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.2rem' }}>KUOTA</p>
                <p style={{ fontWeight: 'bold' }}>{pkg.quota} Peserta</p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.2rem' }}>PRAKIRAAN CUACA</p>
                <p style={{ fontWeight: 'bold' }}>☀️ Cerah, 28°C (Placeholder)</p>
              </div>
            </div>

            <div style={{ lineHeight: '1.8', color: '#444' }}>
              <h3 style={{ marginBottom: '1rem' }}>Tentang Paket Ini</h3>
              <p>{pkg.description}</p>
            </div>
          </div>

          <div className="booking-form-container">
            {user.role === 'tourist' ? (
              <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)', position: 'sticky', top: '100px' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Booking Paket</h3>
                <form onSubmit={handleBookingSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Tanggal Perjalanan</label>
                    <input 
                      type="date" 
                      required 
                      value={bookingData.travel_date}
                      onChange={(e) => setBookingData({ ...bookingData, travel_date: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Jumlah Peserta</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={pkg.quota}
                      required 
                      value={bookingData.participants}
                      onChange={(e) => setBookingData({ ...bookingData, participants: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Catatan Tambahan</label>
                    <textarea 
                      rows="3"
                      placeholder="e.g. Alergi makanan, permintaan khusus..."
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'none' }}
                    ></textarea>
                  </div>
                  
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Total Biaya</span>
                      <span style={{ fontWeight: 'bold' }}>Rp {(pkg.price * bookingData.participants).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn-register" 
                    style={{ width: '100%', border: 'none', cursor: 'pointer' }}
                  >
                    {submitting ? 'Mengirim...' : 'Kirim Booking'}
                  </button>
                </form>
              </div>
            ) : user.role === 'travel_provider' || user.role === 'superadmin' ? (
              <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
                <p>Anda masuk sebagai <strong>{user.role}</strong>.</p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Hanya turis yang dapat melakukan booking.</p>
              </div>
            ) : (
              <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1rem' }}>Ingin Ikut Perjalanan Ini?</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>Silakan login sebagai turis untuk mulai memesan paket budaya kami.</p>
                <Link to="/login" className="btn-register" style={{ display: 'block', textDecoration: 'none' }}>Login Sekarang</Link>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Belum punya akun? <Link to="/register" style={{ color: 'var(--burnt-orange)' }}>Daftar</Link></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PackageDetail
