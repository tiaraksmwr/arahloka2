import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const ArahLokaLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke="#B8501C" strokeWidth="2.5"/>
      <path d="M20 6V12M20 28V34M6 20H12M28 20H34" stroke="#B8501C" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12L23 20L20 28L17 20L20 12Z" fill="#B8501C"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
    </svg>
    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#231308', letterSpacing: '-0.5px', fontFamily: 'var(--font-serif)' }}>ArahLoka</span>
  </div>
)

const PackageDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingData, setBookingData] = useState({ travel_date: '', participants: 1, notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/packages/${id}`)
        setPkg(response.data)
        setLoading(false)
        if (response.data.latitude && response.data.longitude) {
          fetchWeather(response.data.latitude, response.data.longitude)
        }
      } catch (err) {
        console.error('Error fetching package:', err)
        setLoading(false)
      }
    }
    fetchPackage()
  }, [id])

  const fetchWeather = async (lat, lon) => {
    setWeatherLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/weather?lat=${lat}&lon=${lon}`)
      setWeather(response.data)
    } catch (err) {
      console.error('Error fetching weather:', err)
    } finally {
      setWeatherLoading(false)
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    if (!user.id) {
      alert('Silakan login sebagai turis untuk melakukan booking')
      navigate('/login')
      return
    }

    if (bookingData.participants < 1) {
      alert('Jumlah peserta minimal adalah 1')
      return
    }

    if (pkg.quota > 0 && bookingData.participants > pkg.quota) {
      alert(`Jumlah peserta tidak boleh melebihi kuota (${pkg.quota})`)
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
      alert('Booking berhasil dikirim! Pantau statusnya di Dashboard.')
      navigate('/tourist')
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal melakukan booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ marginTop: '16px', color: 'var(--text-gray)', fontWeight: 600 }}>Memuat detail paket...</p>
    </div>
  )
  if (!pkg) return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <h3>Paket tidak ditemukan.</h3>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>Kembali ke Beranda</Link>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-subtle)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(253,250,245,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: '0 1px 0 var(--border-light)',
        height: '68px',
        display: 'flex', alignItems: 'center',
        padding: '0 32px',
        justifyContent: 'space-between'
      }}>
        <Link to="/"><ArahLokaLogo /></Link>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-gray)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Beranda</Link>
          <Link to="/tourist" style={{ color: 'var(--text-gray)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Dashboard</Link>
        </div>
        <div>
          {user.id
            ? <span style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{user.name}</span>
            : <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px' }}>Login</Link>
          }
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 32px 80px' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost"
          style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ← Kembali
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Left: Package Info */}
          <div className="animate-fade-in">
            {/* Hero Image */}
            <div style={{
              position: 'relative', height: '460px', borderRadius: '24px',
              overflow: 'hidden', boxShadow: 'var(--shadow-premium)', marginBottom: '28px'
            }}>
              <img
                src={pkg.image_url || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80'}
                alt={pkg.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80' }}
              />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 32px 32px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.82))',
                color: 'white'
              }}>
                <span style={{
                  background: 'var(--primary)', color: 'white',
                  padding: '4px 12px', borderRadius: '999px',
                  fontSize: '0.75rem', fontWeight: 800
                }}>📍 {pkg.location}</span>
                <h1 style={{ color: 'white', fontSize: '2.75rem', marginTop: '10px', lineHeight: 1.2, fontFamily: 'var(--font-serif)' }}>
                  {pkg.title}
                </h1>
              </div>
            </div>

            {/* Meta Row */}
            <div style={{
              display: 'flex', gap: '0', marginBottom: '24px',
              background: 'white', borderRadius: '16px',
              border: '1px solid var(--border-light)', overflow: 'hidden',
              boxShadow: 'var(--shadow-card)'
            }}>
              {[
                { label: 'Disediakan Oleh', value: pkg.provider_name || 'Penyedia Lokal' },
                { label: 'Durasi Trip', value: pkg.duration },
                { label: 'Kuota Tersisa', value: `${pkg.quota} Peserta` }
              ].map((item, i, arr) => (
                <div key={i} style={{
                  flex: 1, padding: '18px 20px',
                  borderRight: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none'
                }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-light)', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-dark)' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Weather */}
            <div style={{
              background: 'white', borderRadius: '16px', padding: '20px 24px',
              border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)',
              borderLeft: '4px solid var(--secondary)', marginBottom: '24px'
            }}>
              <h3 style={{ marginBottom: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🌤️ Kondisi Cuaca Destinasi
              </h3>
              {weatherLoading ? (
                <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Memantau cuaca...</p>
              ) : weather ? (
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)' }}>Suhu</p>
                    <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{weather.temperature}{weather.unit}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)' }}>Kondisi</p>
                    <p style={{ fontWeight: 800, fontSize: '1.15rem' }}>{weather.condition}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)' }}>Angin</p>
                    <p style={{ fontWeight: 800, fontSize: '1.15rem' }}>{weather.windspeed} km/h</p>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Data cuaca tidak tersedia.</p>
              )}
            </div>

            {/* Description */}
            <div style={{
              background: 'white', borderRadius: '16px', padding: '24px',
              border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)'
            }}>
              <h3 style={{ marginBottom: '14px', fontSize: '1.1rem' }}>Tentang Perjalanan Ini</h3>
              <p style={{ lineHeight: '1.85', color: 'var(--text-dark)', fontSize: '1rem', whiteSpace: 'pre-line' }}>
                {pkg.description}
              </p>
            </div>
          </div>

          {/* Right: Booking Form */}
          <aside style={{ position: 'sticky', top: '88px' }}>
            <div className="animate-fade-in" style={{
              background: 'white', borderRadius: '24px', padding: '28px',
              border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-premium)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-light)', marginBottom: '6px' }}>
                  Harga Per Orang
                </p>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--secondary)', fontFamily: 'var(--font-serif)' }}>
                  Rp {pkg.price.toLocaleString('id-ID')}
                </div>
              </div>

              {user.role === 'tourist' ? (
                <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Pilih Tanggal</label>
                    <input
                      type="date"
                      required
                      className="input"
                      value={bookingData.travel_date}
                      onChange={(e) => setBookingData({ ...bookingData, travel_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Jumlah Peserta</label>
                    <input
                      type="number"
                      min="1"
                      max={pkg.quota > 0 ? pkg.quota : undefined}
                      required
                      className="input"
                      value={bookingData.participants}
                      onChange={(e) => setBookingData({ ...bookingData, participants: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Catatan (Opsional)</label>
                    <textarea
                      rows="3"
                      placeholder="Permintaan khusus..."
                      className="input"
                      style={{ resize: 'none' }}
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    />
                  </div>

                  <div style={{
                    borderTop: '2px dashed var(--border-light)',
                    paddingTop: '16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Total Estimasi</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>
                      Rp {(pkg.price * bookingData.participants).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '4px' }}
                  >
                    {submitting ? 'Mengirim...' : 'Pesan Sekarang'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-surface)', borderRadius: '14px', border: '2px dashed var(--border-light)' }}>
                  <p style={{ color: 'var(--text-gray)', marginBottom: '16px', fontSize: '0.9rem' }}>
                    Masuk sebagai Turis untuk memesan paket ini.
                  </p>
                  <Link to="/login" className="btn btn-primary" style={{ display: 'block', width: '100%' }}>Login</Link>
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>
                Butuh bantuan?{' '}
                <a href="#" style={{ color: 'var(--primary)', fontWeight: 700 }}>Hubungi CS ArahLoka</a>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default PackageDetail
