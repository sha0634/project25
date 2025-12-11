import React from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen w-full bg-[#EDE7FF] flex items-center justify-center">
      <div className="w-[400px] bg-white rounded-[30px] shadow-xl p-10">
        
        <h2 className="text-center text-2xl font-bold mb-4">Forgot Password</h2>
        <p className="text-center text-gray-800 mb-8">
          Enter your email to reset your password.
        </p>

        <div className="space-y-5">
          <div className="relative">
            <img
              src="/images/emailimg.png"
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-10 py-3 bg-[#F3EDFF] rounded-xl outline-none"
            />
          </div>

          <button className="w-full bg-[#443097] text-white py-3 rounded-xl shadow-md">
            Send Reset Link
          </button>
        </div>

        <div className="text-center mt-6 text-gray-600 font-semibold">
          Remember your password?{" "}
          <Link to="/login" className="text-[#2b128f] hover:underline">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}
