import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import PendingApproval from './pages/PendingApproval'
import SuperadminDashboard from './pages/SuperadminDashboard'
import { TouristDashboard, ProviderDashboard } from './pages/RoleDashboards'
import PackageDetail from './pages/PackageDetail'
import JourneyStudio from './pages/JourneyStudio'
import TripPlannerDetail from './pages/TripPlannerDetail'
import JelajahDestinasi from './pages/JelajahDestinasi'
import BookingSaya from './pages/BookingSaya'
import TripPlanner from './pages/TripPlanner'
import PengaturanProfil from './pages/PengaturanProfil'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/admin" element={<SuperadminDashboard />} />
        <Route path="/tourist" element={<TouristDashboard />} />
        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/packages/:id" element={<PackageDetail />} />
        <Route path="/journey-studio" element={<JourneyStudio />} />
        <Route path="/trip-planner/:bookingId" element={<TripPlannerDetail />} />
        <Route path="/destinasi" element={<JelajahDestinasi />} />
        <Route path="/bookings" element={<BookingSaya />} />
        <Route path="/trips" element={<TripPlanner />} />
        <Route path="/pengaturan" element={<PengaturanProfil />} />
      </Routes>
    </Router>
  )
}

export default App
