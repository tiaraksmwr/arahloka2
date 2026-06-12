import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/* ─── Warm Nusantara palette ─────────────────────── */
const C = {
  cream:  '#FDF6E8',   /* page background */
  cream2: '#FFF9F0',   /* section alt */
  paper:  '#F5ECD8',   /* deeper cream */
  terra:  '#C4531A',   /* primary */
  terraD: '#A33D10',
  green:  '#1D4F32',   /* secondary */
  greenL: '#2E6B46',
  gold:   '#C49030',   /* accent */
  goldL:  '#DBA83C',
  dark:   '#1A0E06',   /* text */
  mid:    '#4E321E',
  muted:  '#9C8470',
  border: '#E8D5B8',
}

/* ─── Batik SVG pattern for hero ─────────────────── */
const batikUrl = `url("data:image/svg+xml,%3Csvg width='52' height='52' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C49030' fill-opacity='0.055' fill-rule='evenodd'%3E%3Cpath d='M26 0l4 13-4 13-4-13zm0 26l4 13-4 13-4-13zM0 26l13 4 13-4-13-4zM26 26l13 4 13-4-13-4z'/%3E%3C/g%3E%3C/svg%3E")`

/* ─── Logo ───────────────────────────────────────── */
const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke={C.terra} strokeWidth="2.5"/>
      <path d="M20 6V12M20 28V34M6 20H12M28 20H34" stroke={C.terra} strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12L23 20L20 28L17 20L20 12Z" fill={C.terra}/>
      <circle cx="20" cy="20" r="3" fill="white"/>
    </svg>
    <span style={{ fontSize: '1.55rem', fontWeight: '900', color: C.dark, letterSpacing: '-0.7px', fontFamily: 'var(--font-serif)' }}>
      ArahLoka
    </span>
  </div>
)

/* ─── Section chip label ─────────────────────────── */
const Chip = ({ children, color = C.terra, bg = 'rgba(196,83,26,0.09)', mb = '14px' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', background: bg, color, border: `1px solid ${color}22`,
    padding: '4px 14px', borderRadius: '999px',
    fontSize: '0.67rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
    marginBottom: mb,
  }}>{children}</span>
)

/* ─── Mini Indonesia flag (renders consistently across OS) ── */
const FlagID = () => (
  <span style={{
    display: 'inline-block', width: '15px', height: '11px', borderRadius: '2px',
    overflow: 'hidden', marginRight: '7px', flexShrink: 0,
    boxShadow: '0 0 0 1px rgba(0,0,0,0.08)', verticalAlign: 'middle',
  }}>
    <span style={{ display: 'block', height: '50%', background: '#CE1126' }}/>
    <span style={{ display: 'block', height: '50%', background: '#FFFFFF' }}/>
  </span>
)

