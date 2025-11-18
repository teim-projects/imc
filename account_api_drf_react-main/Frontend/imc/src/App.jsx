import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";
import ProfileSection from "./components/ProfileSection";
import ForgotPassword from "./components/ForgotPassword";
import ResetPasswordConfirm from "./components/ResetPasswordConfirm";
import HeroCarousel from "./components/HeroCarousel";
import "./App.css";

import Img1 from "./assets/banner.jpg";
import Img2 from "./assets/banner1.jpg"; // ✅ make sure these exist


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

  // ✅ Auto-slide every 2 seconds
  return <HeroCarousel images={slides} interval={2000} height="calc(100vh - 70px)" />;
}

function Layout() {
  const location = useLocation();
  const showHero = location.pathname === "/"; // only show on homepage

  return (
    <>
      <Navbar />
      {showHero && <HomeHero />}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<div />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfileSection />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/password-reset-confirm/:uid/:token"
            element={<ResetPasswordConfirm />}
          />
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
