"use client";

import { useState } from "react";
import axios from "axios";
import { useUser } from "../../../context/UserContext";
import { useRouter } from "next/navigation";
import "./styles/Login.css";

export default function Login() {
  const { setUserid, setUsername, setEmail, setCoins, setCheckin,setAvatar } = useUser();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post("/api/user/login", form);
      const { token, name, id } = res.data;

      // ✅ Store token in localStorage
      localStorage.setItem("token", token);

      // ✅ Save user data in context
      setEmail(res.data.email);
      setCoins(res.data.coins);
      setAvatar(res.data.avatar);
      setCheckin(res.data.checkin);
      setUserid(id);
      setUsername(name);

      console.log("Logged in successfully");
      
      // ✅ Show success state
      setSuccess(true);
      
      // ✅ Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    router.push("/auth/register");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="email"
                name="email"
                placeholder="Enter your email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="password"
                name="password"
                placeholder="Enter your password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          {success && (
            <div className="success-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
              Login successful! Redirecting to homepage...
            </div>
          )}

          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading || success}>
            {loading || success ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6"/>
                  <path d="M10 14L21 3"/>
                  <path d="M21 3v6"/>
                  <path d="M3 12a9 9 0 1 0 9-9"/>
                </svg>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="register-text">
            Don&apos;t have an account?{" "}
            <button onClick={handleRegisterRedirect} className="register-link">
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}