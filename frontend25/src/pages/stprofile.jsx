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
    location: '',
    timezone: '',
    emailVerified: false,
    phoneVerified: false,
    // Role & Goal
    currentStatus: '',
    targetRole: '',
    primaryGoal: '',
    // Availability
    availableStartDate: '',
    weeklyAvailabilityHours: '',
    commitmentDurationWeeks: '',
    canWorkDuringExams: false,
    // Education
    highestEducationLevel: '',
    degreeProgram: '',
    institutionName: '',
    educationStartYear: '',
    educationEndYear: '',
    educationCGPA: '',
    // Top Skills (limited 5)
    topSkills: [],
    // Experience
    priorInternship: { hasInternship: false, company: '', role: '', durationWeeks: '' },
    priorWorkExperience: { hasWorkExperience: false, title: '', durationWeeks: '' },
    // Links
    links: { github: '', portfolio: '', linkedIn: '' },
    // Preferences
    internshipTypePreference: '',
    workModePreference: '',
    preferredDomains: [],
    preferredCompanySize: '',
    // Declarations
    declarations: { informationAccuracy: false, consentToSkillAssessment: false, consentToFeedbackScoring: false },
  });

  const [appliedCompanies, setAppliedCompanies] = useState([]);

  const [cvFile, setCvFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [microtasks, setMicrotasks] = useState([]);

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
          
          console.log('Profile picture from DB:', profile.profilePicture);
          const imageUrl = profile.profilePicture ? `http://localhost:5000${profile.profilePicture}` : null;
          console.log('Constructed image URL:', imageUrl);
          
          setProfileData({
            name: profile.fullName || user?.username || "",
            email: data.user.email || "",
            phone: profile.phone || "",
            bio: profile.bio || "",
            image: imageUrl,
            skills: profile.skills || [],
            qualifications: profile.qualifications || "",
            location: profile.location || '',
            timezone: profile.timezone || '',
            emailVerified: !!profile.emailVerified,
            phoneVerified: !!profile.phoneVerified,
            // Role & Goal
            currentStatus: profile.currentStatus || '',
            targetRole: profile.targetRole || '',
            primaryGoal: profile.primaryGoal || '',
            // Availability
            availableStartDate: (profile.availability && profile.availability.startDate) || '',
            weeklyAvailabilityHours: (profile.availability && profile.availability.hoursPerWeek) || '',
            commitmentDurationWeeks: (profile.availability && profile.availability.commitmentDurationWeeks) || '',
            canWorkDuringExams: (profile.availability && profile.availability.canWorkDuringExams) || false,
            // Education
            highestEducationLevel: profile.highestEducationLevel || '',
            degreeProgram: profile.degreeProgram || '',
            institutionName: profile.institutionName || '',
            educationStartYear: profile.educationStartYear || '',
            educationEndYear: profile.educationEndYear || '',
            educationCGPA: profile.educationCGPA || '',
            // Top Skills
            topSkills: profile.topSkills || [],
            // Experience
            priorInternship: profile.priorInternship || { hasInternship: false, company: '', role: '', durationWeeks: '' },
            priorWorkExperience: profile.priorWorkExperience || { hasWorkExperience: false, title: '', durationWeeks: '' },
            // Links
            links: profile.links || { github: '', portfolio: '', linkedIn: '' },
            // Preferences
            internshipTypePreference: profile.internshipTypePreference || '',
            workModePreference: profile.workModePreference || '',
            preferredDomains: profile.preferredDomains || [],
            preferredCompanySize: profile.preferredCompanySize || '',
            // Declarations
            declarations: profile.declarations || { informationAccuracy: false, consentToSkillAssessment: false, consentToFeedbackScoring: false },
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
    fetchMicrotasks();
  }, [user]);

  const fetchMicrotasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/internships/student/microtasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMicrotasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Error fetching microtasks:', err);
    }
  };

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
          location: profileData.location,
          timezone: profileData.timezone,
          emailVerified: profileData.emailVerified,
          phoneVerified: profileData.phoneVerified,
          skills: profileData.skills,
          qualifications: profileData.qualifications,
          // Role & Goal
          currentStatus: profileData.currentStatus,
          targetRole: profileData.targetRole,
          primaryGoal: profileData.primaryGoal,
          // Availability
          availableStartDate: profileData.availableStartDate,
          weeklyAvailabilityHours: profileData.weeklyAvailabilityHours,
          commitmentDurationWeeks: profileData.commitmentDurationWeeks,
          canWorkDuringExams: profileData.canWorkDuringExams,
          // Education
          highestEducationLevel: profileData.highestEducationLevel,
          degreeProgram: profileData.degreeProgram,
          institutionName: profileData.institutionName,
          educationStartYear: profileData.educationStartYear,
          educationEndYear: profileData.educationEndYear,
          educationCGPA: profileData.educationCGPA,
          // Top Skills
          topSkills: profileData.topSkills,
          // Experience
          priorInternship: profileData.priorInternship,
          priorWorkExperience: profileData.priorWorkExperience,
          // Links
          links: profileData.links,
          // Preferences
          internshipTypePreference: profileData.internshipTypePreference,
          workModePreference: profileData.workModePreference,
          preferredDomains: profileData.preferredDomains,
          preferredCompanySize: profileData.preferredCompanySize,
          // Declarations
          declarations: profileData.declarations
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile saved successfully:', data);
        alert('Profile updated successfully!');
        setIsEditing(false);
      } else {
        const error = await response.json();
        console.error('Save error:', error);
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

      const data = await response.json();
      console.log('Upload response:', data);

      if (response.ok) {
        const newImageUrl = `http://localhost:5000${data.profilePicture}`;
        console.log('Image uploaded successfully. New URL:', newImageUrl);
        setProfileData(prev => ({ 
          ...prev, 
          image: newImageUrl
        }));
        alert('Profile picture uploaded successfully!');
      } else {
        const error = await response.json();
        console.error('Upload failed:', error);
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
          const { skills, bio } = data.extractedData;
          
          console.log('Extracted Data:', data.extractedData);
          
          setProfileData(prev => ({
            ...prev,
            // Merge new skills with existing ones
            skills: skills && skills.length > 0 
              ? [...new Set([...prev.skills, ...skills])] 
              : prev.skills,
            // Update bio if empty
            bio: bio && !prev.bio ? bio : prev.bio,
          }));

          let message = 'Resume uploaded successfully!';
          if (skills?.length > 0 || bio) {
            message += '\n\nWe automatically extracted information from your CV:';
            if (skills?.length > 0) message += `\n• ${skills.length} skills added`;
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
                {/* Basic Info */}
                <input name="name" value={profileData.name} onChange={handleInput} placeholder="Full name" className={`border rounded-lg p-2 ${inputTheme}`} />
                <div className="grid grid-cols-2 gap-3">
                  <input name="email" value={profileData.email} readOnly placeholder="Email" className={`border rounded-lg p-2 ${inputTheme} opacity-70`} />
                  <div className="flex items-center gap-3">
                    <input name="phone" value={profileData.phone} onChange={handleInput} placeholder="Phone" className={`border rounded-lg p-2 ${inputTheme} w-full`} />
                    <div className="text-sm">
                      {profileData.emailVerified ? <span className="text-green-600">Email ✓</span> : <span className="text-yellow-600">Email unverified</span>}
                      <br />
                      {profileData.phoneVerified ? <span className="text-green-600">Phone ✓</span> : <span className="text-yellow-600">Phone unverified</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input name="location" value={profileData.location || ''} onChange={handleInput} placeholder="Location (City, Country)" className={`border rounded-lg p-2 ${inputTheme}`} />
                  <input name="timezone" value={profileData.timezone || ''} onChange={handleInput} placeholder="Timezone (e.g. UTC+5:30)" className={`border rounded-lg p-2 ${inputTheme}`} />
                </div>

                <textarea name="bio" value={profileData.bio} onChange={handleInput} placeholder="Short bio / summary" className={`border rounded-lg p-2 ${inputTheme}`} />

                {/* Role & Goal */}
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Current Status</label>
                  <select name="currentStatus" value={profileData.currentStatus} onChange={handleInput} className={`border rounded-lg p-2 ${inputTheme}`}>
                    <option value="">Select status</option>
                    <option value="Student">Student</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Career Switcher">Career Switcher</option>
                  </select>
                  <input name="targetRole" value={profileData.targetRole} onChange={handleInput} placeholder="Target role" className={`border rounded-lg p-2 ${inputTheme}`} />
                  <input name="primaryGoal" value={profileData.primaryGoal} onChange={handleInput} placeholder="Primary goal" className={`border rounded-lg p-2 ${inputTheme}`} />
                </div>

                {/* Availability */}
                <div className="grid grid-cols-3 gap-3">
                  <input type="date" name="availableStartDate" value={profileData.availableStartDate || ''} onChange={(e)=>setProfileData(prev=>({...prev, availableStartDate: e.target.value}))} className={`border rounded-lg p-2 ${inputTheme}`} />
                  <input type="number" min="0" name="weeklyAvailabilityHours" value={profileData.weeklyAvailabilityHours || ''} onChange={(e)=>setProfileData(prev=>({...prev, weeklyAvailabilityHours: e.target.value}))} placeholder="Hours/week" className={`border rounded-lg p-2 ${inputTheme}`} />
                  <input type="number" min="0" name="commitmentDurationWeeks" value={profileData.commitmentDurationWeeks || ''} onChange={(e)=>setProfileData(prev=>({...prev, commitmentDurationWeeks: e.target.value}))} placeholder="Commitment (weeks)" className={`border rounded-lg p-2 ${inputTheme}`} />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!!profileData.canWorkDuringExams} onChange={(e)=>setProfileData(prev=>({...prev, canWorkDuringExams: e.target.checked}))} /> Can work during exams?</label>
                </div>

                {/* Education (structured) */}
                <div className="grid grid-cols-2 gap-3">
                  <input name="highestEducationLevel" value={profileData.highestEducationLevel || ''} onChange={handleInput} placeholder="Highest education level" className={`border rounded-lg p-2 ${inputTheme}`} />
                  <input name="degreeProgram" value={profileData.degreeProgram || ''} onChange={handleInput} placeholder="Degree / Program" className={`border rounded-lg p-2 ${inputTheme}`} />
                  <input name="institutionName" value={profileData.institutionName || ''} onChange={handleInput} placeholder="Institution" className={`border rounded-lg p-2 ${inputTheme}`} />
                  <div className="flex gap-3">
                    <input name="educationStartYear" value={profileData.educationStartYear || ''} onChange={handleInput} placeholder="Start Year" className={`border rounded-lg p-2 ${inputTheme} w-1/2`} />
                    <input name="educationEndYear" value={profileData.educationEndYear || ''} onChange={handleInput} placeholder="End Year" className={`border rounded-lg p-2 ${inputTheme} w-1/2`} />
                  </div>
                  <input name="educationCGPA" value={profileData.educationCGPA || ''} onChange={handleInput} placeholder="CGPA / % (optional)" className={`border rounded-lg p-2 ${inputTheme}`} />
                </div>

                {/* Top 5 Skills */}
                <div>
                  <label className="block mb-2 font-medium">Top 5 Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {(profileData.topSkills || []).map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 border rounded-lg p-2">
                        <input value={s} onChange={(e)=>{
                          const newSkills = [...(profileData.topSkills||[])]; newSkills[idx]=e.target.value; setProfileData(prev=>({...prev, topSkills:newSkills}));
                        }} className={`outline-none ${theme === "light" ? "bg-white text-slate-900" : "bg-slate-700 text-slate-100"} w-40`} />
                        <button onClick={()=>{
                          const newSkills = (profileData.topSkills||[]).filter((_,i)=>i!==idx); setProfileData(prev=>({...prev, topSkills:newSkills}));
                        }} className="text-red-500">×</button>
                      </div>
                    ))}
                    {(profileData.topSkills||[]).length < 5 && (
                      <button onClick={()=>setProfileData(prev=>({...prev, topSkills: [...(prev.topSkills||[]), '']}))} className="px-3 py-1 border rounded-lg">+ Add</button>
                    )}
                  </div>
                </div>

                {/* Experience (optional) */}
                <div className="grid gap-2">
                  <label className="font-medium">Prior Internship</label>
                  <div className="flex gap-2 items-center">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={profileData.priorInternship?.hasInternship} onChange={(e)=>setProfileData(prev=>({...prev, priorInternship: {...(prev.priorInternship||{}), hasInternship: e.target.checked}}))} /> Had internship?</label>
                    {profileData.priorInternship?.hasInternship && (
                      <>
                        <input placeholder="Company" value={profileData.priorInternship.company} onChange={(e)=>setProfileData(prev=>({...prev, priorInternship: {...(prev.priorInternship||{}), company: e.target.value}}))} className={`border rounded-lg p-2 ${inputTheme}`} />
                        <input placeholder="Role" value={profileData.priorInternship.role} onChange={(e)=>setProfileData(prev=>({...prev, priorInternship: {...(prev.priorInternship||{}), role: e.target.value}}))} className={`border rounded-lg p-2 ${inputTheme}`} />
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="font-medium">Prior Work Experience</label>
                  <div className="flex gap-2 items-center">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={profileData.priorWorkExperience?.hasWorkExperience} onChange={(e)=>setProfileData(prev=>({...prev, priorWorkExperience: {...(prev.priorWorkExperience||{}), hasWorkExperience: e.target.checked}}))} /> Has prior work?</label>
                    {profileData.priorWorkExperience?.hasWorkExperience && (
                      <>
                        <input placeholder="Title" value={profileData.priorWorkExperience.title} onChange={(e)=>setProfileData(prev=>({...prev, priorWorkExperience: {...(prev.priorWorkExperience||{}), title: e.target.value}}))} className={`border rounded-lg p-2 ${inputTheme}`} />
                      </>
                    )}
                  </div>
                </div>

                {/* Links */}
                <div className="grid gap-2">
                  <input name="links.github" value={profileData.links?.github || ''} onChange={(e)=>setProfileData(prev=>({...prev, links: {...(prev.links||{}), github: e.target.value}}))} placeholder="GitHub URL" className={`border rounded-lg p-2 ${inputTheme}`} />
                  <input name="links.portfolio" value={profileData.links?.portfolio || ''} onChange={(e)=>setProfileData(prev=>({...prev, links: {...(prev.links||{}), portfolio: e.target.value}}))} placeholder="Portfolio URL (optional)" className={`border rounded-lg p-2 ${inputTheme}`} />
                  <input name="links.linkedIn" value={profileData.links?.linkedIn || ''} onChange={(e)=>setProfileData(prev=>({...prev, links: {...(prev.links||{}), linkedIn: e.target.value}}))} placeholder="LinkedIn (optional)" className={`border rounded-lg p-2 ${inputTheme}`} />
                </div>

                {/* Preferences */}
                <div className="grid grid-cols-3 gap-3">
                  <select name="internshipTypePreference" value={profileData.internshipTypePreference || ''} onChange={handleInput} className={`border rounded-lg p-2 ${inputTheme}`}>
                    <option value="">Internship type</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                  <select name="workModePreference" value={profileData.workModePreference || ''} onChange={handleInput} className={`border rounded-lg p-2 ${inputTheme}`}>
                    <option value="">Work mode</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                  <input name="preferredCompanySize" value={profileData.preferredCompanySize || ''} onChange={handleInput} placeholder="Preferred company size" className={`border rounded-lg p-2 ${inputTheme}`} />
                </div>

                {/* Declarations */}
                <div className="grid gap-2 text-sm">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={profileData.declarations?.informationAccuracy} onChange={(e)=>setProfileData(prev=>({...prev, declarations: {...(prev.declarations||{}), informationAccuracy: e.target.checked}}))} /> I confirm the information is accurate</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={profileData.declarations?.consentToSkillAssessment} onChange={(e)=>setProfileData(prev=>({...prev, declarations: {...(prev.declarations||{}), consentToSkillAssessment: e.target.checked}}))} /> I consent to skill assessments</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={profileData.declarations?.consentToFeedbackScoring} onChange={(e)=>setProfileData(prev=>({...prev, declarations: {...(prev.declarations||{}), consentToFeedbackScoring: e.target.checked}}))} /> I consent to feedback & scoring</label>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold">{profileData.name}</h2>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <p><strong>Email:</strong> {profileData.email} </p>
                    <p><strong>Phone:</strong> {profileData.phone} </p>
                    <p><strong>Location:</strong> {profileData.location}</p>
                    <p><strong>Timezone:</strong> {profileData.timezone}</p>
                    <p className="mt-2">{profileData.bio}</p>
                  </div>
                  <div>
                    <p><strong>Current Status:</strong> {profileData.currentStatus}</p>
                    <p><strong>Target Role:</strong> {profileData.targetRole}</p>
                    <p><strong>Availability:</strong> {profileData.weeklyAvailabilityHours ? `${profileData.weeklyAvailabilityHours} hrs/week` : '—'} starting {profileData.availableStartDate || '—'}</p>
                    <p><strong>Top Skills:</strong> {(profileData.topSkills||[]).join(', ')}</p>
                  </div>
                </div>
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

        {/* Microtasks */}
        <div className={`p-6 mt-6 rounded-xl shadow-md border ${cardTheme}`}>
          <h3 className="text-xl font-semibold mb-3">Assigned Microtasks</h3>
          {microtasks.length === 0 ? (
            <p className="text-slate-500">No microtasks assigned.</p>
          ) : (
            <div className="space-y-3">
              {microtasks.map((t) => (
                <div key={t.taskId} className={`p-4 rounded-lg border ${cardTheme}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{t.title}</p>
                      <p className="text-sm text-slate-600">For: {t.internshipTitle}</p>
                      <p className="text-xs text-slate-500">Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</p>
                      <p className="mt-2">{t.instructions}</p>
                      {t.submission ? (
                        <div className="mt-2 text-sm">
                          <p>Submitted: {t.submission.submittedAt ? new Date(t.submission.submittedAt).toLocaleString() : '—'}</p>
                          <p>Type: {t.submission.submissionType}</p>
                          <p>Content: {typeof t.submission.content === 'string' ? (<a href={t.submission.content} target="_blank" rel="noreferrer">Link</a>) : JSON.stringify(t.submission.content)}</p>
                        </div>
                      ) : (
                        <MicrotaskSubmit key={t.taskId} task={t} onSubmitted={fetchMicrotasks} />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Status: {t.status}</p>
                      {t.score !== undefined && <p className="text-sm">Score: {t.score}</p>}
                      {t.feedback && <p className="text-sm">Feedback: {t.feedback}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}

// Separate component for submitting a microtask
function MicrotaskSubmit({ task, onSubmitted }) {
  const [link, setLink] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [answers, setAnswers] = React.useState(() => (task.quizQuestions ? Array(task.quizQuestions.length).fill(null) : []));

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      let body;
      let headers = { 'Authorization': `Bearer ${token}` };

      if (task.type === 'quiz') {
        // ensure all answers provided
        const unanswered = answers.some(a => a === null || typeof a === 'undefined');
        if (unanswered) return alert('Please answer all questions');
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ submissionType: 'answers', content: { answers } });
      } else {
        if (!link) return alert('Provide a link or content');
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ submissionType: 'link', content: link });
      }

      const res = await fetch(`http://localhost:5000/api/internships/${task.internshipId}/microtasks/${task.taskId}/submit`, {
        method: 'POST',
        headers,
        body
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to submit');
        return;
      }
      alert('Submitted');
      onSubmitted && onSubmitted();
    } catch (err) {
      console.error('Submit microtask error:', err);
      alert('Error submitting microtask');
    } finally { setSubmitting(false); }
  };

  // render quiz UI when appropriate
  if (task.type === 'quiz') {
    return (
      <div className="mt-3">
        {(task.quizQuestions || []).map((q, idx) => (
          <div key={idx} className="mb-3">
            <p className="font-medium">{idx + 1}. {q.question}</p>
            <div className="flex gap-3 mt-2">
              { (q.options || []).map((opt, oi) => (
                <label key={oi} className="flex items-center gap-2">
                  <input type="radio" name={`q_${task.taskId}_${idx}`} checked={answers[idx]===oi} onChange={()=>{ const copy=[...answers]; copy[idx]=oi; setAnswers(copy); }} />
                  <span>{opt}</span>
                </label>
              )) }
            </div>
          </div>
        ))}
        <div className="flex justify-end mt-2">
          <button onClick={handleSubmit} disabled={submitting} className="px-3 py-1 bg-[#443097] text-white rounded">{submitting ? 'Submitting...' : 'Submit Quiz'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <input value={link} onChange={(e)=>setLink(e.target.value)} placeholder="Submission link or text" className="border p-2 rounded w-full" />
      <div className="flex justify-end mt-2">
        <button onClick={handleSubmit} disabled={submitting} className="px-3 py-1 bg-[#443097] text-white rounded">{submitting ? 'Submitting...' : 'Submit'}</button>
      </div>
    </div>
  );
}
