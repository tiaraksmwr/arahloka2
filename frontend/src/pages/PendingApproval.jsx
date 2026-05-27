import { Link } from 'react-router-dom'

const ArahLokaLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke="#B8501C" strokeWidth="2.5"/>
      <path d="M20 6V12M20 28V34M6 20H12M28 20H34" stroke="#B8501C" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12L23 20L20 28L17 20L20 12Z" fill="#B8501C"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
    </svg>
    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#231308', letterSpacing: '-0.5px', fontFamily: "var(--font-serif)" }}>ArahLoka</span>
  </div>
)

const steps = [
  { icon: '✅', title: 'Pendaftaran Diterima', desc: 'Data akun Anda telah kami terima dengan baik.' },
  { icon: '🔍', title: 'Peninjauan Admin', desc: 'Tim Superadmin sedang memverifikasi profil Anda.' },
  { icon: '🚀', title: 'Akses Penuh', desc: 'Setelah disetujui, Anda dapat langsung masuk.' },
]

function PendingApproval() {
  return (
    <div className="pending-page">
      {/* Navbar */}
      <nav style={{
        width: '100%', height: 'var(--navbar-height)',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex', alignItems: 'center',
        padding: '0 32px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <Link to="/"><ArahLokaLogo /></Link>
      </nav>

      <div className="pending-body">
        <div className="pending-card animate-fade-in">
          {/* Icon */}
          <div className="pending-icon-wrap">
            <span style={{ fontSize: '2.5rem' }}>⏳</span>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--warning-light)', color: 'var(--warning)',
              padding: '4px 14px', borderRadius: '999px',
              fontSize: '0.72rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '1px',
              marginBottom: '16px'
            }}>Menunggu Verifikasi</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: '2rem',
            fontWeight: 800, color: 'var(--text-dark)', marginBottom: '16px'
          }}>
            Pendaftaran Berhasil!
          </h2>

          <p style={{
            color: 'var(--text-gray)', fontSize: '1rem', lineHeight: 1.8,
            marginBottom: '36px', maxWidth: '440px', margin: '0 auto 36px'
          }}>
            Terima kasih telah bergabung sebagai mitra ArahLoka. Akun Anda sedang ditinjau oleh tim kami untuk memastikan standar kualitas layanan.
          </p>

          {/* Steps */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '12px',
            background: 'var(--bg-surface)', borderRadius: '18px',
            padding: '24px', marginBottom: '36px',
            border: '1px solid var(--border-light)', textAlign: 'left'
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: i === 0 ? 'var(--success-light)' : i === 1 ? 'var(--warning-light)' : 'var(--border-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', flexShrink: 0
                }}>
                  {step.icon}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '2px' }}>{step.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary btn-lg">
              Ke Halaman Login
            </Link>
            <Link to="/" className="btn btn-ghost btn-lg">
              Kembali ke Beranda
            </Link>
          </div>

          <p style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Butuh bantuan? Hubungi{' '}
            <a href="mailto:support@arahloka.id" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              support@arahloka.id
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PendingApproval
