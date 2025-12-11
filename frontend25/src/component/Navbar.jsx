import React from 'react'
import { FiChevronDown } from 'react-icons/fi'
import logo from '../assets/logo.png'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="nav-left">
          <a href="#" className="logo">
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
          <button className="login-btn">Log in</button>
          <button className="signup-btn">Sign up</button>
        </div>
      </div>
    </header>
  )
}
