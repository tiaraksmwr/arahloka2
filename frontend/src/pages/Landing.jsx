import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Landing() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/packages`)
      .then(res => res.json())
      .then(data => {
        setPackages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching packages:', err);
        setLoading(false);
      });
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">ArahLoka</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <a href="#">Explore</a>
          <a href="#">Community Logs</a>
          <Link to="/login" className="btn-login">Login</Link>
          <Link to="/register" className="btn-register">Register</Link>
        </div>
      </nav>

      <header className="hero">
        <h1>ArahLoka</h1>
        <p>Temukan, Jelajahi, dan Lestarikan Budaya Indonesia.</p>
      </header>

      <section className="section">
        <div className="features-grid">
          <div className="feature-card">
            <h3>Rekomendasi Destinasi</h3>
            <p>Temukan tempat-tempat tersembunyi yang kaya akan budaya.</p>
          </div>
          <div className="feature-card">
            <h3>Paket Wisata Budaya</h3>
            <p>Pilihan paket perjalanan kurasi terbaik untuk Anda.</p>
          </div>
          <div className="feature-card">
            <h3>Cuaca Destinasi</h3>
            <p>Pantau kondisi cuaca real-time dari Open-Meteo untuk rencana perjalanan yang sempurna.</p>
          </div>
          <div className="feature-card">
            <h3>Journey Studio</h3>
            <p>Abadikan dan bagikan momen perjalanan budaya Anda.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Paket Budaya Unggulan</h2>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Memuat paket wisata...</p>
        ) : (
          <div className="packages-grid">
            {packages.map(pkg => (
              <Link key={pkg.id} to={`/packages/${pkg.id}`} className="package-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <img src={pkg.image_url} alt={pkg.title} className="package-image" />
                <div className="package-content">
                  <div className="package-location">{pkg.location}</div>
                  <h3 className="package-title">{pkg.title}</h3>
                  <p className="package-description" style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#666' }}>
                    {pkg.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="package-duration" style={{ fontSize: '0.8rem', color: '#888' }}>{pkg.duration}</span>
                    <span className="package-price">{formatPrice(pkg.price)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <p>&copy; 2026 ArahLoka. Pelestari Budaya Indonesia.</p>
      </footer>
    </div>
  )
}

export default Landing
