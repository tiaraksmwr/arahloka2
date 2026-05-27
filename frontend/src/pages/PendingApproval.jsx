import { Link } from 'react-router-dom'

function PendingApproval() {
  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">ArahLoka</Link>
      </nav>

      <div style={{ maxWidth: '600px', margin: '100px auto', padding: '3rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Pendaftaran Berhasil!</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Terima kasih telah mendaftar di ArahLoka. Akun Anda sedang dalam proses peninjauan oleh tim Superadmin.
          <br /><br />
          Anda akan dapat masuk ke sistem setelah akun Anda disetujui. Silakan cek secara berkala.
        </p>
        <Link to="/login" className="btn-login" style={{ padding: '0.75rem 2rem', textDecoration: 'none', display: 'inline-block' }}>Kembali ke Login</Link>
      </div>
    </div>
  )
}

export default PendingApproval
