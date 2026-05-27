import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke="#CC5500" strokeWidth="2.5"/>
      <path d="M20 6V12M20 28V34M6 20H12M28 20H34" stroke="#CC5500" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12L23 20L20 28L17 20L20 12Z" fill="#CC5500"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
    </svg>
    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3D2B1F', letterSpacing: '-0.5px', fontFamily: "var(--font-serif)" }}>ArahLoka</span>
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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password
      })
      
      const { token, user } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      if (user.role === 'superadmin') {
        navigate('/admin')
      } else if (user.role === 'tourist') {
        navigate('/tourist')
      } else if (user.role === 'travel_provider') {
        navigate('/provider')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split-layout">
      <div className="auth-visual-side" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1596402184320-417d717867cd?auto=format&fit=crop&q=80&w=1200)' }}>
        <div className="auth-visual-content">
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 800 }}>Kembali ke Akar Budaya</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Masuk untuk melanjutkan penjelajahan Anda di nusantara yang penuh makna.</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-card animate-fade-in">
          <div className="flex justify-center mb-8">
            <Link to="/"><Logo /></Link>
          </div>
          
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-dark)', fontSize: '1.75rem' }}>Selamat Datang</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Silakan masuk ke akun ArahLoka Anda</p>
          
          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="input"
                placeholder="nama@email.com"
              />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <div className="flex justify-between items-center mb-2">
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Password</label>
                <a href="#" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Lupa Password?</a>
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
            <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ padding: '1rem' }}>
              {loading ? 'Masuk...' : 'Masuk Sekarang'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-gray)' }}>
            Belum punya akun? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Daftar Gratis</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
