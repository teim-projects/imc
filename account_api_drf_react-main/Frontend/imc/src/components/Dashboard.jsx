// Dashboard.jsx — IMC Neo Glass Dashboard (Board-wrapped for ALL sections)
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "./Sidebar";
import Charts from "./Charts";

import StudioForm from "./Forms/StudioForm";
import StudioMasterForm from "./Forms/StudioMasterForm"; // ⬅️ NEW
import EquipmentForm from "./Forms/EquipmentForm";
import EventsForm from "./Forms/EventsForm";
import ShowsForm from "./Forms/ShowsForm";
import PhotographyForm from "./Forms/PhotographyForm";
import VideographyForm from "./Forms/VideographyForm";
// ⬇️ replaced old SoundForm with the new full page (ADD/VIEW)
import SoundSystemService from "./Forms/SoundSystemService";
import SingerForm from "./Forms/SingerForm";
import PaymentForm from "./Forms/PaymentForm";
import UserForm from "./Forms/UserForm";
import PrivateBookingForm from "./Forms/PrivateBookingForm";

import { motion } from "framer-motion";
import { FaUsers, FaMicrophone, FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import CountUp from "react-countup";
import "./Dashboard.css";

/* ----------------------------------------------------
   Allowed keys for safety (prevents bad state values)
---------------------------------------------------- */
const ALLOWED_KEYS = new Set([
  null,
  // top-level modules
  "studio", "studioMaster", "equipment", "events", "photography", "videography", "sound", "singer", "payment", "user", "private",
  // sub-actions used by Sidebar
  "addStudio", "viewStudio",
  "addEquipment", "viewEquipment",
  "addEvent", "viewEvent",
  "addShow", "viewShow",
  "addPrivate", "viewPrivate",
  "addPhotography", "viewPhotography",
  "addVideography", "viewVideography",
  "addSound", "viewSound",
  "addSinger", "viewSinger",
  "addPayment", "viewPayment",
  "addUser", "viewUser",
  // Studio Master sub-actions
  "addStudioMaster", "viewStudioMaster",
]);

const prettyTitle = (k) => {
  if (!k) return "Overview";
  const map = {
    studio: "Studio",
    studioMaster: "Studio Master",
    equipment: "Equipment",
    events: "Events",
    photography: "Photography",
    videography: "Videography",
    sound: "Sound System Service",
    singer: "Singer",
    payment: "Payment",
    user: "Users",
    private: "Private Bookings",

    addStudio: "Add Studio Booking",
    viewStudio: "View Studio Bookings",

    addEquipment: "Add Equipment",
    viewEquipment: "View Equipment",

    addEvent: "Add Event",
    viewEvent: "View Events",

    addShow: "Add Show",
    viewShow: "View Shows",

    addPrivate: "Add Private Booking",
    viewPrivate: "View Private Bookings",

    addPhotography: "Add Photography Booking",
    viewPhotography: "View Photography Bookings",

    addVideography: "Add Videography Booking",
    viewVideography: "View Videography Bookings",

    addSound: "Add Sound Job",
    viewSound: "View Sound Jobs",

    addSinger: "Add Singer",
    viewSinger: "View Singers",

    addPayment: "Add Payment",
    viewPayment: "View Payments",

    addUser: "Add User",
    viewUser: "View Users",

    // Studio Master sub-actions
    addStudioMaster: "Add Studio (Master)",
    viewStudioMaster: "View Studios (Master)",
  };
  return map[k] ?? "Overview";
};

const defaultTabFor = (key) => (key && key.startsWith("view") ? "VIEW" : "ADD");

export default function Dashboard() {
  const [sidebarOpen] = useState(true);
  const [cardsLoaded, setCardsLoaded] = useState(false);
  const [activeForm, setActiveForm] = useState(null);

  const safeSetActiveForm = useCallback((key) => {
    setActiveForm(ALLOWED_KEYS.has(key) ? key : null);
  }, []);

  const closeForm = useCallback(() => setActiveForm(null), []);

  useEffect(() => {
    const base = "IMC Music Hub";
    document.title = activeForm ? `${prettyTitle(activeForm)} — ${base}` : `${base} — Dashboard`;
  }, [activeForm]);

  useEffect(() => {
    const t = setTimeout(() => setCardsLoaded(true), 350);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeForm();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeForm]);

  // Demo KPI data
  const cards = useMemo(
    () => [
      { icon: <FaUsers />,       title: "Customers",   value: 1750,  color: "#9ec4ff" },
      { icon: <FaMicrophone />,  title: "Bookings",    value: 320,   color: "#9ec4ff" },
      { icon: <FaCalendarAlt />, title: "Events",      value: 58,    color: "#9ec4ff" },
      { icon: <FaDollarSign />,  title: "Revenue (₹)", value: 46800, color: "#ffbf4d" },
    ],
    []
  );

  // Render whichever module is active
  const renderActive = () => {
    switch (activeForm) {
      // Top-level opens
      case "studio":          return <StudioForm onClose={closeForm} />;
      case "studioMaster":    return <StudioMasterForm defaultTab="ADD" />; // ⬅️ NEW top-level
      case "equipment":       return <EquipmentForm onClose={closeForm} />;
      case "events":          return <EventsForm onClose={closeForm} />;
      case "photography":     return <PhotographyForm onClose={closeForm} />;
      case "videography":     return <VideographyForm onClose={closeForm} />;
      case "sound":           return <SoundSystemService />; // full page with its own tabs
      case "singer":          return <SingerForm onClose={closeForm} />;
      case "payment":         return <PaymentForm onClose={closeForm} />;
      case "user":            return <UserForm onClose={closeForm} />;
      case "private":         return <PrivateBookingForm onClose={closeForm} />;

      // Studio Bookings
      case "addStudio":       return <StudioForm onClose={closeForm} viewOnly={false} />;
      case "viewStudio":      return <StudioForm onClose={closeForm} viewOnly />;

      // Studio Master sub-actions
      case "addStudioMaster":  return <StudioMasterForm defaultTab="ADD" />;
      case "viewStudioMaster": return <StudioMasterForm defaultTab="VIEW" />;

      // Equipment
      case "addEquipment":    return <EquipmentForm onClose={closeForm} viewOnly={false} />;
      case "viewEquipment":   return <EquipmentForm onClose={closeForm} viewOnly />;

      // Events
      case "addEvent":        return <EventsForm onClose={closeForm} defaultTab={defaultTabFor("addEvent")} />;
      case "viewEvent":       return <EventsForm onClose={closeForm} defaultTab={defaultTabFor("viewEvent")} />;

      // Shows
      case "addShow":         return <ShowsForm onClose={closeForm} defaultTab={defaultTabFor("addShow")} />;
      case "viewShow":        return <ShowsForm onClose={closeForm} defaultTab={defaultTabFor("viewShow")} />;

      // Private bookings
      case "addPrivate":      return <PrivateBookingForm onClose={closeForm} viewOnly={false} />;
      case "viewPrivate":     return <PrivateBookingForm onClose={closeForm} viewOnly />;

      // Photography
      case "addPhotography":  return <PhotographyForm onClose={closeForm} viewOnly={false} />;
      case "viewPhotography": return <PhotographyForm onClose={closeForm} viewOnly />;

      // Videography
      case "addVideography":  return <VideographyForm onClose={closeForm} viewOnly={false} />;
      case "viewVideography": return <VideographyForm onClose={closeForm} viewOnly />;

      // Sound submenu → direct tab
      case "addSound":        return <SoundSystemService defaultTab="ADD" />;
      case "viewSound":       return <SoundSystemService defaultTab="VIEW" />;

      // Singer / Payment / User submenu handling
      case "addSinger":       return <SingerForm onClose={closeForm} viewOnly={false} />;
      case "viewSinger":      return <SingerForm onClose={closeForm} viewOnly />;

      case "addPayment":      return <PaymentForm onClose={closeForm} viewOnly={false} />;
      case "viewPayment":     return <PaymentForm onClose={closeForm} viewOnly />;

      case "addUser":         return <UserForm onClose={closeForm} viewOnly={false} />;
      case "viewUser":        return <UserForm onClose={closeForm} viewOnly />;

      default:                return null;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Left rail */}
      <Sidebar
        openModal={(key) => safeSetActiveForm(key)}
        openSubModal={(key) => safeSetActiveForm(key)}
        currentKey={activeForm}
      />

      {/* Main board */}
      <main className={`dashboard-content ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <section className="neo-board">
          <div className="inner">
            {/* ===== OVERVIEW ===== */}
            {!activeForm && (
              <>
                {/* HERO */}
                <motion.section
                  className="neo-hero"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="hero-row">
                    <div>
                      <h2>Welcome back, Admin 👋</h2>
                      <div className="sub">Manage your studio, bookings, and analytics efficiently</div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      className="neo-cta"
                      onClick={() => safeSetActiveForm("addEvent")}
                    >
                      + Add New Event
                    </motion.button>
                  </div>
                </motion.section>

                {/* KPI CARDS */}
                <div className="neo-kpis">
                  {cards.map((card, i) => (
                    <motion.div
                      key={card.title}
                      className="neo-card"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: cardsLoaded ? 1 : 0, y: cardsLoaded ? 0 : 16 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <div className="kpi-top">
                        <span className="kpi-icon" style={{ color: card.color }}>
                          {card.icon}
                        </span>
                        <span>{card.title}</span>
                      </div>
                      <div className="kpi-value">
                        <CountUp end={card.value} duration={1.6} separator="," />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CHART PANEL */}
                <motion.div
                  className="neo-panel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <div className="panel-head">
                    <div className="title">
                      <span style={{ color: "#ffbf4d" }}>▮▮▮</span>
                      <span>User Activity</span>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div className="neo-pill">+32% Growth</div>
                      <div className="neo-pill">12 Upcoming Events</div>
                    </div>
                  </div>
                  <Charts />
                </motion.div>
              </>
            )}

            {/* ===== MODULE VIEWS (ALL) ===== */}
            {activeForm && <div className="content-wide">{renderActive()}</div>}
          </div>
        </section>
      </main>
    </div>
  );
}
