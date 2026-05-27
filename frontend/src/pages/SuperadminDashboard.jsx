import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

function SuperadminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/pending-users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPendingUsers(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching pending users:', err)
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login')
      }
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${import.meta.env.VITE_API_URL}/admin/users/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPendingUsers()
    } catch (err) {
      alert('Failed to approve user')
    }
  }

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${import.meta.env.VITE_API_URL}/admin/users/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchPendingUsers()
    } catch (err) {
      alert('Failed to reject user')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">ArahLoka Admin</Link>
        <div className="nav-links">
          <button onClick={handleLogout} className="btn-login" style={{ border: 'none', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <section className="section" style={{ padding: '2rem' }}>
        <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>Dashboard Superadmin</h2>
        
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Persetujuan Pengguna Baru</h3>
          
          {loading ? (
            <p>Memuat data...</p>
          ) : pendingUsers.length === 0 ? (
            <p>Tidak ada pengguna yang menunggu persetujuan.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '1rem' }}>Nama</th>
                    <th style={{ padding: '1rem' }}>Email</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1rem' }}>{user.name}</td>
                      <td style={{ padding: '1rem' }}>{user.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem',
                          background: user.role === 'travel_provider' ? '#e0f2fe' : '#f3f4f6',
                          color: user.role === 'travel_provider' ? '#0369a1' : '#374151'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{user.status}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          onClick={() => handleApprove(user.id)} 
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(user.id)} 
                          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default SuperadminDashboard
