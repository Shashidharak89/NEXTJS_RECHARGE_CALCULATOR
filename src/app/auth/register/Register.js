"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUser } from "../../../context/UserContext";
import "./styles/Register.css";

export default function Register() {
  const router = useRouter();
  const { setUserid, setUsername, setEmail } = useUser();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Signup, 4: Success
  const [email, setEmailInput] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [form, setForm] = useState({ name: "", password: "" });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // 🔹 STEP 1: Send OTP
  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.post("/api/user/verifyemail", { email });

      if (res.data.status === "success") {
        setServerOtp(res.data.otp);
        setStep(2);
        startResendCooldown();
      } else {
        setError("Failed to send OTP.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "OTP sending failed.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Resend OTP with cooldown
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    try {
      setLoading(true);
      setError('');
      const res = await axios.post("/api/user/verifyemail", { email });

      if (res.data.status === "success") {
        setServerOtp(res.data.otp);
        setEnteredOtp('');
        startResendCooldown();
      } else {
        setError("Failed to resend OTP.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "OTP resending failed.");
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 🔹 STEP 2: Verify OTP
  const handleVerifyOtp = () => {
    if (enteredOtp === String(serverOtp)) {
      setStep(3);
      setError('');
    } else {
      setError("Incorrect OTP.");
    }
  };

  // 🔹 STEP 3: Final Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post("/api/user", {
        name: form.name,
        email,
        password: form.password,
      });

      const { token, name, email: registeredEmail, id } = res.data;
      localStorage.setItem("token", token);

      setUserid(id);
      setUsername(name);
      setEmail(registeredEmail);

      // ✅ Show success step
      setStep(4);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);

      console.log("✅ Registered successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Login Redirect
  const handleLoginRedirect = () => {
    router.push('/auth/login');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2 className="register-title">Create Account</h2>
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
            <div className={`step-line ${step >= 4 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 4 ? 'active' : ''}`}>✓</div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}

        <div className="form-content">
          {/* STEP 1: Send OTP */}
          {step === 1 && (
            <div className="form-step step-1">
              <h3 className="step-title">Enter Your Email</h3>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="register-input"
                  required
                />
              </div>
              <button 
                onClick={handleSendOtp} 
                disabled={loading || !email}
                className="register-button primary"
              >
                {loading ? <span className="loading-spinner"></span> : "Send OTP"}
              </button>
              <p className="login-redirect">
                Already have an account?{" "}
                <span onClick={handleLoginRedirect} className="login-link">
                  Click here
                </span>
              </p>
            </div>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 2 && (
            <div className="form-step step-2">
              <h3 className="step-title">Verify Your Email</h3>
              <p className="step-description">
                We&apos;ve sent a 4-digit code to <strong>{email}</strong>
              </p>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="register-input otp-input"
                  maxLength={4}
                />
              </div>
              <div className="button-group">
                <button 
                  onClick={handleVerifyOtp}
                  disabled={!enteredOtp || enteredOtp.length !== 4}
                  className="register-button primary"
                >
                  Verify OTP
                </button>
                <button 
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="register-button secondary"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </div>
              <p className="login-redirect">
                Already have an account?{" "}
                <span onClick={handleLoginRedirect} className="login-link">
                  Click here
                </span>
              </p>
            </div>
          )}

          {/* STEP 3: Final Signup */}
          {step === 3 && (
            <div className="form-step step-3">
              <h3 className="step-title">Complete Registration</h3>
              <div className="verified-email">
                <span className="verified-icon">✅</span>
                <strong>Email:</strong> {email}
              </div>
              
              <form onSubmit={handleRegister} className="register-form">
                <div className="input-group">
                  <input
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="register-input"
                    required
                  />
                </div>

                <div className="input-group">
                  <input
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="register-input"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !form.name || !form.password}
                  className="register-button primary"
                >
                  {loading ? <span className="loading-spinner"></span> : "Create Account"}
                </button>
              </form>
              <p className="login-redirect">
                Already have an account?{" "}
                <span onClick={handleLoginRedirect} className="login-link">
                  Click here
                </span>
              </p>
            </div>
          )}

          {/* STEP 4: Success Message */}
          {step === 4 && (
            <div className="form-step step-4">
              <div className="success-container">
                <div className="success-icon">🎉</div>
                <h3 className="success-title">Account Created Successfully!</h3>
                <p className="success-description">
                  Welcome to our platform! You will be redirected to the home page in a moment.
                </p>
                <div className="success-details">
                  <p><strong>Name:</strong> {form.name}</p>
                  <p><strong>Email:</strong> {email}</p>
                </div>
                <div className="redirect-message">
                  <span className="loading-spinner"></span>
                  Redirecting to home page...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
