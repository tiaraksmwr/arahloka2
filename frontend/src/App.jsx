import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import PendingApproval from './pages/PendingApproval'
import SuperadminDashboard from './pages/SuperadminDashboard'
import { TouristDashboard, ProviderDashboard } from './pages/RoleDashboards'

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
      </Routes>
    </Router>
  )
}

export default App
