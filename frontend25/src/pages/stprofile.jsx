import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function StudentProfile() {
  const [theme, setTheme] = useState("light");

  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    bio: "Passionate developer and tech enthusiast",
    image: null,
    skills: ["JavaScript", "React", "Node.js", "CSS"],
    qualifications: "BTech in Computer Science",
  });

  const [appliedCompanies] = useState([
    { id: 1, name: "Google", position: "Frontend Developer", status: "Applied" },
    { id: 2, name: "Microsoft", position: "Full Stack Developer", status: "Shortlisted" },
    { id: 3, name: "Amazon", position: "Backend Developer", status: "Applied" },
  ]);

  const [cvFile, setCvFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // THEME CLASSES
  const rootTheme =
    theme === "light"
      ? "bg-slate-50 text-slate-900"
      : "bg-slate-900 text-slate-100";

  const cardTheme =
    theme === "light"
      ? "bg-white border-slate-200"
      : "bg-slate-800 border-slate-700";

  const inputTheme =
    theme === "light"
      ? "bg-white text-black border-slate-300"
      : "bg-slate-700 text-white border-slate-600";

  // Handlers
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setProfileData({ ...profileData, image: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    if (file) setCvFile(file);
  };

  const handleInput = (e) =>
    setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const handleSkillChange = (i, v) => {
    const skills = [...profileData.skills];
    skills[i] = v;
    setProfileData({ ...profileData, skills });
  };

  return (
    <div className={`${rootTheme} min-h-screen px-4 py-8`}>
      {/* Header */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-6">

  {/* BACK BUTTON */}
  <Link
    to="/stdashboard"
    className={`
      px-4 py-2 rounded-lg shadow text-sm font-medium
      ${theme === "light"
        ? "bg-slate-200 text-slate-900 hover:bg-slate-300"
        : "bg-slate-700 text-slate-100 hover:bg-slate-600"
      }
    `}
  >
    ← Back
  </Link>

  <h1 className="text-3xl font-bold">Student Profile</h1>

  <div className="flex items-center gap-3">

    {/* EDIT PROFILE BUTTON */}
    <button
      onClick={() => setIsEditing(!isEditing)}
      className="px-4 py-2 text-white bg-[#443097] rounded-lg shadow hover:bg-[#36217c]"
    >
      {isEditing ? "Save" : "Edit Profile"}
    </button>

    {/* THEME TOGGLE */}
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="
        px-3 py-1.5 rounded-full border text-sm
        border-slate-300 dark:border-slate-600
        hover:bg-slate-200 dark:hover:bg-slate-700
      "
    >
      {theme === "light" ? "Dark Theme" : "Light Theme"}
    </button>
  </div>
</div>

      <div className="max-w-5xl mx-auto">
        {/* Basic Info */}
        <div
          className={`p-6 rounded-xl shadow-md border flex flex-col md:flex-row gap-6 ${cardTheme}`}
        >
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-md bg-slate-400">
              {profileData.image ? (
                <img
                  src={profileData.image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  No Image
                </div>
              )}
            </div>

            {isEditing && (
              <label className="mt-3 cursor-pointer text-[#443097] text-sm">
                <input type="file" className="hidden" onChange={handleImageUpload} />
                Change Photo
              </label>
            )}
          </div>

          {/* Profile Details */}
          <div className="flex-1">
            {isEditing ? (
              <div className="grid gap-3">
                <input
                  name="name"
                  value={profileData.name}
                  onChange={handleInput}
                  className={`border rounded-lg p-2 ${inputTheme}`}
                />
                <input
                  name="email"
                  value={profileData.email}
                  onChange={handleInput}
                  className={`border rounded-lg p-2 ${inputTheme}`}
                />
                <input
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInput}
                  className={`border rounded-lg p-2 ${inputTheme}`}
                />
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInput}
                  className={`border rounded-lg p-2 ${inputTheme}`}
                />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold">{profileData.name}</h2>
                <p className="mt-1">
                  <strong>Email:</strong> {profileData.email}
                </p>
                <p>
                  <strong>Phone:</strong> {profileData.phone}
                </p>
                <p className="mt-2">{profileData.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* CV Upload */}
        <div className={`p-6 mt-6 rounded-xl shadow-md border ${cardTheme}`}>
          <h3 className="text-xl font-semibold mb-3">Resume / CV</h3>
          
          {cvFile ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">📄 {cvFile.name}</span>
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(cvFile);
                  link.download = cvFile.name;
                  link.click();
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                Download
              </button>
              <label className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm cursor-pointer hover:bg-orange-600">
                <input type="file" className="hidden" onChange={handleCvUpload} />
                Re-upload
              </label>
              <button
                onClick={() => setCvFile(null)}
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ) : (
            <label className="cursor-pointer text-[#443097]">
              <input type="file" className="hidden" onChange={handleCvUpload} />
              📤 Upload CV
            </label>
          )}
        </div>

        {/* Skills */}
        <div className={`p-6 mt-6 rounded-xl shadow-md border ${cardTheme}`}>
          <h3 className="text-xl font-semibold mb-3">Skills</h3>

          <div className="flex flex-wrap gap-3">
            {isEditing
              ? profileData.skills.map((skill, idx) => (
                  <input
                    key={idx}
                    value={skill}
                    onChange={(e) => handleSkillChange(idx, e.target.value)}
                    className={`border p-2 rounded-lg ${inputTheme}`}
                  />
                ))
              : profileData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#443097]/10 text-[#443097] rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
          </div>
        </div>

        {/* Qualifications */}
        <div className={`p-6 mt-6 rounded-xl shadow-md border ${cardTheme}`}>
          <h3 className="text-xl font-semibold mb-3">Qualifications</h3>

          {isEditing ? (
            <textarea
              name="qualifications"
              value={profileData.qualifications}
              onChange={handleInput}
              className={`border p-2 rounded-lg w-full ${inputTheme}`}
            />
          ) : (
            <p>{profileData.qualifications}</p>
          )}
        </div>

        {/* Applied Companies */}
        <div className={`p-6 mt-6 rounded-xl shadow-md border ${cardTheme}`}>
          <h3 className="text-xl font-semibold mb-3">Companies Applied</h3>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-200 dark:bg-slate-700 text-left">
                <th className="p-3">Company</th>
                <th className="p-3">Position</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {appliedCompanies.map((company) => (
                <tr key={company.id} className="border-t border-slate-300 dark:border-slate-600">
                  <td className="p-3">{company.name}</td>
                  <td className="p-3">{company.position}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        company.status === "Shortlisted"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {company.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
