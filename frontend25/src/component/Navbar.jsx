import React from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../assets/logo.png'

export default function Navbar() {
  const navigate = useNavigate()

  const logoVariants = {
    hidden: { opacity: 0, y: -30, rotate: -180 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotate: 0,
      transition: { duration: 0.8, type: "spring", damping: 8, stiffness: 200 }
    }
  }

  const textVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6 }
    }
  }

  const rightVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6 }
    }
  }

  const navLinksVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const navItemVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  }

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="nav-left">
          <motion.a 
            href="/" 
            className="logo"
            variants={logoVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.img 
              src={logo} 
              alt="Placify" 
              width="28" 
              height="28"
              variants={logoVariants}
            />
            <motion.span 
              className="logo-text"
              variants={textVariants}
              initial="hidden"
              animate="visible"
            >
              Placify
            </motion.span>
          </motion.a>
        </div>

        <nav className="nav-center" aria-label="Main navigation">
          <motion.ul 
            className="nav-links"
            variants={navLinksVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.li variants={navItemVariants}>
              <button className="nav-item">Internships <FiChevronDown className="chev"/></button>
            </motion.li>
            <motion.li variants={navItemVariants}>
              <button className="nav-item">Platforms <FiChevronDown className="chev"/></button>
            </motion.li>
            <motion.li variants={navItemVariants}>
              <button className="nav-item">Tools & Education <FiChevronDown className="chev"/></button>
            </motion.li>
            <motion.li variants={navItemVariants}>
              <button className="nav-item">About Us <FiChevronDown className="chev"/></button>
            </motion.li>
            <motion.li variants={navItemVariants}>
              <button className="nav-item">Partners</button>
            </motion.li>
          </motion.ul>
        </nav>

        <motion.div 
          className="nav-right"
          variants={rightVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button 
            className="login-btn" 
            onClick={() => navigate('/login')}
            variants={rightVariants}
            whileHover={{ scale: 1.05 }}
          >
            Log in
          </motion.button>
          <motion.button 
            className="signup-btn" 
            onClick={() => navigate('/signup')}
            variants={rightVariants}
            whileHover={{ scale: 1.05 }}
          >
            Sign up
          </motion.button>
        </motion.div>
      </div>
    </header>
  )
}
