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

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tourist'
  })
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
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split-layout">
      <div className="auth-visual-side" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1200)' }}>
        <div className="auth-visual-content">
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 800 }}>Mulai Jejak Budaya Anda</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Daftar sekarang dan jadilah bagian dari komunitas pelestari budaya Indonesia.</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-card animate-fade-in" style={{ padding: '40px 56px' }}>
          <div className="flex justify-center mb-6">
            <Link to="/"><Logo /></Link>
          </div>
          
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-dark)', fontSize: '1.75rem' }}>Buat Akun Baru</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '2rem', fontSize: '0.9rem' }}>Bergabung dengan ribuan penjelajah lainnya</p>
          
          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Nama Lengkap</label>
              <input 
                type="text" 
                name="name"
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="input"
                placeholder="John Doe"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Email</label>
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
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password} 
                onChange={handleChange} 
                required 
                className="input"
                placeholder="••••••••"
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Daftar Sebagai</label>
              <select 
                name="role"
                value={formData.role} 
                onChange={handleChange} 
                className="input"
                style={{ cursor: 'pointer' }}
              >
                <option value="tourist">Tourist (Wisatawan)</option>
                <option value="travel_provider">Travel Provider (Penyedia Jasa)</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ padding: '0.85rem' }}>
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-gray)' }}>
            Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
