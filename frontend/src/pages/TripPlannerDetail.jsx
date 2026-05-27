import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

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

  // Checklist management state
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
      
      // Optimistic update
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
      setData(prev => ({
        ...prev,
        checklist: [...prev.checklist, response.data]
      }))
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
      setData(prev => ({
        ...prev,
        checklist: prev.checklist.filter(item => item.id !== itemId)
      }))
    } catch (err) {
      alert('Gagal menghapus barang')
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen"><p>Memuat rencana perjalanan...</p></div>
  if (!data) return <div className="container p-12 text-center"><h3>Data tidak ditemukan.</h3></div>

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
    <div className="app">
      <nav className="navbar-wrapper glass scrolled">
        <div className="navbar-container">
          <Link to="/" className="nav-logo"><Logo /></Link>
          <div className="nav-links">
            <Link to="/tourist">Dashboard</Link>
          </div>
          <div className="nav-actions">
            <span style={{ fontWeight: 800 }}>{user.name}</span>
          </div>
        </div>
      </nav>

      <section className="container section-padding" style={{ padding: '40px 0 100px 0' }}>
        <button onClick={() => navigate('/tourist')} className="btn btn-outline mb-8" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          ← Kembali ke Dashboard
        </button>

        <div className="grid" style={{ gridTemplateColumns: '320px 1fr', gap: '3rem' }}>
          {/* Sidebar */}
          <div className="animate-fade-in">
            <div className="card overflow-hidden mb-8">
              <img src={booking.image_url} alt={booking.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div className="p-6">
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>Trip Anda</span>
                <h3 className="mb-4 mt-1" style={{ fontSize: '1.25rem' }}>{booking.title}</h3>
                <div className="flex flex-col gap-2" style={{ fontSize: '0.85rem' }}>
                  <p>📍 {booking.location}</p>
                  <p>📅 {booking.travel_date}</p>
                  <p>⏱️ {booking.duration}</p>
                  <p>👥 {booking.participants} Orang</p>
                </div>
              </div>
            </div>

            <div className="card p-6 mb-8" style={{ borderLeft: `6px solid ${progressPercent === 100 ? 'var(--success)' : 'var(--warning)'}` }}>
              <h4 className="mb-4">Persiapan Barang</h4>
              <div style={{ height: '12px', background: '#eee', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: progressPercent === 100 ? 'var(--success)' : 'var(--primary)', transition: 'width 0.8s ease' }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{progressPercent}% Siap</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>{checkedItems}/{totalItems} Item</span>
              </div>
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="btn btn-primary w-full"
              style={{ padding: '1rem' }}
            >
              {generating ? 'Menyusun Rencana...' : plans.length > 0 ? '🔄 Perbarui Itinerary' : '✨ Susun Itinerary Otomatis'}
            </button>
          </div>

          {/* Main Content */}
          <div className="animate-fade-in">
            <div className="card p-8 mb-8">
              <div className="flex justify-between items-center mb-8">
                <h3>Rencana Perjalanan</h3>
                <div className="flex items-center gap-4">
                  {!isEditing && plans.length > 0 && (
                    <button onClick={handleStartEdit} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>✏️ Edit</button>
                  )}
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                      onClick={() => { setActiveTab('daily'); setIsEditing(false); }} 
                      className={`btn ${activeTab === 'daily' ? 'btn-primary' : ''}`}
                      style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: activeTab === 'daily' ? 'var(--primary)' : 'transparent', color: activeTab === 'daily' ? 'white' : 'var(--text-gray)', boxShadow: 'none' }}
                    >Harian</button>
                    <button 
                      onClick={() => { setActiveTab('time'); setIsEditing(false); }} 
                      className={`btn ${activeTab === 'time' ? 'btn-primary' : ''}`}
                      style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: activeTab === 'time' ? 'var(--primary)' : 'transparent', color: activeTab === 'time' ? 'white' : 'var(--text-gray)', boxShadow: 'none' }}
                    >Waktu</button>
                  </div>
                </div>
              </div>
              
              {plans.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed">
                  <p className="text-gray">Klik tombol "Susun Itinerary" untuk mendapatkan rencana perjalanan berbasis AI.</p>
                </div>
              ) : isEditing ? (
                <div className="flex flex-col gap-4">
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input"
                    style={{ minHeight: '400px', resize: 'vertical', lineHeight: '1.8' }}
                  />
                  <div className="flex gap-4">
                    <button onClick={handleSavePlan} disabled={savingPlan} className="btn btn-primary" style={{ flex: 1 }}>{savingPlan ? 'Menyimpan...' : 'Simpan Plan'}</button>
                    <button onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ flex: 1 }}>Batal</button>
                  </div>
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre-line', lineHeight: '2', color: 'var(--text-dark)', fontSize: '1.1rem' }}>
                  {activeTab === 'daily' ? dailyPlan?.content : timePlan?.content}
                </div>
              )}
            </div>

            <div className="card p-8">
              <div className="flex justify-between items-center mb-8">
                <h3>Checklist Barang</h3>
                <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                  {showAddForm ? 'Batal' : '+ Item Baru'}
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddChecklist} className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gray-50 rounded-2xl animate-fade-in">
                  <input type="text" placeholder="Nama Barang" value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name: e.target.value})} required className="input" />
                  <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="input">
                    <option>Dokumen</option>
                    <option>Barang Pribadi</option>
                    <option>Perlengkapan Perjalanan</option>
                    <option>Budaya dan Etika Lokal</option>
                    <option>Tambahan Pribadi</option>
                  </select>
                  <button type="submit" className="btn btn-primary">Tambah</button>
                </form>
              )}

              {checklist.length === 0 ? (
                <p className="text-gray text-center p-8">Checklist belum tersedia.</p>
              ) : (
                Object.keys(groupedChecklist).map(category => (
                  <div key={category} className="mb-8 last:mb-0">
                    <h4 className="mb-4 pb-2" style={{ borderBottom: '2px solid var(--primary-light)', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{category}</h4>
                    <div className="grid gap-3">
                      {groupedChecklist[category].map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4 flex-1">
                            <input 
                              type="checkbox" 
                              checked={!!item.is_checked} 
                              onChange={() => toggleChecklist(item.id)}
                              style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', accentColor: 'var(--primary)' }}
                            />
                            {editingItemId === item.id ? (
                              <div className="flex gap-2 flex-1">
                                <input type="text" value={editItem.item_name} onChange={e => setEditItem({...editItem, item_name: e.target.value})} className="input" style={{ padding: '0.25rem 0.5rem' }} />
                                <button onClick={() => handleUpdateChecklist(item.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.7rem' }}>Ok</button>
                              </div>
                            ) : (
                              <span style={{ 
                                fontSize: '1rem', 
                                textDecoration: item.is_checked ? 'line-through' : 'none',
                                color: item.is_checked ? 'var(--text-light)' : 'var(--text-dark)',
                                fontWeight: item.is_checked ? 400 : 500
                              }}>{item.item_name}</span>
                            )}
                          </div>
                          
                          <div className="flex gap-4 ml-4 opacity-0 hover:opacity-100 transition-opacity" style={{ visibility: editingItemId === item.id ? 'visible' : 'inherit', opacity: editingItemId === item.id ? 1 : undefined }}>
                            {editingItemId !== item.id && (
                              <>
                                <button onClick={() => { setEditingItemId(item.id); setEditItem({ item_name: item.item_name, category: item.category }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>✏️</button>
                                <button onClick={() => handleDeleteChecklist(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>🗑️</button>
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
      </section>
    </div>
  )
}

export default TripPlannerDetail
