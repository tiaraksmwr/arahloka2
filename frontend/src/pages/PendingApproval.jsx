import { Link } from 'react-router-dom'

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke="#CC5500" strokeWidth="2.5"/>
      <path d="M20 6V12M20 28V34M6 20H12M28 20H34" stroke="#CC5500" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12L23 20L20 28L17 20L20 12Z" fill="#CC5500"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
    </svg>
    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', letterSpacing: '-0.5px', fontFamily: "var(--font-serif)" }}>ArahLoka</span>
  </div>
)

function PendingApproval() {
  return (
    <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar-wrapper glass scrolled">
        <div className="navbar-container">
          <Link to="/" className="nav-logo"><Logo /></Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card p-12 text-center animate-fade-in" style={{ maxWidth: '600px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⏳</div>
          <h2 className="text-primary mb-6" style={{ fontSize: '2rem' }}>Pendaftaran Berhasil!</h2>
          <p className="text-gray mb-8" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
            Terima kasih telah bergabung sebagai mitra ArahLoka. Akun Anda saat ini sedang dalam proses peninjauan oleh tim Superadmin kami untuk memastikan standar kualitas layanan.
            <br /><br />
            Anda akan mendapatkan akses penuh setelah akun Anda disetujui. Silakan cek halaman ini atau coba masuk secara berkala.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.75rem 2.5rem' }}>Ke Halaman Login</Link>
            <Link to="/" className="btn btn-outline" style={{ padding: '0.75rem 2.5rem' }}>Beranda</Link>
          </div>
        </div>
      </div>
      
      <footer className="footer-bottom" style={{ background: 'transparent', color: 'var(--text-gray)', padding: '2rem' }}>
        <p>© 2026 ArahLoka. Sistem Verifikasi Keanggotaan.</p>
      </footer>
    </div>
  )
}

export default PendingApproval
