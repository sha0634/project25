import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const images = [
  "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg",
  "https://images.pexels.com/photos/3184404/pexels-photo-3184404.jpeg",
  "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg",
];

export default function SignUpPage() {
  const [index, setIndex] = useState(0);
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      userType: userType,
      profile: {
        fullName: formData.fullName
      }
    };

    const result = await signup(userData);

    if (!result.success) {
      setError(result.message || "Error creating account");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#EDE7FF] flex items-center justify-center">
      <div className="w-[55%] h-[550px]  max-w-[1600px] bg-white rounded-[30px] shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT PANEL - SIGN UP FORM */}
        <div className="px-14 py-16">
          <h2 className="text-center text-xl font-bold mb-2">SIGN UP</h2>
          <p className="text-center text-gray-800 mb-5">
            Placify — Place Your Future.
          </p>

          {error && (
            <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* User Type Selection */}
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => setUserType("student")}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                userType === "student"
                  ? "bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6] text-white shadow-md"
                  : "bg-[#F3EDFF] text-gray-700 hover:bg-[#E9DEFF]"
              }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => setUserType("company")}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                userType === "company"
                  ? "bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6] text-white shadow-md"
                  : "bg-[#F3EDFF] text-gray-700 hover:bg-[#E9DEFF]"
              }`}
            >
              🏢 Company
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <img
                src="/images/userimg.png"
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                name="fullName"
                placeholder={userType === "company" ? "Company Name" : "Full Name"}
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-10 py-3 bg-[#F3EDFF] rounded-xl outline-none h-[0.9cm]"
              />
            </div>

            <div className="relative">
              <img
                src="/images/userimg.png"
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-10 py-3 bg-[#F3EDFF] rounded-xl outline-none h-[0.9cm]"
              />
            </div>

            <div className="relative">
              <img
                src="/images/emailimg.png"
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-10 py-3 bg-[#F3EDFF] rounded-xl outline-none h-[0.9cm]"
              />
            </div>

            <div className="relative">
              <img
                src="/images/passimg.png"
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-10 py-3 bg-[#F3EDFF] rounded-xl outline-none h-[0.9cm]"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#443097] text-white py-2 rounded-xl shadow-md h-[1cm] disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="text-center mt-5 font-semibold text-gray-600">
            Sign up with Others
          </div>

          <div className="mt-5 space-y-4">
            <button className="w-full flex items-center justify-center gap-3 bg-white border py-3 rounded-xl shadow-sm h-[1cm]">
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                className="w-5"
              />
              Sign Up with Google
            </button>

            <p className="text-center">
                Already have an account?{" "}
                <Link to="/login" className=" text-[#2b128f] font-semibold">
                Login
                </Link>
            </p>

          </div>
        </div>

        {/* RIGHT PANEL - SLIDING IMAGES */}
        <div className="relative bg-linear-to-br from-[#5f4ea1] via-[#443097] to-[#2b128f] flex items-center justify-center p-12">
          <div className="bg-[#5f4ea1] backdrop-blur-xl rounded-[25px] p-4 shadow-2xl">
            <img
              src={images[index]}
              alt="User"
              className="rounded-[20px] w-[260px] h-[320px] object-cover transition-all duration-700"
            />
          </div>

          <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-yellow-500 text-xl">
            ✨
          </div>
        </div>

      </div>
    </div>
  );
}
