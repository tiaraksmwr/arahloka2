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
            <p>Simpan kenangan dan bagikan cerita budaya Anda setelah melakukan perjalanan.</p>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--deep-green)', marginBottom: '1.5rem' }}>ArahLoka Journey Studio</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#666', marginBottom: '2rem' }}>
              Ekspresikan perjalanan budaya Anda dengan fitur-fitur kreatif kami. Mulai dari perencanaan hingga berbagi inspirasi dengan sesama penjelajah budaya.
            </p>
            <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                <div style={{ background: 'var(--cream)', padding: '0.75rem', borderRadius: '12px' }}>🗺️</div>
                <div>
                  <h4 style={{ color: 'var(--burnt-orange)' }}>Persiapan Trip</h4>
                  <p style={{ fontSize: '0.9rem', color: '#888' }}>Itinerary dan checklist otomatis dari booking Anda.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                <div style={{ background: 'var(--cream)', padding: '0.75rem', borderRadius: '12px' }}>📸</div>
                <div>
                  <h4 style={{ color: 'var(--burnt-orange)' }}>Memory Lane Card</h4>
                  <p style={{ fontSize: '0.9rem', color: '#888' }}>Abadikan momen berkesan dalam kartu digital eksklusif.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                <div style={{ background: 'var(--cream)', padding: '0.75rem', borderRadius: '12px' }}>📖</div>
                <div>
                  <h4 style={{ color: 'var(--burnt-orange)' }}>Community Story Challenge</h4>
                  <p style={{ fontSize: '0.9rem', color: '#888' }}>Bagikan cerita Anda dan temukan inspirasi baru.</p>
                </div>
              </div>
            </div>
            <Link to="/journey-studio" className="btn-register" style={{ textDecoration: 'none', display: 'inline-block' }}>Buka Journey Studio</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              background: 'var(--burnt-orange)', 
              width: '100%', 
              height: '400px', 
              borderRadius: '24px',
              transform: 'rotate(-2deg)',
              opacity: 0.1,
              position: 'absolute',
              top: 0,
              left: 0
            }}></div>
            <img 
              src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800" 
              alt="Cultural Journey" 
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '24px', position: 'relative', boxShadow: 'var(--shadow)' }}
            />
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="package-location">{pkg.location}</div>
                    {pkg.provider_name && <span style={{ fontSize: '0.7rem', color: '#888', fontStyle: 'italic' }}>oleh {pkg.provider_name}</span>}
                  </div>
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
