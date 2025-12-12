// src/CompanyDashboard.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

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

  const lowercaseSearch = search.toLowerCase();

  const filteredInternships = useMemo(
    () =>
      POSTED_INTERNSHIPS.filter((i) =>
        i.title.toLowerCase().includes(lowercaseSearch)
      ),
    [lowercaseSearch]
  );

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

          <nav className="flex items-center gap-2 md:gap-4 text-sm md:text-base">
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
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        {activeTab === "internships" && (
          <section>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold md:text-2xl">
                My Posted Internships
              </h1>
              <button className="bg-[#443097] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#5a3ec4] transition">
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
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(search.trim() === "" ? POSTED_INTERNSHIPS : filteredInternships).map((internship) => (
                <article
                  key={internship.id}
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
                    <span className="font-medium">{internship.applicants}</span> applicants
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      theme === "light" ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    Posted: {internship.postedDate}
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
                <h2 className="font-semibold text-lg mb-1">📢 Post Internships</h2>
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  Create and publish internship opportunities visible to thousands of students.
                </p>
              </div>

              <div className={`p-4 rounded-xl border shadow-sm ${cardTheme}`}>
                <h2 className="font-semibold text-lg mb-1">👥 Manage Applicants</h2>
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  Review applications, shortlist candidates, and schedule interviews efficiently.
                </p>
              </div>

              <div className={`p-4 rounded-xl border shadow-sm ${cardTheme}`}>
                <h2 className="font-semibold text-lg mb-1">📰 Share Updates</h2>
                <p
                  className={`text-sm ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  Publish newsletters to keep students informed about your company.
                </p>
              </div>

              <div className={`p-4 rounded-xl border shadow-sm ${cardTheme}`}>
                <h2 className="font-semibold text-lg mb-1">🎯 Find Talent</h2>
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
    </div>
  );
}
