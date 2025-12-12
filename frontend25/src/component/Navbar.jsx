import React from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="nav-left">
          <a href="/" className="logo">
            <img src={logo} alt="Placify" width="28" height="28" />
            <span className="logo-text">Placify</span>
          </a>
        </div>

        <nav className="nav-center" aria-label="Main navigation">
          <ul className="nav-links">
            <li><button className="nav-item">Internships <FiChevronDown className="chev"/></button></li>
            <li><button className="nav-item">Platforms <FiChevronDown className="chev"/></button></li>
            <li><button className="nav-item">Tools & Education <FiChevronDown className="chev"/></button></li>
            <li><button className="nav-item">About Us <FiChevronDown className="chev"/></button></li>
            <li><button className="nav-item">Partners</button></li>
          </ul>
        </nav>

        <div className="nav-right">
          {isAuthenticated ? (
            <>
              <span className="text-gray-700 mr-4">
                {user?.profile?.fullName} ({user?.userType})
              </span>
              <button className="login-btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="login-btn" onClick={() => navigate('/login')}>Log in</button>
              <button className="signup-btn" onClick={() => navigate('/signup')}>Sign up</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
