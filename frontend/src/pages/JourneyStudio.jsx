import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const getFullImageUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  const backendUrl = import.meta.env.VITE_API_URL.replace('/api', '')
  return `${backendUrl}${url}`
}

const StarRating = ({ rating, setRating, editable = true }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => editable && setRating(star)}
          style={{
            cursor: editable ? 'pointer' : 'default',
            fontSize: '1.25rem',
            color: star <= rating ? 'var(--warning)' : '#d1d5db',
            transition: 'var(--transition)'
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

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

const JourneyStudio = () => {
  const [activeTab, setActiveTab] = useState('memory')
  const [userBookings, setUserBookings] = useState([])
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  useEffect(() => {
    if (user.id && user.role === 'tourist') {
      fetchUserBookings()
    }
  }, [user.id])

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUserBookings(response.data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
    }
  }

  return (
    <div className="app">
      <nav className="navbar-wrapper glass scrolled">
        <div className="navbar-container">
          <Link to="/" className="nav-logo"><Logo /></Link>
          <div className="nav-links">
            <Link to={user.role === 'tourist' ? '/tourist' : user.role === 'travel_provider' ? '/provider' : '/admin'}>Dashboard</Link>
            <Link to="/journey-studio" className="active">Journey Studio</Link>
          </div>
          <div className="nav-actions">
            {user.id ? (
              <span className="text-gray" style={{ fontWeight: 700 }}>{user.name}</span>
            ) : (
              <Link to="/login" className="btn btn-primary">Login</Link>
            )}
          </div>
        </div>
      </nav>

      <section className="section-padding" style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="text-center mb-12">
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Journey Studio</h1>
            <p className="text-gray" style={{ fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>Simpan kenangan perjalanan Anda dan bagikan cerita budaya bersama komunitas penjelajah nusantara.</p>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            {[
              { id: 'memory', label: 'Memory Lane', icon: '📸' },
              { id: 'story', label: 'Community Story', icon: '📖' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ background: activeTab === tab.id ? 'var(--primary)' : 'white' }}
              >
                <span className="mr-2">{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          <div className="animate-fade-in" style={{ minHeight: '500px' }}>
            {activeTab === 'memory' && <MemoryLane user={user} bookings={userBookings} />}
            {activeTab === 'story' && <StoryChallenge user={user} bookings={userBookings} />}
          </div>
        </div>
      </section>
    </div>
  )
}

const MemoryLane = ({ user, bookings }) => {
  const [form, setForm] = useState({ booking_id: '', destination: '', title: '', rating: 5, content: '' })
  const [imageFile, setImageFile] = useState(null)
  const [myCards, setMyCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchMyCards()
  }, [user.id])

  const fetchMyCards = async () => {
    if (!user.id) {
      setLoading(false)
      return
    }
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/memory-cards/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMyCards(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching my cards:', err)
      setLoading(false)
    }
  }

  const handleBookingChange = (e) => {
    const bookingId = e.target.value
    const selected = bookings.find(b => b.id.toString() === bookingId)
    if (selected) {
      setForm({ ...form, booking_id: bookingId, destination: selected.location, title: selected.title })
    } else {
      setForm({ ...form, booking_id: '', destination: '', title: '' })
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user.id) return alert('Login sebagai turis untuk menyimpan kartu kenangan.')
    
    setSaving(true)
    const formData = new FormData()
    formData.append('booking_id', form.booking_id)
    formData.append('destination', form.destination)
    formData.append('title', form.title)
    formData.append('rating', form.rating)
    formData.append('content', form.content)
    if (imageFile) {
      formData.append('image', imageFile)
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post(`${import.meta.env.VITE_API_URL}/memory-cards`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Memory Lane Card berhasil disimpan.')
      setForm({ booking_id: '', destination: '', title: '', rating: 5, content: '' })
      setImageFile(null)
      fetchMyCards()
    } catch (err) {
      alert('Gagal menyimpan memory card')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1" style={{ gap: '4rem' }}>
      <div className="card p-8" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h3 className="mb-6">Buat Kartu Kenangan Baru</h3>
        <form onSubmit={handleSave} className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Pilih Trip</label>
              <select value={form.booking_id} onChange={handleBookingChange} className="input">
                <option value="">-- Pilih Trip Selesai --</option>
                {bookings.filter(b => b.status === 'accepted').map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Destinasi</label>
              <input type="text" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required className="input" placeholder="e.g. Borobudur" />
            </div>
          </div>
          
          <div className="grid grid-cols-1" style={{ gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Judul Kenangan</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="input" placeholder="e.g. Senja di Pelataran Candi" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Rating</label>
              <div style={{ paddingTop: '8px' }}><StarRating rating={form.rating} setRating={(r) => setForm({ ...form, rating: r })} /></div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Catatan Kenangan</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} required rows="3" className="input" style={{ resize: 'none' }} placeholder="Tuliskan momen paling berkesan..."></textarea>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Foto Perjalanan</label>
            <input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" style={{ fontSize: '0.8rem' }} />
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={saving || !user.id} className="btn btn-primary" style={{ flex: 1, padding: '1rem' }}>
              {saving ? 'Menyimpan...' : 'Simpan ke Koleksi 📸'}
            </button>
            <button type="button" onClick={() => { setForm({ booking_id: '', destination: '', title: '', rating: 5, content: '' }); setImageFile(null); }} className="btn btn-outline" style={{ padding: '1rem' }}>Reset</button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="mb-8" style={{ borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem' }}>Koleksi Kartu Saya</h3>
        {loading ? <p>Memuat koleksi...</p> : myCards.length === 0 ? <p className="text-gray text-center p-12">Belum ada kartu kenangan.</p> : (
          <div className="grid grid-cols-4 gap-6">
            {myCards.map(card => (
              <div key={card.id} className="card overflow-hidden flex flex-col">
                {card.image_url && (
                  <div style={{ height: '180px', overflow: 'hidden' }}>
                    <img 
                      src={getFullImageUrl(card.image_url)} 
                      className="w-full h-full" 
                      style={{ objectFit: 'cover' }}
                      alt={card.title} 
                      onError={(e) => e.target.style.display = 'none'} 
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>📍 {card.destination}</span>
                    <StarRating rating={card.rating} editable={false} />
                  </div>
                  <h4 className="mb-2" style={{ fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{card.title}</h4>
                  <p className="text-gray" style={{ fontSize: '0.85rem', fontStyle: 'italic', lineHeight: '1.6' }}>"{card.content}"</p>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', fontSize: '0.7rem', color: 'var(--text-light)', textAlign: 'right' }}>
                    {new Date(card.created_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const StoryChallenge = ({ user, bookings }) => {
  const [form, setForm] = useState({ booking_id: '', destination: '', title: '', content: '', rating: 5 })
  const [imageFile, setImageFile] = useState(null)
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/story-challenges`)
      setStories(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching stories:', err)
      setLoading(false)
    }
  }

  const handleBookingChange = (e) => {
    const bookingId = e.target.value
    const selected = bookings.find(b => b.id.toString() === bookingId)
    if (selected) {
      setForm({ ...form, booking_id: bookingId, destination: selected.location, title: `Kisah di ${selected.title}` })
    } else {
      setForm({ ...form, booking_id: '', destination: '', title: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user.id) return alert('Login sebagai turis untuk membagikan cerita.')
    
    setSubmitting(true)
    const formData = new FormData()
    formData.append('booking_id', form.booking_id)
    formData.append('destination', form.destination)
    formData.append('title', form.title)
    formData.append('rating', form.rating)
    formData.append('content', form.content)
    if (imageFile) {
      formData.append('image', imageFile)
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post(`${import.meta.env.VITE_API_URL}/story-challenges`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('Cerita berhasil dikirim ke Community Story Challenge.')
      setForm({ booking_id: '', destination: '', title: '', content: '', rating: 5 })
      setImageFile(null)
      fetchStories()
    } catch (err) {
      alert('Gagal mengirim cerita')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '3rem' }}>
      <div className="grid gap-8">
        <div className="card p-8" style={{ background: 'var(--secondary)', color: 'white' }}>
          <h3 className="mb-2" style={{ color: 'white' }}>Community Story Challenge</h3>
          <h4 className="mb-4" style={{ color: 'var(--primary)', fontWeight: 800 }}>TEMA: KEAJAIBAN BUDAYA LOKAL</h4>
          <p style={{ opacity: 0.9, lineHeight: '1.7' }}>Bagikan pengalaman autentik Anda. Cerita terbaik akan mendapatkan apresiasi dan menjadi inspirasi bagi penjelajah lainnya!</p>
        </div>
        
        {loading ? <p>Memuat inspirasi...</p> : stories.map(story => (
          <div key={story.id} className="card p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="mb-1" style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 800 }}>{story.title}</h4>
                <span className="text-gray" style={{ fontWeight: 700, fontSize: '0.85rem' }}>📍 {story.destination}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: 'var(--secondary)' }}>{story.user_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{new Date(story.created_at).toLocaleDateString('id-ID')}</div>
              </div>
            </div>
            
            <div className="mb-4"><StarRating rating={story.rating} editable={false} /></div>
            
            <p style={{ lineHeight: '1.8', color: 'var(--text-dark)', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>{story.content}</p>
            
            {story.image_url && (
              <div className="mt-8 overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src={getFullImageUrl(story.image_url)} 
                  className="w-full"
                  style={{ maxHeight: '450px', objectFit: 'cover' }} 
                  alt={story.title} 
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t flex gap-6">
              <button style={{ background: 'none', border: 'none', color: 'var(--text-gray)', fontWeight: 700, cursor: 'pointer' }}>❤️ Suka</button>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-gray)', fontWeight: 700, cursor: 'pointer' }}>💬 Diskusi</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: 'sticky', top: '100px' }}>
        <div className="card p-8">
          <h3 className="mb-6">Tulis Kisah Anda</h3>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Pilih Booking</label>
              <select value={form.booking_id} onChange={handleBookingChange} className="input">
                <option value="">-- Pilih Trip --</option>
                {bookings.filter(b => b.status === 'accepted').map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Destinasi & Judul</label>
              <div className="grid gap-2">
                <input type="text" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required className="input" placeholder="Lokasi..." />
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="input" placeholder="Judul kisah..." />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Rating</label>
              <div style={{ paddingTop: '8px' }}><StarRating rating={form.rating} setRating={(r) => setForm({ ...form, rating: r })} /></div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Isi Cerita</label>
              <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} required rows="6" className="input" style={{ resize: 'none' }} placeholder="Bagikan pengalaman unik Anda..."></textarea>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 700 }}>Upload Foto</label>
              <input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" style={{ fontSize: '0.8rem' }} />
            </div>
            <button type="submit" disabled={submitting || !user.id} className="btn btn-primary w-full" style={{ padding: '1rem' }}>
              {submitting ? 'Mengirim...' : 'Kirim Kisah 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default JourneyStudio