/* ─── Section heading ────────────────────────────── */
const Heading = ({ children, sub, center, light }) => (
  <div style={{ textAlign: center ? 'center' : undefined, marginBottom: '36px' }}>
    <h2 style={{
      fontFamily: 'var(--font-serif)', fontSize: '2.6rem', fontWeight: 900,
      color: light ? 'white' : C.dark, letterSpacing: '-1px', lineHeight: 1.15,
      marginBottom: sub ? '10px' : 0,
    }}>{children}</h2>
    {sub && <p style={{ color: light ? 'rgba(255,255,255,0.62)' : C.muted, fontSize: '1rem', lineHeight: 1.7 }}>{sub}</p>}
  </div>
)

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeFilter, setActiveFilter] = useState('Semua')

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* ── data ── */
  const heroPhotos = [
    { src: 'https://images.unsplash.com/photo-1596402184320-417d717867cd?w=500&q=80', label: 'Borobudur' },
    { src: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80', label: 'Ubud, Bali' },
    { src: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=500&q=80', label: 'Yogyakarta' },
    { src: 'https://images.unsplash.com/photo-1626245199920-561b69519198?w=500&q=80', label: 'Toraja' },
  ]

  const destinations = [
    { name: 'Borobudur', loc: 'Jawa Tengah', cat: 'Candi', rating: '4.9', rev: '2.4rb', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Pradaksina.jpg/960px-Pradaksina.jpg' },
    { name: 'Ubud', loc: 'Bali', cat: 'Budaya', rating: '4.8', rev: '3.1rb', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&q=80' },
    { name: 'Tana Toraja', loc: 'Sulawesi Selatan', cat: 'Tradisi', rating: '4.9', rev: '1.2rb', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Tongkonan_-_South_Sulawesi_Pavilion_TMII_%282025%29_-_img_01.jpg/960px-Tongkonan_-_South_Sulawesi_Pavilion_TMII_%282025%29_-_img_01.jpg' },
    { name: 'Labuan Bajo', loc: 'NTT', cat: 'Alam & Budaya', rating: '4.7', rev: '1.8rb', img: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=700&q=80' },
    { name: 'Yogyakarta', loc: 'D.I. Yogyakarta', cat: 'Seni & Budaya', rating: '4.8', rev: '4.5rb', img: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=700&q=80' },
    { name: 'Raja Ampat', loc: 'Papua Barat', cat: 'Alam', rating: '5.0', rev: '980', img: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=700&q=80' },
  ]

  const filters = ['Semua', 'Jawa', 'Bali', 'Sumatera', 'NTT', 'Papua']

  const features = [
    { n: '01', icon: '🧭', title: 'Rekomendasi Personal', desc: 'Temukan destinasi sesuai mood, budget, dan minatmu secara instan' },
    { n: '02', icon: '🎭', title: 'Paket Wisata Budaya', desc: 'Ratusan paket dari penyedia lokal terpercaya di seluruh nusantara' },
    { n: '03', icon: '🗺️', title: 'AI Itinerary Planner', desc: 'Susun rencana perjalanan lengkap otomatis dengan kecerdasan buatan' },
    { n: '04', icon: '🌤️', title: 'Cuaca Destinasi', desc: 'Data cuaca real-time untuk setiap destinasi yang ingin kamu kunjungi' },
    { n: '05', icon: '📸', title: 'Journey Studio', desc: 'Abadikan, edit, dan bagikan kenangan budaya perjalananmu' },
    { n: '06', icon: '📖', title: 'Community Stories', desc: 'Bergabung dengan ribuan penjelajah budaya Indonesia yang aktif berbagi' },
  ]

  const events = [
    { title: 'Festival Bau Nyale', loc: 'Lombok, NTB', date: '15–17 FEB', month: 'FEB', day: '15', cat: 'Festival Budaya', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=75' },
    { title: 'Sekaten Yogyakarta', loc: 'Yogyakarta', date: '05–07 MAR', month: 'MAR', day: '05', cat: 'Tradisi & Budaya', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Gunungan_darat_during_Garebeg_Mulud_Yogyakarta_Dec_2017_Pj_IMG_4517sm.jpg/960px-Gunungan_darat_during_Garebeg_Mulud_Yogyakarta_Dec_2017_Pj_IMG_4517sm.jpg' },
    { title: 'Festival Danau Toba', loc: 'Sumatera Utara', date: '24–26 FEB', month: 'FEB', day: '24', cat: 'Festival Budaya', img: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&q=75' },
    { title: 'Pesta Kesenian Bali', loc: 'Denpasar, Bali', date: '15–17 JUN', month: 'JUN', day: '15', cat: 'Seni & Budaya', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=75' },
    { title: 'Festival Lembah Baliem', loc: 'Papua Pegunungan', date: '10–12 AUG', month: 'AUG', day: '10', cat: 'Festival Budaya', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/20170903_Papouasie_Baliem_valley_15.jpg/960px-20170903_Papouasie_Baliem_valley_15.jpg' },
    { title: 'Pesta Bondan Jogyakarta', loc: 'Yogyakarta', date: '20–22 SEP', month: 'SEP', day: '20', cat: 'Seni Pertunjukan', img: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=400&q=75' },
  ]

  const testimonials = [
    { name: 'Dewi Lestari', city: 'Jakarta', initials: 'DL', rating: 5, comment: 'ArahLoka membantu saya menemukan pengalaman budaya yang luar biasa! Autentik dan tak terlupakan.' },
    { name: 'Rizky Pratama', city: 'Bandung', initials: 'RP', rating: 5, comment: 'Fitur rekomendasinya keren banget! Menemukan destinasi sesuai mood dan budget, booking juga gampang.' },
    { name: 'Nadia Putri', city: 'Surabaya', initials: 'NP', rating: 5, comment: 'Komunitasnya aktif dan inspiratif. Banyak cerita seru dari berbagai penjuru nusantara!' },
  ]

  const marqueItems = ['🏛️ Borobudur', '🌾 Subak Bali', '🎭 Sekaten Jogja', '🌊 Raja Ampat', '🦅 Danau Toba', '🏺 Tana Toraja', '🎪 Labuan Bajo', '🌺 Ubud Bali', '🎨 Batik Solo', '🌿 Flores', '🏔️ Bromo', '🎋 Lombok']

  const stats = [
    { n: '500+', lbl: 'Destinasi Budaya' },
    { n: '50+', lbl: 'Festival Tahunan' },
    { n: '10K+', lbl: 'Penjelajah Aktif' },
    { n: '34', lbl: 'Provinsi Terjangkau' },
  ]

  return (
    <>
      {/* ── Marquee keyframe injected once ── */}
      <style>{`
        @keyframes marquee { 0% { transform:translateX(0) } 100% { transform:translateX(-50%) } }
        .mq-track { display:flex; width:max-content; animation:marquee 36s linear infinite; }
        .mq-track:hover { animation-play-state:paused; }
        a:hover { text-decoration:none !important; }
      `}</style>

      <div style={{ background: C.cream, fontFamily: 'var(--font-sans)' }}>

        {/* ═══ NAVBAR ═══════════════════════════════════ */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: '68px',
          display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between',
          background: isScrolled ? 'rgba(253,246,232,0.97)' : 'rgba(253,246,232,0.97)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${C.border}`,
          boxShadow: isScrolled ? '0 2px 20px rgba(26,14,6,0.08)' : '0 1px 0 rgba(232,213,184,0.5)',
          transition: 'box-shadow 0.3s ease',
        }}>
          <Logo />

          <div style={{ display: 'flex', gap: '2rem' }}>
            {[['Home','#'], ['Eksplorasi','#explore'], ['Komunitas','#community'], ['Festival','#events']].map(([label, href]) => (
              <a key={label} href={href} style={{ color: C.mid, fontWeight: 500, fontSize: '0.875rem', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = C.terra}
                onMouseLeave={e => e.currentTarget.style.color = C.mid}
              >{label}</a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link to="/login" style={{
              color: C.mid, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
              padding: '7px 20px', borderRadius: '999px', border: `1.5px solid ${C.border}`,
            }}>Masuk</Link>
            <Link to="/register" style={{
              background: C.terra, color: 'white', fontWeight: 700, fontSize: '0.875rem',
              textDecoration: 'none', padding: '7px 20px', borderRadius: '999px',
              boxShadow: '0 4px 14px rgba(196,83,26,0.38)',
            }}>Daftar Gratis</Link>
          </div>
        </nav>


        {/* ═══ HERO ════════════════════════════════════ */}
        <header style={{
          paddingTop: '68px',
          position: 'relative',
          minHeight: '88vh', display: 'flex', alignItems: 'center',
          backgroundImage: `url('https://images.unsplash.com/photo-1596402184320-417d717867cd?w=1800&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}>
          {/* Warm cream overlay — opaque on left, fades right */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: `linear-gradient(110deg,
              rgba(253,246,232,0.97) 0%,
              rgba(253,246,232,0.94) 40%,
              rgba(253,246,232,0.72) 62%,
              rgba(253,246,232,0.28) 100%)`,
          }}/>
          {/* Batik pattern on top of overlay */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, backgroundImage: batikUrl, opacity: 0.4 }}/>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '52px 40px 60px', width: '100%', position: 'relative', zIndex: 3 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '56px', alignItems: 'center' }}>

              {/* LEFT: Text content */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Chip color={C.green} bg="rgba(29,79,50,0.09)" mb={0}><FlagID />Platform Wisata Budaya</Chip>
                  <span style={{
                    background: C.terra, color: 'white', fontSize: '0.65rem', fontWeight: 800,
                    padding: '3px 10px', borderRadius: '999px', letterSpacing: '1px',
                  }}>BARU</span>
                </div>

                <h1 style={{
                  fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.8rem, 4.5vw, 4rem)',
                  fontWeight: 900, color: C.dark, lineHeight: 1.08, letterSpacing: '-1.5px',
                  marginBottom: '18px',
                }}>
                  Temukan Indonesia,<br/>
                  Rasakan <em style={{ fontStyle: 'italic', color: C.terra }}>Budayanya.</em>
                </h1>

                <p style={{ color: C.muted, fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '460px', marginBottom: '32px' }}>
                  Jelajahi 500+ destinasi budaya autentik — dari candi bersejarah hingga festival tradisional — di 34 provinsi Indonesia.
                </p>

                {/* CTA row */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '36px' }}>
                  <Link to="/register" style={{
                    background: C.terra, color: 'white', padding: '13px 32px', borderRadius: '999px',
                    fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
                    boxShadow: '0 6px 24px rgba(196,83,26,0.42)',
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                  }}>
                    Mulai Perjalanan
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                  <a href="#explore" style={{
                    color: C.dark, padding: '13px 28px', borderRadius: '999px',
                    fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
                    border: `1.5px solid ${C.border}`, background: 'white',
                  }}>Jelajahi Destinasi</a>
                </div>

                {/* Stats chips */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
                  {stats.map((s, i) => (
                    <div key={i} style={{
                      background: 'white', border: `1px solid ${C.border}`,
                      borderRadius: '12px', padding: '10px 16px', textAlign: 'center',
                      boxShadow: '0 1px 4px rgba(26,14,6,0.05)',
                    }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: C.terra, fontFamily: 'var(--font-serif)', lineHeight: 1 }}>{s.n}</div>
                      <div style={{ fontSize: '0.68rem', color: C.muted, fontWeight: 500, marginTop: '2px' }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>

                {/* Quick destination tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 500, alignSelf: 'center' }}>Populer:</span>
                  {['Borobudur', 'Ubud Bali', 'Yogyakarta', 'Labuan Bajo', 'Tana Toraja'].map(tag => (
                    <a key={tag} href="#explore" style={{
                      fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none',
                      color: C.mid, background: C.cream2, border: `1px solid ${C.border}`,
                      padding: '4px 12px', borderRadius: '999px', transition: 'all 0.15s ease',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = C.terra; e.currentTarget.style.borderColor = C.terra }}
                      onMouseLeave={e => { e.currentTarget.style.background = C.cream2; e.currentTarget.style.color = C.mid; e.currentTarget.style.borderColor = C.border }}
                    >{tag}</a>
                  ))}
                </div>
              </div>

              {/* RIGHT: Showcase card — single tall featured destination */}
              <div style={{ position: 'relative', transform: 'translateY(-72px)' }}>
                <div style={{
                  borderRadius: '28px', overflow: 'hidden',
                  height: '520px', position: 'relative',
                  boxShadow: '0 28px 72px rgba(26,14,6,0.28)',
                  border: '4px solid rgba(255,255,255,0.92)',
                  outline: `2px solid ${C.border}`,
                }}>
                  <img
                    src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=85"
                    alt="Ubud, Bali"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {/* Bottom info overlay */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(20,10,3,0.82))',
                    padding: '40px 24px 24px',
                  }}>
                    <span style={{ color: C.gold, fontSize: '0.66rem', fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase' }}>✦ Destinasi Unggulan</span>
                    <div style={{ color: 'white', fontSize: '1.55rem', fontWeight: 900, fontFamily: 'var(--font-serif)', lineHeight: 1.2, marginTop: '4px' }}>Ubud, Bali</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <span style={{ color: C.gold, fontSize: '0.82rem', letterSpacing: '1px' }}>★★★★★</span>
                      <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>4.8 · 3.100+ ulasan</span>
                    </div>
                  </div>
                </div>

                {/* Floating verified badge — top right */}
                <div style={{
                  position: 'absolute', top: '20px', right: '-18px',
                  background: 'white', borderRadius: '16px', padding: '10px 16px',
                  boxShadow: '0 8px 28px rgba(26,14,6,0.16)', display: 'flex', alignItems: 'center', gap: '8px',
                  border: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: '1.2rem' }}>✅</span>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: C.dark }}>Provider Terverifikasi</div>
                    <div style={{ fontSize: '0.65rem', color: C.muted }}>120+ penyedia lokal</div>
                  </div>
                </div>

                {/* Floating review badge — bottom left */}
                <div style={{
                  position: 'absolute', bottom: '-52px', left: '-18px',
                  background: 'white', borderRadius: '16px', padding: '11px 16px',
                  boxShadow: '0 8px 28px rgba(26,14,6,0.16)',
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '3px' }}>
                    {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: C.gold, fontSize: '0.82rem' }}>{s}</span>)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: C.muted }}><b style={{ color: C.dark }}>10.000+</b> ulasan positif</div>
                </div>
              </div>
            </div>
          </div>
        </header>


        {/* ═══ MARQUEE STRIP ══════════════════════════ */}
        <div style={{ background: C.terra, padding: '14px 0', overflow: 'hidden', borderTop: `3px solid ${C.terraD}` }}>
          <div className="mq-track">
            {[...marqueItems, ...marqueItems].map((item, i) => (
              <span key={i} style={{
                color: 'rgba(255,255,255,0.9)', fontSize: '0.82rem', fontWeight: 700,
                padding: '0 28px', whiteSpace: 'nowrap', letterSpacing: '0.5px',
                borderRight: '1px solid rgba(255,255,255,0.18)',
              }}>{item}</span>
            ))}
          </div>
        </div>


        {/* ═══ DESTINATIONS ════════════════════════════ */}
        <section id="explore" style={{ background: '#fff', padding: '80px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
              <div>
                <Chip>Destinasi Pilihan</Chip>
                <Heading sub="Permata budaya nusantara yang wajib Anda kunjungi">
                  Jelajahi <em style={{ fontStyle: 'italic', color: C.terra }}>Nusantara</em>
                </Heading>
              </div>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
              {filters.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  padding: '6px 18px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700,
                  cursor: 'pointer', border: 'none', transition: 'all 0.15s ease',
                  background: activeFilter === f ? C.terra : 'white',
                  color: activeFilter === f ? 'white' : C.mid,
                  boxShadow: activeFilter === f ? '0 4px 14px rgba(196,83,26,0.3)' : `0 0 0 1.5px ${C.border}`,
                }}>{f}</button>
              ))}
              <Link to="/login" style={{ marginLeft: 'auto', color: C.terra, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>Lihat Semua →</Link>
            </div>

            {/* Bento grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gridTemplateRows: '280px 240px', gap: '12px' }}>
              <DestCard d={destinations[0]} tall />
              {destinations.slice(1, 5).map((d, i) => <DestCard key={i} d={d} />)}
            </div>
          </div>
        </section>


        {/* ═══ FEATURES ════════════════════════════════ */}
        <section style={{ background: C.cream, backgroundImage: batikUrl, padding: '80px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <Chip color={C.green} bg="rgba(29,79,50,0.09)">Fitur Unggulan</Chip>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.6rem', fontWeight: 900, color: C.dark, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: '10px' }}>
                Satu Platform, <em style={{ fontStyle: 'italic', color: C.terra }}>Segalanya Ada</em>
              </h2>
              <p style={{ color: C.muted, fontSize: '0.98rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
                Dari perencanaan hingga kenangan — ArahLoka hadir di setiap langkah perjalanan budaya Anda.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              {features.map((f, i) => <FeatureCard key={i} f={f} />)}
            </div>
          </div>
        </section>


        {/* ═══ STATS + CULTURE HIGHLIGHT ══════════════ */}
        <section style={{ background: C.green, padding: '0' }}>
          {/* Stats band */}
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '52px 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0' }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  textAlign: 'center', padding: '12px 20px',
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                }}>
                  <div style={{ fontSize: '3.2rem', fontWeight: 900, fontFamily: 'var(--font-serif)', color: C.goldL, lineHeight: 1, marginBottom: '8px' }}>{s.n}</div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Culture quote strip */}
          <div style={{
            background: 'rgba(0,0,0,0.18)', padding: '22px 40px', textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)', letterSpacing: '0.3px' }}>
              "Budaya adalah jiwa bangsa. Menjelajahinya berarti mengenal diri sendiri."
            </p>
          </div>
        </section>


        {/* ═══ EVENTS ══════════════════════════════════ */}
        <section id="events" style={{ background: '#fff', padding: '80px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <Chip>Acara & Festival</Chip>
                <Heading sub="Jangan lewatkan festival budaya nusantara terdekat">
                  Festival <em style={{ fontStyle: 'italic', color: C.terra }}>Mendatang</em>
                </Heading>
              </div>
              <Link to="/login" style={{ color: C.terra, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>Semua Acara →</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              {events.slice(0, 6).map((ev, i) => <EventCard key={i} ev={ev} />)}
            </div>
          </div>
        </section>


        {/* ═══ PROVIDER PROMO ══════════════════════════ */}
        <section style={{ background: C.cream, backgroundImage: batikUrl, padding: '72px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center' }}>
              <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '380px' }}>
                <img src="https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=700&q=80" alt="Yogyakarta" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(29,79,50,0.88) 0%, rgba(29,79,50,0.2) 60%, transparent 100%)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '28px',
                }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>Penyedia Wisata</div>
                  <div style={{ color: 'white', fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-serif)' }}>120+ Provider Bergabung</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.84rem', marginTop: '4px' }}>Dari Sabang sampai Merauke</div>
                </div>
              </div>

              <div>
                <Chip color={C.green} bg="rgba(29,79,50,0.09)">Untuk Travel Provider</Chip>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 900, color: C.dark, lineHeight: 1.15, letterSpacing: '-1px', marginBottom: '16px' }}>
                  Jadikan Bisnis Wisata<br/><em style={{ fontStyle: 'italic', color: C.green }}>Anda Berkembang</em>
                </h2>
                <p style={{ color: C.muted, fontSize: '0.97rem', lineHeight: 1.75, marginBottom: '28px' }}>
                  Daftarkan bisnis wisata budaya Anda di ArahLoka dan jangkau ribuan wisatawan dari seluruh Indonesia. Kelola paket, booking, dan ulasan dalam satu dashboard.
                </p>
                {['Jangkau 10.000+ wisatawan aktif', 'Dashboard manajemen lengkap', 'Verifikasi dan kepercayaan terjamin', 'Tanpa biaya pendaftaran'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{ fontSize: '0.88rem', color: C.mid, fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
                  <Link to="/register" style={{
                    background: C.green, color: 'white', padding: '12px 28px', borderRadius: '999px',
                    fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(29,79,50,0.3)',
                  }}>Daftar sebagai Provider</Link>
                  <a href="#" style={{
                    color: C.green, padding: '12px 22px', borderRadius: '999px',
                    fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
                    border: `1.5px solid ${C.green}`,
                  }}>Pelajari Lebih →</a>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ═══ TESTIMONIALS ════════════════════════════ */}
        <section id="community" style={{ background: C.paper, padding: '80px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '44px' }}>
              <Chip>Cerita Penjelajah</Chip>
              <Heading sub="Kesan nyata dari para wisatawan budaya ArahLoka" center>
                Apa Kata <em style={{ fontStyle: 'italic', color: C.terra }}>Mereka?</em>
              </Heading>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {testimonials.map((t, i) => (
                <div key={i} style={{
                  background: 'white', borderRadius: '20px', padding: '28px',
                  border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(26,14,6,0.05)',
                }}>
                  <div style={{ marginBottom: '14px' }}>
                    {[...Array(t.rating)].map((_, j) => <span key={j} style={{ color: C.gold, fontSize: '0.9rem' }}>★</span>)}
                  </div>
                  <p style={{ color: C.mid, fontSize: '0.95rem', lineHeight: 1.75, marginBottom: '22px', fontStyle: 'italic' }}>
                    "{t.comment}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '18px', borderTop: `1px solid ${C.border}` }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${C.terra}, ${C.gold})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: '0.8rem', color: 'white', flexShrink: 0,
                    }}>{t.initials}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: C.dark, fontSize: '0.9rem' }}>{t.name}</div>
                      <div style={{ color: C.muted, fontSize: '0.75rem' }}>📍 {t.city}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ═══ FINAL CTA ═══════════════════════════════ */}
        <section style={{
          background: C.terra, backgroundImage: batikUrl,
          padding: '96px 0', textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}/>
          <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 40px', position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.28)',
              color: 'white', padding: '4px 16px', borderRadius: '999px',
              fontSize: '0.67rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: '22px',
            }}>Bergabung Sekarang — Gratis!</div>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
              fontWeight: 900, color: 'white', letterSpacing: '-1.5px', lineHeight: 1.12, marginBottom: '18px',
            }}>
              Mulai Perjalanan Budaya<br/>
              <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.82)' }}>Indonesia Anda Hari Ini</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '40px' }}>
              Bergabung dengan 10.000+ penjelajah budaya dan temukan pengalaman autentik dari 34 provinsi nusantara.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                background: 'white', color: C.terra, padding: '14px 38px', borderRadius: '999px',
                fontWeight: 800, fontSize: '0.98rem', textDecoration: 'none',
                boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
              }}>Daftar Gratis Sekarang</Link>
              <Link to="/login" style={{
                color: 'rgba(255,255,255,0.82)', padding: '14px 32px', borderRadius: '999px',
                fontWeight: 600, fontSize: '0.98rem', textDecoration: 'none',
                border: '1.5px solid rgba(255,255,255,0.3)',
              }}>Sudah punya akun? Masuk</Link>
            </div>
          </div>
        </section>


        {/* ═══ FOOTER ══════════════════════════════════ */}
        <footer style={{ background: C.dark, padding: '72px 0 36px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 1.6fr', gap: '40px', marginBottom: '56px' }}>

              {/* Brand */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '16px' }}>
                  <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke={C.gold} strokeWidth="2.5"/>
                    <path d="M20 6V12M20 28V34M6 20H12M28 20H34" stroke={C.gold} strokeWidth="2" strokeLinecap="round"/>
                    <path d="M20 12L23 20L20 28L17 20L20 12Z" fill={C.gold}/>
                    <circle cx="20" cy="20" r="3" fill={C.dark}/>
                  </svg>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-serif)', letterSpacing: '-0.5px' }}>ArahLoka</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.845rem', lineHeight: 1.78, maxWidth: '240px', marginBottom: '24px' }}>
                  Platform perjalanan budaya Indonesia yang menghubungkan wisatawan dengan destinasi dan cerita autentik nusantara.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['IG', 'TW', 'YT', 'TK'].map((s, i) => (
                    <a key={i} href="#" style={{
                      width: '32px', height: '32px', borderRadius: '50%', textDecoration: 'none',
                      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.38)', fontSize: '0.68rem', fontWeight: 700,
                    }}>{s}</a>
                  ))}
                </div>
              </div>

              {[
                { title: 'Jelajahi', links: ['Destinasi', 'Paket Wisata', 'Itinerary Planner', 'Festival Budaya'] },
                { title: 'Komunitas', links: ['Journey Studio', 'Community Stories', 'Leaderboard', 'Tentang Kami'] },
                { title: 'Bantuan', links: ['FAQ', 'Pusat Bantuan', 'Kebijakan Privasi', 'Hubungi Kami'] },
              ].map((col, i) => (
                <div key={i}>
                  <div style={{ fontSize: '0.67rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.26)', marginBottom: '18px' }}>{col.title}</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px' }}>
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <a href="#" style={{ color: 'rgba(255,255,255,0.36)', fontSize: '0.845rem', textDecoration: 'none' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.36)'}
                        >{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Newsletter */}
              <div>
                <div style={{ fontSize: '0.67rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.26)', marginBottom: '18px' }}>Newsletter</div>
                <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.82rem', lineHeight: 1.65, marginBottom: '14px' }}>
                  Dapatkan update destinasi & festival terbaru langsung ke inbox Anda.
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input type="email" placeholder="Email kamu" style={{
                    flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '10px 12px', color: 'white', fontSize: '0.82rem', outline: 'none', minWidth: 0,
                  }}/>
                  <button style={{
                    background: C.terra, color: 'white', border: 'none',
                    borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                  }}>→</button>
                </div>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.78rem' }}>
                © 2026 ArahLoka. Dibuat dengan ❤️ untuk Indonesia
              </p>
              <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: '0.72rem' }}>
                Temukan Nusantara · Lestarikan Budaya · Jelajahi Bersama
              </p>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}


/* ═══ SUB-COMPONENTS ════════════════════════════════ */

function HeroPhoto({ src, label, radius }) {
  const [h, setH] = useState(false)
  return (
    <div style={{ borderRadius: radius, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      <img src={src} alt={label} style={{
        width: '100%', height: '100%', objectFit: 'cover', display: 'block',
        transform: h ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
      }}/>
      <div style={{
        position: 'absolute', bottom: '10px', left: '10px',
        background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(6px)',
        color: 'white', fontSize: '0.7rem', fontWeight: 700,
        padding: '4px 10px', borderRadius: '999px', letterSpacing: '0.3px',
      }}>📍 {label}</div>
    </div>
  )
}

function DestCard({ d, tall = false }) {
  const [h, setH] = useState(false)
  const navigate = useNavigate()
  return (
    <div style={{ gridRow: tall ? 'span 2' : undefined, borderRadius: '20px', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
      onClick={() => navigate('/login')}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      <img src={d.img} alt={d.name} style={{
        width: '100%', height: '100%', objectFit: 'cover', display: 'block',
        transform: h ? 'scale(1.06)' : 'scale(1)',
        transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)',
      }}/>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(26,14,6,0.88) 0%, rgba(26,14,6,0.15) 55%, transparent 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: tall ? '24px' : '18px',
      }}>
        <div style={{
          display: 'inline-block', alignSelf: 'flex-start',
          background: 'rgba(196,144,48,0.88)', color: '#1A0E06',
          padding: '2px 9px', borderRadius: '999px',
          fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px',
        }}>{d.cat}</div>
        <div style={{ fontSize: tall ? '1.55rem' : '1.05rem', fontWeight: 900, color: 'white', fontFamily: 'var(--font-serif)', lineHeight: 1.1, marginBottom: '4px' }}>{d.name}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.62)' }}>📍 {d.loc}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.72)', fontWeight: 700 }}>
            <span style={{ color: '#F5C742' }}>★</span> {d.rating} ({d.rev})
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ f }) {
  const [h, setH] = useState(false)
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: 'white', borderRadius: '18px', padding: '26px 24px',
      border: `1px solid ${h ? 'rgba(196,83,26,0.2)' : 'rgba(232,213,184,0.7)'}`,
      boxShadow: h ? '0 12px 32px rgba(196,83,26,0.1)' : '0 2px 8px rgba(26,14,6,0.04)',
      transform: h ? 'translateY(-3px)' : 'none',
      transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)', cursor: 'default',
      display: 'flex', gap: '16px', alignItems: 'flex-start',
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
        background: h ? 'rgba(196,83,26,0.09)' : 'rgba(232,213,184,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
        transition: 'background 0.2s ease',
      }}>{f.icon}</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: C.terra, opacity: 0.45, letterSpacing: '1px' }}>{f.n}</span>
          <span style={{ fontWeight: 800, fontSize: '0.92rem', color: C.dark }}>{f.title}</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: C.muted, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
      </div>
    </div>
  )
}

function EventCard({ ev }) {
  const [h, setH] = useState(false)
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: 'white', borderRadius: '18px', overflow: 'hidden',
      border: `1px solid ${C.border}`,
      boxShadow: h ? '0 16px 40px rgba(26,14,6,0.1)' : '0 2px 8px rgba(26,14,6,0.05)',
      transform: h ? 'translateY(-3px)' : 'none',
      transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)', cursor: 'pointer',
    }}>
      <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
        <img src={ev.img} alt={ev.title} style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          transform: h ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.5s ease',
        }}/>
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          background: C.terra, color: 'white',
          padding: '5px 10px', borderRadius: '10px', textAlign: 'center',
          fontWeight: 900, fontSize: '0.72rem', lineHeight: 1.25,
        }}>
          {ev.day}<br/><span style={{ fontWeight: 600, opacity: 0.82 }}>{ev.month}</span>
        </div>
      </div>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: C.dark, marginBottom: '4px', lineHeight: 1.35 }}>{ev.title}</div>
        <div style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '10px' }}>📍 {ev.loc}</div>
        <span style={{
          display: 'inline-block', background: 'rgba(196,83,26,0.08)',
          color: C.terra, padding: '3px 10px', borderRadius: '999px',
          fontSize: '0.64rem', fontWeight: 700, border: `1px solid rgba(196,83,26,0.14)`,
        }}>{ev.cat}</span>
      </div>
    </div>
  )
}
