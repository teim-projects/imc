// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

/* ---------------- COMMON ---------------- */
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProfileSection from "./components/ProfileSection";
import ForgotPassword from "./components/ForgotPassword";
import ResetPasswordConfirm from "./components/ResetPasswordConfirm";
import HeroCarousel from "./components/HeroCarousel";

/* ---------------- USER DASHBOARD ---------------- */
import UserDashboard from "./userDashboard/UserDashboard";

/* ---------------- PAGES ---------------- */
import Services from "./userDashboard/pages/Services";
import Events from "./userDashboard/pages/Events";
import Contact from "./userDashboard/pages/Contact";

/* ---------------- SERVICE HOME PAGES ---------------- */
import StudioHomePage from "./userDashboard/studio/HomePage";
import EventHomePage from "./userDashboard/Events/HomePage";
import SingerHomePage from "./userDashboard/singer/HomePage";

/* ---------------- FORMS ---------------- */
import SingerForm from "./components/Forms/SingerForm";
import UserStudioRentalForm from "./userDashboard/Forms/UserStudioRentalForm";
import UserPhotographyBookingForm from "./userDashboard/Forms/UserPhotographyBookingForm";
import UserEventBookingForm from "./userDashboard/Forms/UserEvents";

/* ---------------- PAYMENT ---------------- */
import PaymentPage from "./userDashboard/payment/PaymentPage";

/* ---------------- ASSETS ---------------- */
import "./App.css";
import Img1 from "./assets/banner.jpg";
import Img2 from "./assets/banner1.jpg";

/* ---------------- AUTH HELPERS ---------------- */
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

/* ---------------- ROUTE GUARDS ---------------- */
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

/* ---------------- HOME HERO ---------------- */
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

/* ---------------- LAYOUT ---------------- */
function Layout() {
  const location = useLocation();
  const showHero = location.pathname === "/";

  return (
    <>
      <Navbar />
      {showHero && <HomeHero />}

      <main className="app-main">
        <Routes>
          {/* ---------------- HOME ---------------- */}
          <Route path="/" element={<div />} />

          {/* ---------------- AUTH ---------------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/password-reset-confirm/:uid/:token"
            element={<ResetPasswordConfirm />}
          />

          {/* ---------------- ADMIN ---------------- */}
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

          {/* ---------------- USER ---------------- */}
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

          {/* ---------------- MAIN PAGES ---------------- */}
          <Route path="/services" element={<Services />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />

          {/* ---------------- BOOKINGS ---------------- */}
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

          <Route
            path="/photography-booking"
            element={
              <PrivateRoute>
                <UserPhotographyBookingForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/singer-booking"
            element={
              <PrivateRoute>
                <SingerHomePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/singer/register"
            element={
              <PrivateRoute>
                <SingerForm initialMode="form" />
              </PrivateRoute>
            }
          />

          {/* ---------------- PAYMENT ---------------- */}
          <Route
            path="/payment"
            element={
              <PrivateRoute>
                <PaymentPage />
              </PrivateRoute>
            }
          />

          {/* ---------------- FALLBACK ---------------- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

/* ---------------- APP ROOT ---------------- */
export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
