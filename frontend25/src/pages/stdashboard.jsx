// src/StudentDashboard.jsx
import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, DollarSign, Target, Rocket, MapPin, Building2, Mail } from 'lucide-react';
import logo from '../assets/logo.png';

const NEWSLETTERS = [
  {
    id: 1,
    title: "Google Summer Internship Updates",
    company: "Google",
    summary: "Latest batch timelines, roles, and eligibility.",
    date: "December 10, 2025",
    content: `
      <h3>Exciting News for Aspiring Googlers!</h3>
      <p>We're thrilled to announce our Summer 2026 Internship Program is now open for applications. This year, we're expanding our program to include more diverse roles across engineering, product, design, and business teams.</p>
      
      <h4>Key Highlights:</h4>
      <ul>
        <li><strong>Duration:</strong> 10-12 weeks (May - August 2026)</li>
        <li><strong>Locations:</strong> Bangalore, Hyderabad, Mumbai, and Gurgaon</li>
        <li><strong>Stipend:</strong> Competitive compensation package</li>
        <li><strong>Application Deadline:</strong> January 15, 2026</li>
      </ul>
      
      <h4>Available Roles:</h4>
      <ul>
        <li>Software Engineering Intern</li>
        <li>Product Management Intern</li>
        <li>UX Design Intern</li>
        <li>Data Science Intern</li>
        <li>Business Analyst Intern</li>
      </ul>
      
      <h4>Eligibility:</h4>
      <p>Students pursuing Bachelor's or Master's degrees in Computer Science, Engineering, Business, or related fields. Strong problem-solving skills and passion for technology are essential.</p>
      
      <p><strong>Ready to apply?</strong> Visit our careers portal and submit your application along with your resume and cover letter. Selected candidates will be contacted for technical and behavioral interviews.</p>
    `
  },
  {
    id: 2,
    title: "Tech Innovations Hiring Drive",
    company: "Tech Innovations",
    summary: "Marketing + Product roles for freshers.",
    date: "December 8, 2025",
    content: `
      <h3>Join Tech Innovations - We're Hiring!</h3>
      <p>Tech Innovations is conducting a campus hiring drive for passionate freshers looking to kickstart their careers in Marketing and Product Management.</p>
      
      <h4>Why Join Us?</h4>
      <ul>
        <li>Work on cutting-edge SaaS products</li>
        <li>Mentorship from industry leaders</li>
        <li>Flexible work culture (Hybrid model)</li>
        <li>Fast-track career growth opportunities</li>
      </ul>
      
      <h4>Open Positions:</h4>
      <p><strong>1. Marketing Intern</strong></p>
      <ul>
        <li>Content creation and social media management</li>
        <li>Campaign planning and execution</li>
        <li>Market research and competitor analysis</li>
        <li>Stipend: ₹20,000/month</li>
      </ul>
      
      <p><strong>2. Product Management Intern</strong></p>
      <ul>
        <li>Feature ideation and roadmap planning</li>
        <li>User research and feedback analysis</li>
        <li>Cross-functional team collaboration</li>
        <li>Stipend: ₹35,000/month</li>
      </ul>
      
      <h4>Selection Process:</h4>
      <p>Online Assessment → Group Discussion → HR Interview → Final Offer</p>
      
      <p>Applications close on December 31, 2025. Don't miss this opportunity!</p>
    `
  },
  {
    id: 3,
    title: "Summit Consulting Data Week",
    company: "Summit Consulting",
    summary: "Workshops and internship program for analysts.",
    date: "December 5, 2025",
    content: `
      <h3>Summit Consulting Data Week 2026</h3>
      <p>We're excited to invite students to our annual Data Week - a series of workshops, masterclasses, and networking sessions focused on data analytics and consulting.</p>
      
      <h4>Event Schedule:</h4>
      <p><strong>Day 1 (Jan 15):</strong> Introduction to Data Analytics in Consulting</p>
      <p><strong>Day 2 (Jan 16):</strong> SQL and Python for Business Analysis</p>
      <p><strong>Day 3 (Jan 17):</strong> Data Visualization with Tableau & Power BI</p>
      <p><strong>Day 4 (Jan 18):</strong> Case Study Competition</p>
      <p><strong>Day 5 (Jan 19):</strong> Networking & Internship Offers</p>
      
      <h4>Internship Opportunities:</h4>
      <p>Top performers in the case study competition will receive pre-placement offers for our 6-month Data Analyst Internship Program.</p>
      
      <h4>Internship Benefits:</h4>
      <ul>
        <li>Stipend: ₹25,000/month</li>
        <li>Remote work option available</li>
        <li>Real client projects exposure</li>
        <li>Certification upon completion</li>
        <li>PPO (Pre-Placement Offer) for high performers</li>
      </ul>
      
      <h4>Registration:</h4>
      <p>Limited seats available! Register by December 20, 2025. Participation is free for all registered students.</p>
      
      <p><em>This is a great opportunity to learn, network, and secure your first internship in the consulting industry!</em></p>
    `
  },
];



