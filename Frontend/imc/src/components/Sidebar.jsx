// ---------- Sidebar.jsx (updated) ----------
import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./Sidebar.css";
import {
  FaMusic, FaCalendarAlt, FaEnvelope, FaUser, FaChartLine, FaTools, FaLock,
  FaCamera, FaVideo, FaVolumeUp, FaMoneyBill, FaBars, FaTimes, FaBuilding
} from "react-icons/fa";

function Sidebar({ openModal, openSubModal, currentKey = null }) {
  const [activeName, setActiveName] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);

  const _openModal = openModal || (() => {});
  const _openSubModal = openSubModal || (() => {});

  // mapping submenu action keys -> parent key
  const subKeyToParent = useMemo(() => ({
    addStudio: "studio", viewStudio: "studio",
    addStudioMaster: "studioMaster", viewStudioMaster: "studioMaster",
 
    addEvent: "eventsShows", viewEvent: "eventsShows",
    
    addPrivate: "private", viewPrivate: "private",
    addPhotography: "photography", viewPhotography: "photography",
    addVideography: "videography", viewVideography: "videography",
    addSinger: "singer", viewSinger: "singer",
    addPayment: "payment", viewPayment: "payment",
    // singing classes
    addClass: "classes", viewClass: "classes",
  }), []);

  const menuItems = useMemo(() => [
    { name: "Overview", key: "overview", icon: <FaChartLine />, modal: null, submenu: null },

    {
      name: "Studio Master",
      key: "studioMaster",
      icon: <FaBuilding />,
      modal: "studioMaster",
      submenu: [
        { label: "➕ Add Studio (Master)", actionKey: "addStudioMaster" },
        { label: "👁 View Studios (Master)", actionKey: "viewStudioMaster" },
      ],
    },

    { name: "Studio Booking", key: "studio", icon: <FaMusic />, submenu: [{ label: "➕ Add Info", actionKey: "addStudio" }] },

    { name: "Singing Classes", key: "equipment", icon: <FaTools />, submenu: [{ label: "➕ Add Info", actionKey: "addEquipment" }] },

    { name: "Auditorium Music Shows", key: "eventsShows", icon: <FaCalendarAlt />, submenu: [
        { label: "➕ Event", actionKey: "addEvent" },

      ] },

    { name: "Private Music Events ", key: "private", icon: <FaLock />, submenu: [{ label: "➕ Add Info", actionKey: "addPrivate" }] },

    { name: "Photography Service ", key: "photography", icon: <FaCamera />, submenu: [{ label: "➕ Add Info", actionKey: "addPhotography" }] },

    {
      name: "Videography Service ",
      key: "videography",
      icon: <FaVideo />,
      submenu: [
        { label: "➕ Add Info", actionKey: "addVideography" },
        
      ],
    },

    { name: "Sound System Service", key: "sound", icon: <FaVolumeUp />, modal: "sound", submenu: null },

    {
      name: "Singer Management",
      key: "singer",
      icon: <FaUser />,
      submenu: [
        { label: "➕ Add Info", actionKey: "addSinger" },
        
      ],
    },

    {
      name: "Payments",
      key: "payment",
      icon: <FaMoneyBill />,
      submenu: [
        { label: "➕ Add Info", actionKey: "addPayment" },
        
      ],
    },

    // 

    { name: "Contact", key: "contact", icon: <FaEnvelope />, modal: "contact", submenu: null },
  ], []);

  const goHome = useCallback(() => {
    setActiveName("Overview");
    setExpandedItem(null);
    _openModal(null);
    setMobileOpen(false);
  }, [_openModal]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  useEffect(() => {
    if (!currentKey) return;
    const parent = subKeyToParent[currentKey];
    if (parent) setExpandedItem(parent);
  }, [currentKey, subKeyToParent]);

  const toggleExpand = (key) => setExpandedItem((curr) => (curr === key ? null : key));

  const handleItemClick = (item) => {
    const hasSub = !!(item.submenu && item.submenu.length);
    setActiveName(item.name);

    if (hasSub) {
      const willExpand = expandedItem !== item.key;
      toggleExpand(item.key);
      _openModal(null);
    } else {
      setExpandedItem(null);
      if (item.modal !== undefined) _openModal(item.modal);
      else _openModal(null);
    }
    setMobileOpen(false);
  };

  const handleSubClick = (e, actionKey) => {
    e.preventDefault();
    e.stopPropagation();
    _openSubModal(actionKey);
    setMobileOpen(false);
  };

  const isItemExpanded = (item) =>
    expandedItem === item.key || (!!currentKey && subKeyToParent[currentKey] === item.key);

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <h2 className="mobile-title" onClick={goHome}>IMC</h2>
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className={`sidebar-overlay ${mobileOpen ? "active" : ""}`} onClick={() => setMobileOpen(false)} />

      <aside
        className={`sidebar ${mobileOpen ? "open" : ""} ${
          isHovered ? "expanded" : "collapsed"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="sidebar-header" onClick={goHome}>
          <h2 className="sidebar-title">IMC</h2>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const hasSub = !!item.submenu?.length;
            const expanded = hasSub ? isItemExpanded(item) : false;

            return (
              <li key={item.key} className={activeName === item.name ? "active" : ""}>
                <button className="sidebar-btn" onClick={() => handleItemClick(item)}>
                  <div className="icon">{item.icon}</div>
                  <span className="text">{item.name}</span>
                  {hasSub && <span className={`caret ${expanded ? "open" : ""}`}>▾</span>}
                </button>

                {hasSub && expanded && (
                  <div className="submenu">
                    {item.submenu.map((sub) => (
                      <button key={sub.actionKey} className="submenu-btn"
                        onClick={(e) => handleSubClick(e, sub.actionKey)}>
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

