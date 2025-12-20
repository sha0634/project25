import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles } from 'lucide-react';

const images = [
  "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg",
  "https://images.pexels.com/photos/3184404/pexels-photo-3184404.jpeg",
  "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg",
];

export default function LoginPage() {
  const [index, setIndex] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const existing = document.getElementById('google-client-script');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-client-script';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        try {
          /* global google */
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              setError('');
              setLoading(true);
              try {
                const idToken = response.credential;
                const result = await googleLogin(idToken);
                if (!result.success) setError(result.message || 'Google login failed');
              } catch (err) {
                console.error('Google callback error', err);
                setError('Google login failed');
              } finally {
                setLoading(false);
              }
            }
          });

          window.google.accounts.id.renderButton(
            document.getElementById('g_id_signin'),
            { theme: 'outline', size: 'large', width: '100%' }
          );
        } catch (err) {
          console.error('Error initializing Google Identity Services', err);
        }
      };
      document.body.appendChild(script);
    }
  }, [googleLogin]);

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

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#EDE7FF] flex items-center justify-center">
      <div className="w-[55%]  h-[550px] max-w-[1600px] bg-white rounded-[30px] shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="px-14 py-16">
          <h2 className="text-center text-xl font-bold mb-2">LOGIN</h2>
          <p className="text-center text-gray-800 mb-7">
            Placify — Place Your Future.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
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
                className="w-full px-10 py-3 bg-[#F3EDFF] rounded-xl outline-none h-[1cm]"
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
                className="w-full px-10 py-3 bg-[#F3EDFF] rounded-xl outline-none h-[1cm]"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#443097] text-white mt-4 py-2 rounded-xl shadow-md h-[1cm] disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login Now"}
            </button>
            
            <Link to="/forget-password" className="text-sm text-[#2b128f] font-semibold hover:underline block text-right">
              Forgot password?
            </Link>
          </form>


          <div className="text-center mt-4 font-semibold text-gray-600">
            Login with Others
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div id="g_id_signin"></div>
              {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                <div className="mt-2 text-xs text-yellow-600">Set VITE_GOOGLE_CLIENT_ID in your frontend env to enable Google login.</div>
              )}
            </div>
          <div className="text-center mt-5 font-semibold text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#2b128f] font-semibold">
              Sign Up
            </Link>
          </div>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="relative bg-linear-to-br from-[#5f4ea1] via-[#443097] to-[#2b128f] flex items-center justify-center p-12">
          <div className="bg-[#5f4ea1] backdrop-blur-xl rounded-[25px] p-4 shadow-2xl">
            <img
              src={images[index]}
              alt="User"
              className="rounded-[20px] w-[260px] h-[320px] object-cover transition-all duration-700"
            />
          </div>

          <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-yellow-500 text-xl">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

      </div>
    </div>
  );
}

// Load Google Identity Services button
// We intentionally put this outside the component to avoid multiple listeners in hot reload — handled via effect below.
