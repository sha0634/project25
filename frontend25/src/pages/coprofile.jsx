import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Globe, Users, MapPin, Phone, Mail, Edit2, Save, X, FileText } from 'lucide-react';

export default function CompanyProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [theme, setTheme] = useState("light");
  
  const [profileData, setProfileData] = useState({
    companyName: "",
    email: "",
    phone: "",
    location: "",
    industry: "",
    companySize: "",
    website: "",
    description: "",
    image: null
  });

  const [postedInternships, setPostedInternships] = useState([]);
  const [applicantsCount, setApplicantsCount] = useState(0);

  // Theme classes
  const cardTheme = theme === "light"
    ? "bg-white text-black border-slate-300"
    : "bg-slate-800 text-white border-slate-600";

  const inputTheme = theme === "light"
    ? "bg-white text-black border-slate-300"
    : "bg-slate-700 text-white border-slate-600";

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/profile/company', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const profile = data.profile;
          
          console.log('Company profile from DB:', profile);
          const imageUrl = profile.profilePicture ? `http://localhost:5000${profile.profilePicture}` : null;
          
          setProfileData({
            companyName: profile.companyName || "",
            email: data.user.email || "",
            phone: profile.phone || "",
            location: profile.location || "",
            industry: profile.industry || "",
            companySize: profile.companySize || "",
            website: profile.website || "",
            description: profile.description || "",
            image: imageUrl
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchInternships = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/internships/company/my-internships', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPostedInternships(data.internships || []);
          
          // Calculate total applicants
          const total = data.internships.reduce((sum, internship) => 
            sum + (internship.applicants?.length || 0), 0
          );
          setApplicantsCount(total);
        }
      } catch (error) {
        console.error('Error fetching internships:', error);
      }
    };

    fetchProfile();
    fetchInternships();
  }, []);

  // Handle save profile
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/company', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyName: profileData.companyName,
          phone: profileData.phone,
          location: profileData.location,
          industry: profileData.industry,
          companySize: profileData.companySize,
          website: profileData.website,
          description: profileData.description
        })
      });

      if (response.ok) {
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

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only image files (JPEG, PNG, GIF, WebP) are allowed!');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB!');
      return;
    }

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

      if (response.ok) {
        const newImageUrl = `http://localhost:5000${data.profilePicture}`;
        setProfileData(prev => ({ 
          ...prev, 
          image: newImageUrl
        }));
        alert('Company logo uploaded successfully!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition ${theme === "light" ? "bg-slate-50 text-black" : "bg-slate-900 text-white"}`}>
      {/* Header */}
      <div className={`border-b ${theme === "light" ? "border-slate-200" : "border-slate-700"}`}>
        <div className="max-w-5xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Company Profile</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your company information</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/codashboard')}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg shadow hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Back to Dashboard
            </button>

            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={saving}
              className="px-4 py-2 text-white bg-[#443097] rounded-lg shadow hover:bg-[#36217c] disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                "Saving..."
              ) : isEditing ? (
                <><Save className="w-4 h-4" /> Save</>
              ) : (
                <><Edit2 className="w-4 h-4" /> Edit Profile</>
              )}
            </button>

            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg shadow hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Basic Info Card */}
        <div className={`p-6 rounded-xl shadow-md border ${cardTheme} mb-6`}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Company Logo */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-lg overflow-hidden shadow-md bg-slate-400 flex items-center justify-center">
                {profileData.image ? (
                  <img
                    src={profileData.image}
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-16 h-16 text-slate-300" />
                )}
              </div>

              <label className="mt-3 cursor-pointer text-[#443097] text-sm hover:text-[#36217c] flex items-center gap-1">
                <input 
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
                <Edit2 className="w-4 h-4" />
                {profileData.image ? 'Change Logo' : 'Upload Logo'}
              </label>
            </div>

            {/* Company Details */}
            <div className="flex-1">
              {isEditing ? (
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Name</label>
                    <input
                      name="companyName"
                      value={profileData.companyName}
                      onChange={handleInput}
                      placeholder="Enter company name"
                      className={`w-full border rounded-lg p-2 ${inputTheme}`}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        name="email"
                        value={profileData.email}
                        disabled
                        className={`w-full border rounded-lg p-2 ${inputTheme} opacity-60 cursor-not-allowed`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInput}
                        placeholder="+91 98765 43210"
                        className={`w-full border rounded-lg p-2 ${inputTheme}`}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Industry</label>
                      <input
                        name="industry"
                        value={profileData.industry}
                        onChange={handleInput}
                        placeholder="e.g., Technology, Finance"
                        className={`w-full border rounded-lg p-2 ${inputTheme}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Company Size</label>
                      <select
                        name="companySize"
                        value={profileData.companySize}
                        onChange={handleInput}
                        className={`w-full border rounded-lg p-2 ${inputTheme}`}
                      >
                        <option value="">Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <input
                        name="location"
                        value={profileData.location}
                        onChange={handleInput}
                        placeholder="City, Country"
                        className={`w-full border rounded-lg p-2 ${inputTheme}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Website</label>
                      <input
                        name="website"
                        value={profileData.website}
                        onChange={handleInput}
                        placeholder="https://company.com"
                        className={`w-full border rounded-lg p-2 ${inputTheme}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Company Description</label>
                    <textarea
                      name="description"
                      value={profileData.description}
                      onChange={handleInput}
                      placeholder="Tell us about your company..."
                      rows={4}
                      className={`w-full border rounded-lg p-2 ${inputTheme}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold">{profileData.companyName || "Company Name Not Set"}</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="w-4 h-4" />
                      <span>{profileData.email}</span>
                    </div>

                    {profileData.phone && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="w-4 h-4" />
                        <span>{profileData.phone}</span>
                      </div>
                    )}

                    {profileData.location && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span>{profileData.location}</span>
                      </div>
                    )}

                    {profileData.website && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Globe className="w-4 h-4" />
                        <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-[#443097] hover:underline">
                          {profileData.website}
                        </a>
                      </div>
                    )}

                    {profileData.industry && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Building2 className="w-4 h-4" />
                        <span>{profileData.industry}</span>
                      </div>
                    )}

                    {profileData.companySize && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>{profileData.companySize} employees</span>
                      </div>
                    )}
                  </div>

                  {profileData.description && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">About Us</h3>
                      <p className="text-slate-600 dark:text-slate-400">{profileData.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className={`p-6 rounded-xl shadow-md border ${cardTheme} text-center`}>
            <FileText className="w-8 h-8 mx-auto mb-2 text-[#443097]" />
            <div className="text-3xl font-bold">{postedInternships.length}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Posted Internships</div>
          </div>

          <div className={`p-6 rounded-xl shadow-md border ${cardTheme} text-center`}>
            <Users className="w-8 h-8 mx-auto mb-2 text-[#443097]" />
            <div className="text-3xl font-bold">{applicantsCount}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Applicants</div>
          </div>

          <div className={`p-6 rounded-xl shadow-md border ${cardTheme} text-center`}>
            <Building2 className="w-8 h-8 mx-auto mb-2 text-[#443097]" />
            <div className="text-3xl font-bold">{postedInternships.filter(i => i.status === 'Active').length}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Active Listings</div>
          </div>
        </div>

        {/* Posted Internships */}
        <div className={`p-6 rounded-xl shadow-md border ${cardTheme}`}>
          <h3 className="text-xl font-semibold mb-4">Posted Internships</h3>
          
          {postedInternships.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
              No internships posted yet. Go to dashboard to post your first internship!
            </p>
          ) : (
            <div className="space-y-4">
              {postedInternships.map((internship) => (
                <div 
                  key={internship._id} 
                  className={`p-4 rounded-lg border ${theme === "light" ? "border-slate-200 hover:bg-slate-50" : "border-slate-600 hover:bg-slate-700"} transition`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{internship.title}</h4>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {internship.location}
                        </span>
                        <span>{internship.type}</span>
                        <span>{internship.duration}</span>
                        <span className="font-semibold text-[#443097]">{internship.stipend}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        internship.status === 'Active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {internship.status}
                      </span>
                      <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {internship.applicants?.length || 0} applicants
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
