// src/CompanyDashboard.jsx
import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Megaphone, Users, Newspaper, Target, Phone, MapPin, FileText, User, Download, Bell, Mail, X } from 'lucide-react';
import io from 'socket.io-client';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState("internships"); // internships | applicants | newsletters | profile | about
  const [theme, setTheme] = useState("light"); // light | dark
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [postedInternships, setPostedInternships] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [posting, setPosting] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showMicrotaskModal, setShowMicrotaskModal] = useState(false);
  const [microtaskForm, setMicrotaskForm] = useState({ title: '', type: 'task', instructions: '', dueDate: '' });
  const [microtaskQuestions, setMicrotaskQuestions] = useState([]);
  const [questionCount, setQuestionCount] = useState(4);
  const [microtaskMode, setMicrotaskMode] = useState('ai'); // 'ai' or 'manual'
  const [microtaskAssigning, setMicrotaskAssigning] = useState({ internshipId: null, studentId: null });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const socketRef = useRef(null);
  const notificationRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Remote",
    duration: "",
    stipend: "",
    description: "",
    requirements: "",
    skills: "",
    applicationDeadline: ""
  });
  const [showCreateNewsletter, setShowCreateNewsletter] = useState(false);
  const [nwTitle, setNwTitle] = useState('');
  const [nwSummary, setNwSummary] = useState('');
  const [nwContent, setNwContent] = useState('');
  const [nwDate, setNwDate] = useState('');
  const [creatingNewsletter, setCreatingNewsletter] = useState(false);
  const [editingNewsletterId, setEditingNewsletterId] = useState(null);
  const [showViewNewsletter, setShowViewNewsletter] = useState(false);
  const [viewNewsletter, setViewNewsletter] = useState(null);
  const { user } = useAuth();

  const lowercaseSearch = search.toLowerCase();

  // Fetch company internships
  const fetchInternships = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/internships/company/my-internships', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPostedInternships(data.internships);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all applicants across company's internships
  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/internships/company/my-internships', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Extract all applicants from all internships
        const allApplicants = [];
        data.internships.forEach(internship => {
          if (internship.applicants && internship.applicants.length > 0) {
            internship.applicants.forEach(applicant => {
              allApplicants.push({
                ...applicant,
                internshipTitle: internship.title,
                internshipId: internship._id
              });
            });
          }
        });
        
        setApplicants(allApplicants);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    }
  };

  // Fetch newsletters
  const fetchNewsletters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/newsletters/company/my-newsletters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNewsletters(data.newsletters);
      }
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Setup Socket.io and fetch initial data
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    console.log('Socket.io setup - userId:', userId, 'token:', token ? 'exists' : 'missing');
    
    if (userId && token) {
      // Connect to Socket.io server
      socketRef.current = io('http://localhost:5000');
      
      socketRef.current.on('connect', () => {
        console.log('Socket.io connected:', socketRef.current.id);
        // Register user after connection is established
        socketRef.current.emit('register', userId);
        console.log('Registered userId with socket:', userId);
      });
      
      // Listen for new notifications
      socketRef.current.on('newNotification', (notification) => {
        console.log('New notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png'
          });
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket.io disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error);
      });

      // Fetch initial notifications
      fetchNotifications();
      fetchInternships();
      fetchNewsletters();
      fetchApplicants();
    } else {
      console.warn('Cannot setup Socket.io: userId or token missing');
    }

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket');
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch on mount
  useState(() => {
    fetchInternships();
  }, []);

  const filteredInternships = useMemo(
    () =>
      postedInternships.filter((i) =>
        i.title.toLowerCase().includes(lowercaseSearch)
      ),
    [lowercaseSearch, postedInternships]
  );

  const handlePostInternship = async (e) => {
    e.preventDefault();
    setPosting(true);

    try {
      const token = localStorage.getItem('token');
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      
      const url = editingInternship 
        ? `http://localhost:5000/api/internships/${editingInternship._id}`
        : 'http://localhost:5000/api/internships';
      
      const method = editingInternship ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          skills: skillsArray
        })
      });

      if (response.ok) {
        alert(editingInternship ? 'Internship updated successfully!' : 'Internship posted successfully!');
        fetchInternships();
        setShowPostForm(false);
        setEditingInternship(null);
        setFormData({
          title: "",
          company: "",
          location: "",
          type: "Remote",
          duration: "",
          stipend: "",
          description: "",
          requirements: "",
          skills: "",
          applicationDeadline: ""
        });
        fetchInternships();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error posting internship:', error);
      alert('Failed to post internship. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleViewApplicants = (internship) => {
    setSelectedInternship(internship);
    setShowApplicantsModal(true);
  };

  const handleEditInternship = (internship) => {
    setEditingInternship(internship);
    setFormData({
      title: internship.title,
      company: internship.company,
      location: internship.location,
      type: internship.type,
      duration: internship.duration,
      stipend: internship.stipend,
      description: internship.description,
      requirements: internship.requirements || "",
      skills: internship.skills?.join(', ') || "",
      applicationDeadline: internship.applicationDeadline ? new Date(internship.applicationDeadline).toISOString().split('T')[0] : ""
    });
    setShowPostForm(true);
  };

  const handleViewProfile = (applicant) => {
    setSelectedApplicant(applicant);
    setShowProfileModal(true);
  };

  const filteredApplicants = useMemo(
    () =>
      applicants.filter(
        (a) =>
          (a.studentId?.profile?.fullName || a.studentId?.username || '').toLowerCase().includes(lowercaseSearch) ||
          a.internshipTitle.toLowerCase().includes(lowercaseSearch)
      ),
    [lowercaseSearch, applicants]
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== "internships" && tab !== "applicants") setSearch("");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const rootTheme =
    theme === "dark"
      ? "bg-slate-900 text-slate-100"
      : "bg-slate-50 text-slate-900";

  const cardTheme =
    theme === "dark"
      ? "bg-slate-800 border-slate-700"
      : "bg-white border-slate-200";

  return (
    <div className={`${rootTheme} min-h-screen`}>
      {/* NAVBAR */}
      <header className="border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Placify" className="w-8 h-8 object-contain" />
            <div className="font-semibold text-lg text-[#2b128f] md:text-xl">Placify</div>
          </div>

          {/* Hamburger Button - Mobile Only */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <nav className="hidden md:flex items-center gap-2 md:gap-4 text-sm md:text-base">
            {/* Tabs */}
            {["internships", "applicants", "newsletters", "about"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-3 py-1.5 rounded-full transition text-xs md:text-sm
                ${
                  activeTab === tab
                    ? "bg-[#443097] text-white"
                    : "hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}

            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`relative px-3 py-1.5 rounded-full transition text-xs md:text-sm
                ${
                  activeTab === "profile"
                    ? "bg-[#443097] text-white"
                    : "hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Profile
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </button>

              {showDropdown && (
                <div
                  className={`
                    absolute right-0 mt-1 w-48 
                    rounded-xl border shadow-lg z-50 transition
                    ${
                      theme === "light"
                        ? "bg-white border-slate-200 text-black"
                        : "bg-slate-800 border-slate-600 text-white"
                    }
                  `}
                >
                  <Link to="/coprofile">
                    <button
                      onClick={() => handleTabChange("profile")}
                      className={`
                        w-full text-left px-4 py-2 text-sm rounded-t-xl transition
                        ${
                          theme === "light"
                            ? "hover:bg-slate-100 text-black"
                            : "hover:bg-slate-700 text-white"
                        }
                      `}
                    >
                      Company Profile
                    </button>
                  </Link>

                  <button
                    onClick={() => handleTabChange("notifications")}
                    className={`
                      w-full text-left px-4 py-2 text-sm transition
                      ${
                        theme === "light"
                          ? "hover:bg-slate-100 text-black"
                          : "hover:bg-slate-700 text-white"
                      }
                    `}
                  >
                    Notifications
                  </button>

                  <Link to="/login">
                    <button
                      onClick={() => alert("Logged out")}
                      className={`
                        w-full text-left px-4 py-2 text-sm rounded-b-xl transition
                        ${
                          theme === "light"
                            ? "text-red-600 hover:bg-red-100"
                            : "text-red-400 hover:bg-red-900 hover:text-white"
                        }
                      `}
                    >
                      Logout
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* THEME BUTTON */}
            <button
              onClick={toggleTheme}
              className="ml-2 rounded-full border px-3 py-1.5 text-xs md:text-sm border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {theme === "light" ? "Dark Theme" : "Light Theme"}
            </button>
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700">
            <nav className="px-4 py-3 space-y-2">
              {["internships", "applicants", "newsletters", "about"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    handleTabChange(tab);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    activeTab === tab
                      ? "bg-[#443097] text-white"
                      : "hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              
              {/* Profile Section */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 space-y-2">
                <Link to="/coprofile" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                    Company Profile
                  </button>
                </Link>
                <button 
                  onClick={() => {
                    handleTabChange("notifications");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Notifications
                </button>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full text-left px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900">
                    Logout
                  </button>
                </Link>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full text-left px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                {theme === "light" ? <><Moon className="w-4 h-4" /> Dark Theme</> : <><Sun className="w-4 h-4" /> Light Theme</>}
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        {activeTab === "internships" && (
          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold md:text-2xl">
                My Posted Internships
              </h1>
              <button 
                onClick={() => setShowPostForm(true)}
                className="bg-[#443097] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#36217c] transition"
              >
                + Post New Internship
              </button>
            </div>

            {/* SEARCH */}
            <div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by internship title…"
                className="
                  w-full rounded-xl border border-slate-300 
                  bg-white text-black
                  dark:bg-white dark:text-black
                  px-4 py-2.5 text-sm shadow-sm outline-none 
                  focus:border-indigo-500 
                  focus:ring-2 focus:ring-[#443097] 
                  dark:border-slate-600 
                  dark:focus:ring-[#443097]
                "
              />
            </div>

            {/* INTERNSHIPS LIST */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#443097]"></div>
                <span className="ml-3 text-lg">Loading internships...</span>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(search.trim() === "" ? postedInternships : filteredInternships).map((internship) => (
                  <article
                    key={internship._id}
                    className={`rounded-2xl border p-4 shadow-sm ${cardTheme}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-sm font-semibold md:text-base flex-1">
                        {internship.title}
                      </h2>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          internship.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {internship.status}
                      </span>
                    </div>
                    <p
                      className={`text-xs md:text-sm ${
                        theme === "light" ? "text-slate-700" : "text-slate-500"
                      }`}
                    >
                      <span className="font-medium">{internship.applicants?.length || 0}</span> applicants
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        theme === "light" ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                    Posted: {new Date(internship.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleViewApplicants(internship)}
                      className="flex-1 bg-[#443097] text-white px-3 py-1.5 rounded-lg text-xs hover:bg-[#36217c]"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleEditInternship(internship)}
                      className="flex-1 border border-slate-300 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Edit
                    </button>
                  </div>
                </article>
              ))}
            </div>
            )}
          </section>
        )}

        {activeTab === "applicants" && (
          <section>
            <div className="mb-4">
              <h1 className="text-xl font-semibold md:text-2xl mb-4">
                Applicants
              </h1>

              {/* SEARCH */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or position…"
                className="
                  w-full rounded-xl border border-slate-300 
                  bg-white text-black
                  dark:bg-white dark:text-black
                  px-4 py-2.5 text-sm shadow-sm outline-none 
                  focus:border-indigo-500 
                  focus:ring-2 focus:ring-[#443097]
                "
              />
            </div>

            {/* APPLICANTS LIST */}
            <div className="space-y-3">
              {applicants.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No applicants yet. Post internships to receive applications!</p>
                </div>
              ) : (
                (search.trim() === "" ? applicants : filteredApplicants).map((applicant) => (
                  <article
                    key={`${applicant.studentId?._id}-${applicant.internshipId}`}
                    className={`rounded-xl border p-4 shadow-sm ${cardTheme} flex items-center justify-between`}
                  >
                    <div className="flex-1">
                      <h2 className="text-sm font-semibold md:text-base">
                        {applicant.studentId?.profile?.fullName || applicant.studentId?.username || 'Unknown'}
                      </h2>
                      <p className="text-xs text-[#443097] md:text-sm">
                        Applied for: {applicant.internshipTitle}
                      </p>
                      <p
                        className={`mt-1 text-xs ${
                          theme === "light" ? "text-slate-600" : "text-slate-400"
                        }`}
                      >
                        Applied: {new Date(applicant.appliedAt).toLocaleDateString()}
                      </p>
                      {applicant.studentId?.email && (
                        <p className="text-xs text-slate-500 mt-1">
                          📧 {applicant.studentId.email}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          applicant.status === "Shortlisted"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : applicant.status === "Accepted"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : applicant.status === "Rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {applicant.status}
                      </span>
                      <button 
                        onClick={() => handleViewProfile(applicant)}
                        className="bg-[#443097] text-white px-4 py-1.5 rounded-lg text-xs hover:bg-[#5a3ec4] flex items-center gap-1"
                      >
                        <User className="w-3 h-3" />
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          setMicrotaskAssigning({ internshipId: applicant.internshipId, studentId: applicant.studentId?._id });
                          setMicrotaskForm({ title: `Task for ${applicant.internshipTitle}`, type: 'task', instructions: '', dueDate: '' });
                          setShowMicrotaskModal(true);
                        }}
                        className="bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-300"
                      >
                        Assign Microtask
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "newsletters" && (
          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold md:text-2xl">
                My Newsletters
              </h1>
              <button onClick={() => setShowCreateNewsletter(true)} className="bg-[#443097] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5a3ec4] transition">
                + Create Newsletter
              </button>
            </div>

            {newsletters.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No newsletters created yet. Create your first newsletter to keep students informed!</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {newsletters.map((newsletter) => (
                  <article
                    key={newsletter._id}
                    className={`rounded-2xl border p-4 shadow-sm ${cardTheme}`}
                  >
                    <h2 className="mb-1 text-sm font-semibold md:text-base">
                      {newsletter.title}
                    </h2>
                    <p
                      className={`text-xs md:text-sm ${
                        theme === "light" ? "text-slate-700" : "text-slate-500"
                      }`}
                    >
                      Published: {new Date(newsletter.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {newsletter.summary}
                    </p>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        newsletter.status === 'Published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {newsletter.status}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => { setViewNewsletter(newsletter); setShowViewNewsletter(true); }} className="flex-1 bg-[#443097] text-white px-3 py-1.5 rounded-lg text-xs hover:bg-[#5a3ec4]">
                        View
                      </button>
                      <button onClick={() => {
                        setEditingNewsletterId(newsletter._id);
                        setNwTitle(newsletter.title || '');
                        setNwSummary(newsletter.summary || '');
                        setNwContent(newsletter.content || '');
                        setNwDate(newsletter.date ? new Date(newsletter.date).toISOString().split('T')[0] : '');
                        setShowCreateNewsletter(true);
                      }} className="flex-1 border border-slate-300 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700">
                        Edit
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "notifications" && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold md:text-2xl">Notifications</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      await fetch('http://localhost:5000/api/notifications/mark-all-read', {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      setUnreadCount(0);
                    } catch (err) {
                      console.error('Error marking all read', err);
                    }
                  }}
                  className="px-3 py-2 bg-slate-100 rounded-lg text-sm hover:bg-slate-200"
                >
                  Mark all read
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 rounded-xl shadow-md border text-center">No notifications</div>
            ) : (
              <div className="grid gap-3">
                {notifications.map((n) => (
                  <div key={n._id || n.id} className={`p-4 rounded-xl border ${n.read ? 'opacity-80' : ''} ${cardTheme}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{n.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                        <p className="text-xs text-slate-500 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                        {n.relatedStudent && (
                          <p className="mt-2 text-sm">Applicant: {n.relatedStudent.profile?.fullName || n.relatedStudent.username}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {!n.read && (
                          <button onClick={() => markAsRead(n._id || n.id)} className="px-3 py-1 bg-blue-600 text-white rounded">Mark read</button>
                        )}
                        {n.relatedStudent && (
                          <button onClick={() => { setActiveTab('applicants'); /* optionally open applicant modal */ }} className="px-3 py-1 bg-[#443097] text-white rounded">View Applicant</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      {/* Microtask Modal */}
      {showMicrotaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowMicrotaskModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-lg p-6" onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3">Assign Microtask</h3>
            <div className="grid gap-3">
              <input className={`border rounded-lg p-2 ${cardTheme}`} placeholder="Title" value={microtaskForm.title} onChange={(e)=>setMicrotaskForm(prev=>({...prev,title:e.target.value}))} />
              <select className={`border rounded-lg p-2 ${cardTheme}`} value={microtaskForm.type} onChange={(e)=>setMicrotaskForm(prev=>({...prev,type:e.target.value}))}>
                <option value="task">Task</option>
                <option value="quiz">Quiz</option>
                <option value="github">GitHub</option>
              </select>
              <textarea className={`border rounded-lg p-2 ${cardTheme}`} placeholder="Instructions" value={microtaskForm.instructions} onChange={(e)=>setMicrotaskForm(prev=>({...prev,instructions:e.target.value}))} />
              <input type="date" className={`border rounded-lg p-2 ${cardTheme}`} value={microtaskForm.dueDate} onChange={(e)=>setMicrotaskForm(prev=>({...prev,dueDate:e.target.value}))} />
              {microtaskForm.type === 'quiz' && (
                <>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2"><input type="radio" name="quizMode" checked={microtaskMode==='ai'} onChange={()=>setMicrotaskMode('ai')} /> Use AI</label>
                    <label className="flex items-center gap-2"><input type="radio" name="quizMode" checked={microtaskMode==='manual'} onChange={()=>setMicrotaskMode('manual')} /> Create Manually</label>
                  </div>

                  {microtaskMode === 'ai' && (
                    <>
                      <div className="flex gap-2 items-center mt-2">
                        <label className="text-sm">Questions:</label>
                        <input type="number" min={1} max={10} value={questionCount} onChange={(e)=>setQuestionCount(Number(e.target.value))} className={`border rounded-lg p-2 w-20 ${cardTheme}`} />
                        <button onClick={async ()=>{
                          try {
                            const token = localStorage.getItem('token');
                            const { internshipId } = microtaskAssigning;
                            const resp = await fetch(`http://localhost:5000/api/internships/${internshipId}/microtasks/generate`, {
                              method: 'POST',
                              headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ questionCount })
                            });
                            const data = await resp.json();
                            if (!resp.ok) { alert(data.message || 'Failed to generate'); return; }
                            setMicrotaskQuestions(data.questions || []);
                            alert('Generated quiz preview ready');
                          } catch (err) { console.error('Generate quiz error', err); alert('Error generating quiz'); }
                        }} className="px-3 py-1 bg-[#443097] text-white rounded">Use AI</button>
                        <button onClick={()=>{ setMicrotaskQuestions([]); }} className="px-3 py-1 border rounded">Clear</button>
                      </div>
                      {microtaskQuestions.length > 0 && (
                        <div className="mt-2 p-2 border rounded">
                          <p className="text-sm font-medium">Preview Questions:</p>
                          <ol className="list-decimal ml-5 text-sm">
                            {microtaskQuestions.map((q, i)=> (
                              <li key={i} className="mt-1">{q.question} <span className="text-xs text-slate-500">(Options: {q.options?.join(' / ')})</span></li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </>
                  )}

                  {microtaskMode === 'manual' && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Create quiz questions (up to 10)</p>
                      {(microtaskQuestions || []).map((q, qi) => (
                        <div key={qi} className="p-2 border rounded mb-2">
                          <input className={`w-full border p-2 rounded ${cardTheme}`} placeholder={`Question ${qi+1}`} value={q.question} onChange={(e)=>{
                            const copy = [...microtaskQuestions]; copy[qi].question = e.target.value; setMicrotaskQuestions(copy);
                          }} />
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            { (q.options||[]).map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <input className="w-full border p-2 rounded" value={opt} onChange={(e)=>{ const copy=[...microtaskQuestions]; copy[qi].options[oi]=e.target.value; setMicrotaskQuestions(copy); }} />
                                <label className="text-sm"> <input type="radio" name={`correct_${qi}`} checked={q.correctIndex===oi} onChange={()=>{ const copy=[...microtaskQuestions]; copy[qi].correctIndex=oi; setMicrotaskQuestions(copy); }} /> </label>
                              </div>
                            )) }
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button onClick={()=>{
                              const copy = [...microtaskQuestions]; copy.splice(qi,1); setMicrotaskQuestions(copy);
                            }} className="px-2 py-1 border rounded">Remove</button>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <button onClick={()=>{
                          if ((microtaskQuestions||[]).length >= 10) return alert('Max 10 questions');
                          setMicrotaskQuestions(prev => [...(prev||[]), { question: '', options: ['', '', '', ''], correctIndex: 0 }]);
                        }} className="px-3 py-1 bg-[#443097] text-white rounded">Add Question</button>
                        <button onClick={()=>{ setMicrotaskQuestions([]); }} className="px-3 py-1 border rounded">Clear</button>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center justify-end gap-2 mt-2">
                <button onClick={()=>setShowMicrotaskModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button onClick={async ()=>{
                  try{
                    const token = localStorage.getItem('token');
                    const { internshipId, studentId } = microtaskAssigning;
                    const body = { title: microtaskForm.title, type: microtaskForm.type, instructions: microtaskForm.instructions, assignedTo: studentId, dueDate: microtaskForm.dueDate };
                    if (microtaskForm.type === 'quiz' && microtaskQuestions.length > 0) body.quizQuestions = microtaskQuestions;
                    const resp = await fetch(`http://localhost:5000/api/internships/${internshipId}/microtasks`, {
                      method: 'POST',
                      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify(body)
                    });
                    if (!resp.ok) {
                      const err = await resp.json();
                      alert(err.message || 'Failed to assign microtask');
                      return;
                    }
                    alert('Microtask assigned');
                    setShowMicrotaskModal(false);
                    setMicrotaskQuestions([]);
                    setJobDescription('');
                  } catch(err) {
                    console.error('Assign microtask error:', err);
                    alert('Error assigning microtask');
                  }
                }} className="px-4 py-2 rounded-lg bg-[#443097] text-white">Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Newsletter Modal */}
      {showCreateNewsletter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => { setShowCreateNewsletter(false); setEditingNewsletterId(null); }}>
          <div className={`w-full max-w-2xl rounded-xl p-6 ${cardTheme} shadow-lg`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingNewsletterId ? 'Edit Newsletter' : 'Create Newsletter'}</h3>
              <button onClick={() => { setShowCreateNewsletter(false); setEditingNewsletterId(null); }} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><X /></button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setCreatingNewsletter(true);
              try {
                const token = localStorage.getItem('token');
                if (editingNewsletterId) {
                  // Update
                  const resp = await fetch(`http://localhost:5000/api/newsletters/${editingNewsletterId}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ title: nwTitle, summary: nwSummary, content: nwContent, date: nwDate })
                  });
                  const data = await resp.json();
                  if (resp.ok) {
                    alert('Newsletter updated');
                    setShowCreateNewsletter(false);
                    setEditingNewsletterId(null);
                    setNwTitle(''); setNwSummary(''); setNwContent(''); setNwDate('');
                    fetchNewsletters();
                  } else {
                    alert(data.message || 'Failed to update newsletter');
                  }
                } else {
                  // Create
                  const resp = await fetch('http://localhost:5000/api/newsletters', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ title: nwTitle, company: (user?.profile?.companyName || user?.profile?.fullName || user?.username), summary: nwSummary, content: nwContent, date: nwDate })
                  });
                  const data = await resp.json();
                  if (resp.ok) {
                    alert('Newsletter created');
                    setShowCreateNewsletter(false);
                    setNwTitle(''); setNwSummary(''); setNwContent(''); setNwDate('');
                    fetchNewsletters();
                  } else {
                    alert(data.message || 'Failed to create newsletter');
                  }
                }
              } catch (err) {
                console.error('Create/update newsletter error:', err);
                alert('Failed to save newsletter');
              } finally {
                setCreatingNewsletter(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required value={nwTitle} onChange={e => setNwTitle(e.target.value)} className="w-full px-3 py-2 rounded border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Summary</label>
                <input required value={nwSummary} onChange={e => setNwSummary(e.target.value)} className="w-full px-3 py-2 rounded border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea required value={nwContent} onChange={e => setNwContent(e.target.value)} rows={6} className="w-full px-3 py-2 rounded border" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" value={nwDate} onChange={e => setNwDate(e.target.value)} className="px-3 py-2 rounded border" />
              </div>

              <div className="flex gap-2">
                <button disabled={creatingNewsletter} type="submit" className="px-4 py-2 rounded bg-[#443097] text-white">{creatingNewsletter ? (editingNewsletterId ? 'Updating...' : 'Saving...') : (editingNewsletterId ? 'Update' : 'Create')}</button>
                <button type="button" onClick={() => { setShowCreateNewsletter(false); setEditingNewsletterId(null); }} className="px-4 py-2 rounded border">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Newsletter Modal */}
      {showViewNewsletter && viewNewsletter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => { setShowViewNewsletter(false); setViewNewsletter(null); }}>
          <div className={`w-full max-w-2xl rounded-xl p-6 ${cardTheme} shadow-lg`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-semibold">{viewNewsletter.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{viewNewsletter.company} • {new Date(viewNewsletter.createdAt || viewNewsletter.date).toLocaleDateString()}</p>
              </div>
              <div className="ml-auto">
                <button onClick={() => { setShowViewNewsletter(false); setViewNewsletter(null); }} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><X /></button>
              </div>
            </div>

            <div className="prose max-w-full dark:prose-invert" dangerouslySetInnerHTML={{ __html: viewNewsletter.content }} />
          </div>
        </div>
      )}

        {activeTab === "about" && (
          <section className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-3">
              About <span className="text-[#443097]">Placify for Companies</span>
            </h1>

            <p
              className={`text-sm md:text-base leading-relaxed mb-8 ${
                theme === "light" ? "text-slate-800" : "text-slate-300"
              }`}
            >
              Placify provides companies with a streamlined platform to post internships,
              manage applications, and connect with talented students. Reach the best candidates
              and build your future workforce.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              <div className={`p-4 rounded-xl border shadow-sm ${cardTheme}`}>
                <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><Megaphone className="w-5 h-5" /> Post Internships</h2>
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  Create and publish internship opportunities visible to thousands of students.
                </p>
              </div>

              <div className={`p-4 rounded-xl border shadow-sm ${cardTheme}`}>
                <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><Users className="w-5 h-5" /> Manage Applicants</h2>
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  Review applications, shortlist candidates, and schedule interviews efficiently.
                </p>
              </div>

              <div className={`p-4 rounded-xl border shadow-sm ${cardTheme}`}>
                <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><Newspaper className="w-5 h-5" /> Share Updates</h2>
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  Publish newsletters to keep students informed about your company.
                </p>
              </div>

              <div className={`p-4 rounded-xl border shadow-sm ${cardTheme}`}>
                <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><Target className="w-5 h-5" /> Find Talent</h2>
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  Access a pool of motivated students ready to contribute to your team.
                </p>
              </div>
            </div>

            <div className={`p-6 rounded-xl border shadow-sm text-center ${cardTheme}`}>
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p
                className={`text-sm mb-3 ${
                  theme === "light" ? "text-slate-800" : "text-slate-300"
                }`}
              >
                Contact our support team for assistance
              </p>
              <p className="text-sm">
                <span className="font-medium text-[#443097]">Email:</span> companies@placify.io
              </p>
              <p className="text-sm">
                <span className="font-medium text-[#443097]">Phone:</span> +91 98765 43210
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Post New Internship Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => {
          setShowPostForm(false);
          setEditingInternship(null);
        }}>
          <div 
            className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${cardTheme} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingInternship ? 'Edit Internship' : 'Post New Internship'}</h2>
              <button onClick={() => {
                setShowPostForm(false);
                setEditingInternship(null);
              }} className="text-2xl font-bold text-slate-500 hover:text-slate-700">×</button>
            </div>

            <form onSubmit={handlePostInternship} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                    placeholder="e.g. Software Engineering Intern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                    placeholder="e.g. Bangalore, India"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                  >
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Duration *</label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                    placeholder="e.g. 3 months"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stipend *</label>
                  <input
                    type="text"
                    required
                    value={formData.stipend}
                    onChange={(e) => setFormData({...formData, stipend: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                    placeholder="e.g. ₹50,000/month"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                  placeholder="Describe the internship role and responsibilities..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Requirements</label>
                <textarea
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                  placeholder="Required qualifications and experience..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                  placeholder="e.g. JavaScript, React, Node.js, Python"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
                  className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-300 dark:border-slate-600">
                <button
                  type="submit"
                  disabled={posting}
                  className="flex-1 bg-[#443097] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#36217c] disabled:opacity-50"
                >
                  {posting ? (editingInternship ? "Updating..." : "Posting...") : (editingInternship ? "Update Internship" : "Post Internship")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPostForm(false);
                    setEditingInternship(null);
                  }}
                  className={`px-6 py-3 rounded-lg font-semibold border ${theme === "light" ? "border-slate-300 hover:bg-slate-100" : "border-slate-600 hover:bg-slate-700"}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showProfileModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowProfileModal(false)}>
          <div 
            className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${cardTheme} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Applicant Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-3xl font-bold text-slate-500 hover:text-slate-700">×</button>
            </div>

            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {selectedApplicant.studentId?.profile?.profilePicture ? (
                    <img
                      src={`http://localhost:5000${selectedApplicant.studentId.profile.profilePicture}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-purple-200 flex items-center justify-center text-3xl font-bold text-purple-600">
                      {selectedApplicant.studentId?.profile?.fullName?.charAt(0) || selectedApplicant.studentId?.username?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">
                    {selectedApplicant.studentId?.profile?.fullName || selectedApplicant.studentId?.username || 'N/A'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-2">{selectedApplicant.studentId?.email}</p>
                  {selectedApplicant.studentId?.profile?.phone && (
                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2"><Phone className="w-4 h-4" /> {selectedApplicant.studentId.profile.phone}</p>
                  )}
                  {selectedApplicant.studentId?.profile?.location && (
                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> {selectedApplicant.studentId.profile.location}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              {selectedApplicant.studentId?.profile?.bio && (
                <div className={`p-4 rounded-lg ${theme === "light" ? "bg-slate-50" : "bg-slate-800"}`}>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedApplicant.studentId.profile.bio}</p>
                </div>
              )}

              {/* Skills */}
              {selectedApplicant.studentId?.profile?.skills && selectedApplicant.studentId.profile.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.studentId.profile.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedApplicant.studentId?.profile?.education && selectedApplicant.studentId.profile.education.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Education</h4>
                  <div className="space-y-3">
                    {selectedApplicant.studentId.profile.education.map((edu, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${theme === "light" ? "border-slate-200" : "border-slate-700"}`}>
                        <h5 className="font-semibold">{edu.degree || 'Degree'}</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{edu.institution || 'Institution'}</p>
                        {edu.fieldOfStudy && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">Field: {edu.fieldOfStudy}</p>
                        )}
                        {(edu.startDate || edu.endDate) && (
                          <p className="text-xs text-slate-500 mt-1">
                            {edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'} - 
                            {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Details */}
              <div className={`p-4 rounded-lg border ${theme === "light" ? "border-slate-200 bg-slate-50" : "border-slate-700 bg-slate-800"}`}>
                <h4 className="font-semibold mb-3">Application Details</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Applied Date:</span>
                    <p className="font-medium">{new Date(selectedApplicant.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Status:</span>
                    <p className="font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedApplicant.status === 'Shortlisted' ? 'bg-green-100 text-green-700' :
                        selectedApplicant.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedApplicant.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Resume Download */}
              {selectedApplicant.studentId?.profile?.resume && (
                <div className="flex justify-center">
                  <a
                    href={`http://localhost:5000${selectedApplicant.studentId.profile.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="px-6 py-3 bg-[#443097] text-white rounded-lg font-semibold hover:bg-[#36217c] flex items-center gap-2 justify-center"
                  >
                    <Download className="w-4 h-4" /> Download Complete Resume
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-slate-300 dark:border-slate-600">
              <button
                onClick={() => setShowProfileModal(false)}
                className={`px-6 py-3 rounded-lg font-semibold border ${theme === "light" ? "border-slate-300 hover:bg-slate-100" : "border-slate-600 hover:bg-slate-700"}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Applicants Modal */}
      {showApplicantsModal && selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowApplicantsModal(false)}>
          <div 
            className={`max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${cardTheme} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedInternship.title}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedInternship.applicants?.length || 0} applicants
                </p>
              </div>
              <button onClick={() => setShowApplicantsModal(false)} className="text-3xl font-bold text-slate-500 hover:text-slate-700">×</button>
            </div>

            {selectedInternship.applicants && selectedInternship.applicants.length > 0 ? (
              <div className="space-y-4">
                {selectedInternship.applicants.map((applicant, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${theme === "light" ? "border-slate-200" : "border-slate-700"}`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {applicant.studentId?.profile?.fullName || applicant.studentId?.username || 'N/A'}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {applicant.studentId?.email || 'N/A'}
                        </p>
                        {applicant.studentId?.profile?.phone && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                            <Phone className="w-4 h-4" /> {applicant.studentId.profile.phone}
                          </p>
                        )}
                        {applicant.studentId?.profile?.skills && applicant.studentId.profile.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {applicant.studentId.profile.skills.slice(0, 5).map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-center ${
                          applicant.status === 'Shortlisted' ? 'bg-green-100 text-green-700' :
                          applicant.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {applicant.status}
                        </span>
                        <p className="text-xs text-slate-500 text-center">
                          Applied: {new Date(applicant.appliedAt).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => handleViewProfile(applicant)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 text-center flex items-center gap-1 justify-center"
                        >
                          <User className="w-3 h-3" /> View Profile
                        </button>
                        {applicant.studentId?.profile?.resume && (
                          <a
                            href={`http://localhost:5000${applicant.studentId.profile.resume}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="px-4 py-2 bg-[#443097] text-white rounded-lg text-xs hover:bg-[#36217c] text-center flex items-center gap-1 justify-center"
                          >
                            <FileText className="w-3 h-3" /> Download CV
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500">No applicants yet for this internship.</p>
              </div>
            )}

            <div className="flex justify-end mt-6 pt-4 border-t border-slate-300 dark:border-slate-600">
              <button
                onClick={() => setShowApplicantsModal(false)}
                className={`px-6 py-3 rounded-lg font-semibold border ${theme === "light" ? "border-slate-300 hover:bg-slate-100" : "border-slate-600 hover:bg-slate-700"}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLICANT PROFILE MODAL */}
      {showProfileModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${theme === "light" ? "bg-white" : "bg-slate-800"}`}>
            <div className="sticky top-0 bg-[#443097] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedApplicant.studentId?.profile?.fullName || selectedApplicant.studentId?.username}
                  </h2>
                  <p className="text-sm text-indigo-200 mt-1">
                    Applied for: {selectedApplicant.internshipTitle}
                  </p>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#443097]" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {selectedApplicant.studentId?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedApplicant.studentId?.profile?.phone || 'N/A'}</p>
                  <p><strong>Location:</strong> {selectedApplicant.studentId?.profile?.location || 'N/A'}</p>
                </div>
              </div>

              {/* Application Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Application Status</h3>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedApplicant.status === "Shortlisted"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : selectedApplicant.status === "Accepted"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : selectedApplicant.status === "Rejected"
                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}>
                    {selectedApplicant.status}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Applied on {new Date(selectedApplicant.appliedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>

              {/* Bio */}
              {selectedApplicant.studentId?.profile?.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">About</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {selectedApplicant.studentId.profile.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {selectedApplicant.studentId?.profile?.skills && selectedApplicant.studentId.profile.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.studentId.profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education/Qualifications */}
              {selectedApplicant.studentId?.profile?.qualifications && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Qualifications</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {selectedApplicant.studentId.profile.qualifications}
                  </p>
                </div>
              )}

              {/* Resume Download */}
              {selectedApplicant.studentId?.profile?.resume && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">Resume / CV</h3>
                  <a
                    href={`http://localhost:5000${selectedApplicant.studentId.profile.resume}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#443097] text-white rounded-lg hover:bg-[#36217c] transition"
                  >
                    <Download className="w-5 h-5" />
                    Download Resume
                  </a>
                  <p className="text-xs text-slate-500 mt-2">
                    Click to download the candidate's resume in PDF format
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Close
                </button>
                <button
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Shortlist Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
