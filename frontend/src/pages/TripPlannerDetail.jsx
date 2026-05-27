import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const ArahLokaLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" stroke="#B8501C" strokeWidth="2.5"/>
      <path d="M20 6V12M20 28V34M6 20H12M28 20H34" stroke="#B8501C" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12L23 20L20 28L17 20L20 12Z" fill="#B8501C"/>
      <circle cx="20" cy="20" r="3" fill="white"/>
    </svg>
    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#231308', letterSpacing: '-0.5px', fontFamily: 'var(--font-serif)' }}>ArahLoka</span>
  </div>
)

const TripPlannerDetail = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('daily')
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [savingPlan, setSavingPlan] = useState(false)

  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ item_name: '', category: 'Tambahan Pribadi' })
  const [editingItemId, setEditingItemId] = useState(null)
  const [editItem, setEditItem] = useState({ item_name: '', category: '' })

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchTripData()
  }, [bookingId])

  const fetchTripData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/trip-planner/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching trip data:', err)
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${import.meta.env.VITE_API_URL}/trip-planner/${bookingId}/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchTripData()
    } catch (err) {
      alert('Gagal membuat planner')
    } finally {
      setGenerating(false)
    }
  }

  const handleStartEdit = () => {
    const plan = data.plans.find(p => p.plan_type === activeTab)
    if (!plan) {
      alert('Buat itinerary terlebih dahulu sebelum mengedit.')
      return
    }
    setEditContent(plan.content)
    setIsEditing(true)
  }

  const handleSavePlan = async () => {
    setSavingPlan(true)
    try {
      const token = localStorage.getItem('token')
      const plan = data.plans.find(p => p.plan_type === activeTab)
      await axios.put(`${import.meta.env.VITE_API_URL}/trip-planner/${bookingId}/plan`, {
        plan_type: activeTab,
        title: plan?.title || (activeTab === 'daily' ? 'Daily Itinerary' : 'Time Plan'),
        content: editContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIsEditing(false)
      alert('Itinerary berhasil diperbarui.')
      fetchTripData()
    } catch (err) {
      alert('Gagal memperbarui itinerary.')
    } finally {
      setSavingPlan(false)
    }
  }

  const toggleChecklist = async (itemId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${import.meta.env.VITE_API_URL}/trip-planner/checklist/${itemId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(prev => ({
        ...prev,
        checklist: prev.checklist.map(item =>
          item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
        )
      }))
    } catch (err) {
      alert('Gagal update checklist')
    }
  }

  const handleAddChecklist = async (e) => {
    e.preventDefault()
    if (!newItem.item_name) return
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/trip-planner/${bookingId}/checklist`, newItem, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(prev => ({ ...prev, checklist: [...prev.checklist, response.data] }))
      setNewItem({ item_name: '', category: 'Tambahan Pribadi' })
      setShowAddForm(false)
    } catch (err) {
      alert('Gagal menambah barang')
    }
  }

  const handleUpdateChecklist = async (itemId) => {
    if (!editItem.item_name) return
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${import.meta.env.VITE_API_URL}/trip-planner/checklist/${itemId}`, editItem, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(prev => ({
        ...prev,
        checklist: prev.checklist.map(item =>
          item.id === itemId ? { ...item, ...editItem } : item
        )
      }))
      setEditingItemId(null)
    } catch (err) {
      alert('Gagal update barang')
    }
  }

  const handleDeleteChecklist = async (itemId) => {
    if (!window.confirm('Hapus barang ini dari checklist?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${import.meta.env.VITE_API_URL}/trip-planner/checklist/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(prev => ({ ...prev, checklist: prev.checklist.filter(item => item.id !== itemId) }))
    } catch (err) {
      alert('Gagal menghapus barang')
    }
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ marginTop: '16px', color: 'var(--text-gray)', fontWeight: 600 }}>Memuat rencana perjalanan...</p>
    </div>
  )
  if (!data) return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <h3>Data tidak ditemukan.</h3>
    </div>
  )

  const { booking, plans, checklist } = data
  const dailyPlan = plans.find(p => p.plan_type === 'daily')
  const timePlan = plans.find(p => p.plan_type === 'time')

  const totalItems = checklist.length
  const checkedItems = checklist.filter(item => item.is_checked).length
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div style={{ background: 'var(--bg-subtle)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(253,250,245,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-light)',
        height: '68px',
        display: 'flex', alignItems: 'center',
        padding: '0 32px',
        justifyContent: 'space-between'
      }}>
        <Link to="/"><ArahLokaLogo /></Link>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link to="/tourist" style={{ color: 'var(--text-gray)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Dashboard</Link>
        </div>
        <span style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{user.name}</span>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 32px 80px' }}>
        <button
          onClick={() => navigate('/tourist')}
          className="btn btn-ghost"
          style={{ marginBottom: '24px', padding: '8px 16px', fontSize: '0.85rem' }}
        >
          ← Kembali ke Dashboard
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '28px' }}>
          {/* Sidebar */}
          <div className="animate-fade-in">
            {/* Trip Info Card */}
            <div style={{
              background: 'white', borderRadius: '20px', overflow: 'hidden',
              border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)',
              marginBottom: '16px'
            }}>
              <img
                src={booking.image_url || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=70'}
                alt={booking.title}
                style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Trip Anda</div>
                <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', marginBottom: '12px', lineHeight: 1.3 }}>{booking.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.84rem', color: 'var(--text-gray)' }}>
                  <p>📍 {booking.location}</p>
                  <p>📅 {booking.travel_date}</p>
                  <p>⏱️ {booking.duration}</p>
                  <p>👥 {booking.participants} Orang</p>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div style={{
              background: 'white', borderRadius: '16px', padding: '18px 20px',
              border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)',
              borderLeft: `4px solid ${progressPercent === 100 ? 'var(--success)' : 'var(--warning)'}`,
              marginBottom: '16px'
            }}>
              <h4 style={{ marginBottom: '12px', fontSize: '0.95rem' }}>Persiapan Barang</h4>
              <div className="progress-track" style={{ marginBottom: '8px' }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${progressPercent}%`,
                    background: progressPercent === 100 ? 'var(--success)' : 'var(--primary)'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>{progressPercent}% Siap</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{checkedItems}/{totalItems} Item</span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px' }}
            >
              {generating ? 'Menyusun Rencana...' : plans.length > 0 ? 'Perbarui Itinerary' : '✨ Susun Itinerary Otomatis'}
            </button>
          </div>

          {/* Main Content */}
          <div className="animate-fade-in">
            {/* Itinerary Section */}
            <div style={{
              background: 'white', borderRadius: '20px', padding: '24px',
              border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)' }}>Rencana Perjalanan</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {!isEditing && plans.length > 0 && (
                    <button onClick={handleStartEdit} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                      ✏️ Edit
                    </button>
                  )}
                  <div className="trip-tabs">
                    <button
                      onClick={() => { setActiveTab('daily'); setIsEditing(false) }}
                      className={`trip-tab ${activeTab === 'daily' ? 'active' : ''}`}
                    >Harian</button>
                    <button
                      onClick={() => { setActiveTab('time'); setIsEditing(false) }}
                      className={`trip-tab ${activeTab === 'time' ? 'active' : ''}`}
                    >Waktu</button>
                  </div>
                </div>
              </div>

              {plans.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '48px 24px',
                  background: 'var(--bg-surface)', borderRadius: '14px',
                  border: '2px dashed var(--border-light)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🗺️</div>
                  <p style={{ color: 'var(--text-gray)', fontSize: '0.92rem' }}>
                    Klik tombol "Susun Itinerary" untuk mendapatkan rencana perjalanan berbasis AI.
                  </p>
                </div>
              ) : isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input"
                    style={{ minHeight: '360px', resize: 'vertical', lineHeight: 1.8, fontFamily: 'var(--font-sans)' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleSavePlan} disabled={savingPlan} className="btn btn-primary" style={{ flex: 1 }}>
                      {savingPlan ? 'Menyimpan...' : 'Simpan Plan'}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="btn btn-ghost" style={{ flex: 1 }}>Batal</button>
                  </div>
                </div>
              ) : (
                <div style={{
                  whiteSpace: 'pre-line', lineHeight: 2,
                  color: 'var(--text-dark)', fontSize: '1rem',
                  minHeight: '200px'
                }}>
                  {activeTab === 'daily' ? dailyPlan?.content : timePlan?.content}
                </div>
              )}
            </div>

            {/* Checklist Section */}
            <div style={{
              background: 'white', borderRadius: '20px', padding: '24px',
              border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)' }}>Checklist Barang</h3>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="btn btn-outline"
                  style={{ padding: '6px 16px', fontSize: '0.82rem' }}
                >
                  {showAddForm ? 'Batal' : '+ Item Baru'}
                </button>
              </div>

              {showAddForm && (
                <form
                  onSubmit={handleAddChecklist}
                  className="animate-fade-in"
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px',
                    marginBottom: '20px', padding: '16px',
                    background: 'var(--bg-surface)', borderRadius: '14px',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <input
                    type="text"
                    placeholder="Nama Barang"
                    value={newItem.item_name}
                    onChange={e => setNewItem({...newItem, item_name: e.target.value})}
                    required
                    className="input"
                  />
                  <select
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value})}
                    className="input"
                  >
                    <option>Dokumen</option>
                    <option>Barang Pribadi</option>
                    <option>Perlengkapan Perjalanan</option>
                    <option>Budaya dan Etika Lokal</option>
                    <option>Tambahan Pribadi</option>
                  </select>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>Tambah</button>
                </form>
              )}

              {checklist.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-gray)', padding: '32px' }}>Checklist belum tersedia.</p>
              ) : (
                Object.keys(groupedChecklist).map(category => (
                  <div key={category} style={{ marginBottom: '24px' }}>
                    <div className="checklist-category-header">
                      <span>{category}</span>
                      <span style={{ fontWeight: 400, fontSize: '0.72rem', opacity: 0.7 }}>
                        {groupedChecklist[category].filter(i => i.is_checked).length}/{groupedChecklist[category].length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {groupedChecklist[category].map(item => (
                        <div key={item.id} className="checklist-item">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={!!item.is_checked}
                              onChange={() => toggleChecklist(item.id)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)', flexShrink: 0 }}
                            />
                            {editingItemId === item.id ? (
                              <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                <input
                                  type="text"
                                  value={editItem.item_name}
                                  onChange={e => setEditItem({...editItem, item_name: e.target.value})}
                                  className="input"
                                  style={{ padding: '4px 10px', flex: 1 }}
                                />
                                <button
                                  onClick={() => handleUpdateChecklist(item.id)}
                                  className="btn btn-primary"
                                  style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                                >Ok</button>
                              </div>
                            ) : (
                              <span style={{
                                fontSize: '0.95rem',
                                textDecoration: item.is_checked ? 'line-through' : 'none',
                                color: item.is_checked ? 'var(--text-light)' : 'var(--text-dark)',
                                fontWeight: item.is_checked ? 400 : 500
                              }}>{item.item_name}</span>
                            )}
                          </div>

                          <div className="checklist-item-actions">
                            {editingItemId !== item.id && (
                              <>
                                <button
                                  onClick={() => { setEditingItemId(item.id); setEditItem({ item_name: item.item_name, category: item.category }) }}
                                  className="checklist-action-btn"
                                >✏️</button>
                                <button
                                  onClick={() => handleDeleteChecklist(item.id)}
                                  className="checklist-action-btn"
                                >🗑️</button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripPlannerDetail
