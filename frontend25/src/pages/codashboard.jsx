// src/CompanyDashboard.jsx
import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Megaphone, Users, Newspaper, Target, Phone, MapPin, FileText, User, Download, Bell, Mail, X, Upload } from 'lucide-react';
import io from 'socket.io-client';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';



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
  
  // --- STATE FOR COURSES ---
  const [courses, setCourses] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [existingCourseVideos, setExistingCourseVideos] = useState([]); // paths for already-uploaded videos
  const [removeVideos, setRemoveVideos] = useState([]); // tracks which existing videos to remove on update
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [showCourseDetailsModal, setShowCourseDetailsModal] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    name: "",
    description: "",
    category: "Development",
    duration: "4 weeks",
    price: "Free",
    isPublished: false,
    prerequisites: "",
    courseVideos: [], // Stores File objects (allow multiple or none)
  });
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [videoFileName, setVideoFileName] = useState(''); // Stores the name for display
  const removeSelectedVideo = (idx) => {
    const files = [...(courseFormData.courseVideos || [])];
    files.splice(idx, 1);
    setCourseFormData({...courseFormData, courseVideos: files});
    if (files.length === 0) setVideoFileName('');
    else if (files.length === 1) setVideoFileName(files[0].name);
    else setVideoFileName(`${files.length} files selected`);
  };

  const removeExistingVideo = (idx) => {
    const files = [...existingCourseVideos];
    const removed = files.splice(idx, 1)[0];
    setExistingCourseVideos(files);
    setRemoveVideos(prev => [...prev, removed]);
    // update display name count
    const totalNew = (courseFormData.courseVideos || []).length + files.length;
    if (totalNew === 0) setVideoFileName('');
    else if (totalNew === 1) setVideoFileName((courseFormData.courseVideos && courseFormData.courseVideos[0]?.name) || files[0]);
    else setVideoFileName(`${totalNew} files selected`);
  };
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
  // Student submission UI state
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [currentMicrotask, setCurrentMicrotask] = useState(null);
  const [submissionData, setSubmissionData] = useState({ text: '', githubLink: '', files: [], answers: [] });
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
  const [nwPrompt, setNwPrompt] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [editingNewsletterId, setEditingNewsletterId] = useState(null);
  const [showViewNewsletter, setShowViewNewsletter] = useState(false);
  const [viewNewsletter, setViewNewsletter] = useState(null);
  const { user } = useAuth();

  const lowercaseSearch = search.toLowerCase();

  // --- FETCHING FUNCTIONS ---

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
  
  // Fetch Courses
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

  // --- INITIAL DATA FETCH & SOCKET SETUP ---

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    
    
    // Define socket logic to use in conditional block
    const setupSocket = () => {
        socketRef.current = io('http://localhost:5000');
        
        socketRef.current.on('connect', () => {
          socketRef.current.emit('register', userId);
        });
        
        socketRef.current.on('newNotification', (notification) => {
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
            
            if (Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: '/logo.png'
                });
            }
        });

        socketRef.current.on('disconnect', () => {
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Socket.io connection error:', error);
        });
    };


    if (userId && token) {
      setupSocket();
      
      // Fetch all initial data concurrently
      const loadData = async () => {
        try {
          await Promise.all([
            fetchNotifications(),
            fetchInternships(),
            fetchNewsletters(),
            fetchApplicants(),
            fetchCourses(),
          ]);
        } catch (error) {
          console.error("Error during initial data loading:", error);
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    } else {
      console.warn('Cannot setup: userId or token missing');
      setLoading(false);
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  // Run once on mount (or when `user` changes). Avoid including local function refs
  // which causes this effect to rerun and recreate sockets repeatedly.
  }, [user]);

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


  // --- MEMOIZED FILTERS ---

  const filteredInternships = useMemo(
    () =>
      postedInternships.filter((i) =>
        i.title.toLowerCase().includes(lowercaseSearch)
      ),
    [lowercaseSearch, postedInternships]
  );
  
  const filteredCourses = useMemo(
    () => courses.filter((c) => c.name.toLowerCase().includes(lowercaseSearch)),
    [lowercaseSearch, courses]
  );

  const filteredApplicants = useMemo(
    () =>
      applicants.filter(
        (a) =>
          (a.studentId?.profile?.fullName || a.studentId?.username || '').toLowerCase().includes(lowercaseSearch) ||
          a.internshipTitle.toLowerCase().includes(lowercaseSearch)
      ),
    [lowercaseSearch, applicants]
  );

  // --- HANDLERS ---

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
        // Re-fetch to update the list immediately
        fetchInternships(); 
        setShowPostForm(false);
        setEditingInternship(null);
        setFormData({
          title: "", company: "", location: "", type: "Remote", duration: "", stipend: "", 
          description: "", requirements: "", skills: "", applicationDeadline: ""
        });
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

  // --- MODIFIED: Handle Course Creation to support File Upload ---
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreatingCourse(true);
    // selected video files available in state

    try {
      const token = localStorage.getItem('token');
      
      // Use FormData to send both JSON data and any files (optional)
      const data = new FormData();
      data.append('name', courseFormData.name);
      data.append('description', courseFormData.description);
      data.append('category', courseFormData.category);
      data.append('duration', courseFormData.duration);
      data.append('price', courseFormData.price);
      data.append('isPublished', courseFormData.isPublished);
      data.append('prerequisites', courseFormData.prerequisites);
      // Append any selected video files (if provided)
      if (courseFormData.courseVideos && courseFormData.courseVideos.length > 0) {
        courseFormData.courseVideos.forEach((file) => {
          data.append('courseVideos', file);
        });
      }
      // If editing, include removeVideos list
      if (editingCourseId && removeVideos && removeVideos.length > 0) {
        data.append('removeVideos', JSON.stringify(removeVideos));
      }
      const url = editingCourseId ? `http://localhost:5000/api/courses/${editingCourseId}` : 'http://localhost:5000/api/courses';
      const method = editingCourseId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data
      });

      if (response.ok) {
        alert(editingCourseId ? 'Course updated successfully!' : 'Course created successfully!');
        fetchCourses(); 
        setShowCourseForm(false);
        // Reset form data and file state
        setCourseFormData({
          name: "", description: "", category: "Development", duration: "4 weeks", 
          price: "Free", isPublished: false, prerequisites: "", courseVideos: [],
        });
        setVideoFileName('');
        // Clear editing state if we updated
        if (editingCourseId) {
          setEditingCourseId(null);
          setExistingCourseVideos([]);
          setRemoveVideos([]);
        }
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


  const handleViewApplicants = (internship) => {
    setSelectedInternship(internship);
    setShowApplicantsModal(true);
  };

  const handleApplicantStatusUpdate = async (status) => {
    if (!selectedInternship || !selectedApplicant) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/internships/${selectedInternship._id}/applicants/${selectedApplicant._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');

      // Update local selectedInternship applicants list
      const updatedApplicants = (selectedInternship.applicants || []).map(a => {
        if (String(a._id) === String(selectedApplicant._id)) return { ...a, status };
        return a;
      });
      setSelectedInternship({ ...selectedInternship, applicants: updatedApplicants });
      // Refresh applicants modal list
      setShowProfileModal(false);
      // Optional: refresh company internships to get latest statuses
      fetchInternships();
      alert(`Candidate ${status === 'Rejected' ? 'rejected' : 'updated to ' + status}`);
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update applicant status');
    }
  };

  // Download or open resume PDF (protected endpoint)
  const handleDownloadResume = async (student) => {
    try {
      const studentId = typeof student === 'string' ? student : (student && (student._id || student.id));
      if (!studentId) return alert('Student ID not available');
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/profile/student/${studentId}/resume`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return alert(err.message || 'Failed to download resume');
      }

      const blob = await res.blob();
      // Try to read filename from Content-Disposition header
      const cd = res.headers.get('content-disposition') || '';
      let filename = '';
      const fnMatch = cd.match(/filename\*=UTF-8''([^;\n\r]+)/i) || cd.match(/filename="?([^";\n\r]+)"?/i);
      if (fnMatch) {
        filename = decodeURIComponent(fnMatch[1]);
      } else {
        // fallback: try to use username or generic name
        filename = `${selectedApplicant?.studentId?.username || 'resume'}`;
      }

      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 60 * 1000);
    } catch (error) {
      console.error('Download resume error:', error);
      alert('Failed to download resume');
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourseId(course._id);
    setExistingCourseVideos(course.videos || []);
    setRemoveVideos([]);
    setCourseFormData({
      name: course.name || "",
      description: course.description || "",
      category: course.category || "Development",
      duration: course.duration || "4 weeks",
      price: course.price || "Free",
      isPublished: !!course.isPublished,
      prerequisites: course.prerequisites || "",
      courseVideos: [], // new file selections
    });

    const total = (course.videos?.length || 0);
    if (total === 0) setVideoFileName('');
    else if (total === 1) setVideoFileName(course.videos[0]);
    else setVideoFileName(`${total} files selected`);

    setShowCourseForm(true);
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

  // Open student submission modal (student-side will call this with the microtask object)
  const openSubmissionModal = (microtask) => {
    setCurrentMicrotask(microtask || null);
    // initialize answers if it's a quiz
    if (microtask?.type === 'quiz' && microtask.quizQuestions) {
      setSubmissionData({ text: '', githubLink: '', files: [], answers: microtask.quizQuestions.map(() => '') });
    } else {
      setSubmissionData({ text: '', githubLink: '', files: [], answers: [] });
    }
    setShowSubmissionModal(true);
  };

  // Debug helper removed: no console exposure in production
  useEffect(() => {}, [showProfileModal, selectedApplicant]);

  // When opening profile modal, if resume not present, try to fetch student profile by id
  useEffect(() => {
    const loadMissingStudent = async () => {
      if (!showProfileModal || !selectedApplicant) return;
      const student = selectedApplicant.studentId;
      const studentId = typeof student === 'string' ? student : (student && (student._id || student.id));
      if (!student) return;

      const hasResume = Boolean(student?.profile?.resume || student?.profile?.resumePath);
      const isPopulated = typeof student === 'object' && (student.profile || student.email);
      if (hasResume || isPopulated) return;

      try {
        const token = localStorage.getItem('token');
        if (!studentId) return;
        const res = await fetch(`http://localhost:5000/api/profile/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.user) {
          setSelectedApplicant(prev => ({ ...prev, studentId: data.user }));
        }
      } catch (err) {
        console.error('Failed to fetch student profile by id:', err);
      }
    };
    loadMissingStudent();
  }, [showProfileModal, selectedApplicant]);

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
            {["internships", "courses", "newsletters", "about"].map((tab) => (

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
              {["internships", "courses", "newsletters", "about"].map((tab) => (

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
        
        {/* INTERNSHIPS TAB */}
        {activeTab === "internships" && (
          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold md:text-2xl">
                My Posted Internships
              </h1>
              <button 
                onClick={() => {
                  setShowPostForm(true);
                  setEditingInternship(null); // Ensure form is for creation
                  setFormData({
                    title: "", company: "", location: "", type: "Remote", duration: "", stipend: "", 
                    description: "", requirements: "", skills: "", applicationDeadline: ""
                  });
                }}
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

        {/* COURSES TAB */}
        {activeTab === "courses" && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold md:text-2xl">
                My Courses
              </h1>

              <button
                onClick={() => {
                  setEditingCourseId(null);
                  setExistingCourseVideos([]);
                  setRemoveVideos([]);
                  setCourseFormData({
                    name: "",
                    description: "",
                    category: "Development",
                    duration: "4 weeks",
                    price: "Free",
                    isPublished: false,
                    prerequisites: "",
                    courseVideos: []
                  });
                  setVideoFileName('');
                  setShowCourseForm(true);
                }}
                className="bg-[#443097] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#36217c]"
              >
                + Create Course
              </button>
            </div>
            
            {/* SEARCH */}
            <div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by course title…"
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

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#443097]"></div>
                <span className="ml-3 text-lg">Loading courses...</span>
              </div>
            ) : courses.length === 0 ? (
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
                      <button onClick={() => handleEditCourse(course)} className="flex-1 bg-[#443097] text-white px-3 py-1.5 rounded-lg text-xs hover:bg-[#36217c]">
                        View/Edit Content
                      </button>
                      <button onClick={() => { setSelectedCourseDetails(course); setShowCourseDetailsModal(true); }} className="flex-1 border border-slate-300 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700">
                        Details
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}


        {/* APPLICANTS TAB */}
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
                      {/* Only show email, phone and CV to company */}
                      <p className="text-xs text-slate-600">{applicant.studentId?.email || 'No email'}</p>
                      <p className="text-xs text-slate-600">{applicant.studentId?.profile?.phone || 'No phone'}</p>
                      {/* CV link moved to actions column below View Profile button */}
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
                      {/* View Profile removed — companies see only email/phone/CV */}
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

        {/* NEWSLETTERS TAB */}
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

        {/* NOTIFICATIONS TAB */}
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
                <label className="block text-sm font-medium mb-1">AI Prompt (optional)</label>
                <textarea value={nwPrompt} onChange={e => setNwPrompt(e.target.value)} rows={3} placeholder="Give instructions for AI to generate title, summary and HTML content" className="w-full px-3 py-2 rounded border mb-2" />
                <div className="flex gap-2 mb-3">
                  <button type="button" disabled={generatingAI || !nwPrompt.trim()} onClick={async () => {
                    setGeneratingAI(true);
                    try {
                      const token = localStorage.getItem('token');
                      const resp = await fetch('http://localhost:5000/api/newsletters/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                        body: JSON.stringify({ prompt: nwPrompt })
                      });
                      const data = await resp.json();
                      if (resp.ok && data.newsletter) {
                        setNwTitle(data.newsletter.title || '');
                        setNwSummary(data.newsletter.summary || '');
                        setNwContent(data.newsletter.content || '');
                      } else {
                        alert(data.message || 'AI generation failed');
                      }
                    } catch (err) {
                      console.error('AI generation request failed', err);
                      alert('AI generation failed');
                    } finally {
                      setGeneratingAI(false);
                    }
                  }} className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600">{generatingAI ? 'Generating...' : 'Generate with AI'}</button>
                  <button type="button" onClick={() => { setNwPrompt(''); setNwTitle(''); setNwSummary(''); setNwContent(''); }} className="px-3 py-1 rounded border">Clear</button>
                </div>

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

      {/* Course Details Modal (company view) */}
      {showCourseDetailsModal && selectedCourseDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowCourseDetailsModal(false)}>
          <div className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${cardTheme} p-6`} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowCourseDetailsModal(false)} className="float-right text-3xl font-bold text-slate-500 hover:text-slate-700">×</button>

            <h2 className="text-2xl font-bold mb-1">{selectedCourseDetails.name}</h2>
            <p className="text-sm text-[#443097] font-semibold mb-4">{selectedCourseDetails.companyName || selectedCourseDetails.company || 'Company'}</p>

            <div className="flex gap-3 flex-wrap mb-4">
              <span className={`px-3 py-1 rounded-full text-sm ${selectedCourseDetails.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{selectedCourseDetails.isPublished ? 'Published' : 'Draft'}</span>
              {selectedCourseDetails.category && <span className="px-3 py-1 rounded-full text-sm bg-slate-200">{selectedCourseDetails.category}</span>}
              {selectedCourseDetails.duration && <span className="px-3 py-1 rounded-full text-sm bg-slate-200">{selectedCourseDetails.duration}</span>}
              {selectedCourseDetails.price && <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">{selectedCourseDetails.price}</span>}
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{selectedCourseDetails.description}</p>
            </div>

            {selectedCourseDetails.prerequisites && (
              <div className="mb-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold">Prerequisites</h4>
                <p className={`text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{selectedCourseDetails.prerequisites}</p>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-semibold">Videos</h4>
              {selectedCourseDetails.videos && selectedCourseDetails.videos.length > 0 ? (
                <ul className="list-disc list-inside text-sm mt-2">
                  {selectedCourseDetails.videos.map((v, i) => (
                    <li key={i}><a href={`http://localhost:5000${v}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">{`Video ${i+1}`}</a></li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No videos for this course.</p>
              )}
            </div>

            <div className="mb-4">
              <h4 className="font-semibold">Enrolled Students</h4>
              <p className="text-sm text-slate-600">{(selectedCourseDetails.enrolledStudents || []).length} enrolled</p>
              {(selectedCourseDetails.enrolledStudents || []).length > 0 && (
                <EnrolledStudentsList courseId={selectedCourseDetails._id} />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-300 dark:border-slate-600">
              <button onClick={() => setShowCourseDetailsModal(false)} className={`px-6 py-3 rounded-lg font-semibold border ${theme === 'light' ? 'border-slate-300 hover:bg-slate-100' : 'border-slate-600 hover:bg-slate-700'}`}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showProfileModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${theme === "light" ? "bg-white" : "bg-slate-800"}`}>
            <div className="sticky top-0 bg-[#443097] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedApplicant.studentId?.profile?.fullName || selectedApplicant.studentId?.username}
                  </h2>
                  <p className="text-sm text-indigo-200 mt-1">
                    Applied for: {selectedInternship?.title || selectedApplicant.internshipTitle}
                  </p>
                  {/* CV presence handled in resume section; no top 'No CV' badge */}
                </div>
                <div className="flex items-center gap-3">
                  {/* Top CV quick-action removed to avoid parsed-text download and 'No CV' label */}

                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-white hover:bg-white/20 rounded-full p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Information (only) */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#443097]" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {selectedApplicant.studentId?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedApplicant.studentId?.profile?.phone || 'N/A'}</p>
                </div>
              </div>

                {/* Candidate contact and resume info shown above */}

              {/* Resume Download */}
              {(selectedApplicant.studentId?.profile?.resume || selectedApplicant.studentId?.profile?.resumePath || selectedApplicant.studentId?.profile?.resumeText) && (
                (() => {
                  const r = (selectedApplicant.studentId.profile.resume || selectedApplicant.studentId.profile.resumePath || '');
                  const href = r && r.startsWith('http') ? r : (r ? `http://localhost:5000/${r.replace(/^\/+/, '')}` : null);
                  const resumeText = selectedApplicant.studentId?.profile?.resumeText || null;
                  return (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold mb-3">Resume / CV</h3>
                      <>
                        <button
                          onClick={() => handleDownloadResume(selectedApplicant.studentId)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#443097] text-white rounded-lg hover:bg-[#36217c] transition"
                        >
                          <Download className="w-5 h-5" />
                          Download Resume (PDF)
                        </button>

                        
                      </>
                    </div>
                  );
                })()
              )}

              {/* Actions: Shortlist / Reject */}
              <div className="flex gap-3 pt-6 border-t">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => handleApplicantStatusUpdate('Shortlisted')}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => handleApplicantStatusUpdate('Rejected')}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Microtask Modal */}
      {showMicrotaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowMicrotaskModal(false)}>
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl ${cardTheme} p-6`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Assign Microtask</h3>
              <button onClick={() => setShowMicrotaskModal(false)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><X /></button>
            </div>

            <div className="grid gap-3">
              <input
                className={`w-full rounded-lg border px-3 py-2 ${theme === 'light' ? 'border-slate-300 bg-white text-black' : 'border-slate-600 bg-slate-700 text-white'}`}
                placeholder="Title"
                value={microtaskForm.title}
                onChange={(e) => setMicrotaskForm((prev) => ({ ...prev, title: e.target.value }))}
              />

              <select
                className={`w-full rounded-lg border px-3 py-2 ${theme === 'light' ? 'border-slate-300 bg-white text-black' : 'border-slate-600 bg-slate-700 text-white'}`}
                value={microtaskForm.type}
                onChange={(e) => setMicrotaskForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="task">Task</option>
                <option value="quiz">Quiz</option>
                <option value="github">GitHub</option>
              </select>

              <textarea
                className={`w-full rounded-lg border px-3 py-2 ${theme === 'light' ? 'border-slate-300 bg-white text-black' : 'border-slate-600 bg-slate-700 text-white'}`}
                placeholder="Instructions"
                value={microtaskForm.instructions}
                onChange={(e) => setMicrotaskForm((prev) => ({ ...prev, instructions: e.target.value }))}
              />

              <input
                type="date"
                className={`w-full rounded-lg border px-3 py-2 ${theme === 'light' ? 'border-slate-300 bg-white text-black' : 'border-slate-600 bg-slate-700 text-white'}`}
                value={microtaskForm.dueDate}
                onChange={(e) => setMicrotaskForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              />

              {microtaskForm.type === 'quiz' && (
                <>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2"><input type="radio" name="quizMode" checked={microtaskMode === 'ai'} onChange={() => setMicrotaskMode('ai')} /> Use AI</label>
                    <label className="flex items-center gap-2"><input type="radio" name="quizMode" checked={microtaskMode === 'manual'} onChange={() => setMicrotaskMode('manual')} /> Create Manually</label>
                  </div>

                  {microtaskMode === 'ai' && (
                    <>
                      <div className="flex gap-2 items-center mt-2">
                        <label className="text-sm">Questions:</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={questionCount}
                          onChange={(e) => setQuestionCount(Number(e.target.value))}
                          className={`rounded-lg border px-3 py-2 w-24 ${theme === 'light' ? 'border-slate-300 bg-white text-black' : 'border-slate-600 bg-slate-700 text-white'}`}
                        />
                        <button onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const { internshipId } = microtaskAssigning;
                            const resp = await fetch(`http://localhost:5000/api/internships/${internshipId}/microtasks/generate`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                              body: JSON.stringify({ questionCount })
                            });
                            const data = await resp.json();
                            if (!resp.ok) { alert(data.message || 'Failed to generate'); return; }
                            setMicrotaskQuestions(data.questions || []);
                            alert('Generated quiz preview ready');
                          } catch (err) { console.error('Generate quiz error', err); alert('Error generating quiz'); }
                        }} className="px-3 py-1 bg-[#443097] text-white rounded">Use AI</button>
                        <button onClick={() => { setMicrotaskQuestions([]); }} className="px-3 py-1 border rounded">Clear</button>
                      </div>

                      {microtaskQuestions.length > 0 && (
                        <div className={`mt-2 p-2 rounded border ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'}`}>
                          <p className="text-sm font-medium">Preview Questions:</p>
                          <ol className="list-decimal ml-5 text-sm">
                            {microtaskQuestions.map((q, i) => (
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
                        <div key={qi} className={`p-2 rounded mb-2 border ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'}`}>
                          <input
                            className={`w-full rounded-lg border px-3 py-2 ${theme === 'light' ? 'border-slate-300 bg-white text-black' : 'border-slate-600 bg-slate-700 text-white'}`}
                            placeholder={`Question ${qi + 1}`}
                            value={q.question}
                            onChange={(e) => { const copy = [...microtaskQuestions]; copy[qi].question = e.target.value; setMicrotaskQuestions(copy); }}
                          />
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {(q.options || []).map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <input className={`w-full rounded-lg border px-3 py-2 ${theme === 'light' ? 'border-slate-300 bg-white text-black' : 'border-slate-600 bg-slate-700 text-white'}`} value={opt} onChange={(e) => { const copy = [...microtaskQuestions]; copy[qi].options[oi] = e.target.value; setMicrotaskQuestions(copy); }} />
                                <label className="text-sm"> <input type="radio" name={`correct_${qi}`} checked={q.correctIndex === oi} onChange={() => { const copy = [...microtaskQuestions]; copy[qi].correctIndex = oi; setMicrotaskQuestions(copy); }} /> </label>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => { const copy = [...microtaskQuestions]; copy.splice(qi, 1); setMicrotaskQuestions(copy); }} className="px-2 py-1 border rounded">Remove</button>
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <button onClick={() => {
                          if ((microtaskQuestions || []).length >= 10) return alert('Max 10 questions');
                          setMicrotaskQuestions(prev => [...(prev || []), { question: '', options: ['', '', '', ''], correctIndex: 0 }]);
                        }} className="px-3 py-1 bg-[#443097] text-white rounded">Add Question</button>
                        <button onClick={() => { setMicrotaskQuestions([]); }} className="px-3 py-1 border rounded">Clear</button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-end gap-2 mt-2">
                <button onClick={() => setShowMicrotaskModal(false)} className={`px-4 py-2 rounded-lg border ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}>Cancel</button>
                <button onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const { internshipId, studentId } = microtaskAssigning;
                    const body = { title: microtaskForm.title, type: microtaskForm.type, instructions: microtaskForm.instructions, assignedTo: studentId, dueDate: microtaskForm.dueDate };
                    if (microtaskForm.type === 'quiz' && microtaskQuestions.length > 0) body.quizQuestions = microtaskQuestions;
                    const resp = await fetch(`http://localhost:5000/api/internships/${internshipId}/microtasks`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
                  } catch (err) {
                    console.error('Assign microtask error:', err);
                    alert('Error assigning microtask');
                  }
                }} className="px-4 py-2 rounded-lg bg-[#443097] text-white">Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Submission Modal (used by student-facing views) */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowSubmissionModal(false)}>
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl ${cardTheme} p-6`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>{currentMicrotask?.title || 'Submit Task'}</h3>
              <button onClick={() => setShowSubmissionModal(false)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><X /></button>
            </div>

            <div className="space-y-3">
              <p className={`text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{currentMicrotask?.instructions || 'Provide your submission below.'}</p>

              {currentMicrotask?.type !== 'quiz' && (
                <>
                  <label className="block text-sm font-medium">Answer / Notes</label>
                  <textarea
                    rows={4}
                    value={submissionData.text}
                    onChange={(e) => setSubmissionData(prev => ({ ...prev, text: e.target.value }))}
                    className={`w-full rounded-lg border px-3 py-2 ${theme === 'light' ? 'border-slate-300 bg-white text-black' : 'border-slate-600 bg-slate-700 text-white'}`}
                  />

                  <label className="block text-sm font-medium">GitHub Repo / Link (optional)</label>
                  <input
                    value={submissionData.githubLink}
                    onChange={(e) => setSubmissionData(prev => ({ ...prev, githubLink: e.target.value }))}
                    className={`w-full rounded-lg border px-3 py-2 ${theme === 'light' ? 'border-slate-300 bg-white text-black' : 'border-slate-600 bg-slate-700 text-white'}`}
                    placeholder="https://github.com/your/repo"
                  />

                  <label className="block text-sm font-medium">Attach files (optional)</label>
                  <label htmlFor="submission-files" className={`w-full flex items-center justify-between cursor-pointer rounded-lg border px-3 py-2 text-sm ${theme === 'light' ? 'border-slate-300 bg-white hover:bg-slate-50' : 'border-slate-600 bg-slate-700 hover:bg-slate-600'}`}>
                    <span className="truncate pr-4">{submissionData.files.length > 0 ? `${submissionData.files.length} file(s) selected` : 'Choose files...'}</span>
                    <span className="text-xs bg-[#443097] text-white px-3 py-1 rounded-md">Browse</span>
                  </label>
                  <input id="submission-files" type="file" multiple className="hidden" accept="*/*" onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setSubmissionData(prev => ({ ...prev, files: [...prev.files, ...files] }));
                    e.target.value = null;
                  }} />

                  {submissionData.files.length > 0 && (
                    <div className="mt-2 space-y-1 text-sm">
                      {submissionData.files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <div className="truncate">{f.name}</div>
                          <button type="button" onClick={() => setSubmissionData(prev => ({ ...prev, files: prev.files.filter((_, idx) => idx !== i) }))} className="text-xs text-red-600">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {currentMicrotask?.type === 'quiz' && currentMicrotask.quizQuestions && (
                <div>
                  <p className="text-sm font-medium mb-2">Quiz</p>
                  <ol className="list-decimal ml-5 text-sm space-y-3">
                    {currentMicrotask.quizQuestions.map((q, i) => (
                      <li key={i} className="space-y-2">
                        <div className="font-medium">{q.question}</div>
                        <div className="grid grid-cols-1 gap-2">
                          {(q.options || []).map((opt, oi) => (
                            <label key={oi} className="flex items-center gap-2">
                              <input type="radio" name={`answer_${i}`} checked={submissionData.answers[i] === String(oi)} onChange={() => setSubmissionData(prev => {
                                const answers = [...(prev.answers || [])]; answers[i] = String(oi); return { ...prev, answers };
                              })} />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 mt-3">
                <button onClick={() => setShowSubmissionModal(false)} className={`px-4 py-2 rounded-lg border ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}>Cancel</button>
                <button onClick={async () => {
                  try {
                    if (!currentMicrotask) return alert('No task selected');
                    const token = localStorage.getItem('token');
                    const fd = new FormData();
                    fd.append('text', submissionData.text || '');
                    fd.append('githubLink', submissionData.githubLink || '');
                    if (submissionData.answers && submissionData.answers.length > 0) fd.append('answers', JSON.stringify(submissionData.answers));
                    submissionData.files.forEach((f) => fd.append('files', f));

                    const resp = await fetch(`http://localhost:5000/api/microtasks/${currentMicrotask._id}/submissions`, {
                      method: 'POST',
                      headers: { Authorization: token ? `Bearer ${token}` : undefined },
                      body: fd
                    });
                    const data = await resp.json().catch(() => ({}));
                    if (!resp.ok) { alert(data.message || 'Failed to submit'); return; }
                    alert('Submission successful');
                    setShowSubmissionModal(false);
                    setSubmissionData({ text: '', githubLink: '', files: [], answers: [] });
                  } catch (err) {
                    console.error('Submission error', err);
                    alert('Error submitting task');
                  }
                }} className="px-4 py-2 rounded-lg bg-[#443097] text-white">Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COURSE CREATION MODAL - MODIFIED FOR VIDEO UPLOAD */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowCourseForm(false)}>
          <div 
            className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${cardTheme} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingCourseId ? 'Edit Course' : 'Create New Course'}</h2>
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

              {/* NEW: Video Upload Input */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4"/> Course Video File (MP4/MOV) *
                </label>
                
                {/* Custom File Input button */}
                <label htmlFor="course-video-upload" className={`
                    w-full flex items-center justify-between cursor-pointer 
                    rounded-lg border px-3 py-2 text-sm 
                    ${theme === "light" ? "border-slate-300 bg-white hover:bg-slate-50" : "border-slate-600 bg-slate-700 hover:bg-slate-600"}
                  `}>
                  <span className="truncate pr-4">
                    {videoFileName || "Choose video files (optional)..."}
                  </span>
                  <span className="text-xs bg-[#443097] text-white px-3 py-1 rounded-md">Browse</span>
                </label>

                <input
                  id="course-video-upload"
                  type="file"
                  multiple
                  accept="video/mp4,video/mov,video/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);

                    setCourseFormData(prev => {
                      const newVideos = [...(prev.courseVideos || []), ...files];

                      if (newVideos.length === 0) setVideoFileName('');
                      else if (newVideos.length === 1) setVideoFileName(newVideos[0].name);
                      else setVideoFileName(`${newVideos.length} files selected`);

                      return { ...prev, courseVideos: newVideos };
                    });

                    // Clear the input so the same file(s) can be selected again if needed
                    e.target.value = null;
                  }}
                  className="hidden"
                />
                {/* Show selected files list */}
                {/* Show existing uploaded videos (when editing) */}
                {existingCourseVideos && existingCourseVideos.length > 0 && (
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="text-xs text-slate-500 mb-1">Existing uploaded videos:</div>
                    {existingCourseVideos.map((p, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="truncate text-slate-700 dark:text-slate-300">{p}</div>
                        <button type="button" onClick={() => removeExistingVideo(i)} className="text-xs text-red-600">Remove</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Show newly selected files list */}
                {courseFormData.courseVideos && courseFormData.courseVideos.length > 0 && (
                  <div className="mt-2 space-y-1 text-sm">
                    {courseFormData.courseVideos.map((f, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="truncate text-slate-700 dark:text-slate-300">{f.name}</div>
                        <button type="button" onClick={() => removeSelectedVideo(i)} className="text-xs text-red-600">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* END NEW: Video Upload Input */}

              <div className="flex gap-3 pt-4 border-t border-slate-300 dark:border-slate-600">
                <button
                  type="submit"
                  disabled={creatingCourse}
                  className="flex-1 bg-[#443097] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#36217c] disabled:opacity-50"
                >
                  {creatingCourse ? (editingCourseId ? "Updating..." : "Creating...") : (editingCourseId ? "Update Course" : "Create Course")}
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
      
    </div>
  );
}

// Component: fetch and display enrolled student summaries (name, email, phone, resume)
function EnrolledStudentsList({ courseId }) {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/courses/${courseId}/enrolled`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          if (mounted) setStudents(data.students || []);
        } else {
          console.warn('Failed to load enrolled students', data.message);
          if (mounted) setStudents([]);
        }
      } catch (err) {
        console.error('Error fetching enrolled students', err);
        if (mounted) setStudents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [courseId]);

  if (loading) return <p className="text-sm">Loading students...</p>;
  if (!students || students.length === 0) return <p className="text-sm text-slate-500">No enrolled students yet.</p>;

  return (
    <div className="mt-2 text-sm space-y-2">
      {students.map((s) => (
        <div key={s._id} className="p-3 rounded bg-slate-100 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{s.name || 'Unknown'}</div>
              <div className="text-xs text-slate-600">{s.email || ''}{s.phone ? ` · ${s.phone}` : ''}</div>
            </div>
            {s.resume ? (
              <a href={s.resume.startsWith('http') ? s.resume : `http://localhost:5000/${s.resume.replace(/^\/+/, '')}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">View CV</a>
            ) : (
              <></>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}