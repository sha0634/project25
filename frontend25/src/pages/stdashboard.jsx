// src/StudentDashboard.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";


const INTERNSHIPS = [
  {
    id: 1,
    title: "Software Engineering Intern",
    company: "Google",
    location: "Bangalore, India",
    type: "On-site",
  },
  {
    id: 2,
    title: "Data Analysis Intern",
    company: "Summit Consulting",
    location: "Remote",
    type: "Remote",
  },
  {
    id: 3,
    title: "Marketing Intern",
    company: "Tech Innovations",
    location: "Hyderabad, India",
    type: "Hybrid",
  },
  {
    id: 4,
    title: "Product Management Intern",
    company: "DataTech Solutions",
    location: "Pune, India",
    type: "On-site",
  },
];

const NEWSLETTERS = [
  {
    id: 1,
    title: "Google Summer Internship Updates",
    company: "Google",
    summary: "Latest batch timelines, roles, and eligibility.",
  },
  {
    id: 2,
    title: "Tech Innovations Hiring Drive",
    company: "Tech Innovations",
    summary: "Marketing + Product roles for freshers.",
  },
  {
    id: 3,
    title: "Summit Consulting Data Week",
    company: "Summit Consulting",
    summary: "Workshops and internship program for analysts.",
  },
];



export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState("internships"); // internships | newsletters | profile | about
    const [theme, setTheme] = useState("light"); // light | dark
    const [search, setSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

  const lowercaseSearch = search.toLowerCase();

  const filteredInternships = useMemo(
    () =>
      INTERNSHIPS.filter((i) =>
        i.company.toLowerCase().includes(lowercaseSearch)
      ),
    [lowercaseSearch]
  );

  const filteredNewsletters = useMemo(
    () =>
      NEWSLETTERS.filter((n) =>
        n.company.toLowerCase().includes(lowercaseSearch)
      ),
    [lowercaseSearch]
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Clear search when changing section
    if (tab !== "internships") setSearch("");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
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
          <div className="font-semibold text-lg  text-[#2b128f] md:text-xl px">
            Placify
          </div>

         <nav className="flex items-center gap-2 md:gap-4 text-sm md:text-base">

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
  <div
    className="relative"
    onMouseEnter={() => setShowDropdown(true)}
    onMouseLeave={() => setShowDropdown(false)}
  >
    <button
      
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {INTERNSHIPS.map((internship) => (
                  <article
                    key={internship.id}
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
                    <button className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#443097] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#443097]">
                      View Details
                    </button>
                  </article>
                ))}
              </div>
            )}

            {/* SEARCH RESULTS VIEW: internships + newsletters for company */}
            {search.trim() !== "" && (
              <div className="space-y-6">
                {/* Internships */}
                <div>
                  <h2 className="mb-3 text-lg font-semibold">
                    Internships at "{search}"
                  </h2>
                  {filteredInternships.length === 0 ? (
                    <p className={`text-sm ${theme === "light" ? "text-slate-700" : "text-slate-500"}`}>
                      No internships found for this company.
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredInternships.map((internship) => (
                        <article
                          key={internship.id}
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
                          <button className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#443097] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#443097]">
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
                          <button className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#443097] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#443097]">
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {NEWSLETTERS.map((newsletter) => (
                <article
                  key={newsletter.id}
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
                  <button className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#443097] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#443097]">
                    Read Newsletter
                  </button>
                </article>
              ))}
            </div>
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
        <h2 className="font-semibold text-lg mb-1">🎯 Mission</h2>
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
        <h2 className="font-semibold text-lg mb-1">🚀 Vision</h2>
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
    </div>
  );
}
