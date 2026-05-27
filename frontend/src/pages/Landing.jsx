import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const Logo = ({ light = false }) => (
  <div className="flex items-center gap-2">
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke={light ? "white" : "#CC5500"} strokeWidth="2.5"/>
      <path d="M20 6V12M20 28V34M6 20H12M28 20H34" stroke={light ? "white" : "#CC5500"} strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12L23 20L20 28L17 20L20 12Z" fill={light ? "white" : "#CC5500"}/>
      <circle cx="20" cy="20" r="3" fill={light ? "var(--secondary)" : "white"}/>
    </svg>
    <span style={{
      fontSize: '1.75rem',
      fontWeight: '900',
      color: light ? 'white' : 'var(--text-dark)',
      letterSpacing: '-1px',
      fontFamily: "var(--font-serif)"
    }}>ArahLoka</span>
  </div>
)

function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const heroImage = 'https://images.unsplash.com/photo-1605634509531-9252bc30541c?auto=format&fit=crop&q=85&w=1920';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { title: 'Rekomendasi Destinasi', desc: 'Temukan tempat sesuai mood & minatmu', icon: '🧭', bg: '#E8F5E9' },
    { title: 'Paket Wisata Budaya', desc: 'Pilih paket dari penyedia terpercaya', icon: '🎭', bg: '#FFF3E0' },
    { title: 'Cuaca Destinasi', desc: 'Cek cuaca sebelum perjalanan', icon: '🌤️', bg: '#E3F2FD' },
    { title: 'Itinerary Planner', desc: 'Rencanakan perjalananmu dengan mudah', icon: '📋', bg: '#F3E5F5' },
    { title: 'Wishlist', desc: 'Simpan destinasi favoritmu', icon: '❤️', bg: '#FCE4EC' },
    { title: 'Catatan Perjalanan', desc: 'Bagikan pengalaman & inspirasi', icon: '📖', bg: '#EFEBE9' },
  ];

  const destinations = [
    { name: 'Yogyakarta', loc: 'D.I. Yogyakarta', img: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&q=80&w=600' },
    { name: 'Ubud', loc: 'Bali', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600' },
    { name: 'Tana Toraja', loc: 'Sulawesi Selatan', img: 'https://images.unsplash.com/photo-1626245199920-561b69519198?auto=format&fit=crop&q=80&w=600' },
    { name: 'Borobudur', loc: 'Jawa Tengah', img: 'https://images.unsplash.com/photo-1596402184320-417d717867cd?auto=format&fit=crop&q=80&w=600' },
    { name: 'Labuan Bajo', loc: 'Nusa Tenggara Timur', img: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&q=80&w=600' },
  ];

  const events = [
    { title: 'Festival Bau Nyale', loc: 'Lombok, NTB', date: '15-17 FEB', cat: 'Festival Budaya', bg: '#FFF0F0', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=300' },
    { title: 'Festival Danau Toba', loc: 'Sumatera Utara', date: '24-26 FEB', cat: 'Festival Budaya', bg: '#F0F7FF', img: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=300' },
    { title: 'Sekaten Yogyakarta', loc: 'Yogyakarta', date: '05-07 MAR', cat: 'Tradisi & Budaya', bg: '#F0FFF4', img: 'https://images.unsplash.com/photo-1605634509531-9252bc30541c?auto=format&fit=crop&q=80&w=300' },
    { title: 'Pesta Kesenian Bali', loc: 'Denpasar, Bali', date: '15-17 JUN', cat: 'Seni & Budaya', bg: '#FFF9EB', img: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=300' },
    { title: 'Festival Lembah Baliem', loc: 'Papua Pegunungan', date: '10-12 AUG', cat: 'Festival Budaya', bg: '#F5F0FF', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=300' },
  ];

  const stats = [
    { number: '500+', label: 'Destinasi Budaya' },
    { number: '50+', label: 'Festival Tahunan' },
    { number: '10rb+', label: 'Penjelajah Aktif' },
    { number: '34', label: 'Provinsi Terjangkau' },
  ];

  return (
    <div className="landing-page">

      {/* Navbar */}
      <nav className={`navbar-wrapper ${isScrolled ? 'scrolled' : 'nav-transparent'}`}>
        <div className="navbar-container">
          <Link to="/" className="nav-logo">
            <Logo light={!isScrolled} />
          </Link>
          <div className="nav-links">
            <a href="#" className={`active ${!isScrolled ? 'nav-link-light' : ''}`}>Home</a>
            <a href="#explore" className={!isScrolled ? 'nav-link-light' : ''}>Explore</a>
            <a href="#community" className={!isScrolled ? 'nav-link-light' : ''}>Community</a>
            <a href="#events" className={!isScrolled ? 'nav-link-light' : ''}>Events</a>
          </div>
          <div className="nav-actions flex items-center gap-4">
            <Link to="/login" className={`btn ${!isScrolled ? 'btn-outline-light' : 'btn-outline'}`} style={{ padding: '0.6rem 1.8rem' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.6rem 1.8rem' }}>Daftar</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero-section" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-overlay"></div>
        <div className="container hero-container">
          <div className="hero-content-wrapper animate-fade-in">
            <div className="hero-text-side">
              <div className="hero-badge">
                <span className="badge-pulse"></span>
                Jelajahi Keindahan, Rasakan Budaya
              </div>
              <h1 className="hero-title">ArahLoka</h1>
              <div className="hero-batik-strip" aria-hidden="true">
                <svg viewBox="0 0 480 18" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <g key={i} transform={`translate(${i * 20}, 0)`}>
                      <path d="M0,9 Q5,0 10,9 Q15,18 20,9" stroke="rgba(196,144,48,0.7)" strokeWidth="1.2" fill="none"/>
                      <circle cx="10" cy="9" r="1.5" fill="rgba(196,144,48,0.5)"/>
                      <circle cx="0" cy="9" r="1" fill="rgba(196,144,48,0.35)"/>
                    </g>
                  ))}
                </svg>
              </div>
              <h2 className="hero-subtitle">Temukan, Jelajahi, dan<br/>Lestarikan Budaya Indonesia.</h2>
              <p className="hero-description">
                Platform perjalanan budaya Indonesia yang menghubungkan wisatawan dengan destinasi, pengalaman, dan cerita budaya yang autentik dan bermakna.
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-hero-primary">
                  Mulai Perjalanan
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <a href="#explore" className="btn btn-hero-outline">Jelajahi Destinasi</a>
              </div>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="hero-stats-float">
            {stats.map((s, i) => (
              <div key={i} className="hero-stat-chip">
                <span className="hero-stat-num">{s.number}</span>
                <span className="hero-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-scroll-hint">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Scroll</span>
        </div>
      </header>

      {/* Features */}
      <section className="section-padding" style={{ background: 'white', padding: '100px 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-chip">Platform Lengkap</span>
            <h2 className="section-title">Satu Platform, Segalanya <em>Tersedia</em></h2>
            <p className="section-sub">Dari perencanaan hingga kenangan, ArahLoka hadir di setiap langkah perjalanan budayamu.</p>
          </div>
          <div className="features-row">
            {features.map((f, i) => (
              <div key={i} className="feature-card card">
                <div className="feature-num">0{i + 1}</div>
                <div className="icon-circle" style={{ background: f.bg }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar-section">
        <div className="stats-bar-pattern"></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="stats-bar-grid">
            {stats.map((s, i) => (
              <div key={i} className="stats-bar-item">
                <span className="stats-bar-num">{s.number}</span>
                <span className="stats-bar-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendation */}
      <section id="explore" className="section-padding" style={{ padding: '100px 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-chip">Rekomendasi Personal</span>
            <h2 className="section-title">Mulai Perjalanan <em>Anda</em></h2>
            <p className="section-sub">Ceritakan preferensimu, biar kami rekomendasikan yang paling cocok untukmu.</p>
          </div>
          <div className="recommendation-box animate-fade-in">
            <div className="rec-grid">
              {[
                { title: 'Current Mood', val: 'Pilih mood', icon: '😊' },
                { title: 'Time Available', val: 'Pilih waktu', icon: '⏰' },
                { title: 'Main Interest', val: 'Pilih minat', icon: '🎨' },
                { title: 'Travel Style', val: 'Pilih gaya', icon: '🧳' },
                { title: 'Budget', val: 'Pilih budget', icon: '💰' },
                { title: 'Region', val: 'Pilih wilayah', icon: '📍' },
              ].map((item, i) => (
                <div key={i} className="rec-item">
                  <div className="rec-icon">{item.icon}</div>
                  <div className="rec-label">
                    <span className="rec-title">{item.title}</span>
                    <span className="rec-value">{item.val} ▾</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button className="btn btn-primary" style={{ padding: '1.25rem 4rem', fontSize: '1.1rem' }}>
                Temukan Rekomendasi 🔍
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Choice Destinations */}
      <section className="section-padding" style={{ background: 'white', padding: '120px 0' }}>
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="section-chip">Destinasi Pilihan</span>
              <h2 className="section-title" style={{ marginTop: '12px' }}>Permata Budaya <em>Nusantara</em></h2>
              <p className="section-sub">Destinasi paling autentik yang wajib Anda kunjungi.</p>
            </div>
            <a href="#" className="see-all-link">Lihat Semua <span>→</span></a>
          </div>
          <div className="dest-grid">
            {destinations.map((d, i) => (
              <div key={i} className={`dest-card card ${i === 0 ? 'dest-featured' : ''}`}>
                <img src={d.img} alt={d.name} className="dest-img" />
                <div className="dest-overlay">
                  <div className="dest-name">{d.name}</div>
                  <div className="dest-loc">📍 {d.loc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="section-padding" style={{ padding: '120px 0' }}>
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="section-chip">Acara & Festival</span>
              <h2 className="section-title" style={{ marginTop: '12px' }}>Acara Budaya <em>Bulan Ini</em></h2>
              <p className="section-sub">Jangan lewatkan momen sakral dan festival meriah di seluruh nusantara.</p>
            </div>
            <a href="#" className="see-all-link">Semua Event <span>→</span></a>
          </div>
          <div className="events-grid">
            {events.map((e, i) => (
              <div key={i} className="event-card card">
                <div className="event-img-wrap">
                  <img src={e.img} alt={e.title} className="event-img" />
                  <div className="date-badge">
                    {e.date.split(' ')[0]}<br/>
                    <span style={{ fontSize: '0.6rem', color: '#999' }}>{e.date.split(' ')[1]}</span>
                  </div>
                </div>
                <div className="event-info">
                  <h3 className="event-title">{e.title}</h3>
                  <p className="event-loc-text">📍 {e.loc}</p>
                  <span className="cat-badge" style={{ background: e.bg, color: 'var(--text-dark)' }}>{e.cat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding" style={{ background: 'white', padding: '120px 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-chip">Cerita Penjelajah</span>
            <h2 className="section-title">Apa Kata <em>Mereka?</em></h2>
            <p className="section-sub">Kesan dan cerita dari para penjelajah budaya ArahLoka.</p>
          </div>
          <div className="test-grid">
            {[
              { name: 'Dewi Lestari', city: 'Jakarta', initials: 'DL', comment: 'ArahLoka membantu saya menemukan tempat-tempat budaya yang luar biasa! Pengalaman yang autentik dan tak terlupakan.' },
              { name: 'Rizky Pratama', city: 'Bandung', initials: 'RP', comment: 'Fitur rekomendasinya keren banget! Saya bisa menemukan destinasi sesuai mood dan budget. Booking paketnya juga mudah.' },
              { name: 'Nadia Putri', city: 'Surabaya', initials: 'NP', comment: 'Komunitasnya aktif dan inspiratif. Saya jadi punya banyak cerita dan teman baru dari berbagai daerah.' },
            ].map((t, i) => (
              <div key={i} className="test-card card">
                <div className="test-quote-mark">"</div>
                <div className="stars">★★★★★</div>
                <p className="test-comment">"{t.comment}"</p>
                <div className="test-user">
                  <div className="avatar-initials">{t.initials}</div>
                  <div className="user-info">
                    <h4>{t.name}</h4>
                    <p>{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-bg-orb cta-orb-1"></div>
        <div className="cta-bg-orb cta-orb-2"></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="cta-content">
            <div className="cta-badge">Bergabung Sekarang</div>
            <h2 className="cta-heading">Siap Memulai Perjalanan<br/>Budaya Anda?</h2>
            <p className="cta-desc">Bergabung dengan ribuan penjelajah budaya Indonesia dan temukan pengalaman yang tak terlupakan di 34 provinsi.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn cta-btn-primary">Daftar Gratis Sekarang</Link>
              <Link to="/login" className="btn cta-btn-secondary">Sudah punya akun? Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-wrapper">
        <div className="container">
          <div className="footer-container">
            <div className="footer-brand">
              <Logo light />
              <p>Platform perjalanan budaya Indonesia yang menghubungkan wisatawan dengan destinasi, pengalaman, dan cerita budaya yang autentik dan bermakna.</p>
            </div>
            <div className="footer-col">
              <h4>Jelajahi</h4>
              <ul>
                <li><a href="#">Destinasi</a></li>
                <li><a href="#">Paket Wisata</a></li>
                <li><a href="#">Itinerary Planner</a></li>
                <li><a href="#">Acara Budaya</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Komunitas</h4>
              <ul>
                <li><a href="#">Community Logs</a></li>
                <li><a href="#">Leaderboard</a></li>
                <li><a href="#">Tentang Kami</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Bantuan</h4>
              <ul>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Kebijakan Privasi</a></li>
                <li><a href="#">Hubungi Kami</a></li>
              </ul>
            </div>
            <div className="footer-newsletter">
              <h4>Newsletter</h4>
              <div className="newsletter-box">
                <p>Berlangganan untuk update destinasi terbaru.</p>
                <div className="input-group">
                  <input type="text" placeholder="Email kamu" />
                  <button className="btn-send">🚀</button>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 ArahLoka. Dibuat dengan ❤️ untuk Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
