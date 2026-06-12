import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { DashboardLayout } from './RoleDashboards'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=70'
const statusLabel = { pending: 'Menunggu', accepted: 'Diterima', rejected: 'Ditolak' }

const BookingSaya = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
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

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)
  const tabs = [
    { id: 'all', label: 'Semua' },
    { id: 'pending', label: 'Menunggu' },
    { id: 'accepted', label: 'Diterima' },
    { id: 'rejected', label: 'Ditolak' },
  ]

  return (
    <DashboardLayout
      title="Booking Saya"
      subtitle="Pantau status dan detail seluruh pemesanan perjalanan budayamu."
      role="tourist"
    >
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={filter === tab.id ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ padding: '7px 16px', fontSize: '0.82rem' }}
          >
            {tab.label}
            {tab.id !== 'all' && ` (${bookings.filter(b => b.status === tab.id).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-gray)' }}>Memuat booking...</div>
      ) : filtered.length === 0 ? (
        <div className="db-section" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-gray)' }}>
          Belum ada booking{filter !== 'all' ? ` dengan status "${statusLabel[filter]}"` : ''}.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(booking => (
            <div key={booking.id} className="db-section" style={{ display: 'flex', gap: '16px', padding: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <img
                src={booking.image_url || FALLBACK_IMG}
                alt={booking.title}
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG }}
                style={{ width: '110px', height: '90px', objectFit: 'cover', borderRadius: '12px', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-dark)' }}>{booking.title}</span>
                  <span className={`badge badge-${booking.status}`}>{statusLabel[booking.status]}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-gray)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>📍 {booking.location}</span>
                  <span>📅 {booking.travel_date}</span>
                  <span>👥 {booking.participants} orang</span>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--accent-dark)', marginTop: '6px' }}>Rp {booking.price.toLocaleString('id-ID')}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => navigate(`/packages/${booking.package_id}`)}
                  className="btn btn-outline"
                  style={{ padding: '7px 16px', fontSize: '0.8rem' }}
                >
                  Lihat Paket
                </button>
                <button
                  onClick={() => navigate(`/trip-planner/${booking.id}`)}
                  disabled={booking.status === 'rejected'}
                  className="btn btn-primary"
                  style={{ padding: '7px 16px', fontSize: '0.8rem' }}
                >
                  Persiapan Trip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export default BookingSaya
