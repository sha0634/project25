import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FileText, Upload } from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuth();
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    image: null,
    skills: [],
    qualifications: "",
  });

  const [appliedCompanies, setAppliedCompanies] = useState([]);

  const [cvFile, setCvFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/profile/student', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const profile = data.profile;
          
          // Format education entries properly
          let formattedQualifications = '';
          if (profile.education && profile.education.length > 0) {
            formattedQualifications = profile.education.map(e => {
              const parts = [];
              if (e.degree) parts.push(e.degree);
              if (e.fieldOfStudy) parts.push(`in ${e.fieldOfStudy}`);
              if (e.institution) parts.push(`from ${e.institution}`);
              return parts.join(' ');
            }).filter(q => q.trim()).join('\n');
          }
          
          setProfileData({
            name: profile.fullName || user?.username || "",
            email: data.user.email || "",
            phone: profile.phone || "",
            bio: profile.bio || "",
            image: profile.profilePicture ? `http://localhost:5000${profile.profilePicture}` : null,
            skills: profile.skills || [],
            qualifications: formattedQualifications,
          });

          if (profile.resume) {
            setCvFile({ name: 'Resume.pdf', url: `http://localhost:5000${profile.resume}` });
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/internships/student/my-applications', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAppliedCompanies(data.applications || []);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchProfile();
    fetchApplications();
  }, [user]);

  // Save profile data
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/student', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: profileData.name,
          phone: profileData.phone,
          bio: profileData.bio,
          profilePicture: profileData.image,
          skills: profileData.skills,
          resume: cvFile?.url || ""
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Profile updated successfully!');
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only image files (JPEG, PNG, GIF, WebP) are allowed!');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB!');
      return;
    }

    // Upload file to backend
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/upload-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData({ 
          ...profileData, 
          image: `http://localhost:5000${data.profilePicture}` 
        });
        alert('Profile picture uploaded successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    }
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type - only PDF
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed!');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB!');
      return;
    }

    // Upload file to backend
    const formData = new FormData();
    formData.append('resume', file);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/student/upload-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to upload resume');
        return;
      }

      if (response.ok) {
        setCvFile({ 
          name: data.fileName, 
          url: `http://localhost:5000${data.resumePath}` 
        });

        // Auto-fill profile data from extracted CV information
        if (data.extractedData) {
          const { skills, education, bio } = data.extractedData;
          
          console.log('Extracted Data:', data.extractedData);
          console.log('Education entries:', education);
          
          setProfileData(prev => ({
            ...prev,
            // Merge new skills with existing ones
            skills: skills && skills.length > 0 
              ? [...new Set([...prev.skills, ...skills])] 
              : prev.skills,
            // Update bio if empty
            bio: bio && !prev.bio ? bio : prev.bio,
          }));

          // Fetch updated profile to get education data
          const profileResponse = await fetch('http://localhost:5000/api/profile/student', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            const profile = profileData.profile;
            
            console.log('Updated profile education:', profile.education);
            
            // Format education entries properly
            let formattedQualifications = '';
            if (profile.education && profile.education.length > 0) {
              formattedQualifications = profile.education.map(e => {
                const parts = [];
                if (e.degree) parts.push(e.degree);
                if (e.fieldOfStudy) parts.push(`in ${e.fieldOfStudy}`);
                if (e.institution) parts.push(`from ${e.institution}`);
                return parts.join(' ');
              }).filter(q => q.trim()).join('\n');
            }
            
            console.log('Formatted qualifications:', formattedQualifications);
            
            setProfileData(prevData => ({
              ...prevData,
              name: profile.fullName || prevData.name,
              qualifications: formattedQualifications || prevData.qualifications,
            }));
          }

          let message = 'Resume uploaded successfully!';
          if (skills?.length > 0 || education?.length > 0 || bio) {
            message += '\n\nWe automatically extracted information from your CV:';
            if (skills?.length > 0) message += `\n• ${skills.length} skills added`;
            if (education?.length > 0) message += `\n• ${education.length} education entries added`;
            if (bio) message += '\n• Professional summary added';
            message += '\n\nPlease review and edit as needed.';
          }
          alert(message);
        } else {
          alert('Resume uploaded successfully!');
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) =>
    setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const handleSkillChange = (i, v) => {
    const skills = [...profileData.skills];
    skills[i] = v;
    setProfileData({ ...profileData, skills });
  };

  const handleAddSkill = () => {
    setProfileData({ 
      ...profileData, 
      skills: [...profileData.skills, ''] 
    });
  };

  const handleRemoveSkill = (idx) => {
    const skills = profileData.skills.filter((_, i) => i !== idx);
    setProfileData({ ...profileData, skills });
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/student/delete-resume', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCvFile(null);
        alert('Resume deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume. Please try again.');
    }
  };

  return (
    <div className={`${rootTheme} min-h-screen px-4 py-8`}>
      {loading ? (
        <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#443097] mx-auto mb-4"></div>
            <p className="text-lg">Loading profile...</p>
          </div>
        </div>
      ) : (
        <>
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
      onClick={() => {
        if (isEditing) {
          handleSaveProfile();
        } else {
          setIsEditing(true);
        }
      }}
      disabled={saving}
      className="px-4 py-2 text-white bg-[#443097] rounded-lg shadow hover:bg-[#36217c] disabled:opacity-50"
    >
      {saving ? "Saving..." : isEditing ? "Save" : "Edit Profile"}
    </button>

    {isEditing && (
      <button
        onClick={() => setIsEditing(false)}
        className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg shadow hover:bg-slate-300"
      >
        Cancel
      </button>
    )}

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

            <label className="mt-3 cursor-pointer text-[#443097] text-sm hover:text-[#36217c]">
              <input 
                type="file" 
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="hidden" 
                onChange={handleImageUpload} 
              />
              {profileData.image ? 'Change Photo' : 'Upload Photo'}
            </label>
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
              <span className="text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> {cvFile.name}</span>
              <a
                href={cvFile.url}
                target="_blank"
                rel="noopener noreferrer"
                download={cvFile.name}
                className="px-3 py-1 bg-[#443097] text-white rounded-lg text-sm hover:bg-[#36217c] transition-colors"
              >
                Download
              </a>
              <label className="px-3 py-1 bg-slate-600 text-white rounded-lg text-sm cursor-pointer hover:bg-slate-700 transition-colors">
                <input type="file" accept=".pdf" className="hidden" onChange={handleCvUpload} />
                Re-upload
              </label>
              <button
                onClick={handleDeleteResume}
                className="px-3 py-1 bg-slate-400 text-white rounded-lg text-sm hover:bg-slate-500 transition-colors"
              >
                Delete
              </button>
            </div>
          ) : (
            <label className="cursor-pointer text-[#443097] hover:text-[#36217c] flex items-center gap-2 transition-colors">
              <input type="file" accept=".pdf" className="hidden" onChange={handleCvUpload} />
              <Upload className="w-4 h-4" /> Upload CV (PDF only)
            </label>
          )}
        </div>

        {/* Skills */}
        <div className={`p-6 mt-6 rounded-xl shadow-md border ${cardTheme}`}>
          <h3 className="text-xl font-semibold mb-3">Skills</h3>

          <div className="flex flex-wrap gap-3">
            {isEditing ? (
              <>
                {profileData.skills.map((skill, idx) => (
                  <div key={idx} className={`flex items-center gap-2 border rounded-lg p-2 ${theme === "light" ? "bg-white border-slate-300" : "bg-slate-700 border-slate-600"}`}>
                    <input
                      value={skill}
                      onChange={(e) => handleSkillChange(idx, e.target.value)}
                      placeholder="Enter skill"
                      className={`outline-none ${theme === "light" ? "bg-white text-slate-900" : "bg-slate-700 text-slate-100"} w-32 placeholder:text-slate-400`}
                    />
                    <button
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddSkill}
                  className={`px-4 py-2 border-2 border-dashed border-[#443097] rounded-lg hover:bg-[#443097]/10 transition-colors ${theme === "light" ? "text-[#443097]" : "text-purple-400"}`}
                  type="button"
                >
                  + Add Skill
                </button>
              </>
            ) : (
              <>
                {profileData.skills.length > 0 ? (
                  profileData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#443097]/10 text-[#443097] dark:bg-[#443097]/20 dark:text-purple-300 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No skills added yet</p>
                )}
              </>
            )}
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
              {appliedCompanies.length > 0 ? (
                appliedCompanies.map((company) => (
                  <tr key={company.id} className="border-t border-slate-300 dark:border-slate-600">
                    <td className="p-3">{company.company}</td>
                    <td className="p-3">{company.position}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          company.status === "Shortlisted"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : company.status === "Accepted"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : company.status === "Rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {company.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-6 text-center text-slate-500 dark:text-slate-400">
                    You haven't applied to any internships yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
