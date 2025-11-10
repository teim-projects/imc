// Sidebar.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
} from "react-icons/fa";

/**
 * Sidebar
 *
 * Props:
 *  - openModal(modalKey: string|null)
 *  - openSubModal(actionKey: string)   e.g. "addStudio", "viewStudio"
 *  - currentKey?: string|null
 */
function Sidebar({ openModal, openSubModal, currentKey = null }) {
  const [activeName, setActiveName] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null); // which group's submenu is open

  const _openModal = openModal || (() => {});
  const _openSubModal = openSubModal || (() => {});

  // Map of sub-action -> parent key to auto-expand correct group
  const subKeyToParent = useMemo(
    () => ({
      addStudio: "studio",
      viewStudio: "studio",
      addEquipment: "equipment",
      viewEquipment: "equipment",
      addEvent: "eventsShows",
      viewEvent: "eventsShows",
      addShow: "eventsShows",
      viewShow: "eventsShows",
      addPrivate: "private",
      viewPrivate: "private",
      addPhotography: "photography",
      viewPhotography: "photography",
      addVideography: "videography",
      viewVideography: "videography",
      // NOTE: sound uses a single full-page module (no add/view sub-keys)
      // so we intentionally do NOT include addSound/viewSound here.
      addSinger: "singer",
      viewSinger: "singer",
      addPayment: "payment",
      viewPayment: "payment",
      addUser: "user",
      viewUser: "user",
    }),
    []
  );

  const menuItems = useMemo(
    () => [
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
          // you can add { label: "👁 View Info", actionKey: "viewStudio" } if needed
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
          // { label: "👁 View Events", actionKey: "viewEvent" },
          // { label: "👁 View Shows", actionKey: "viewShow" },
        ],
      },
      {
        name: "Private Bookings",
        key: "private",
        icon: <FaLock />,
        submenu: [
          { label: "➕ Add Info", actionKey: "addPrivate" },
          // { label: "👁 View Info", actionKey: "viewPrivate" },
        ],
      },
      {
        name: "Photography",
        key: "photography",
        icon: <FaCamera />,
        submenu: [
          { label: "➕ Add Info", actionKey: "addPhotography" },
          // { label: "👁 View Info", actionKey: "viewPhotography" },
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
        // 👉 Single full-page module (no submenu). Clicking opens `activeForm = "sound"`.
        modal: "sound",
        submenu: null,
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
    ],
    []
  );

  const goHome = useCallback(() => {
    setActiveName("Overview");
    setExpandedItem(null);
    _openModal(null);
    setMobileOpen(false);
  }, [_openModal]);

  // Disable page scroll when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  // Keep expanded group in sync with currentKey (from Dashboard)
  useEffect(() => {
    if (!currentKey) return;
    const parent = subKeyToParent[currentKey];
    if (parent) setExpandedItem(parent);
  }, [currentKey, subKeyToParent]);

  const toggleExpand = (key) => {
    setExpandedItem((curr) => (curr === key ? null : key));
  };

  const handleItemClick = (item) => {
    const hasSub = item.submenu && item.submenu.length > 0;
    setActiveName(item.name);

    if (hasSub) {
      // toggle its submenu (don’t open main modal when expanding)
      toggleExpand(item.key);
      _openModal(null);
    } else {
      setExpandedItem(null);
      // If a direct modal key is defined, open it (e.g., "sound")
      if (item.modal !== undefined) {
        _openModal(item.modal);
      } else {
        _openModal(null);
      }
    }
    setMobileOpen(false);
  };

  const handleItemKey = (e, item) => {
    // Enter/Space toggles
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleItemClick(item);
    }
  };

  const handleSubClick = (e, actionKey) => {
    e.preventDefault();
    e.stopPropagation();
    _openSubModal(actionKey);
    setMobileOpen(false);
  };

  // Helper: active/expanded visual based on currentKey if given
  const isItemExpanded = (item) =>
    expandedItem === item.key ||
    (!!currentKey && subKeyToParent[currentKey] === item.key);

  return (
    <>
      {/* ===== MOBILE HEADER ===== */}
      <div className="mobile-header">
        <h2 className="mobile-title" onClick={goHome}>
          IMC
        </h2>
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
        {/* ===== HEADER ===== */}
        <div className="sidebar-header" onClick={goHome}>
          <h2 className="sidebar-title">IMC</h2>
        </div>

        {/* ===== MENU ===== */}
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const hasSub = !!(item.submenu && item.submenu.length);
            const expanded = hasSub ? isItemExpanded(item) : false;
            const isActive =
              activeName === item.name ||
              (currentKey && subKeyToParent[currentKey] === item.key) ||
              (item.modal && currentKey === item.modal); // highlight for direct modal pages like "sound"

            return (
              <li key={item.key} className={isActive ? "active" : ""}>
                <button
                  className="sidebar-btn"
                  onClick={() => handleItemClick(item)}
                  onKeyDown={(e) => handleItemKey(e, item)}
                  aria-expanded={hasSub ? expanded : undefined}
                  aria-controls={hasSub ? `${item.key}-submenu` : undefined}
                >
                  <div className="icon">{item.icon}</div>
                  <span className="text">{item.name}</span>
                  {hasSub && (
                    <span className={`caret ${expanded ? "open" : ""}`} aria-hidden>
                      ▾
                    </span>
                  )}
                </button>

                {hasSub && expanded && (
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
