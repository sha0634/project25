import React, { useEffect, useMemo, useState } from "react";

/* =====================================================
   MOCK LOGIN (ROLE SELECTION)
===================================================== */
function RoleSelector({ onSelect }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-80 text-center space-y-4">
        <h1 className="text-2xl font-bold">Placify</h1>
        <p className="text-sm text-slate-600">Choose your role</p>

        <button
          onClick={() => onSelect("student")}
          className="w-full bg-[#443097] text-white py-2 rounded-lg"
        >
          Login as Student
        </button>

        <button
          onClick={() => onSelect("company")}
          className="w-full bg-slate-800 text-white py-2 rounded-lg"
        >
          Login as Company
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   COMPANY: CREATE COURSE
===================================================== */
function CompanyCreateCourse({ theme }) {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    duration: "",
    level: "Beginner",
    videos: [],
  });

  const inputTheme =
    theme === "light"
      ? "bg-white text-black border-slate-300"
      : "bg-slate-700 text-white border-slate-600";

  const handleChange = (e) =>
    setCourse({ ...course, [e.target.name]: e.target.value });

  const handleVideoChange = (index, value) => {
    const v = [...(course.videos || [])];
    v[index] = value;
    setCourse({ ...course, videos: v });
  };

  const addVideo = () => setCourse({ ...course, videos: [...(course.videos||[]), ""] });
  const removeVideo = (index) => {
    const v = [...(course.videos || [])];
    v.splice(index, 1);
    setCourse({ ...course, videos: v });
  };

  const handleSubmit = () => {
    if (!course.title) return alert("Title required");
    // POST to backend (requires a logged-in company with token)
    const token = localStorage.getItem('token');
    if (!token) return alert('Please login as a company to publish courses');

    const payload = {
      name: course.title,
      description: course.description,
      duration: course.duration,
      category: course.level,
      isPublished: true,
      videoUrls: JSON.stringify((course.videos || []).map(s => (s||"").trim()).filter(Boolean))
    };

    fetch('http://localhost:5000/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }).then(async res => {
      if (!res.ok) {
        const b = await res.json().catch(()=>({}));
        return alert(b.message || 'Failed to create course');
      }
      setCourse({ title: "", description: "", duration: "", level: "Beginner", videos: [] });
      alert('Course published');
    }).catch(err => {
      console.error('Create course error:', err);
      alert('Failed to publish course');
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Create Course</h2>

      <div className="space-y-3">
        <input
          name="title"
          placeholder="Course Title"
          value={course.title}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${inputTheme}`}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={course.description}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${inputTheme}`}
        />
        <input
          name="duration"
          placeholder="Duration (e.g. 4 weeks)"
          value={course.duration}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${inputTheme}`}
        />
        <select
          name="level"
          value={course.level}
          onChange={handleChange}
          className={`w-full p-2 border rounded-lg ${inputTheme}`}
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <div className="space-y-2">
          <label className="text-sm font-medium">Course Videos </label>
          {(course.videos || []).map((v, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder={`Video URL #${i + 1}`}
                value={v}
                onChange={(e) => handleVideoChange(i, e.target.value)}
                className={`flex-1 p-2 border rounded-lg ${inputTheme}`}
              />
              <button
                onClick={() => removeVideo(i)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded"
                type="button"
              >
                Remove
              </button>
            </div>
          ))}

          <div>
            <button
              onClick={addVideo}
              type="button"
              className="px-3 py-1 bg-green-100 text-green-700 rounded"
            >
              Add Video
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[#443097] text-white py-2 rounded-lg"
        >
          Publish Course
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   STUDENT: VIEW & ENROLL COURSES
===================================================== */
function StudentCourses({ theme }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCourseId, setOpenCourseId] = useState(null);
  const [videoBlobs, setVideoBlobs] = useState({}); // { courseId: [objectUrl,...] }
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(() => {
    try {
      const raw = localStorage.getItem('enrolledCourses');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  });

  const fetchCourses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const filtered = (data.courses || []).filter(c => (c.companyId || c.companyName));
      setCourses(filtered);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // When a course is opened and the student is enrolled, fetch protected video blobs
  useEffect(() => {
    if (!openCourseId) return;
    const course = courses.find(c => c._id === openCourseId);
    if (!course) return;
    const userId = localStorage.getItem('userId');
    const enrolled = (course.enrolledStudents || []).some(id => id.toString() === userId);
    if (!enrolled) return;

    let cancelled = false;
    const token = localStorage.getItem('token');
    const fetchVideos = async () => {
      const urls = [];
      for (let i = 0; i < (course.videos || []).length; i++) {
        try {
          const res = await fetch(`http://localhost:5000/api/courses/${course._id}/video/${i}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) {
            urls.push(null);
            continue;
          }
          const blob = await res.blob();
          const objUrl = URL.createObjectURL(blob);
          urls.push(objUrl);
        } catch (err) {
          console.error('Error fetching protected video', err);
          urls.push(null);
        }
      }
      if (!cancelled) setVideoBlobs(prev => ({ ...prev, [course._id]: urls }));
    };

    fetchVideos();

    return () => {
      cancelled = true;
      const prev = videoBlobs[course._id] || [];
      prev.forEach(u => { if (u) URL.revokeObjectURL(u); });
      setVideoBlobs(prevState => { const copy = { ...prevState }; delete copy[course._id]; return copy; });
    };
  }, [openCourseId]);

  const enroll = async (courseId) => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return alert('Please login as a student to enroll');

    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const body = await res.json();
      if (!res.ok) return alert(body.message || 'Failed to enroll');

      // update local UI
      setCourses(prev => prev.map(c => c._id === courseId ? { ...c, enrolledStudents: [...(c.enrolledStudents||[]), userId] } : c));
      // open the course so the student immediately gets access
      setOpenCourseId(courseId);
      // persist enrollment locally so button shows 'View' across reloads
      setEnrolledCourseIds(prev => {
        const next = Array.from(new Set([...(prev||[]), courseId]));
        try { localStorage.setItem('enrolledCourses', JSON.stringify(next)); } catch (e) { /* ignore */ }
        return next;
      });
      alert('Enrolled successfully');
    } catch (err) {
      console.error('Enroll error:', err);
      alert('Failed to enroll');
    }
  };

  const cardTheme =
    theme === "light"
      ? "bg-white border-slate-200"
      : "bg-slate-800 border-slate-700";

  if (loading) return <div className="max-w-6xl mx-auto p-6">Loading courses...</div>;

  const userId = localStorage.getItem('userId');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Available Courses</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const enrolledServer = (course.enrolledStudents || []).some(id => id.toString() === userId);
          const enrolledLocal = enrolledCourseIds.includes(course._id);
          const enrolled = enrolledServer || enrolledLocal;
          const opened = openCourseId === course._id;
          return (
            <div
              key={course._id}
              className={`border rounded-xl p-4 shadow-sm ${cardTheme}`}
            >
              <h3 className="font-semibold">{course.name}</h3>
              <p className="text-sm text-[#443097]">{course.companyName || 'Company'}</p>
              <p className="text-xs mt-2">{course.description}</p>
              <p className="text-xs mt-1">Duration: {course.duration}</p>

              {/* only show videos to enrolled students */}
              {enrolled && opened && course.videos && course.videos.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Videos:</p>
                  <ul className="text-xs list-disc list-inside">
                    {course.videos.map((url, idx) => (
                      <li key={idx} className="mb-3">
                        {videoBlobs[course._id] && videoBlobs[course._id][idx] ? (
                          <video controls className="w-full max-h-60 rounded" src={videoBlobs[course._id][idx]}>
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <span className="text-sm text-slate-500">Loading video {idx + 1}...</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => {
                  if (enrolled) return setOpenCourseId(opened ? null : course._id);
                  enroll(course._id);
                }}
                className={`mt-3 w-full py-1.5 rounded-lg text-sm ${enrolled ? 'bg-[#0ea5a2] text-white' : 'bg-[#443097] text-white'}`}
              >
                {enrolled ? (opened ? 'Close Course' : 'View Course') : 'Enroll'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =====================================================
   STUDENT PROFILE: ENROLLED COURSES
===================================================== */
function StudentProfile({ theme }) {
  const [enrolled, setEnrolled] = useState([]);
  const [openEnrolledId, setOpenEnrolledId] = useState(null);
  const [profileVideoBlobs, setProfileVideoBlobs] = useState({});

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/courses');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        const userId = localStorage.getItem('userId');
        const my = (data.courses || []).filter(c => (c.enrolledStudents || []).some(id => id.toString() === userId) && (c.companyId || c.companyName));
        setEnrolled(my);
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
        setEnrolled([]);
      }
    };
    fetchEnrolled();
  }, []);

  // Fetch protected video blobs for opened enrolled course in profile
  useEffect(() => {
    if (!openEnrolledId) return;
    const course = enrolled.find(c => c._id === openEnrolledId);
    if (!course) return;
    const token = localStorage.getItem('token');
    let cancelled = false;

    const fetchVideos = async () => {
      const urls = [];
      for (let i = 0; i < (course.videos || []).length; i++) {
        try {
          const res = await fetch(`http://localhost:5000/api/courses/${course._id}/video/${i}`, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) { urls.push(null); continue; }
          const blob = await res.blob();
          urls.push(URL.createObjectURL(blob));
        } catch (err) { console.error('Profile video fetch error', err); urls.push(null); }
      }
      if (!cancelled) setProfileVideoBlobs(prev => ({ ...prev, [course._id]: urls }));
    };

    fetchVideos();

    return () => {
      cancelled = true;
      const prev = profileVideoBlobs[course._id] || [];
      prev.forEach(u => { if (u) URL.revokeObjectURL(u); });
      setProfileVideoBlobs(prevState => { const copy = { ...prevState }; delete copy[course._id]; return copy; });
    };
  }, [openEnrolledId]);

  const cardTheme =
    theme === "light"
      ? "bg-white border-slate-200"
      : "bg-slate-800 border-slate-700";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Enrolled Courses</h2>

      <div className={`border rounded-xl p-4 ${cardTheme}`}>
        {enrolled.length === 0 ? (
          <p className="text-sm text-slate-500">No courses enrolled yet.</p>
        ) : (
          <ul className="space-y-2">
            {enrolled.map((c) => {
              const opened = openEnrolledId === c._id;
              return (
                <li key={c._id} className="p-3 rounded-lg bg-[#443097]/10 text-[#443097]">
                  <div className="flex items-center justify-between">
                    <div>{c.name} — {c.companyName || 'Company'}</div>
                    <div>
                      <button
                        onClick={() => setOpenEnrolledId(opened ? null : c._id)}
                        className="px-3 py-1 bg-white text-[#443097] rounded"
                        type="button"
                      >
                        {opened ? 'Close' : 'Enter Course'}
                      </button>
                    </div>
                  </div>

                  {opened && c.videos && c.videos.length > 0 && (
                    <div className="mt-3 text-sm">
                      <p className="font-medium">Videos:</p>
                      <ul className="list-disc list-inside text-xs mt-1">
                        {c.videos.map((v, i) => (
                          <li key={i}>
                                {profileVideoBlobs[c._id] && profileVideoBlobs[c._id][i] ? (
                                  <video controls className="w-full max-h-60 rounded" src={profileVideoBlobs[c._id][i]}>
                                    Your browser does not support the video tag.
                                  </video>
                                ) : (
                                  <span className="text-sm text-slate-500">Loading video {i+1}...</span>
                                )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   ROOT APP (SINGLE FILE)
===================================================== */
export default function Courses() {
  const [role, setRole] = useState(null);
  const [theme, setTheme] = useState("light");

  if (!role) return <RoleSelector onSelect={setRole} />;

  const rootTheme =
    theme === "light"
      ? "bg-slate-50 text-slate-900"
      : "bg-slate-900 text-slate-100";

  return (
    <div className={`${rootTheme} min-h-screen`}>
      {/* TOP BAR */}
      <header className="border-b p-4 flex justify-between max-w-6xl mx-auto">
        <span className="font-semibold text-lg text-[#443097]">Placify</span>

        <div className="flex gap-3">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="px-3 py-1 border rounded-full text-sm"
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>

          <button
            onClick={() => setRole(null)}
            className="text-sm text-red-500"
          >
            Logout
          </button>
        </div>
      </header>

      {/* CONTENT */}
      {role === "company" && <CompanyCreateCourse theme={theme} />}
      {role === "student" && (
        <>
          <StudentCourses theme={theme} />
          <StudentProfile theme={theme} />
        </>
      )}
    </div>
  );
}
