// Dashboard.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Charts from "./Charts";

import StudioForm from "./Forms/StudioForm";
import EquipmentForm from "./Forms/EquipmentForm"; // ✅ single valid import
import EventsForm from "./Forms/EventsForm";
import ShowsForm from "./Forms/ShowsForm";
import PhotographyForm from "./Forms/PhotographyForm";
import VideographyForm from "./Forms/VideographyForm";
import SoundForm from "./Forms/SoundForm";
import SingerForm from "./Forms/SingerForm";
import PaymentForm from "./Forms/PaymentForm";
import UserForm from "./Forms/UserForm";

import { motion } from "framer-motion";
import { FaUsers, FaMicrophone, FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import CountUp from "react-countup";
import "./Dashboard.css";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cardsLoaded, setCardsLoaded] = useState(false);

  /**
   * activeForm can be:
   * Main: "studio","equipment","events","photography","videography","sound","singer","payment","user"
   * Submenus:
   *  - Studio: "addStudio","viewStudio"
   *  - Equipment: "addEquipment","viewEquipment"   ✅
   *  - Events: "addEvent","viewEvent"
   *  - Shows: "addShow","viewShow"
   * null -> Overview
   */
  const [activeForm, setActiveForm] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setCardsLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);

  const cards = [
    { icon: <FaUsers />, title: "Customers", value: 230, color: "#00bfff" },
    { icon: <FaMicrophone />, title: "Studio Bookings", value: 45, color: "#0099ff" },
    { icon: <FaCalendarAlt />, title: "Events", value: 12, color: "#00acee" },
    { icon: <FaDollarSign />, title: "Revenue (₹)", value: 18000, color: "#0077b6" },
  ];

  const closeForm = () => setActiveForm(null);

  // Some forms (Studio/Equipment) support starting on VIEW; others ignore it.
  const defaultTabFor = (key) => (key && key.startsWith("view") ? "VIEW" : "ADD");

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((s) => !s)}
        // top-level menu items open the corresponding form:
        openModal={(key) => setActiveForm(key)}
        // submenu items (Add/View) also map to the same state variable:
        openSubModal={(key) => setActiveForm(key)}
      />

      {/* Main */}
      <main className={`dashboard-content ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <div className="dashboard-main">
          {/* Overview (shown when no form is selected) */}
          {!activeForm && (
            <>
              <motion.div
                className="dashboard-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="header-text">
                  <h2>
                    Welcome Back, <span>Admin 🎧</span>
                  </h2>
                  <p>Manage your studio, bookings, and analytics efficiently</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="header-btn"
                  onClick={() => setActiveForm("events")}
                >
                  + Add New Event
                </motion.button>
              </motion.div>

              {/* KPI Cards */}
              <div className="dashboard-cards">
                {cards.map((card, i) => (
                  <motion.div
                    key={card.title}
                    className={`card ${cardsLoaded ? "loaded" : ""}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    whileHover={{ scale: 1.04 }}
                  >
                    <div className="card-icon" style={{ color: card.color }}>
                      {card.icon}
                    </div>
                    <div className="card-details">
                      <h3>{card.title}</h3>
                      <p>
                        <CountUp end={card.value} duration={2} separator="," />
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <motion.div
                className="chart-section"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="chart-header">
                  <h3>📊 Activity Overview</h3>
                  <p>Monthly performance and analytics</p>
                </div>
                <Charts />
              </motion.div>
            </>
          )}

          {/* -------- Main menu forms -------- */}
          {activeForm === "studio" && <StudioForm onClose={closeForm} />}
          {activeForm === "equipment" && <EquipmentForm onClose={closeForm} />}
          {activeForm === "events" && <EventsForm onClose={closeForm} />}
          {activeForm === "photography" && <PhotographyForm onClose={closeForm} />}
          {activeForm === "videography" && <VideographyForm onClose={closeForm} />}
          {activeForm === "sound" && <SoundForm onClose={closeForm} />}
          {activeForm === "singer" && <SingerForm onClose={closeForm} />}
          {activeForm === "payment" && <PaymentForm onClose={closeForm} />}
          {activeForm === "user" && <UserForm onClose={closeForm} />}

          {/* -------- Studio submenu -------- */}
          {activeForm === "addStudio" && <StudioForm onClose={closeForm} viewOnly={false} />}
          {activeForm === "viewStudio" && <StudioForm onClose={closeForm} viewOnly={true} />}

          {/* -------- Equipment submenu (wired to your screenshot) -------- */}
          {activeForm === "addEquipment" && <EquipmentForm onClose={closeForm} viewOnly={false} />}
          {activeForm === "viewEquipment" && <EquipmentForm onClose={closeForm} viewOnly={true} />}

          {/* -------- Events submenu -------- */}
          {activeForm === "addEvent" && (
            <EventsForm onClose={closeForm} defaultTab={defaultTabFor("addEvent")} />
          )}
          {activeForm === "viewEvent" && (
            <EventsForm onClose={closeForm} defaultTab={defaultTabFor("viewEvent")} />
          )}

          {/* -------- Shows submenu -------- */}
          {activeForm === "addShow" && (
            <ShowsForm onClose={closeForm} defaultTab={defaultTabFor("addShow")} />
          )}
          {activeForm === "viewShow" && (
            <ShowsForm onClose={closeForm} defaultTab={defaultTabFor("viewShow")} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
