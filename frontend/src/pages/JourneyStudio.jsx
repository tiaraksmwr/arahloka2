import { useState, useEffect } from 'react'
import axios from 'axios'
import { DashboardLayout } from './RoleDashboards'

const getFullImageUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  const backendUrl = import.meta.env.VITE_API_URL.replace('/api', '')
  return `${backendUrl}${url}`
}

const StarRating = ({ rating, setRating, editable = true }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        onClick={() => editable && setRating(star)}
        style={{
          cursor: editable ? 'pointer' : 'default',
          fontSize: '1.1rem',
          color: star <= rating ? 'var(--accent)' : '#d1d5db',
          transition: 'var(--transition)'
        }}
      >★</span>
    ))}
  </div>
)

const JourneyStudio = () => {
  const [activeTab, setActiveTab] = useState('memory')
  const [userBookings, setUserBookings] = useState([])
  const user = JSON.parse(localStorage.getItem('user') || '{}')

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
    <DashboardLayout
      title="Journey Studio"
      subtitle="Simpan kenangan perjalanan budaya Anda dan bagikan kisah autentik bersama komunitas penjelajah nusantara."
      role={user.role}
    >
      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div className="studio-tabs">
          {[
            { id: 'memory', label: 'Memory Lane', icon: '📸' },
            { id: 'story', label: 'Community Story', icon: '📖' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`studio-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === 'memory' && <MemoryLane user={user} bookings={userBookings} />}
        {activeTab === 'story' && <StoryChallenge user={user} bookings={userBookings} />}
      </div>
    </DashboardLayout>
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
    if (imageFile) formData.append('image', imageFile)

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Create Form */}
      <div style={{
        background: 'white', borderRadius: '24px', padding: '32px',
        border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)',
        maxWidth: '760px', margin: '0 auto', width: '100%'
      }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '24px' }}>Buat Kartu Kenangan Baru</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pilih Trip</label>
              <select value={form.booking_id} onChange={handleBookingChange} className="input">
                <option value="">-- Pilih Trip Selesai --</option>
                {bookings.filter(b => b.status === 'accepted').map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Destinasi</label>
              <input type="text" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required className="input" placeholder="e.g. Borobudur" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Judul Kenangan</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="input" placeholder="e.g. Senja di Pelataran Candi" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Rating</label>
              <div style={{ paddingTop: '10px' }}>
                <StarRating rating={form.rating} setRating={(r) => setForm({ ...form, rating: r })} />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Catatan Kenangan</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} required rows="3" className="input" style={{ resize: 'none' }} placeholder="Tuliskan momen paling berkesan..." />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Foto Perjalanan</label>
            <input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" style={{ fontSize: '0.82rem', color: 'var(--text-gray)' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            <button type="submit" disabled={saving || !user.id} className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
              {saving ? 'Menyimpan...' : 'Simpan ke Koleksi 📸'}
            </button>
            <button type="button" onClick={() => { setForm({ booking_id: '', destination: '', title: '', rating: 5, content: '' }); setImageFile(null) }} className="btn btn-ghost" style={{ padding: '12px 20px' }}>
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* My Cards */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--primary-light)' }}>
          Koleksi Kartu Saya
        </h3>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-gray)', padding: '48px' }}>Memuat koleksi...</p>
        ) : myCards.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-gray)', padding: '48px' }}>Belum ada kartu kenangan.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {myCards.map(card => (
              <div key={card.id} className="memory-card">
                {card.image_url && (
                  <div className="memory-card-img">
                    <img
                      src={getFullImageUrl(card.image_url)}
                      alt={card.title}
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
                <div className="memory-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>📍 {card.destination}</span>
                    <StarRating rating={card.rating} editable={false} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '6px', lineHeight: 1.3 }}>{card.title}</div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-gray)', fontStyle: 'italic', lineHeight: 1.6, flex: 1 }}>"{card.content}"</p>
                  <div style={{ marginTop: '12px', fontSize: '0.68rem', color: 'var(--text-light)', textAlign: 'right' }}>
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
    if (imageFile) formData.append('image', imageFile)

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
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
      {/* Stories Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Challenge Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-deep) 100%)',
          borderRadius: '20px', padding: '28px 32px', color: 'white'
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.7, marginBottom: '8px' }}>
            Community Challenge
          </div>
          <h3 style={{ color: 'white', fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '6px' }}>
            Community Story Challenge
          </h3>
          <div style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '10px' }}>
            TEMA: KEAJAIBAN BUDAYA LOKAL
          </div>
          <p style={{ opacity: 0.88, lineHeight: 1.7, fontSize: '0.92rem' }}>
            Bagikan pengalaman autentik Anda. Cerita terbaik akan mendapatkan apresiasi dan menjadi inspirasi bagi penjelajah lainnya!
          </p>
        </div>

        {loading ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--text-gray)' }}>Memuat inspirasi...</p>
        ) : stories.map(story => (
          <div key={story.id} style={{
            background: 'white', borderRadius: '20px', padding: '28px',
            border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h4 style={{ color: 'var(--primary)', fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-serif)', marginBottom: '4px' }}>{story.title}</h4>
                <span style={{ color: 'var(--text-gray)', fontWeight: 700, fontSize: '0.82rem' }}>📍 {story.destination}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.92rem' }}>{story.user_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{new Date(story.created_at).toLocaleDateString('id-ID')}</div>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <StarRating rating={story.rating} editable={false} />
            </div>

            <p style={{ lineHeight: 1.85, color: 'var(--text-dark)', fontSize: '1rem', whiteSpace: 'pre-line' }}>
              {story.content}
            </p>

            {story.image_url && (
              <div style={{ marginTop: '20px', borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <img
                  src={getFullImageUrl(story.image_url)}
                  style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
                  alt={story.title}
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '20px' }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-gray)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>❤️ Suka</button>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-gray)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>💬 Diskusi</button>
            </div>
          </div>
        ))}
      </div>

      {/* Write Story Form */}
      <div style={{ position: 'sticky', top: '88px', height: 'fit-content' }}>
        <div style={{
          background: 'white', borderRadius: '24px', padding: '28px',
          border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)'
        }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '20px' }}>Tulis Kisah Anda</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pilih Booking</label>
              <select value={form.booking_id} onChange={handleBookingChange} className="input">
                <option value="">-- Pilih Trip --</option>
                {bookings.filter(b => b.status === 'accepted').map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Destinasi</label>
              <input type="text" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required className="input" placeholder="Lokasi..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Judul Kisah</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="input" placeholder="Judul yang menarik..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Rating</label>
              <div style={{ paddingTop: '8px' }}>
                <StarRating rating={form.rating} setRating={(r) => setForm({ ...form, rating: r })} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Isi Cerita</label>
              <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} required rows="6" className="input" style={{ resize: 'none' }} placeholder="Bagikan pengalaman unik Anda..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Upload Foto</label>
              <input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }} />
            </div>
            <button type="submit" disabled={submitting || !user.id} className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '4px' }}>
              {submitting ? 'Mengirim...' : 'Kirim Kisah 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default JourneyStudio
