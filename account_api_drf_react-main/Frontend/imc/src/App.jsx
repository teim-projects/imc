// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";
import ProfileSection from "./components/ProfileSection";
import ForgotPassword from "./components/ForgotPassword";
import ResetPasswordConfirm from "./components/ResetPasswordConfirm";
import HeroCarousel from "./components/HeroCarousel";

import UserDashboard from "./userDashboard/UserDashboard"; // ⬅️ make sure this file exists

import "./App.css";

import Img1 from "./assets/banner.jpg";
import Img2 from "./assets/banner1.jpg";

// ---------- small helpers to read auth info ----------
const getUserInfo = () => {
  const token = localStorage.getItem("access");
  const rawUser = localStorage.getItem("user");
  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }
  return { token, user };
};

// only require logged in
function PrivateRoute({ children }) {
  const { token } = getUserInfo();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// only allow admin / superuser for admin dashboard
function AdminRoute({ children }) {
  const { token, user } = getUserInfo();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = (user?.role || "").toLowerCase();
  const isSuper = !!user?.is_superuser;

  if (role === "admin" || isSuper) {
    return children;
  }

  // normal users → send to user dashboard
  return <Navigate to="/user-dashboard" replace />;
}

// ---------- Hero for home ----------
function HomeHero() {
  const slides = [
    {
      src: Img1,
      title: "🎵 Welcome to IMC Music Hub",
      subtitle: "Your one-stop platform for studios, sound & creativity",
    },
    {
      src: Img2,
      title: "Mix • Record • Create",
      subtitle: "Discover talent & book professional studios instantly",
    },
  ];

  return (
    <HeroCarousel
      images={slides}
      interval={2000} // auto-slide every 2s
      height="calc(100vh - 70px)"
    />
  );
}

// ---------- Layout with Navbar + Routes ----------
function Layout() {
  const location = useLocation();
  const showHero = location.pathname === "/"; // only on home page

  return (
    <>
      <Navbar />
      {showHero && <HomeHero />}

      <main className="app-main">
        <Routes>
          {/* Home – just hero */}
          <Route path="/" element={<div />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/password-reset-confirm/:uid/:token"
            element={<ResetPasswordConfirm />}
          />

          {/* Admin dashboard – protected by role */}
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />

          {/* User dashboard – any logged-in user */}
          <Route
            path="/user-dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />

          {/* Profile – any logged-in user (you can change to AdminRoute if needed) */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfileSection />
              </PrivateRoute>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
