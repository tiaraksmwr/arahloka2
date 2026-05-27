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

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      if (user.role === 'superadmin') navigate('/admin')
      else if (user.role === 'tourist') navigate('/tourist')
      else if (user.role === 'travel_provider') navigate('/provider')
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah.')
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
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1596402184320-417d717867cd?auto=format&fit=crop&q=80&w=1200)' }}
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-body">
          <div className="auth-visual-logo">
            <ArahLokaLogo light />
          </div>
          <div className="auth-visual-bottom">
            <p className="auth-visual-quote">
              Kembali ke Akar<br />Budaya Nusantara
            </p>
            <p className="auth-visual-sub">
              Masuk dan lanjutkan perjalanan budaya Anda di ribuan destinasi autentik Indonesia.
            </p>
            <div className="auth-visual-dots" style={{ marginTop: '28px' }}>
              <div className="auth-visual-dot active"></div>
              <div className="auth-visual-dot"></div>
              <div className="auth-visual-dot"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="auth-form-wrapper">
        <div className="auth-form-box animate-fade-in">
          <div className="auth-logo-wrap">
            <Link to="/"><ArahLokaLogo /></Link>
          </div>

          <h2 className="auth-heading">Selamat Datang</h2>
          <p className="auth-subtext">Silakan masuk ke akun ArahLoka Anda</p>

          {error && (
            <div className="alert alert-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="nama@email.com"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div className="form-label-group">
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <a href="#" className="form-hint">Lupa Password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg"
              style={{ fontSize: '0.95rem', marginBottom: '8px' }}
            >
              {loading ? 'Masuk...' : 'Masuk Sekarang'}
            </button>
          </form>

          <p className="auth-footer-text">
            Belum punya akun?{' '}
            <Link to="/register">Daftar Gratis</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
