// src/CompanyDashboard.jsx
import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Megaphone, Users, Newspaper, Target, Phone, MapPin, FileText, User, Download } from 'lucide-react';

const POSTED_INTERNSHIPS = [
  {
    id: 1,
    title: "Software Engineering Intern",
    applicants: 45,
    status: "Active",
    postedDate: "2024-12-01",
  },
  {
    id: 2,
    title: "Data Analysis Intern",
    applicants: 32,
    status: "Active",
    postedDate: "2024-11-28",
  },
  {
    id: 3,
    title: "Marketing Intern",
    applicants: 28,
    status: "Closed",
    postedDate: "2024-11-15",
  },
  {
    id: 4,
    title: "Product Management Intern",
    applicants: 51,
    status: "Active",
    postedDate: "2024-12-05",
  },
];

const APPLICANTS = [
  {
    id: 1,
    name: "Rahul Sharma",
    position: "Software Engineering Intern",
    status: "Under Review",
    appliedDate: "2024-12-08",
  },
  {
    id: 2,
    name: "Priya Patel",
    position: "Data Analysis Intern",
    status: "Shortlisted",
    appliedDate: "2024-12-07",
  },
  {
    id: 3,
    name: "Amit Kumar",
    position: "Software Engineering Intern",
    status: "Interview Scheduled",
    appliedDate: "2024-12-06",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    position: "Marketing Intern",
    status: "Under Review",
    appliedDate: "2024-12-05",
  },
];

const NEWSLETTERS = [
  {
    id: 1,
    title: "Summer Internship Program 2025",
    published: "2024-12-01",
    views: 234,
  },
  {
    id: 2,
    title: "Tech Stack We Use",
    published: "2024-11-25",
    views: 189,
  },
  {
    id: 3,
    title: "Culture & Work Environment",
    published: "2024-11-20",
    views: 312,
  },
];

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState("internships"); // internships | applicants | newsletters | profile | about
  const [theme, setTheme] = useState("light"); // light | dark
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [postedInternships, setPostedInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
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
      
      const response = await fetch('http://localhost:5000/api/internships', {
        method: 'POST',
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
        alert('Internship posted successfully!');
        setShowPostForm(false);
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

  const handleViewProfile = (applicant) => {
    setSelectedApplicant(applicant);
    setShowProfileModal(true);
  };

  const filteredApplicants = useMemo(
    () =>
      APPLICANTS.filter(
        (a) =>
          a.name.toLowerCase().includes(lowercaseSearch) ||
          a.position.toLowerCase().includes(lowercaseSearch)
      ),
    [lowercaseSearch]
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
                className={`px-3 py-1.5 rounded-full transition text-xs md:text-sm
                ${
                  activeTab === "profile"
                    ? "bg-[#443097] text-white"
                    : "hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Profile
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
              {(search.trim() === "" ? APPLICANTS : filteredApplicants).map((applicant) => (
                <article
                  key={applicant.id}
                  className={`rounded-xl border p-4 shadow-sm ${cardTheme} flex items-center justify-between`}
                >
                  <div>
                    <h2 className="text-sm font-semibold md:text-base">
                      {applicant.name}
                    </h2>
                    <p className="text-xs text-[#443097] md:text-sm">
                      {applicant.position}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        theme === "light" ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      Applied: {applicant.appliedDate}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        applicant.status === "Shortlisted"
                          ? "bg-blue-100 text-blue-700"
                          : applicant.status === "Interview Scheduled"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {applicant.status}
                    </span>
                    <button className="bg-[#443097] text-white px-4 py-1.5 rounded-lg text-xs hover:bg-[#5a3ec4]">
                      View Profile
                    </button>
                  </div>
                </article>
              ))}
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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {NEWSLETTERS.map((newsletter) => (
                <article
                  key={newsletter.id}
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
                    Published: {newsletter.published}
                  </p>
                  <p className="mt-1 text-xs text-[#443097]">
                    {newsletter.views} views
                  </p>
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
          </section>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowPostForm(false)}>
          <div 
            className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${cardTheme} p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Post New Internship</h2>
              <button onClick={() => setShowPostForm(false)} className="text-2xl font-bold text-slate-500 hover:text-slate-700">×</button>
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
                  {posting ? "Posting..." : "Post Internship"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPostForm(false)}
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
    </div>
  );
}
