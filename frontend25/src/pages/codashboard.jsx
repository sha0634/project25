import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Megaphone, Users, Newspaper, Target, Phone, MapPin, FileText, User, Download, Bell, Mail, X } from 'lucide-react';
import io from 'socket.io-client';



export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState("internships"); // internships | courses | applicants | newsletters | profile | about
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
  
  // --- NEW STATE FOR COURSES ---
  const [courses, setCourses] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    name: "",
    description: "",
    category: "Development",
    duration: "4 weeks",
    price: "Free",
    isPublished: false,
    prerequisites: "",
  });
  const [creatingCourse, setCreatingCourse] = useState(false);
  // -----------------------------

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
  
  // --- NEW FUNCTION: Fetch Courses ---
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/courses/company/my-courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  // ------------------------------------

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

      // Fetch initial data
      fetchNotifications();
      fetchInternships();
      fetchNewsletters();
      fetchApplicants();
      // --- NEW: Fetch Courses on initial load ---
      fetchCourses();
      // ------------------------------------------
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

  // Fetch on mount (already covered by useEffect above, cleaning up redundant useState)
  // useState(() => {
  //   fetchInternships();
  // }, []);

  const filteredInternships = useMemo(
    () =>
      postedInternships.filter((i) =>
        i.title.toLowerCase().includes(lowercaseSearch)
      ),
    [lowercaseSearch, postedInternships]
  );
  
  // --- NEW: Filtered Courses (for potential future search) ---
  const filteredCourses = useMemo(
    () => courses.filter((c) => c.name.toLowerCase().includes(lowercaseSearch)),
    [lowercaseSearch, courses]
  );
  // -----------------------------------------------------------

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

  // --- NEW FUNCTION: Handle Course Creation ---
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreatingCourse(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseFormData)
      });

      if (response.ok) {
        alert('Course created successfully!');
        const newCourse = await response.json();
        setCourses(prev => [...prev, newCourse.course]); // Add new course to state
        setShowCourseForm(false);
        // Reset form data
        setCourseFormData({
          name: "",
          description: "",
          category: "Development",
          duration: "4 weeks",
          price: "Free",
          isPublished: false,
          prerequisites: "",
        });
        fetchCourses(); // Re-fetch all courses just in case
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to create course.'}`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course. Please try again.');
    } finally {
      setCreatingCourse(false);
    }
  };
  // ---------------------------------------------


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
          <div className="font-semibold text-lg text-[#2b128f] md:text-xl">
            Placify - Company
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
            {["internships", "courses", "applicants", "newsletters", "about"].map((tab) => (

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
              {["internships", "courses", "applicants", "newsletters", "about"].map((tab) => (

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

        {/* --- MODIFIED COURSES TAB --- */}
        {activeTab === "courses" && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold md:text-2xl">
                My Courses
              </h1>

              <button
                onClick={() => setShowCourseForm(true)}
                className="bg-[#443097] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#36217c]"
              >
                + Create Course
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No courses created yet. Start creating valuable content for students!</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(search.trim() === "" ? courses : filteredCourses).map((course) => (
                  <article key={course._id} className={`rounded-2xl border p-4 shadow-sm ${cardTheme}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-sm font-semibold md:text-base flex-1 line-clamp-2">
                        {course.name}
                      </h2>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ml-2 ${
                          course.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-[#443097] md:text-sm">{course.category} · {course.duration}</p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 bg-[#443097] text-white px-3 py-1.5 rounded-lg text-xs hover:bg-[#36217c]">
                        View/Edit Content
                      </button>
                      <button className="flex-1 border border-slate-300 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700">
                        Details
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
        {/* ---------------------------------- */}


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
              <button className="bg-[#443097] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5a3ec4] transition">
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
                      <button className="flex-1 bg-[#443097] text-white px-3 py-1.5 rounded-lg text-xs hover:bg-[#5a3ec4]">
                        View
                      </button>
                      <button className="flex-1 border border-slate-300 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700">
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
                      console.
                        error('Assign microtask error:', err);
                      alert('Error assigning microtask');
                    }
                  }} className="px-4 py-2 rounded-lg bg-[#443097] text-white">Assign</button>
                </div>
              </div>
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

      {/* View Applicants Modal (Other modals omitted for brevity) */}
      {/* ... (Existing modals remain here) ... */}
      
      
      {/* --- NEW COURSE CREATION MODAL --- */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowCourseForm(false)}>
          <div 
            className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${cardTheme} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create New Course</h2>
              <button onClick={() => setShowCourseForm(false)} className="text-2xl font-bold text-slate-500 hover:text-slate-700">×</button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              {/* Course Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  value={courseFormData.name}
                  onChange={(e) => setCourseFormData({...courseFormData, name: e.target.value})}
                  className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                  placeholder="e.g. Advanced React & Redux"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({...courseFormData, description: e.target.value})}
                  className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                  placeholder="Detailed description of the course content and learning outcomes..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    required
                    value={courseFormData.category}
                    onChange={(e) => setCourseFormData({...courseFormData, category: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium mb-1">Duration</label>
                  <input
                    type="text"
                    value={courseFormData.duration}
                    onChange={(e) => setCourseFormData({...courseFormData, duration: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                    placeholder="e.g. 6 weeks"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-1">Price/Cost</label>
                  <input
                    type="text"
                    value={courseFormData.price}
                    onChange={(e) => setCourseFormData({...courseFormData, price: e.target.value})}
                    className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                    placeholder="e.g. Free, ₹499, $10"
                  />
                </div>

                {/* Status: Published */}
                <div className="flex items-center pt-6">
                  <input
                    id="isPublished"
                    type="checkbox"
                    checked={courseFormData.isPublished}
                    onChange={(e) => setCourseFormData({...courseFormData, isPublished: e.target.checked})}
                    className="w-4 h-4 text-[#443097] border-slate-300 rounded focus:ring-[#443097]"
                  />
                  <label htmlFor="isPublished" className="ml-2 text-sm font-medium">Publish Now</label>
                </div>
              </div>
              
              {/* Prerequisites */}
              <div>
                <label className="block text-sm font-medium mb-1">Prerequisites (Optional)</label>
                <textarea
                  rows={2}
                  value={courseFormData.prerequisites}
                  onChange={(e) => setCourseFormData({...courseFormData, prerequisites: e.target.value})}
                  className={`w-full rounded-lg border px-3 py-2 ${theme === "light" ? "border-slate-300 bg-white" : "border-slate-600 bg-slate-700"}`}
                  placeholder="What knowledge is required before starting the course?"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-300 dark:border-slate-600">
                <button
                  type="submit"
                  disabled={creatingCourse}
                  className="flex-1 bg-[#443097] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#36217c] disabled:opacity-50"
                >
                  {creatingCourse ? "Creating..." : "Create Course"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCourseForm(false)}
                  className={`px-6 py-3 rounded-lg font-semibold border ${theme === "light" ? "border-slate-300 hover:bg-slate-100" : "border-slate-600 hover:bg-slate-700"}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ------------------------------------- */}
      
    </div>
  );
}