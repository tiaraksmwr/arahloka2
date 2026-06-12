import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const ArahLokaLogo = ({ light = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke={light ? "white" : "#B8501C"} strokeWidth="2.5"/>
      <path d="M20 6V12M20 28V34M6 20H12M28 20H34" stroke={light ? "white" : "#B8501C"} strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12L23 20L20 28L17 20L20 12Z" fill={light ? "white" : "#B8501C"}/>
      <circle cx="20" cy="20" r="3" fill={light ? "rgba(196,144,48,0.9)" : "white"}/>
    </svg>
    <span style={{
      fontSize: '1.5rem', fontWeight: '900',
      color: light ? 'white' : '#231308',
      letterSpacing: '-0.5px', fontFamily: "var(--font-serif)"
    }}>ArahLoka</span>
  </div>
)

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'tourist' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData)
      if (response.data.status === 'approved') {
        alert('Registrasi berhasil! Silakan login.')
        navigate('/login')
      } else {
        navigate('/pending-approval')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Left — Visual */}
      <div className="auth-visual">
        <div
          className="auth-visual-bg"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1200)' }}
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-body">
          <div className="auth-visual-logo">
            <ArahLokaLogo light />
          </div>
          <div className="auth-visual-bottom">
            <p className="auth-visual-quote">
              Mulai Jejak<br />Budaya Anda
            </p>
            <p className="auth-visual-sub">
              Daftar sekarang dan jadilah bagian dari komunitas pelestari budaya Indonesia yang terus berkembang.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '28px', flexWrap: 'wrap' }}>
              {['500+ Destinasi', '50+ Festival', '10rb+ Penjelajah'].map((s, i) => (
                <span key={i} style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.85)',
                  padding: '5px 12px', borderRadius: '999px',
                  backdropFilter: 'blur(8px)'
                }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="auth-form-wrapper">
        <div className="auth-form-box animate-fade-in">
          <Link to="/" className="auth-back-link">← Kembali ke Beranda</Link>
          <div className="auth-logo-wrap">
            <Link to="/"><ArahLokaLogo /></Link>
          </div>

          <h2 className="auth-heading">Buat Akun Baru</h2>
          <p className="auth-subtext">Bergabung dengan ribuan penjelajah budaya Indonesia</p>

          {error && (
            <div className="alert alert-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Nama lengkap Anda"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input"
                placeholder="nama@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input"
                placeholder="Min. 8 karakter"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Daftar Sebagai</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input"
              >
                <option value="tourist">🏕️ Tourist (Wisatawan)</option>
                <option value="travel_provider">🏢 Travel Provider (Penyedia Jasa)</option>
              </select>

              {formData.role === 'travel_provider' && (
                <p style={{
                  marginTop: '8px', fontSize: '0.78rem',
                  color: 'var(--warning)', fontWeight: 600,
                  background: 'var(--warning-light)', padding: '8px 12px',
                  borderRadius: '8px'
                }}>
                  ⏳ Akun provider membutuhkan verifikasi admin sebelum bisa digunakan.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg"
              style={{ fontSize: '0.95rem', marginBottom: '8px' }}
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="auth-footer-text">
            Sudah punya akun?{' '}
            <Link to="/login">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
