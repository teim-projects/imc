import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import GoogleAuthButton from "./GoogleAuthButton";

export default function Login() {
  const navigate = useNavigate();
  const BASE_API = import.meta.env.VITE_BASE_API_URL || "http://127.0.0.1:8000";

  const LOGIN_ENDPOINT = `${BASE_API}/auth/dj-rest-auth/login/`;
  const USER_ENDPOINT = `${BASE_API}/auth/dj-rest-auth/user/`;

  const [form, setForm] = useState({
    email_or_mobile: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const fetchUserAndRedirect = async (accessToken) => {
    try {
      const res = await fetch(USER_ENDPOINT, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        console.warn("Failed to load user profile, status:", res.status);
        navigate("/dashboard");
        return;
      }

      const user = await res.json();

      localStorage.setItem("user", JSON.stringify(user));
      if (user.role) localStorage.setItem("user_role", user.role);
      if (typeof user.is_superuser !== "undefined") {
        localStorage.setItem("is_superuser", JSON.stringify(user.is_superuser));
      }

      window.dispatchEvent(new Event("authChange"));

      const role = (user.role || "").toLowerCase();
      const isSuper = !!user.is_superuser;

      if (role === "admin" || isSuper) {
        navigate("/dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Logging in...");

    try {
      const res = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_or_mobile: form.email_or_mobile,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const detail =
          data?.detail ||
          data?.non_field_errors?.[0] ||
          data?.error ||
          "Invalid credentials. Please try again.";
        setMessage("❌ " + detail);
      } else {
        if (data.access) localStorage.setItem("access", data.access);
        if (data.refresh) localStorage.setItem("refresh", data.refresh);

        setMessage("✅ Login successful! Redirecting...");

        if (data.access) {
          await fetchUserAndRedirect(data.access);
        } else {
          window.dispatchEvent(new Event("authChange"));
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("⚠️ Unable to connect. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        {/* Welcome Side */}
        <div className="welcome-side">
          <div className="welcome-overlay"></div>
          <div className="welcome-content">
            <h1 className="welcome-title">Welcome Back</h1>
            <p className="welcome-text">
              Log in to continue your musical journey<br />
              and rediscover harmony in every note.
            </p>
          </div>
        </div>

        {/* Form Side */}
        <div className="form-side">
          <div className="login-card">
            <h2 className="form-title">Sign In</h2>
            <p className="form-subtitle">Welcome back! Please enter your details</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <input
                  id="email_or_mobile"
                  name="email_or_mobile"
                  type="text"
                  required
                  value={form.email_or_mobile}
                  onChange={handleChange}
                  placeholder=" "
                  autoComplete="username"
                />
                <label htmlFor="email_or_mobile">Email or Mobile Number</label>
              </div>

              <div className="form-group password-group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder=" "
                  autoComplete="current-password"
                />
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                  />
                  <span>Remember for 30 days</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`submit-btn ${loading ? "loading" : ""}`}
              >
                {loading ? (
                  <span className="loading-text">Signing in...</span>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="divider">
                <span>or continue with</span>
              </div>

              <GoogleAuthButton
                endpoint="/auth/google/"
                onSuccessNavigate="/dashboard"
              />

              <p className="register-link">
                Don't have an account?{" "}
                <Link to="/register">Sign up for free</Link>
              </p>

              {message && (
                <div className={`message ${message.includes("✅") ? "success" : message.includes("⚠️") ? "warning" : "error"}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body, html {
          height: 100%;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: #f8f1e9;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: linear-gradient(135deg, #faf5f0 0%, #f0e6dc 100%);
        }

        .auth-container {
          display: grid;
          grid-template-columns: 1fr 460px;
          width: 100%;
          max-width: 1200px;
          height: 92vh;
          background: white;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(100, 80, 60, 0.15);
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Welcome Side */
        .welcome-side {
          background: linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.25)),
                      url('https://thumbs.dreamstime.com/b/grand-piano-serene-landscape-peaceful-sky-reflecting-water-tranquil-scene-white-sits-reflective-surface-overlooking-calm-351092209.jpg') center/cover no-repeat;
          position: relative;
          border-radius: 28px 0 0 28px;
        }

        .welcome-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(212, 163, 115, 0.25), rgba(250, 213, 160, 0.15));
          border-radius: 28px 0 0 28px;
        }

        .welcome-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 4rem;
          color: white;
        }

        .welcome-title {
          font-size: 4.8rem;
          font-weight: 900;
          margin-bottom: 1.8rem;
          line-height: 1.1;
          text-shadow: 0 4px 15px rgba(0,0,0,0.4);
        }

        .welcome-text {
          font-size: 1.4rem;
          line-height: 1.8;
          opacity: 0.95;
          max-width: 480px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
          font-weight: 500;
        }

        /* Form Side */
        .form-side {
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #fffaf5, #fdf8f2);
          padding: 3rem;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: white;
          padding: 3.5rem 3rem;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(100, 80, 60, 0.12);
          animation: slideUp 0.9s ease-out 0.2s both;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .form-title {
          font-size: 2.4rem;
          font-weight: 800;
          color: #2d2419;
          text-align: center;
          margin-bottom: 0.6rem;
        }

        .form-subtitle {
          text-align: center;
          color: #8b6f47;
          font-size: 1.02rem;
          margin-bottom: 2.5rem;
          font-weight: 500;
        }

        .form-group {
          position: relative;
          margin-bottom: 2rem;
        }

        .form-group input {
          width: 100%;
          padding: 1.4rem 1.6rem;
          border: 2px solid transparent;
          border-radius: 16px;
          background: #f8f3ed;
          color: #3d3220;
          font-size: 1.05rem;
          transition: all 0.4s ease;
        }

        .form-group input:focus {
          outline: none;
          background: white;
          border-color: #c89f6a;
          box-shadow: 0 0 0 5px rgba(200, 159, 106, 0.2);
          transform: translateY(-2px);
        }

        .form-group label {
          position: absolute;
          left: 1.6rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          padding: 0 0.6rem;
          color: #a0805a;
          font-size: 1rem;
          font-weight: 500;
          pointer-events: none;
          transition: all 0.4s ease;
        }

        .form-group input:focus + label,
        .form-group input:not(:placeholder-shown) + label {
          top: -0.1rem;
          font-size: 0.82rem;
          color: #c89f6a;
          font-weight: 600;
          background: white;
        }

        .toggle-password {
          position: absolute;
          right: 1.6rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #a0805a;
          cursor: pointer;
          transition: color 0.3s;
        }

        .toggle-password:hover {
          color: #c89f6a;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1.8rem 0 2.5rem;
          font-size: 0.95rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          color: #5d4a33;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-label input {
          width: 19px;
          height: 19px;
          accent-color: #c89f6a;
          border-radius: 6px;
        }

        .forgot-link {
          color: #c89f6a;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s;
        }

        .forgot-link:hover {
          color: #b58a5a;
          text-decoration: underline;
        }

        .submit-btn {
          width: 100%;
          padding: 1.4rem;
          background: linear-gradient(90deg, #d4a373, #c89f6a);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1.12rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s ease;
          box-shadow: 0 8px 25px rgba(212, 163, 115, 0.35);
          position: relative;
          overflow: hidden;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(212, 163, 115, 0.45);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .submit-btn.loading {
          opacity: 0.85;
          cursor: not-allowed;
        }

        .loading-text {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .loading-text::after {
          content: '';
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          position: relative;
          text-align: center;
          margin: 2.5rem 0;
          color: #a0805a;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #d4c0a8, transparent);
        }

        .divider span {
          background: white;
          padding: 0 1.5rem;
        }

        .register-link {
          text-align: center;
          margin: 2.5rem 0 0;
          color: #6b5742;
          font-size: 0.98rem;
          font-weight: 500;
        }

        .register-link a {
          color: #c89f6a;
          font-weight: 700;
          text-decoration: none;
        }

        .register-link a:hover {
          text-decoration: underline;
        }

        .message {
          margin-top: 1.8rem;
          padding: 1.2rem;
          border-radius: 14px;
          text-align: center;
          font-weight: 600;
          font-size: 0.98rem;
          animation: fadeIn 0.5s ease;
        }

        .message.success {
          background: rgba(34, 197, 94, 0.15);
          color: #16a34a;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .message.error {
          background: rgba(239, 68, 68, 0.15);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .message.warning {
          background: rgba(251, 191, 36, 0.15);
          color: #d97706;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .auth-container {
            grid-template-columns: 1fr 420px;
            height: 88vh;
          }

          .welcome-title {
            font-size: 4rem;
          }
        }

        @media (max-width: 992px) {
          .auth-container {
            grid-template-columns: 1fr;
            height: auto;
            max-width: 520px;
            border-radius: 28px;
          }

          .welcome-side {
            height: 380px;
            border-radius: 28px 28px 0 0;
          }

          .welcome-overlay {
            border-radius: 28px 28px 0 0;
            background: linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6));
          }

          .welcome-content {
            padding: 3rem 2rem;
          }

          .welcome-title {
            font-size: 3.6rem;
          }

          .welcome-text {
            font-size: 1.25rem;
          }

          .form-side {
            padding: 4rem 2.5rem;
          }

          .login-card {
            padding: 3rem 2.5rem;
            box-shadow: 0 15px 40px rgba(0,0,0,0.12);
          }
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 0.5rem;
          }

          .auth-container {
            margin: 0.5rem;
            border-radius: 24px;
          }

          .welcome-side {
            height: 320px;
          }

          .welcome-title {
            font-size: 3rem;
          }

          .form-side {
            padding: 3rem 1.5rem;
          }

          .login-card {
            padding: 2.5rem 2rem;
            border-radius: 20px;
          }

          .form-title {
            font-size: 2.1rem;
          }
        }
      `}</style>
    </div>
  );
}