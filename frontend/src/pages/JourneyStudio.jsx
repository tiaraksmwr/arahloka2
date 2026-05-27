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
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => editable && setRating(star)}
          style={{
            cursor: editable ? 'pointer' : 'default',
            fontSize: '1.5rem',
            color: star <= rating ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.2s'
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

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
      <nav className="navbar">
        <Link to="/" className="logo">ArahLoka</Link>
        <div className="nav-links">
          {user.id ? (
            <Link to={user.role === 'tourist' ? '/tourist' : user.role === 'travel_provider' ? '/provider' : '/admin'} className="btn-login">Dashboard</Link>
          ) : (
            <Link to="/login" className="btn-login">Login</Link>
          )}
        </div>
      </nav>

      <section className="section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--deep-green)', marginBottom: '0.5rem' }}>Journey Studio</h1>
          <p style={{ color: '#666' }}>ArahLoka Journey Studio membantu Anda menyimpan kenangan perjalanan dan membagikan cerita budaya bersama komunitas.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { id: 'memory', label: 'Memory Lane', icon: '📸' },
            { id: 'story', label: 'Community Story', icon: '📖' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '50px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                backgroundColor: activeTab === tab.id ? 'var(--burnt-orange)' : 'white',
                color: activeTab === tab.id ? 'white' : 'var(--text-dark)',
                boxShadow: 'var(--shadow)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <div style={{ minHeight: '500px' }}>
          {activeTab === 'memory' && <MemoryLane user={user} bookings={userBookings} />}
          {activeTab === 'story' && <StoryChallenge user={user} bookings={userBookings} />}
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
    <div style={{ display: 'grid', gap: '4rem' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: 'var(--shadow)', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--deep-green)' }}>Buat Kartu Kenangan Baru</h3>
        {!user.id && <p style={{ color: 'var(--burnt-orange)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Login sebagai turis untuk mulai mengoleksi kenangan perjalanan Anda.</p>}
        <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Hubungkan ke Booking (Opsional)</label>
              <select value={form.booking_id} onChange={handleBookingChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option value="">-- Pilih Trip Selesai --</option>
                {bookings.filter(b => b.status === 'accepted').map(b => (
                  <option key={b.id} value={b.id}>{b.title} ({b.travel_date})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Destinasi</label>
              <input type="text" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required placeholder="e.g. Borobudur" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Judul Kenangan</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Senja di Pelataran Candi" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Rating Pengalaman</label>
              <StarRating rating={form.rating} setRating={(r) => setForm({ ...form, rating: r })} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Catatan Kenangan</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} required rows="3" placeholder="Tuliskan momen paling berkesan dari perjalanan ini..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'none' }}></textarea>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Upload Gambar (Opsional)</label>
            <input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" style={{ width: '100%', padding: '0.5rem 0' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" disabled={saving || !user.id} className="btn-register" style={{ flex: 2, border: 'none', cursor: 'pointer' }}>
              {saving ? 'Menyimpan...' : 'Simpan ke Koleksi Saya'}
            </button>
            <button type="button" onClick={() => { setForm({ booking_id: '', destination: '', title: '', rating: 5, content: '' }); setImageFile(null); }} style={{ flex: 1, padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #ddd', background: 'none', cursor: 'pointer' }}>Reset</button>
          </div>
        </form>
      </div>

      <div>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--deep-green)', borderBottom: '2px solid var(--cream)', paddingBottom: '0.5rem' }}>Koleksi Kartu Saya</h3>
        {loading ? <p>Memuat koleksi...</p> : myCards.length === 0 ? <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Belum ada kartu kenangan. Mulai simpan momen perjalanan Anda!</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {myCards.map(card => (
              <div key={card.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow)', border: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
                {card.image_url && (
                  <img 
                    src={getFullImageUrl(card.image_url)} 
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }} 
                    alt={card.title} 
                    onError={(e) => e.target.style.display = 'none'} 
                  />
                )}
                <div style={{ padding: '1.25rem', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--burnt-orange)', fontWeight: 'bold', textTransform: 'uppercase' }}>{card.destination}</span>
                    <StarRating rating={card.rating} editable={false} />
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>{card.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', lineHeight: '1.5' }}>"{card.content}"</p>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', fontSize: '0.7rem', color: '#ccc', textAlign: 'right' }}>
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
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'start' }}>
      <div style={{ display: 'grid', gap: '2rem' }}>
        <div style={{ background: 'var(--deep-green)', color: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ marginBottom: '0.75rem', color: 'white' }}>Community Story Challenge</h3>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--burnt-orange)' }}>Theme: Cerita Budaya Paling Berkesan</h4>
          <p style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: '1.6' }}>Bagikan pengalaman unikmu saat berinteraksi dengan budaya lokal. Cerita terbaik akan mendapatkan apresiasi dari komunitas penjelajah ArahLoka!</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? <p>Memuat inspirasi...</p> : stories.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '3rem', background: 'white', borderRadius: '16px' }}>Belum ada cerita. Jadilah yang pertama berbagi!</p>
          ) : stories.map(story => (
            <div key={story.id} style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ color: 'var(--burnt-orange)', margin: '0 0 0.25rem 0', fontSize: '1.2rem' }}>{story.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'bold' }}>📍 {story.destination}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--deep-green)' }}>{story.user_name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#aaa' }}>{new Date(story.created_at).toLocaleDateString('id-ID')}</div>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}><StarRating rating={story.rating} editable={false} /></div>
              
              <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1rem', whiteSpace: 'pre-line' }}>{story.content}</p>
              
              {story.image_url && (
                <img 
                  src={getFullImageUrl(story.image_url)} 
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '12px', marginTop: '1.5rem' }} 
                  alt={story.title} 
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1.25rem', display: 'flex', gap: '1.5rem' }}>
                <button style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>❤️ <span>Suka</span></button>
                <button style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>💬 <span>Diskusi</span></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'sticky', top: '2rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--deep-green)' }}>Tulis Kisah Anda</h3>
          {!user.id && <p style={{ color: 'var(--burnt-orange)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Login sebagai turis untuk membagikan kisah budaya Anda.</p>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Pilih Booking (Opsional)</label>
              <select value={form.booking_id} onChange={handleBookingChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option value="">-- Pilih Trip Selesai --</option>
                {bookings.filter(b => b.status === 'accepted').map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Destinasi & Judul</label>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <input type="text" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required placeholder="Lokasi perjalanan..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Judul kisah Anda..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Rating Budaya</label>
              <StarRating rating={form.rating} setRating={(r) => setForm({ ...form, rating: r })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Isi Cerita</label>
              <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} required rows="6" placeholder="Ceritakan pengalaman unik Anda bersama budaya lokal..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'none' }}></textarea>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>Upload Gambar (Opsional)</label>
              <input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" style={{ width: '100%', padding: '0.5rem 0' }} />
            </div>
            <button type="submit" disabled={submitting || !user.id} className="btn-register" style={{ width: '100%', border: 'none', cursor: 'pointer', padding: '1rem' }}>
              {submitting ? 'Mengirim...' : 'Kirim ke Challenge'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default JourneyStudio
