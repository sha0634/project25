// src/StudentDashboard.jsx
import { useMemo, useState, useEffect, useRef } from "react";
import io from 'socket.io-client';
import { Link } from "react-router-dom";

import { Moon, Sun, DollarSign, Target, Rocket, MapPin, Building2, Mail, Users, Clock } from 'lucide-react'; // Added Users and Clock icons
import logo from '../assets/logo.png';

// Newsletters will be fetched from the backend; start with empty list



export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState("internships"); // internships | courses | newsletters | profile | about
    const [theme, setTheme] = useState("light"); // light | dark
    const [search, setSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [internships, setInternships] = useState([]);
	// Newsletters fetched from backend
	const [newsletters, setNewsletters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInternship, setSelectedInternship] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [selectedNewsletter, setSelectedNewsletter] = useState(null);
    const [showNewsletterModal, setShowNewsletterModal] = useState(false);
    const dropdownRef = useRef(null);
    
    // Mock Course Data structure for demonstration
    const [courses, setCourses] = useState([
      { _id: "c1", title: "React Development Masterclass", company: "Tech Innovations", description: "Learn modern React, hooks, and state management in a hands-on project-based course.", level: "Advanced", duration: "8 Weeks", price: "₹2,999", studentsEnrolled: 150, prerequisites: "Basic JavaScript knowledge." },
      { _id: "c2", title: "Product Design Essentials", company: "Design Pro Co.", description: "Covering UX principles, Figma prototyping, and design thinking for product managers and designers.", level: "Beginner", duration: "4 Weeks", price: "Free", studentsEnrolled: 300, prerequisites: "None." },
      { _id: "c3", title: "Data Analytics for Beginners", company: "Summit Consulting", description: "An introduction to SQL, Python, and Tableau for aspiring data analysts.", level: "Intermediate", duration: "6 Weeks", price: "₹4,500", studentsEnrolled: 80, prerequisites: "Basic computer skills." },
    ]);
    
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [enrolling, setEnrolling] = useState(false);


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

  // Fetch internships from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch internships
        const internshipsRes = await fetch('http://localhost:5000/api/internships');
        if (internshipsRes.ok) {
          const internshipsData = await internshipsRes.json();
          setInternships(internshipsData.internships);
        }

			// Fetch newsletters from backend (published only)
			try {
				const newslettersRes = await fetch('http://localhost:5000/api/newsletters');
				if (newslettersRes.ok) {
					const newslettersData = await newslettersRes.json();
					setNewsletters(newslettersData.newsletters || []);
				}
			} catch (err) {
				console.error('Error fetching newsletters:', err);
			}

        // Fetch courses (Mocked courses are set above, replace with API call)
       // const coursesRes = await fetch("http://localhost:5000/api/courses");
       //   if (coursesRes.ok) {
       //     const coursesData = await coursesRes.json();
       //     setCourses(coursesData.courses);
       //   }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const lowercaseSearch = search.toLowerCase();

  const filteredInternships = useMemo(
    () =>
      internships.filter((i) =>
        i.company.toLowerCase().includes(lowercaseSearch) ||
        i.title.toLowerCase().includes(lowercaseSearch)
      ),
    [lowercaseSearch, internships]
  );

  const filteredNewsletters = useMemo(
    () =>
      newsletters.filter((n) =>
        n.company.toLowerCase().includes(lowercaseSearch) ||
        n.title.toLowerCase().includes(lowercaseSearch)
      ),
    [lowercaseSearch, newsletters]
  );
  
  // Filtered courses for search bar
  const filteredCourses = useMemo(
    () =>
      courses.filter((c) =>
        c.company.toLowerCase().includes(lowercaseSearch) ||
        c.title.toLowerCase().includes(lowercaseSearch)
      ),
    [lowercaseSearch, courses]
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Clear search when changing section
    if (tab !== "internships") setSearch("");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleViewDetails = (internship) => {
    setSelectedInternship(internship);
    setShowModal(true);
  };

  const handleReadNewsletter = (newsletter) => {
    setSelectedNewsletter(newsletter);
    setShowNewsletterModal(true);
  };

  const handleApply = async () => {
    if (!selectedInternship) return;
    
    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/internships/${selectedInternship._id}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('Application submitted successfully! Your CV has been sent to the recruiter.');
        setShowModal(false);
      } else {
        alert(data.message || 'Failed to apply. Please try again.');
      }
    } catch (error) {
      console.error('Error applying to internship:', error);
      alert('Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const rootTheme =
    theme === "dark"
      ? "bg-slate-900 text-slate-100"
      : "bg-slate-50 text-slate-900";

  const cardTheme =
    theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";

    const handleEnroll = async () => {
  if (!selectedCourse) return;

  setEnrolling(true);
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/courses/${selectedCourse._id}/enroll`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (res.ok) {
      alert("Successfully enrolled in the course!");
      setShowCourseModal(false);
      // Optionally update the course list to reflect new enrollment count
    } else {
      alert(data.message || "Enrollment failed");
    }
  } catch (err) {
    console.error(err);
    alert("Enrollment failed");
  } finally {
    setEnrolling(false);
  }
};


  return (
    <div className={`${rootTheme} min-h-screen `}>
      {/* NAVBAR (omitted for brevity) */}
      <header className="border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
          <div className="font-semibold text-lg  text-[#2b128f] md:text-xl px">
            Placify
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

  {/* Other Tabs */}
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
      className={`px-3 py-1.5 rounded-full transition text-xs md:text-sm
      ${
        activeTab === "profile"
          ? "bg-[#443097] text-white"
          : "hover:bg-slate-200 dark:hover:bg-slate-700"
      }`}
    >
      Profile
    </button>

    {/* DROPDOWN MENU */}
    {showDropdown && (
  <div
    className={`
      absolute right-0 mt-1 w-48 
      rounded-xl border shadow-lg z-50 transition
      ${theme === "light" 
        ? "bg-white border-slate-200 text-black" 
        : "bg-slate-800 border-slate-600 text-white"
      }
    `}
  >
    {/* PROFILE INFO */}
    <Link to="/stprofile">
    <button
      onClick={() => handleTabChange("profile")}
      className={`
        w-full text-left px-4 py-2 text-sm rounded-t-xl
        transition
        ${theme === "light" 
          ? "hover:bg-slate-100 text-black" 
          : "hover:bg-slate-700 text-white"
        }
        `}
        >
      Profile Info
    </button>
      </Link>

    {/* NOTIFICATIONS */}
    <button
      onClick={() => handleTabChange("notifications")}
      className={`
        w-full text-left px-4 py-2 text-sm transition
        ${theme === "light" 
          ? "hover:bg-slate-100 text-black" 
          : "hover:bg-slate-700 text-white"
        }
      `}
    >
      Notifications
    </button>

    {/* LOGOUT */}
    <Link to = "/login">
    <button
      onClick={() => alert("Logged out")}
      className={`
        w-full text-left px-4 py-2 text-sm rounded-b-xl 
        transition
        ${theme === "light"
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
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8  ">
        {/* INTERNSHIPS TAB (omitted for brevity) */}
        {activeTab === "internships" && (
          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold md:text-2xl">
                Internships
              </h1>
              <p className={`text-xs md:text-sm ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
                Browse internships from all registered companies.
              </p>
            </div>

            {/* SEARCH */}
            <div>
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by company name…"
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

              <p className={`mt-4 mb-4 text-xs ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
                When you search a company, its internships and newsletters will
                be shown below.
              </p>
            </div>

            {/* DEFAULT VIEW: all internships */}
            {search.trim() === "" && (
              loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#443097]"></div>
                  <span className="ml-3 text-lg">Loading internships...</span>
                </div>
              ) : internships.length === 0 ? (
                <p className={`text-sm ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
                  No internships available at the moment.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {internships.map((internship) => (
                    <article
                      key={internship._id}
                      className={`rounded-2xl border p-4 shadow-sm ${cardTheme}`}
                    >
                      <h2 className="mb-1 text-sm font-semibold md:text-base">
                        {internship.title}
                      </h2>
                      <p className="text-xs font-medium text-[#443097] md:text-sm">
                        {internship.company}
                      </p>
                      <p className={`mt-2 text-xs md:text-sm ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
                        {internship.location} · {internship.type}
                      </p>
                      {internship.stipend && (
                        <p className={`mt-1 text-xs font-medium ${theme === "light" ? "text-slate-700" : "text-slate-500"} flex items-center gap-1`}>
                          <DollarSign className="w-3 h-3" /> {internship.stipend}
                        </p>
                      )}
                      <button 
                        onClick={() => handleViewDetails(internship)}
                        className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#443097] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#36217c]"
                      >
                        View Details
                      </button>
                    </article>
                  ))}
                </div>
              )
            )}

            {/* SEARCH RESULTS VIEW: internships + newsletters for company (omitted for brevity) */}
            {search.trim() !== "" && (
              <div className="space-y-6">
                {/* Internships */}
                <div>
                  <h2 className="mb-3 text-lg font-semibold">
                    Internships at "{search}"
                  </h2>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#443097]"></div>
                      <span className="ml-3">Loading internships...</span>
                    </div>
                  ) : filteredInternships.length === 0 ? (
                    <p className={`text-sm ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
                      No internships found for this company.
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredInternships.map((internship) => (
                        <article
                          key={internship._id}
                          className={`rounded-2xl border p-4 shadow-sm ${cardTheme}`}
                        >
                          <h3 className="mb-1 text-sm font-semibold md:text-base">
                            {internship.title}
                          </h3>
                          <p className="text-xs font-medium text-[#443097] md:text-sm">
                            {internship.company}
                          </p>
                          <p className={`mt-2 text-xs md:text-sm ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
                            {internship.location} · {internship.type}
                          </p>
                          {internship.stipend && (
                            <p className={`mt-1 text-xs font-medium ${theme === "light" ? "text-slate-700" : "text-slate-500"} flex items-center gap-1`}>
                              <DollarSign className="w-3 h-3" /> {internship.stipend}
                            </p>
                          )}
                          <button 
                            onClick={() => handleViewDetails(internship)}
                            className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#443097] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#36217c]"
                          >
                            View Details
                          </button>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                {/* Newsletters (omitted for brevity) */}
                <div>
                  <h2 className="mb-3 text-lg font-semibold">
                    Newsletters from "{search}"
                  </h2>
                  {filteredNewsletters.length === 0 ? (
                    <p className={`text-sm ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
                      No newsletters found for this company.
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredNewsletters.map((newsletter) => (
                        <article
                          key={newsletter.id}
                          className={`rounded-2xl border p-4 shadow-sm ${cardTheme}`}
                        >
                          <h3 className="mb-1 text-sm font-semibold md:text-base">
                            {newsletter.title}
                          </h3>
                          <p className="text-xs font-medium text-[#443097] md:text-sm">
                            {newsletter.company}
                          </p>
                          <p className={`mt-2 text-xs md:text-sm ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
                            {newsletter.summary}
                          </p>
                          <button 
                            onClick={() => handleReadNewsletter(newsletter)}
                            className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#443097] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#36217c]"
                          >
                            Read Newsletter
                          </button>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}


        {/* COURSES TAB - MODIFIED */}
        {activeTab === "courses" && (
  <section>
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl font-semibold md:text-2xl">
        Courses Offered by Companies
      </h1>
      <p className={`text-xs md:text-sm ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
        Upskill with certified courses designed by industry leaders.
      </p>
    </div>
    
    {/* SEARCH INPUT FOR COURSES */}
    <div>
      <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses by title or company…"
          className="
              w-full rounded-xl border border-slate-300 
              bg-white text-black
              dark:bg-white dark:text-black
              px-4 py-2.5 text-sm shadow-sm outline-none 
              focus:border-indigo-500 
              focus:ring-2 focus:ring-[#443097] 
              dark:border-slate-600 
              dark:focus:ring-[#443097] mb-6
          "
          />
    </div>

    {loading ? (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#443097]"></div>
        <span className="ml-3 text-lg">Loading courses...</span>
      </div>
    ) : courses.length === 0 ? (
      <p className={`text-sm ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
        No courses available at the moment.
      </p>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(search.trim() === "" ? courses : filteredCourses).map((course) => (
          <article
            key={course._id}
            className={`rounded-2xl border p-4 shadow-sm ${cardTheme}`}
          >
            <h2 className="text-sm font-semibold md:text-base line-clamp-2">
              {course.title}
            </h2>

            <p className="text-xs font-medium text-[#443097] flex items-center gap-1 mt-1">
              <Building2 className="w-3 h-3"/> {course.company}
            </p>
            
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
              <p className={`flex items-center gap-1 ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
                <Target className="w-3 h-3"/> 
                {course.level}
              </p>
              <p className={`flex items-center gap-1 ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
                <Clock className="w-3 h-3"/> 
                {course.duration}
              </p>
              <p className={`flex items-center gap-1 font-semibold ${course.price === 'Free' ? 'text-green-600' : 'text-yellow-600'}`}>
                <DollarSign className="w-3 h-3"/> 
                {course.price}
              </p>
            </div>

            <p className={`mt-2 text-xs ${theme === "light" ? "text-slate-600" : "text-slate-400"} line-clamp-2`}>
              {course.description}
            </p>
            
            <button
              onClick={() => {
                setSelectedCourse(course);
                setShowCourseModal(true);
              }}
              className="mt-4 w-full rounded-lg bg-[#443097] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#36217c]"
            >
              View & Enroll
            </button>
          </article>
        ))}
      </div>
    )}
  </section>
)}
        {/* NEWSLETTERS TAB (omitted for brevity) */}
        {activeTab === "newsletters" && (
          <section>
            <h1 className="mb-4 text-xl font-semibold md:text-2xl">
              Newsletters
            </h1>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#443097]"></div>
                <span className="ml-3 text-lg">Loading newsletters...</span>
              </div>
            ) : newsletters.length === 0 ? (
              <p className={`text-sm ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
                No newsletters available at the moment.
              </p>
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
                    <p className="text-xs font-medium text-[#443097] md:text-sm">
                      {newsletter.company}
                    </p>
                    <p className={`mt-2 text-xs md:text-sm ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
                      {newsletter.summary}
                    </p>
                    <button 
                      onClick={() => handleReadNewsletter(newsletter)}
                      className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#443097] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#36217c]"
                    >
                      Read Newsletter
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ABOUT TAB (omitted for brevity) */}
       {activeTab === "about" && (
  <section className="max-w-6xl mx-auto">

    {/* TITLE */}
    <h1 className="text-3xl font-bold mb-3">
      About <span className="text-[#443097]">Placify</span>
    </h1>

    <p className={`text-sm md:text-base leading-relaxed mb-8 ${theme === "light" ? "text-slate-800" : "text-slate-300"}`}>
      Placify is a simple and efficient platform that helps students explore meaningful
      internship opportunities and stay connected with company updates through newsletters.
      Our goal is to make internship discovery easy, transparent, and accessible.
    </p>

    {/* MINI CARDS — MISSION / VISION */}
    <div className="grid sm:grid-cols-2 gap-4 mb-10">
      <div
        className={`p-4 rounded-xl border shadow-sm ${
          theme === "light"
            ? "bg-white border-slate-200"
            : "bg-slate-800 border-slate-700"
        }`}
      >
        <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><Target className="w-5 h-5" /> Mission</h2>
        <p className={`text-sm ${theme === "light" ? "text-slate-800" : "text-slate-300"}`}>
          Helping students find internships faster and more confidently.
        </p>
      </div>

      <div
        className={`p-4 rounded-xl border shadow-sm ${
          theme === "light"
            ? "bg-white border-slate-200"
            : "bg-slate-800 border-slate-700"
        }`}
      >
        <h2 className="font-semibold text-lg mb-1 flex items-center gap-2"><Rocket className="w-5 h-5" /> Vision</h2>
        <p className={`text-sm ${theme === "light" ? "text-slate-800" : "text-slate-300"}`}>
          Creating a trusted internship ecosystem for students & companies.
        </p>
      </div>
    </div>

    {/* FEATURES LIST */}
    <h2 className="text-xl font-semibold mb-3">What We Offer</h2>

    <ul className={`space-y-2 text-sm md:text-base mb-10 ${theme === "light" ? "text-slate-800" : "text-slate-300"}`}>
      <li>• Live internship postings from companies</li>
      <li>• Company newsletters & announcements</li>
      <li>• Professional student profiles</li>
      
    </ul>

    {/* CONTACT SECTION WITH ROUND IMAGE */}
    <div className="flex gap-6">

    <div
      className={`p-6 rounded-xl border w-[10cm] shadow-sm flex flex-col items-center text-center  gap-4 mb-10  h-[8cm]  ${
        theme === "light"
        ? "bg-white border-slate-200"
        : "bg-slate-800 border-slate-700"
      }`}
      >
      {/* Rounded avatar image */}
      <img
        src="https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg"
        alt="Founder"
        className="w-28 h-28 rounded-full object-cover border border-slate-300 dark:border-slate-600"
        />

      <div>
        <h3 className="text-lg font-semibold">Contact Us</h3>
        <p className={`text-sm mt-1 ${theme === "light" ? "text-slate-800" : "text-slate-300"}`}>
          Feel free to reach out for support, feedback, or collaboration!
        </p>
      </div>

      <div className={`text-sm space-y-1 ${theme === "light" ? "text-slate-800" : "text-slate-300"}`}>
        <p><span className="font-medium text-[#443097]">Email:</span> support@placify.io</p>
        <p><span className="font-medium text-[#443097]">Phone:</span> +91 98765 43210</p>
        <p><span className="font-medium text-[#443097]">Location:</span> Punjab, India</p>
      </div>
    </div>
    <div
      className={`p-6 rounded-xl border w-[10cm] shadow-sm flex flex-col items-center text-center gap-4 mb-10 h-[8cm]  ${
        theme === "light"
        ? "bg-white border-slate-200"
        : "bg-slate-800 border-slate-700"
      }`}
      >
      {/* Rounded avatar image */}
      <img
        src="https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg"
        alt="Founder"
        className="w-28 h-28 rounded-full object-cover border border-slate-300 dark:border-slate-600"
        />

      <div>
        <h3 className="text-lg font-semibold">Contact Us</h3>
        <p className={`text-sm mt-1 ${theme === "light" ? "text-slate-800" : "text-slate-300"}`}>
          Feel free to reach out for support, feedback, or collaboration!
        </p>
      </div>

      <div className={`text-sm space-y-1 ${theme === "light" ? "text-slate-800" : "text-slate-300"}`}>
        <p><span className="font-medium text-[#443097]">Email:</span> support@placify.io</p>
        <p><span className="font-medium text-[#443097]">Phone:</span> +91 98765 43210</p>
        <p><span className="font-medium text-[#443097]">Location:</span> Punjab, India</p>
      </div>
    </div>
    <div
      className={`p-6 rounded-xl border  w-[10cm] shadow-sm flex flex-col items-center text-center gap-4 mb-10  h-[8cm] ${
        theme === "light"
        ? "bg-white border-slate-200"
        : "bg-slate-800 border-slate-700"
      }`}
      >
      {/* Rounded avatar image */}
      <img
        src="https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg"
        alt="Founder"
        className="w-28 h-28 rounded-full object-cover border border-slate-300 dark:border-slate-600"
        />

      <div>
        <h3 className="text-lg font-semibold">Contact Us</h3>
        <p className={`text-sm mt-1 ${theme === "light" ? "text-slate-800" : "text-slate-300"}`}>
          Feel free to reach out for support, feedback, or collaboration!
        </p>
      </div>

      <div className={`text-sm space-y-1 ${theme === "light" ? "text-slate-800" : "text-slate-300"}`}>
        <p><span className="font-medium text-[#443097]">Email:</span> support@placify.io</p>
        <p><span className="font-medium text-[#443097]">Phone:</span> +91 98765 43210</p>
        <p><span className="font-medium text-[#443097]">Location:</span> Punjab, India</p>
      </div>
    </div>

        </div>
    {/* FOOTER CARD */}
    <div
      className={`p-5 rounded-xl border shadow-sm text-center ${
        theme === "light"
          ? "bg-white border-slate-200"
          : "bg-slate-800 border-slate-700"
      }`}
    >
      <p className={`text-sm ${theme === "light" ? "text-slate-800" : "text-slate-300"}`}>
        Built with purpose — to empower students in their career journey.
      </p>
    </div>

  </section>
)}


      </main>

      {/* Internship Detail Modal (omitted for brevity) */}
      {/* ... */}

      {/* COURSE DETAIL MODAL - MODIFIED */}
      {showCourseModal && selectedCourse && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    onClick={() => setShowCourseModal(false)}
  >
    <div
      className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${cardTheme} p-6`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setShowCourseModal(false)}
        className="float-right text-3xl font-bold text-slate-500 hover:text-slate-700"
      >
        ×
      </button>

      <h2 className="text-2xl font-bold mb-1">
        {selectedCourse.title}
      </h2>
      <p className="text-lg text-[#443097] font-semibold mb-4">
        {selectedCourse.company}
      </p>

      {/* Course Meta Info */}
      <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === "light" ? "bg-slate-200" : "bg-slate-700"} flex items-center gap-1`}>
          <Target className="w-4 h-4 text-purple-600"/> Level: {selectedCourse.level}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === "light" ? "bg-slate-200" : "bg-slate-700"} flex items-center gap-1`}>
          <Clock className="w-4 h-4 text-purple-600"/> Duration: {selectedCourse.duration}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedCourse.price === 'Free' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'} flex items-center gap-1`}>
          <DollarSign className="w-4 h-4"/> {selectedCourse.price}
        </span>
      </div>
      
      {/* Description */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Course Overview</h3>
        <p className={`text-sm leading-relaxed ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
          {selectedCourse.description}
        </p>
      </div>

      {/* Prerequisites */}
      {selectedCourse.prerequisites && (
        <div className="mb-6 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[#443097]"/> Prerequisites
          </h3>
          <p className={`text-sm leading-relaxed ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
            {selectedCourse.prerequisites}
          </p>
        </div>
      )}
      
      {/* Enrollment Count (Simulated) */}
      <p className={`text-sm mb-6 flex items-center gap-2 ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
        <Users className="w-4 h-4"/> 
        {selectedCourse.studentsEnrolled || 0} students have enrolled so far.
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-slate-300 dark:border-slate-600">
        <button
          onClick={handleEnroll}
          disabled={enrolling}
          className="flex-1 bg-[#443097] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#36217c] disabled:opacity-50"
        >
          {enrolling ? "Enrolling..." : "Enroll Now"}
        </button>
        <button
          onClick={() => setShowCourseModal(false)}
          className={`px-6 py-3 rounded-lg font-semibold border transition ${
            theme === "light" ? "border-slate-300 hover:bg-slate-100" : "border-slate-600 hover:bg-slate-700"
          }`}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
			{/* Newsletter Detail Modal */}
			{showNewsletterModal && selectedNewsletter && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowNewsletterModal(false)}>
					<div className={`max-w-3xl w-full rounded-xl p-6 ${cardTheme}`} onClick={(e) => e.stopPropagation()}>
						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-2xl font-semibold">{selectedNewsletter.title}</h2>
								<p className="text-sm font-medium text-[#443097]">
									{selectedNewsletter.company} · {selectedNewsletter.date ? new Date(selectedNewsletter.date).toLocaleDateString() : (selectedNewsletter.createdAt ? new Date(selectedNewsletter.createdAt).toLocaleDateString() : '')}
								</p>
							</div>
							<button onClick={() => setShowNewsletterModal(false)} className="text-3xl font-bold text-slate-500 hover:text-slate-700">×</button>
						</div>

						<div className="mt-4 prose max-w-none text-sm md:text-base" dangerouslySetInnerHTML={{ __html: selectedNewsletter.content || selectedNewsletter.summary || '' }} />

						<div className="mt-6 flex justify-end">
							<button onClick={() => setShowNewsletterModal(false)} className="px-4 py-2 rounded-lg border">Close</button>
						</div>
					</div>
				</div>
			)}
    </div>
  );
}