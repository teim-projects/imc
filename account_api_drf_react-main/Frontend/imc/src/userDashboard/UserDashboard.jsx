// src/userDashbord/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ⬇️ Use your existing user booking form
import UserStudioBookingForm from "./Forms/UserStudioBookingForm";

const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const ME_URL = `${BASE}/auth/dj-rest-auth/user/`;

const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    const fetchMe = async () => {
      try {
        const res = await api.get(ME_URL);
        if (!cancelled) {
          setUser(res.data);
        }
      } catch (err) {
        console.error("fetch current user error:", err);
        if (!cancelled) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          setTimeout(() => navigate("/login"), 1500);
        }
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    };

    fetchMe();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  const firstName =
    user?.first_name ||
    user?.firstName ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "Guest";

  const role =
    user?.role ||
    (user?.is_superuser ? "admin" : user?.is_staff ? "staff" : "customer");

  const joined =
    user?.date_joined || user?.dateJoined || user?.created_at || null;

  const formattedJoined = joined
    ? new Date(joined).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <>
      <div className="ud-page">
        <div className="ud-shell">
          {/* HEADER */}
          <header className="ud-header">
            <div className="ud-main-title">
              <p className="ud-kicker">
                {loadingUser ? "Loading your account..." : `Welcome, ${firstName}`}
              </p>
              <h1 className="ud-title">Your Studio Dashboard</h1>
              <p className="ud-sub">
                Book studios, track your bookings, and manage your profile in one place.
              </p>
            </div>

            <div className="ud-header-right">
              {!loadingUser && (
                <div className="ud-role-pill">
                  <span className="ud-dot" />
                  <span className="ud-role-text">Signed in as {role}</span>
                </div>
              )}
              <button className="ud-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          {/* MAIN CONTENT */}
          <main className="ud-main">
            {/* Left column – booking form */}
            <section className="ud-left">
              <div className="ud-card ud-card-main">
                <div className="ud-card-head">
                  <h2>Book a Studio</h2>
                  <p>Fill the form below to request a studio booking.</p>
                </div>

                {/* Your existing user booking form */}
                <div className="ud-card-body">
                  <UserStudioBookingForm />
                </div>
              </div>
            </section>

            {/* Right column – profile & info */}
            <aside className="ud-right">
              <div className="ud-card ud-profile">
                <div className="ud-profile-avatar">
                  <span>{firstName?.[0]?.toUpperCase() || "U"}</span>
                </div>
                <div className="ud-profile-main">
                  <h3>{firstName}</h3>
                  {user?.email && (
                    <p className="ud-profile-line">
                      <span className="ud-label">Email:</span>
                      <span>{user.email}</span>
                    </p>
                  )}
                  {user?.mobile_no && (
                    <p className="ud-profile-line">
                      <span className="ud-label">Mobile:</span>
                      <span>{user.mobile_no}</span>
                    </p>
                  )}
                  <p className="ud-profile-line">
                    <span className="ud-label">Member since:</span>
                    <span>{formattedJoined}</span>
                  </p>
                </div>
              </div>

              <div className="ud-card ud-quick">
                <h3>Quick tips</h3>
                <ul className="ud-tips">
                  <li>Choose date and time carefully to avoid clashes.</li>
                  <li>Use a valid phone number so the team can reach you.</li>
                  <li>Keep your payment method info handy at the studio.</li>
                </ul>
              </div>

              <div className="ud-card ud-help">
                <h3>Need help?</h3>
                <p className="ud-help-text">
                  If you face any issue with booking or login, contact support.
                </p>
                <p className="ud-help-contact">
                  📧 support@example.com
                  <br />
                  📞 +91-98XXXXXXXX
                </p>
              </div>
            </aside>
          </main>

          {error && <div className="ud-banner-error">{error}</div>}
        </div>
      </div>

      {/* Local CSS for dashboard */}
      <style>{dashCss}</style>
    </>
  );
}

const dashCss = `
.ud-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, #e0f2fe 0, #f5f3ff 28%, #fdf2f8 52%, #fefce8 100%);
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.ud-shell {
  width: 100%;
  max-width: 1200px;
  background: rgba(255,255,255,0.9);
  border-radius: 22px;
  box-shadow:
    0 24px 70px rgba(15, 23, 42, 0.12),
    0 0 0 1px rgba(148, 163, 184, 0.25);
  padding: 22px 24px 26px;
  box-sizing: border-box;
  backdrop-filter: blur(14px);
}

/* Header */
.ud-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
  padding-bottom: 14px;
  margin-bottom: 18px;
}
@media (max-width: 900px) {
  .ud-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

.ud-main-title {
  max-width: 480px;
}

.ud-kicker {
  font-size: 13px;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 4px;
}

.ud-title {
  font-size: 28px;
  line-height: 1.2;
  color: #0f172a;
  margin: 0 0 4px;
}

.ud-sub {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.ud-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ud-role-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #ecfeff;
  border: 1px solid #a5f3fc;
  font-size: 12px;
  color: #0e7490;
}

.ud-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #22c55e;
  margin-right: 6px;
}

.ud-logout {
  border-radius: 999px;
  border: 1px solid #0f172a;
  background: #0f172a;
  color: #f9fafb;
  font-size: 12px;
  padding: 6px 14px;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: .04em;
  text-transform: uppercase;
}

/* Layout */
.ud-main {
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(260px, 1.2fr);
  gap: 18px;
}
@media (max-width: 900px) {
  .ud-main {
    grid-template-columns: minmax(0, 1fr);
  }
}

.ud-left, .ud-right {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Cards */
.ud-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 14px 16px 16px;
  box-shadow:
    0 14px 40px rgba(148, 163, 184, 0.16),
    0 0 0 1px rgba(226, 232, 240, 0.8);
  box-sizing: border-box;
}

.ud-card-main .ud-card-head h2 {
  margin: 0 0 4px;
  font-size: 18px;
  color: #0f172a;
}
.ud-card-main .ud-card-head p {
  margin: 0 0 8px;
  font-size: 13px;
  color: #6b7280;
}

.ud-card-body {
  margin-top: 4px;
}

/* Profile card */
.ud-profile {
  display: flex;
  gap: 12px;
  align-items: center;
}

.ud-profile-avatar {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 0, #a5b4fc, #4f46e5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e5e7eb;
  font-weight: 800;
  font-size: 22px;
  flex-shrink: 0;
  box-shadow: 0 10px 30px rgba(79,70,229,0.55);
}

.ud-profile-main h3 {
  margin: 0 0 4px;
  font-size: 16px;
  color: #0f172a;
}

.ud-profile-line {
  margin: 2px 0;
  font-size: 13px;
  color: #4b5563;
}

.ud-label {
  display: inline-block;
  min-width: 90px;
  color: #9ca3af;
}

/* Quick tips */
.ud-quick h3 {
  margin: 0 0 6px;
  font-size: 15px;
  color: #0f172a;
}
.ud-tips {
  list-style: disc;
  padding-left: 18px;
  margin: 0;
  font-size: 13px;
  color: #4b5563;
}
.ud-tips li + li {
  margin-top: 4px;
}

/* Help card */
.ud-help h3 {
  margin: 0 0 6px;
  font-size: 15px;
  color: #0f172a;
}
.ud-help-text {
  margin: 0 0 4px;
  font-size: 13px;
  color: #4b5563;
}
.ud-help-contact {
  margin: 0;
  font-size: 13px;
  color: #111827;
  font-weight: 500;
}

/* Error banner */
.ud-banner-error {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 13px;
  border: 1px solid #fecaca;
}
`;
