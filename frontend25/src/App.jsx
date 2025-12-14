import "./App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './component/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgetPassword from './pages/ForgetPassword'
import NotFound from './pages/NotFound'
import StDashboard from './pages/stdashboard'
import StProfile from './pages/stprofile'
import CoDashboard from './pages/codashboard'
import CoProfile from './pages/coprofile'
import Courses from "./pages/courses";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppContent() {
  const location = useLocation()
  const hideNavbarRoutes = ['/login', '/signup', '/forget-password', '/stdashboard', '/stprofile', '/codashboard', '/coprofile']
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname)

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/stdashboard" element={<ProtectedRoute><StDashboard /></ProtectedRoute>} />
        <Route path="/stprofile" element={<ProtectedRoute><StProfile /></ProtectedRoute>} />
        <Route path="/codashboard" element={<ProtectedRoute><CoDashboard /></ProtectedRoute>} />
        <Route path="/coprofile" element={<ProtectedRoute><CoProfile /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
