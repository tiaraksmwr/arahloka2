import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { DashboardLayout } from './RoleDashboards'

const roleLabel = { tourist: 'Wisatawan', travel_provider: 'Penyedia Wisata', superadmin: 'Superadmin' }

const PengaturanProfil = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!user.id) {
      navigate('/login')
    } else {
      setForm({ name: user.name || '', email: user.email || '', password: '' })
    }
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/profile`,
        { name: form.name, email: form.email, password: form.password },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Simpan ulang user di localStorage (pertahankan field lain seperti status)
      const updated = { ...user, ...res.data }
      localStorage.setItem('user', JSON.stringify(updated))
      setForm({ ...form, password: '' })
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memperbarui profil.' })
    } finally {
      setSaving(false)
    }
  }

  const initials = (form.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <DashboardLayout
      title="Pengaturan Profil"
      subtitle="Kelola informasi akun dan keamananmu."
      role={user.role}
    >
      <div style={{ maxWidth: '560px' }}>
        <div className="db-section" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0
          }}>{initials}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{form.name}</div>
            <span className="badge badge-secondary" style={{ marginTop: '4px' }}>{roleLabel[user.role] || user.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="db-section" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '18px' }}>Informasi Akun</h3>

          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-gray)', marginBottom: '6px' }}>Nama Lengkap</label>
          <input type="text" name="name" className="input" value={form.name} onChange={handleChange} required style={{ marginBottom: '16px' }} />

          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-gray)', marginBottom: '6px' }}>Email</label>
          <input type="email" name="email" className="input" value={form.email} onChange={handleChange} required style={{ marginBottom: '16px' }} />

          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-gray)', marginBottom: '6px' }}>Password Baru</label>
          <input type="password" name="password" className="input" value={form.password} onChange={handleChange} placeholder="Kosongkan jika tidak ingin mengubah" style={{ marginBottom: '20px' }} />

          {message && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600,
              background: message.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
              color: message.type === 'success' ? '#166534' : '#991b1b'
            }}>{message.text}</div>
          )}

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default PengaturanProfil
