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

// User Dashboard (main)
import UserDashboard from "./userDashboard/UserDashboard";

// Studio user homepage (list + nice UI)
import StudioHomePage from "./userDashboard/studio/HomePage";

// Real forms
import UserStudioRentalForm from "./userDashboard/Forms/UserStudioRentalForm";
import UserPhotographyBookingForm from "./userDashboard/Forms/UserPhotographyBookingForm";
import UserEvents from "./userDashboard/Forms/UserEvents"; // events page

import "./App.css";
import Img1 from "./assets/banner.jpg";
import Img2 from "./assets/banner1.jpg";

/* ----------------- Auth helpers ----------------- */
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

/* ----------------- Route guards ----------------- */
function PrivateRoute({ children }) {
  const { token } = getUserInfo();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { token, user } = getUserInfo();
  if (!token) return <Navigate to="/login" replace />;

  const role = (user?.role || "").toLowerCase();
  const isSuper = !!user?.is_superuser;

  if (role === "admin" || isSuper) return children;

  return <Navigate to="/user-dashboard" replace />;
}

/* ----------------- Home Hero ----------------- */
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
      interval={2000}
      height="calc(100vh - 70px)"
    />
  );
}

/* ----------------- Layout ----------------- */
function Layout() {
  const location = useLocation();
  const showHero = location.pathname === "/";

  return (
    <>
      <Navbar />
      {showHero && <HomeHero />}

      <main className="app-main">
        <Routes>
          {/* Home (just hero) */}
          <Route path="/" element={<div />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/password-reset-confirm/:uid/:token"
            element={<ResetPasswordConfirm />}
          />

          {/* Admin Dashboard */}
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />

          {/* User Dashboard */}
          <Route
            path="/user-dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfileSection />
              </PrivateRoute>
            }
          />

          {/* ----------------- Services ----------------- */}

          {/* Studio Booking – now opens Studio HomePage */}
          <Route
            path="/studio-booking"
            element={
              <PrivateRoute>
                <StudioHomePage />
              </PrivateRoute>
            }
          />

          {/* (optional) direct form route if you still want it */}
          <Route
            path="/studio-booking/form"
            element={
              <PrivateRoute>
                <UserStudioRentalForm />
              </PrivateRoute>
            }
          />

          {/* Photography Booking */}
          <Route
            path="/photography-booking"
            element={
              <PrivateRoute>
                <UserPhotographyBookingForm />
              </PrivateRoute>
            }
          />

          {/* Events & Shows */}
          <Route
            path="/events-booking"
            element={
              <PrivateRoute>
                <UserEvents />
              </PrivateRoute>
            }
          />

          {/* Videography placeholder */}
          <Route
            path="/videography-booking"
            element={
              <PrivateRoute>
                <div style={{ padding: "2rem" }}>Videography Booking (TODO)</div>
              </PrivateRoute>
            }
          />

          {/* Sound placeholder */}
          <Route
            path="/sound-booking"
            element={
              <PrivateRoute>
                <div style={{ padding: "2rem" }}>Sound Booking (TODO)</div>
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

/* ----------------- App Root ----------------- */
export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
