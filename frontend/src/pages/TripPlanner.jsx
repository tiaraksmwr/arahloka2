import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { DashboardLayout } from './RoleDashboards'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=70'
const statusLabel = { pending: 'Menunggu', accepted: 'Diterima', rejected: 'Ditolak' }

const TripPlanner = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  useEffect(() => {
    if (user.role !== 'tourist') {
      navigate('/login')
    } else {
      fetchData()
    }
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(res.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setLoading(false)
    }
  }

  // Trip yang bisa dipersiapkan = yang tidak ditolak
  const trips = bookings.filter(b => b.status !== 'rejected')

  return (
    <DashboardLayout
      title="Trip Planner"
      subtitle="Siapkan itinerary, jadwal, dan checklist untuk setiap perjalananmu."
      role="tourist"
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-gray)' }}>Memuat trip...</div>
      ) : trips.length === 0 ? (
        <div className="db-section" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-gray)' }}>
          Belum ada trip yang bisa dipersiapkan. Booking paket dulu, yuk!
          <div style={{ marginTop: '16px' }}>
            <button onClick={() => navigate('/destinasi')} className="btn btn-primary" style={{ padding: '8px 20px' }}>Jelajah Destinasi</button>
          </div>
        </div>
      ) : (
        <div className="pkg-grid">
          {trips.map(trip => (
            <div key={trip.id} className="pkg-card">
              <div className="pkg-img-wrap">
                <img
                  src={trip.image_url || FALLBACK_IMG}
                  alt={trip.title}
                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG }}
                />
                <span className="pkg-loc-badge">📍 {trip.location}</span>
              </div>
              <div className="pkg-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="pkg-title" style={{ margin: 0 }}>{trip.title}</span>
                  <span className={`badge badge-${trip.status}`}>{statusLabel[trip.status]}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', marginBottom: '14px' }}>
                  📅 {trip.travel_date} · 👥 {trip.participants} orang
                </div>
                <button
                  onClick={() => navigate(`/trip-planner/${trip.id}`)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '9px', fontSize: '0.85rem', marginTop: 'auto' }}
                >
                  Buka Trip Planner →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export default TripPlanner