export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState("internships"); // internships | newsletters | profile | about
    const [theme, setTheme] = useState("light"); // light | dark
    const [search, setSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [internships, setInternships] = useState([]);
    const [newsletters, setNewsletters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInternship, setSelectedInternship] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [selectedNewsletter, setSelectedNewsletter] = useState(null);
    const [showNewsletterModal, setShowNewsletterModal] = useState(false);
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

        // Fetch newsletters
        const newslettersRes = await fetch('http://localhost:5000/api/newsletters');
        if (newslettersRes.ok) {
          const newslettersData = await newslettersRes.json();
          setNewsletters(newslettersData.newsletters);
        }
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

  return (
    <div className={`${rootTheme} min-h-screen `}>
      {/* NAVBAR */}
      <header className="border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Placify" className="w-8 h-8 object-contain" />
            <div className="font-semibold text-lg  text-[#2b128f] md:text-xl">Placify</div>
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
  {["internships", "newsletters", "about"].map((tab) => (
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700">
            <nav className="px-4 py-3 space-y-2">
              {["internships", "newsletters", "about"].map((tab) => (
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
                <Link to="/stprofile" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                    Profile Info
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
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8  ">
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

            {/* SEARCH RESULTS VIEW: internships + newsletters for company */}
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

                {/* Newsletters */}
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
      className={`p-6 rounded-xl border w-[10cm] shadow-sm flex flex-col items-center text-center  gap-4 mb-10  h-[8cm]  ${
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
      className={`p-6 rounded-xl border w-[10cm] shadow-sm flex flex-col items-center text-center gap-4 mb-10 h-[8cm]  ${
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
      className={`p-6 rounded-xl border  w-[10cm] shadow-sm flex flex-col items-center text-center gap-4 mb-10  h-[8cm] ${
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

      {/* Internship Detail Modal */}
      {showModal && selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div 
            className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${cardTheme} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="float-right text-2xl font-bold text-slate-500 hover:text-slate-700"
            >
              ×
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{selectedInternship.title}</h2>
              <p className="text-lg text-[#443097] font-semibold">{selectedInternship.company}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm ${theme === "light" ? "bg-slate-200" : "bg-slate-700"} flex items-center gap-1`}>
                  <MapPin className="w-4 h-4" /> {selectedInternship.location}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${theme === "light" ? "bg-slate-200" : "bg-slate-700"} flex items-center gap-1`}>
                  <Building2 className="w-4 h-4" /> {selectedInternship.type}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${theme === "light" ? "bg-slate-200" : "bg-slate-700"}`}>
                  ⏱️ {selectedInternship.duration}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${theme === "light" ? "bg-green-100 text-green-700" : "bg-green-900 text-green-300"} flex items-center gap-1`}>
                  <DollarSign className="w-4 h-4" /> {selectedInternship.stipend}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className={`text-sm leading-relaxed ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                {selectedInternship.description}
              </p>
            </div>

            {/* Requirements */}
            {selectedInternship.requirements && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                <p className={`text-sm leading-relaxed ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                  {selectedInternship.requirements}
                </p>
              </div>
            )}

            {/* Skills */}
            {selectedInternship.skills && selectedInternship.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedInternship.skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        theme === "light"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-purple-900 text-purple-300"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-300 dark:border-slate-600">
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 bg-[#443097] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#36217c] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {applying ? "Applying..." : "Apply Now"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={`px-6 py-3 rounded-lg font-semibold border transition ${
                  theme === "light"
                    ? "border-slate-300 hover:bg-slate-100"
                    : "border-slate-600 hover:bg-slate-700"
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
          <div 
            className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${cardTheme} p-6 md:p-8`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowNewsletterModal(false)}
              className="float-right text-3xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              ×
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                theme === "light" ? "bg-purple-100 text-purple-700" : "bg-purple-900 text-purple-300"
              } flex items-center gap-1`}>
                <Mail className="w-3 h-3" /> Newsletter
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{selectedNewsletter.title}</h2>
              <div className="flex items-center gap-4 text-sm">
                <p className="text-[#443097] font-semibold">{selectedNewsletter.company}</p>
                <span className={`${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>•</span>
                <p className={`${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                  {selectedNewsletter.date ? new Date(selectedNewsletter.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : ''}
                </p>
              </div>
            </div>

            {/* Newsletter Content */}
            <div 
              className={`prose prose-sm md:prose-base max-w-none ${
                theme === "light" ? "prose-slate" : "prose-invert"
              }`}
              dangerouslySetInnerHTML={{ __html: selectedNewsletter.content }}
              style={{
                color: theme === "light" ? "#334155" : "#cbd5e1"
              }}
            />

            {/* Close Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-slate-300 dark:border-slate-600">
              <button
                onClick={() => setShowNewsletterModal(false)}
                className={`px-8 py-3 rounded-lg font-semibold border transition ${
                  theme === "light"
                    ? "border-slate-300 hover:bg-slate-100"
                    : "border-slate-600 hover:bg-slate-700"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
