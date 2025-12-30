// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

/* ================= COMMON ================= */
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProfileSection from "./components/ProfileSection";
import ForgotPassword from "./components/ForgotPassword";
import ResetPasswordConfirm from "./components/ResetPasswordConfirm";
import HeroCarousel from "./components/HeroCarousel";

/* ================= USER DASHBOARD ================= */
import UserDashboard from "./userDashboard/UserDashboard";

/* ================= PAGES ================= */
import Services from "./userDashboard/pages/Services";
import Events from "./userDashboard/pages/Events";
import Contact from "./userDashboard/pages/Contact";
import SingingClass from "./userDashboard/pages/SingingClass";
import SingerRegistration from "./userDashboard/pages/SingerRegistration";

/* ================= NEW: MY BOOKINGS & SOUND BOOKING PAGES ================= */
import MyBookings from "./userDashboard/pages/MyBookings";
import SoundBooking from "./userDashboard/pages/SoundBooking";   // ← ADDED: Sound Booking page

/* ================= SERVICE HOME PAGES ================= */
import StudioHomePage from "./userDashboard/studio/HomePage";
import EventHomePage from "./userDashboard/Events/HomePage";
import SingerHomePage from "./userDashboard/singer/HomePage";

/* ================= EXTRA SERVICE PAGES ================= */
import PrivateBooking from "./userDashboard/pages/PrivateBooking";
import PhotographyBooking from "./userDashboard/pages/PhotographyBooking";
import VideographyPage from "./userDashboard/pages/VideographyPage";

/* ================= FORMS ================= */
import SingerForm from "./components/Forms/SingerForm";
import UserStudioRentalForm from "./userDashboard/Forms/UserStudioRentalForm";
import UserPhotographyBookingForm from "./userDashboard/Forms/UserPhotographyBookingForm";
import UserEventBookingForm from "./userDashboard/Forms/UserEvents";

/* ================= PAYMENT ================= */
import PaymentPage from "./userDashboard/payment/PaymentPage";

/* ================= ASSETS ================= */
import "./App.css";
import Img1 from "./assets/banner.jpg";
import Img2 from "./assets/banner1.JPG";

/* ================= AUTH HELPERS ================= */
const getUserInfo = () => {
  const token = localStorage.getItem("access");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }
  return { token, user };
};

/* ================= ROUTE GUARDS ================= */
function PrivateRoute({ children }) {
  const { token } = getUserInfo();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { token, user } = getUserInfo();
  if (!token) return <Navigate to="/login" replace />;

  const role = (user?.role || "").toLowerCase();
  if (role === "admin" || user?.is_superuser) return children;

  return <Navigate to="/user-dashboard" replace />;
}

/* ================= HERO ================= */
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
      interval={2500}
      height="calc(100vh - 70px)"
    />
  );
}

/* ================= LAYOUT ================= */
function Layout() {
  const location = useLocation();
  const showHero = location.pathname === "/";

  return (
    <>
      <Navbar />
      {showHero && <HomeHero />}

      <main className="app-main">
        <Routes>

          {/* HOME */}
          <Route path="/" element={<div />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/password-reset-confirm/:uid/:token"
            element={<ResetPasswordConfirm />}
          />

          {/* ADMIN */}
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/singers"
            element={
              <AdminRoute>
                <SingerForm initialMode="list" />
              </AdminRoute>
            }
          />

          {/* USER */}
          <Route
            path="/user-dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfileSection />
              </PrivateRoute>
            }
          />

          {/* MY BOOKINGS */}
          <Route
            path="/my-bookings"
            element={
              <PrivateRoute>
                <MyBookings />
              </PrivateRoute>
            }
          />

          {/* PUBLIC */}
          <Route path="/services" element={<Services />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />

          {/* CLASSES */}
          <Route path="/classes" element={<SingingClass />} />
          <Route path="/singing-classes" element={<Navigate to="/classes" replace />} />

          {/* SINGER REGISTRATION */}
          <Route path="/singer" element={<SingerRegistration />} />

          {/* STUDIO */}
          <Route
            path="/studio"
            element={
              <PrivateRoute>
                <StudioHomePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/studio-booking"
            element={
              <PrivateRoute>
                <StudioHomePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/studio-booking/form"
            element={
              <PrivateRoute>
                <UserStudioRentalForm />
              </PrivateRoute>
            }
          />

          {/* EVENTS */}
          <Route
            path="/events-booking"
            element={
              <PrivateRoute>
                <EventHomePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/events-booking/form"
            element={
              <PrivateRoute>
                <UserEventBookingForm />
              </PrivateRoute>
            }
          />

          {/* PHOTOGRAPHY */}
          <Route
            path="/photography-booking"
            element={
              <PrivateRoute>
                <PhotographyBooking />
              </PrivateRoute>
            }
          />

          {/* VIDEOGRAPHY */}
          <Route
            path="/videography"
            element={
              <PrivateRoute>
                <VideographyPage />
              </PrivateRoute>
            }
          />

          {/* PRIVATE BOOKING */}
          <Route
            path="/private-booking"
            element={
              <PrivateRoute>
                <PrivateBooking />
              </PrivateRoute>
            }
          />

          {/* SINGER BOOKING */}
          <Route
            path="/singer-booking"
            element={
              <PrivateRoute>
                <SingerHomePage />
              </PrivateRoute>
            }
          />

          {/* NEW: SOUND SYSTEM BOOKING */}
          <Route
            path="/sound-booking"
            element={
              <PrivateRoute>
                <SoundBooking />
              </PrivateRoute>
            }
          />

          {/* PAYMENT */}
          <Route
            path="/payment"
            element={
              <PrivateRoute>
                <PaymentPage />
              </PrivateRoute>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <style jsx global>{`
        html,
        body,
        #root {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        .app-main {
          min-height: calc(100vh - 70px);
          position: relative;
          overflow: visible !important;
        }

        .modal-overlay {
          position: fixed !important;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999 !important;
        }

        .modal {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  );
}

/* ================= ROOT ================= */
export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}