import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const JourneyStudio = () => {
  const [activeTab, setActiveTab] = useState('memory')
  const [loading, setLoading] = useState(false)
  const [stories, setStories] = useState([])
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  useEffect(() => {
    if (activeTab === 'story') {
      fetchStories()
    }
  }, [activeTab])

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/journey-studio`)
      setStories(response.data.filter(item => item.type === 'story'))
    } catch (err) {
      console.error('Error fetching stories:', err)
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
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>Abadikan momen berkesan dan bagikan cerita perjalanan budaya Anda.</p>
        </div>

        <div style={{ background: '#fdfbf0', border: '1px dashed var(--burnt-orange)', padding: '1.5rem', borderRadius: '16px', marginBottom: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.95rem', color: '#444', marginBottom: '1rem' }}>
            ✨ <strong>Informasi:</strong> Itinerary dan checklist persiapan perjalanan kini tersedia melalui menu <strong>Persiapan Trip</strong> pada halaman Booking Saya.
          </p>
          <button 
            onClick={() => navigate(user.id ? '/tourist' : '/login')}
            style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '50px', 
              border: 'none', 
              background: 'var(--burnt-orange)', 
              color: 'white', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
          >
            Lihat Booking Saya
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          {['memory', 'story'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '50px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                backgroundColor: activeTab === tab ? 'var(--burnt-orange)' : 'white',
                color: activeTab === tab ? 'white' : 'var(--text-dark)',
                boxShadow: 'var(--shadow)',
                transition: 'all 0.3s'
              }}
            >
              {tab === 'memory' ? 'Memory Lane' : 'Story Challenge'}
            </button>
          ))}
        </div>

        <div style={{ minHeight: '500px' }}>
          {activeTab === 'memory' && <MemoryLane user={user} />}
          {activeTab === 'story' && <StoryChallenge user={user} stories={stories} refresh={fetchStories} />}
        </div>
      </section>
    </div>
  )
}

const MemoryLane = ({ user }) => {
  const [form, setForm] = useState({ destination: '', rating: 5, content: '', image_url: '' })
  const [saving, setSaving] = useState(false)

  const saveMemory = async () => {
    if (!user.id) return alert('Silakan login sebagai turis untuk menyimpan memory card.')
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${import.meta.env.VITE_API_URL}/journey-studio`, {
        type: 'memory',
        ...form
      }, { headers: { Authorization: `Bearer ${token}` } })
      alert('Memory card berhasil disimpan!')
    } catch (err) {
      alert('Gagal menyimpan memory card')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Memory Lane Card</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Destinasi</label>
          <input type="text" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} placeholder="e.g. Borobudur" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Rating (1-5)</label>
          <input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Catatan Kenangan</label>
          <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows="4" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'none' }}></textarea>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>URL Gambar (Opsional)</label>
          <input type="text" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
        </div>
        <button onClick={saveMemory} disabled={saving} className="btn-register" style={{ width: '100%', border: 'none', cursor: 'pointer' }}>
          {saving ? 'Menyimpan...' : 'Simpan Memory Card'}
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ 
          background: 'white', 
          width: '350px', 
          borderRadius: '20px', 
          overflow: 'hidden', 
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
          border: '1px solid #eee'
        }}>
          <div style={{ height: '200px', background: '#f0f0f0', overflow: 'hidden' }}>
            {form.image_url ? <img src={form.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Memory" /> : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>Photo Preview</div>
            )}
          </div>
          <div style={{ padding: '1.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-25px', right: '20px', background: 'var(--burnt-orange)', color: 'white', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', border: '4px solid white' }}>
              {form.rating}
            </div>
            <h4 style={{ color: 'var(--deep-green)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{form.destination || 'Nama Destinasi'}</h4>
            <p style={{ fontSize: '0.9rem', color: '#555', fontStyle: 'italic', lineHeight: '1.6' }}>"{form.content || 'Tuliskan kenangan indahmu di sini...'}"</p>
            <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#999', textAlign: 'right' }}>ArahLoka Memory Lane</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StoryChallenge = ({ user, stories, refresh }) => {
  const [form, setForm] = useState({ destination: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  const submitStory = async (e) => {
    e.preventDefault()
    if (!user.id) return alert('Silakan login sebagai turis untuk mengirim cerita.')
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${import.meta.env.VITE_API_URL}/journey-studio`, {
        type: 'story',
        ...form
      }, { headers: { Authorization: `Bearer ${token}` } })
      alert('Cerita Anda berhasil dikirim!')
      setForm({ destination: '', content: '' })
      refresh()
    } catch (err) {
      alert('Gagal mengirim cerita')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBottom: '1.5rem' }}>Community Story Challenge</h3>
        <div style={{ background: 'var(--deep-green)', color: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Theme: Cerita Budaya Paling Berkesan</h4>
          <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Bagikan pengalaman unikmu saat berinteraksi dengan budaya lokal. Cerita terbaik akan mendapatkan apresiasi dari komunitas!</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {stories.map(story => (
            <div key={story.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--burnt-orange)' }}>{story.destination}</h4>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>oleh {story.user_name}</span>
              </div>
              <p style={{ lineHeight: '1.6', color: '#444' }}>{story.content}</p>
              <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem', cursor: 'pointer' }}>❤️ Suka</button>
                <button style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem', cursor: 'pointer' }}>💬 Komentar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Kirim Cerita</h3>
          <form onSubmit={submitStory}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Judul atau Destinasi</label>
              <input type="text" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Isi Cerita</label>
              <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} required rows="6" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'none' }}></textarea>
            </div>
            <button type="submit" disabled={submitting} className="btn-register" style={{ width: '100%', border: 'none', cursor: 'pointer' }}>
              {submitting ? 'Mengirim...' : 'Kirim ke Challenge'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default JourneyStudio
