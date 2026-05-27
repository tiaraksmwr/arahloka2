import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

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

  if (loading) return <div className="app" style={{ padding: '2rem' }}>Memuat...</div>
  if (!data) return <div className="app" style={{ padding: '2rem' }}>Data tidak ditemukan.</div>

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
      <nav className="navbar">
        <Link to="/" className="logo">ArahLoka</Link>
        <div className="nav-links">
          <Link to="/tourist" className="btn-login">Dashboard</Link>
        </div>
      </nav>

      <section className="section" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <button onClick={() => navigate('/tourist')} style={{ background: 'none', border: 'none', color: 'var(--burnt-orange)', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ← Kembali ke Dashboard
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Sidebar */}
          <div className="planner-sidebar">
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}>
              <img src={booking.image_url} alt={booking.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{booking.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>📍 {booking.location}</p>
                <div style={{ fontSize: '0.85rem', color: '#444' }}>
                  <p style={{ marginBottom: '0.4rem' }}>📅 Tanggal: {booking.travel_date}</p>
                  <p style={{ marginBottom: '0.4rem' }}>⏱️ Durasi: {booking.duration}</p>
                  <p style={{ marginBottom: '0.4rem' }}>👥 Peserta: {booking.participants}</p>
                  <p style={{ marginBottom: '0.4rem' }}>🔔 Status: <span style={{ fontWeight: 'bold', color: booking.status === 'accepted' ? 'var(--deep-green)' : booking.status === 'rejected' ? '#dc2626' : '#92400e' }}>{booking.status?.toUpperCase()}</span></p>
                </div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow)', borderLeft: `6px solid ${progressPercent === 100 ? 'var(--deep-green)' : '#f59e0b'}` }}>
              <h4 style={{ marginBottom: '1rem' }}>Status Persiapan</h4>
              <div style={{ height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: progressPercent === 100 ? 'var(--deep-green)' : 'var(--burnt-orange)', transition: 'width 0.3s' }}></div>
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{checkedItems} dari {totalItems} barang siap</p>
              <span style={{ 
                display: 'inline-block', 
                marginTop: '1rem', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '50px', 
                fontSize: '0.75rem', 
                fontWeight: 'bold',
                backgroundColor: progressPercent === 100 ? '#d1fae5' : '#fef3c7',
                color: progressPercent === 100 ? '#065f46' : '#92400e'
              }}>
                {progressPercent === 100 ? 'SUDAH LENGKAP' : 'HARUS DILENGKAPI'}
              </span>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <button 
                onClick={handleGenerate}
                disabled={generating}
                className="btn-register"
                style={{ width: '100%', border: 'none', cursor: 'pointer', padding: '1rem' }}
              >
                {generating ? 'Memproses...' : plans.length > 0 ? 'Perbarui Itinerary' : 'Buat Itinerary & Checklist'}
              </button>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fdfbf0', borderRadius: '12px', border: '1px dashed #ccc' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--deep-green)' }}>💡 Etika Lokal</h4>
              <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>
                Hormati aturan lokal, berpakaian sopan di tempat ibadah, dan ikuti arahan pemandu selama perjalanan budaya ini.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="planner-main">
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem' }}>Rencana Perjalanan</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {!isEditing && plans.length > 0 && (
                    <button 
                      onClick={handleStartEdit}
                      style={{ 
                        background: 'none', 
                        border: '1px solid var(--burnt-orange)', 
                        color: 'var(--burnt-orange)', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}
                    >
                      ✏️ Edit Itinerary
                    </button>
                  )}
                  <div style={{ display: 'flex', background: '#f8f9fa', borderRadius: '8px', padding: '0.3rem' }}>
                    <button 
                      onClick={() => { setActiveTab('daily'); setIsEditing(false); }} 
                      style={{ 
                        padding: '0.5rem 1rem', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        background: activeTab === 'daily' ? 'white' : 'transparent',
                        boxShadow: activeTab === 'daily' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                        fontWeight: activeTab === 'daily' ? 'bold' : 'normal'
                      }}
                    >Harian</button>
                    <button 
                      onClick={() => { setActiveTab('time'); setIsEditing(false); }} 
                      style={{ 
                        padding: '0.5rem 1rem', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        background: activeTab === 'time' ? 'white' : 'transparent',
                        boxShadow: activeTab === 'time' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                        fontWeight: activeTab === 'time' ? 'bold' : 'normal'
                      }}
                    >Waktu</button>
                  </div>
                </div>
              </div>
              
              {plans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                  <p>Belum ada rencana perjalanan. Klik "Buat Itinerary" untuk memulai.</p>
                </div>
              ) : isEditing ? (
                <div>
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{ 
                      width: '100%', 
                      minHeight: '300px', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      border: '1px solid #ddd',
                      lineHeight: '1.6',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button 
                      onClick={handleSavePlan}
                      disabled={savingPlan}
                      style={{ 
                        background: 'var(--deep-green)', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.6rem 1.2rem', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {savingPlan ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      style={{ 
                        background: '#eee', 
                        color: '#444', 
                        border: 'none', 
                        padding: '0.6rem 1.2rem', 
                        borderRadius: '8px', 
                        cursor: 'pointer'
                      }}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: '#444' }}>
                  {activeTab === 'daily' ? dailyPlan?.content : timePlan?.content}
                </div>
              )}
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.3rem' }}>Checklist Persiapan</h3>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  style={{ 
                    background: 'var(--deep-green)', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}
                >
                  {showAddForm ? 'Batal' : '+ Tambah Barang'}
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddChecklist} style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr auto' }}>
                  <input 
                    type="text" 
                    placeholder="Nama Barang" 
                    value={newItem.item_name} 
                    onChange={e => setNewItem({...newItem, item_name: e.target.value})}
                    required
                    style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  />
                  <select 
                    value={newItem.category} 
                    onChange={e => setNewItem({...newItem, category: e.target.value})}
                    style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                  >
                    <option>Dokumen</option>
                    <option>Barang Pribadi</option>
                    <option>Perlengkapan Perjalanan</option>
                    <option>Budaya dan Etika Lokal</option>
                    <option>Tambahan Pribadi</option>
                  </select>
                  <button type="submit" className="btn-register" style={{ border: 'none', cursor: 'pointer', padding: '0.6rem 1.2rem' }}>Simpan</button>
                </form>
              )}

              {checklist.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Belum ada checklist. Buat itinerary untuk mendapatkan saran otomatis atau tambahkan secara manual.</p>
              ) : (
                Object.keys(groupedChecklist).map(category => (
                  <div key={category} style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--burnt-orange)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>{category}</h4>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {groupedChecklist[category].map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }} className="checklist-item-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1 }}>
                            <input 
                              type="checkbox" 
                              checked={!!item.is_checked} 
                              onChange={() => toggleChecklist(item.id)}
                              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: 'var(--deep-green)' }}
                            />
                            {editingItemId === item.id ? (
                              <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                                <input 
                                  type="text" 
                                  value={editItem.item_name} 
                                  onChange={e => setEditItem({...editItem, item_name: e.target.value})}
                                  style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--burnt-orange)', flex: 1 }}
                                />
                                <select 
                                  value={editItem.category} 
                                  onChange={e => setEditItem({...editItem, category: e.target.value})}
                                  style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                  <option>Dokumen</option>
                                  <option>Barang Pribadi</option>
                                  <option>Perlengkapan Perjalanan</option>
                                  <option>Budaya dan Etika Lokal</option>
                                  <option>Tambahan Pribadi</option>
                                </select>
                              </div>
                            ) : (
                              <span style={{ 
                                fontSize: '0.95rem', 
                                textDecoration: item.is_checked ? 'line-through' : 'none',
                                color: item.is_checked ? '#888' : '#333'
                              }}>{item.item_name}</span>
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                            {editingItemId === item.id ? (
                              <>
                                <button onClick={() => handleUpdateChecklist(item.id)} style={{ background: 'var(--deep-green)', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Simpan</button>
                                <button onClick={() => setEditingItemId(null)} style={{ background: '#eee', color: '#444', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Batal</button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    setEditingItemId(item.id);
                                    setEditItem({ item_name: item.item_name, category: item.category });
                                  }}
                                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={() => handleDeleteChecklist(item.id)}
                                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                  🗑️
                                </button>
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
