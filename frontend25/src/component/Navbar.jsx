import React from 'react'
import { FiChevronDown } from 'react-icons/fi'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="nav-left">
          <a href="#" className="logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M4 12L10 4L20 6L14 14L4 12Z" fill="#5B21B6" />
            </svg>
            <span className="logo-text">Project25</span>
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
          <button className="login-btn">Log in</button>
          <button className="signup-btn">Sign up</button>
        </div>
      </div>
    </header>
  )
}
