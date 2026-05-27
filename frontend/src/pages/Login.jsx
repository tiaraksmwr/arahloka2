import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
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
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">ArahLoka</Link>
      </nav>

      <div className="auth-container" style={{ maxWidth: '400px', margin: '100px auto', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>Login Ke ArahLoka</h2>
        
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <button type="submit" className="btn-login" style={{ width: '100%', padding: '0.75rem', border: 'none', cursor: 'pointer' }}>Login</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Belum punya akun? <Link to="/register" style={{ color: 'var(--primary)' }}>Daftar</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
