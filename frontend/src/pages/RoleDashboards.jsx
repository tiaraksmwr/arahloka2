import { useNavigate, Link } from 'react-router-dom'

const DashboardLayout = ({ title, children }) => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">ArahLoka</Link>
        <div className="nav-links">
          <span>Halo, {user.name}</span>
          <button onClick={handleLogout} className="btn-login" style={{ border: 'none', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>
      <section className="section" style={{ padding: '2rem' }}>
        <h2 className="section-title" style={{ textAlign: 'left' }}>{title}</h2>
        {children}
      </section>
    </div>
  )
}

export const TouristDashboard = () => (
  <DashboardLayout title="Dashboard Tourist">
    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <p>Selamat datang di ArahLoka! Temukan keindahan budaya Indonesia di sini.</p>
    </div>
  </DashboardLayout>
)

export const ProviderDashboard = () => (
  <DashboardLayout title="Dashboard Travel Provider">
    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <p>Selamat datang! Kelola paket wisata budaya Anda di sini.</p>
    </div>
  </DashboardLayout>
)
