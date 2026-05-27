import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
      alert(`Booking berhasil dikirim! Pantau statusnya di Dashboard.`)
      navigate('/tourist')
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal melakukan booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen"><p>Memuat detail paket...</p></div>
  if (!pkg) return <div className="container p-12 text-center"><h3>Paket tidak ditemukan.</h3><Link to="/" className="text-primary">Kembali ke Beranda</Link></div>

  return (
    <div className="app">
      <nav className="navbar-wrapper glass scrolled">
        <div className="navbar-container">
          <Link to="/" className="nav-logo"><Logo /></Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/tourist">Dashboard</Link>
          </div>
          <div className="nav-actions">
            {user.id ? <span className="font-bold">{user.name}</span> : <Link to="/login" className="btn btn-primary">Login</Link>}
          </div>
        </div>
      </nav>

      <div className="container section-padding" style={{ padding: '40px 0 100px 0' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline mb-8" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          ← Kembali
        </button>

        <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '3rem' }}>
          <div className="animate-fade-in">
            <div style={{ position: 'relative', height: '500px', borderRadius: '32px', overflow: 'hidden', boxShadow: 'var(--shadow-premium)', marginBottom: '3rem' }}>
              <img 
                src={pkg.image_url || 'https://via.placeholder.com/800x400'} 
                alt={pkg.title} 
                className="w-full h-full"
                style={{ objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white' }}>
                <span style={{ background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800 }}>📍 {pkg.location}</span>
                <h1 style={{ color: 'white', fontSize: '3.5rem', marginTop: '1rem' }}>{pkg.title}</h1>
              </div>
            </div>
            
            <div className="flex gap-12 mb-12">
              <div className="flex flex-col gap-1">
                <span className="text-gray" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Disediakan Oleh</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{pkg.provider_name || 'Penyedia Lokal'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Durasi Trip</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{pkg.duration}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Kuota Tersisa</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{pkg.quota} Peserta</span>
              </div>
            </div>

            <div className="card p-8 mb-12" style={{ borderLeft: '6px solid var(--secondary)' }}>
              <h3 className="mb-6 flex items-center gap-2">🌤️ Kondisi Cuaca Destinasi</h3>
              {weatherLoading ? (
                <p>Memantau cuaca...</p>
              ) : weather ? (
                <div className="flex gap-12 items-center">
                  <div>
                    <p className="text-gray" style={{ fontSize: '0.7rem', fontWeight: 700 }}>SUHU</p>
                    <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{weather.temperature}{weather.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray" style={{ fontSize: '0.7rem', fontWeight: 700 }}>KONDISI</p>
                    <p style={{ fontWeight: 800, fontSize: '1.25rem' }}>{weather.condition}</p>
                  </div>
                  <div>
                    <p className="text-gray" style={{ fontSize: '0.7rem', fontWeight: 700 }}>ANGIN</p>
                    <p style={{ fontWeight: 800, fontSize: '1.25rem' }}>{weather.windspeed} km/h</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray">Data cuaca tidak tersedia.</p>
              )}
            </div>

            <div className="card p-8">
              <h3 className="mb-4">Tentang Perjalanan Ini</h3>
              <p style={{ lineHeight: '1.8', color: 'var(--text-dark)', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>{pkg.description}</p>
            </div>
          </div>

          <aside style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div className="card p-8 animate-fade-in">
              <div className="text-center mb-8">
                <p className="text-gray" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Harga Per Orang</p>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--secondary)' }}>Rp {pkg.price.toLocaleString('id-ID')}</h2>
              </div>

              {user.role === 'tourist' ? (
                <form onSubmit={handleBookingSubmit} className="grid gap-6">
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Pilih Tanggal</label>
                    <input 
                      type="date" 
                      required 
                      className="input"
                      value={bookingData.travel_date}
                      onChange={(e) => setBookingData({ ...bookingData, travel_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Jumlah Peserta</label>
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
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Catatan</label>
                    <textarea 
                      rows="3"
                      placeholder="Permintaan khusus..."
                      className="input"
                      style={{ resize: 'none' }}
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    ></textarea>
                  </div>
                  
                  <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '1.5rem', marginBottom: '0.5rem' }}>
                    <div className="flex justify-between items-center">
                      <span style={{ fontWeight: 700 }}>Total Estimasi</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>Rp {(pkg.price * bookingData.participants).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn btn-primary w-full"
                    style={{ padding: '1.25rem' }}
                  >
                    {submitting ? 'Mengirim...' : 'Pesan Sekarang 🚀'}
                  </button>
                </form>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-2xl border-2 border-dashed">
                  <p className="mb-4">Masuk sebagai Turis untuk memesan paket ini.</p>
                  <Link to="/login" className="btn btn-primary w-full">Login</Link>
                </div>
              )}
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray" style={{ fontSize: '0.85rem' }}>Butuh bantuan? <a href="#" style={{ color: 'var(--primary)', fontWeight: 700 }}>Hubungi CS ArahLoka</a></p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default PackageDetail
