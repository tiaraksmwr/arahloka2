import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tourist'
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData)
      navigate('/pending-approval')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">ArahLoka</Link>
      </nav>

      <div className="auth-container" style={{ maxWidth: '400px', margin: '80px auto', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>Daftar Akun ArahLoka</h2>
        
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nama Lengkap</label>
            <input 
              type="text" 
              name="name"
              value={formData.name} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Daftar Sebagai</label>
            <select 
              name="role"
              value={formData.role} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="tourist">Tourist (Wisatawan)</option>
              <option value="travel_provider">Travel Provider (Penyedia Jasa)</option>
            </select>
          </div>
          <button type="submit" className="btn-register" style={{ width: '100%', padding: '0.75rem', border: 'none', cursor: 'pointer' }}>Daftar Sekarang</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
