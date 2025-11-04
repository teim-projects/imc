import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import {
  FaMusic,
  FaCalendarAlt,
  FaEnvelope,
  FaUser,
  FaChartLine,
  FaTools,
  FaLock,
  FaCamera,
  FaVideo,
  FaVolumeUp,
  FaMoneyBill,
  FaUsers,
  FaBars,
  FaTimes,
  FaSignInAlt,
} from "react-icons/fa";

/**
 * Reusable Sidebar with per-item submenus (Add Info / View Info) for all modules.
 * - Hover to expand/collapse on desktop
 * - Mobile drawer with overlay
 * - A11y-friendly aria-* attributes
 *
 * Parent should provide:
 *   openModal(modalKey?: string | null)
 *   openSubModal(actionKey: string)  // e.g., "addStudio", "viewStudio", etc.
 */
function Sidebar({ openModal, openSubModal }) {
  const [active, setActive] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null); // which item’s submenu is open

  // fallback handlers
  const _openModal = openModal || (() => {});
  const _openSubModal = openSubModal || (() => {});

  // Define menu + sub-actions
  const menuItems = [
    {
      name: "Overview",
      key: "overview",
      icon: <FaChartLine />,
      modal: null,
      submenu: null,
    },
    {
      name: "Studio Rentals",
      key: "studio",
      icon: <FaMusic />,
      submenu: [
        { label: "➕ Add Info", actionKey: "addStudio" },
        { label: "👁 View Info", actionKey: "viewStudio" },
      ],
    },
    {
      name: "Equipment Rentals",
      key: "equipment",
      icon: <FaTools />,
      submenu: [
        { label: "➕ Add Info", actionKey: "addEquipment" },
        // { label: "👁 View Info", actionKey: "viewEquipment" },
      ],
    },
    {
      name: "Events & Shows",
      key: "eventsShows",
      icon: <FaCalendarAlt />,
      submenu: [
        { label: "➕ Event", actionKey: "addEvent" },
        { label: "🎤 Show", actionKey: "addShow" },
      ],
    },
    {
      name: "Private Bookings",
      key: "private",
      icon: <FaLock />,
    
    },
    {
      name: "Photography",
      key: "photography",
      icon: <FaCamera />,
      submenu: [
        { label: "➕ Add Info", actionKey: "addPhotography" },
        { label: "👁 View Info", actionKey: "viewPhotography" },
      ],
    },
    {
      name: "Videography",
      key: "videography",
      icon: <FaVideo />,
      submenu: [
        { label: "➕ Add Info", actionKey: "addVideography" },
        { label: "👁 View Info", actionKey: "viewVideography" },
      ],
    },
    {
      name: "Sound Systems",
      key: "sound",
      icon: <FaVolumeUp />,
      submenu: [
        { label: "➕ Add Info", actionKey: "addSound" },
        { label: "👁 View Info", actionKey: "viewSound" },
      ],
    },
    {
      name: "Singer Management",
      key: "singer",
      icon: <FaUser />,
      submenu: [
        { label: "➕ Add Info", actionKey: "addSinger" },
        { label: "👁 View Info", actionKey: "viewSinger" },
      ],
    },
    {
      name: "Payments",
      key: "payment",
      icon: <FaMoneyBill />,
      submenu: [
        { label: "➕ Add Info", actionKey: "addPayment" },
        { label: "👁 View Info", actionKey: "viewPayment" },
      ],
    },
    {
      name: "User Management",
      key: "user",
      icon: <FaUsers />,
      submenu: [
        { label: "➕ Add Info", actionKey: "addUser" },
        { label: "👁 View Info", actionKey: "viewUser" },
      ],
    },
    {
      name: "Contact",
      key: "contact",
      icon: <FaEnvelope />,
      modal: "contact",
      submenu: null,
    },
  ];

  const goHome = () => {
    setActive("Overview");
    setExpandedItem(null);
    _openModal(null);
    setMobileOpen(false);
  };

  // Disable page scroll when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  const handleItemClick = (item) => {
    setActive(item.name);
    if (item.submenu && item.submenu.length) {
      setExpandedItem((curr) => (curr === item.key ? null : item.key));
      _openModal(null);
    } else {
      setExpandedItem(null);
      item.modal ? _openModal(item.modal) : _openModal(null);
    }
    setMobileOpen(false);
  };

  const handleSubClick = (e, actionKey) => {
    e.preventDefault();
    e.stopPropagation();
    _openSubModal(actionKey);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ===== MOBILE HEADER ===== */}
      <div className="mobile-header">
        <h2 className="mobile-title" onClick={goHome}>IMC</h2>
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* ===== OVERLAY ===== */}
      <div
        className={`sidebar-overlay ${mobileOpen ? "active" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`sidebar ${mobileOpen ? "open" : ""} ${
          isHovered ? "expanded" : "collapsed"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Main sidebar navigation"
      >
        {/* ===== HEADER (text only now) ===== */}
        <div className="sidebar-header" onClick={goHome}>
          <h2 className="sidebar-title">IMC</h2>
        </div>

        {/* ===== MENU ===== */}
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const isActive = active === item.name;
            const isExpanded = expandedItem === item.key;
            const hasSub = item.submenu && item.submenu.length;

            return (
              <li key={item.key} className={isActive ? "active" : ""}>
                <button
                  className="sidebar-btn"
                  onClick={() => handleItemClick(item)}
                  aria-expanded={hasSub ? isExpanded : undefined}
                  aria-controls={hasSub ? `${item.key}-submenu` : undefined}
                >
                  <div className="icon">{item.icon}</div>
                  <span className="text">{item.name}</span>
                  {hasSub && (
                    <span className={`caret ${isExpanded ? "open" : ""}`} aria-hidden>
                      ▾
                    </span>
                  )}
                </button>

                {hasSub && isExpanded && (
                  <div
                    id={`${item.key}-submenu`}
                    className="submenu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.submenu.map((sub) => (
                      <button
                        key={sub.actionKey}
                        className="submenu-btn"
                        onClick={(e) => handleSubClick(e, sub.actionKey)}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        
      </aside>
    </>
  );
}

export default Sidebar;
