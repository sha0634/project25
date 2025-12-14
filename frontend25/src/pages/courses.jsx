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
  });

  const inputTheme =
    theme === "light"
      ? "bg-white text-black border-slate-300"
      : "bg-slate-700 text-white border-slate-600";

  const handleChange = (e) =>
    setCourse({ ...course, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!course.title) return alert("Title required");

    const existing = JSON.parse(localStorage.getItem("courses")) || [];
    localStorage.setItem(
      "courses",
      JSON.stringify([
        ...existing,
        {
          ...course,
          id: Date.now(),
          company: "Demo Company",
          enrolledStudents: [],
        },
      ])
    );

    setCourse({ title: "", description: "", duration: "", level: "Beginner" });
    alert("Course published");
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

  useEffect(() => {
    setCourses(JSON.parse(localStorage.getItem("courses")) || []);
  }, []);

  const enroll = (id) => {
    const updated = courses.map((c) =>
      c.id === id
        ? { ...c, enrolledStudents: [...c.enrolledStudents, "student1"] }
        : c
    );
    setCourses(updated);
    localStorage.setItem("courses", JSON.stringify(updated));
  };

  const cardTheme =
    theme === "light"
      ? "bg-white border-slate-200"
      : "bg-slate-800 border-slate-700";

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Available Courses</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`border rounded-xl p-4 shadow-sm ${cardTheme}`}
          >
            <h3 className="font-semibold">{course.title}</h3>
            <p className="text-sm text-[#443097]">{course.company}</p>
            <p className="text-xs mt-2">{course.description}</p>
            <p className="text-xs mt-1">Duration: {course.duration}</p>

            <button
              onClick={() => enroll(course.id)}
              className="mt-3 w-full bg-[#443097] text-white py-1.5 rounded-lg text-sm"
            >
              Enroll
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   STUDENT PROFILE: ENROLLED COURSES
===================================================== */
function StudentProfile({ theme }) {
  const enrolled = useMemo(() => {
    const all = JSON.parse(localStorage.getItem("courses")) || [];
    return all.filter((c) => c.enrolledStudents.includes("student1"));
  }, []);

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
            {enrolled.map((c) => (
              <li
                key={c.id}
                className="p-3 rounded-lg bg-[#443097]/10 text-[#443097]"
              >
                {c.title} — {c.company}
              </li>
            ))}
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
            onClick={() => {
              localStorage.removeItem("courses");
              setRole(null);
            }}
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
