import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faGear,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState({
    full_name: "",
    email: "",
    profile_photo: "",
  });
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const btnRef = useRef(null);

  const BASE = (import.meta.env.VITE_BASE_API_URL || "").replace(/\/+$/, "");

  /* ---------------- HELPERS ---------------- */
  const toAbsolute = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith("/")) return `${BASE}${url}`;
    return `${BASE}/${url}`;
  };

  const initials = (name) =>
    (name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "IM";

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setMenuOpen(false);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser({ full_name: "", email: "", profile_photo: "" });
    window.dispatchEvent(new Event("authChange"));
    navigate("/login", { replace: true });
  }, [navigate]);

  /* ---------------- FETCH USER ---------------- */
  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      return;
    }

    try {
      const res = await fetch(`${BASE}/auth/dj-rest-auth/user/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        handleLogout();
        return;
      }

      const data = await res.json();

      setIsAuthenticated(true);

      // ✅ ADMIN DETECTION
      const admin =
        data?.role === "admin" ||
        data?.is_superuser === true ||
        data?.is_staff === true;

      setIsAdmin(admin);

      setUser({
        full_name:
          data.full_name ||
          `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        email: data.email || "",
        profile_photo: data.profile_photo || data.photo || "",
      });
    } catch {
      handleLogout();
    }
  }, [BASE, handleLogout]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe, location.pathname]);

  const avatarSrc = user.profile_photo ? toAbsolute(user.profile_photo) : "";

  return (
    <nav style={styles.navbar}>
      {/* LOGO */}
      <div style={styles.logo}>
        <Link to="/user-dashboard" style={styles.logoLink}>
          <img src={logo} alt="IMC Logo" style={styles.logoImg} />
          <span style={styles.logoText}>IMC</span>
        </Link>
      </div>

      {/* ================= CENTER NAV (USER ONLY) ================= */}
      {isAuthenticated && !isAdmin && (
        <div style={styles.centerLinks}>
          <Link
            to="/user-dashboard"
            style={{
              ...styles.navItem,
              ...(isActive("/user-dashboard") && styles.activeNav),
            }}
          >
            Home
          </Link>

          <Link
            to="/services"
            style={{
              ...styles.navItem,
              ...(isActive("/services") && styles.activeNav),
            }}
          >
            Services
          </Link>

          <Link
            to="/events-booking"
            style={{
              ...styles.navItem,
              ...(isActive("/events-booking") && styles.activeNav),
            }}
          >
            Events
          </Link>

          <Link
            to="/studio-booking"
            style={{
              ...styles.navItem,
              ...(isActive("/studio-booking") && styles.activeNav),
            }}
          >
            Studio
          </Link>

          <Link
            to="/singing-classes"
            style={{
              ...styles.navItem,
              ...(isActive("/singing-classes") && styles.activeNav),
            }}
          >
            Classes
          </Link>

          <Link
            to="/singer-booking"
            style={{
              ...styles.navItem,
              ...(isActive("/singer-booking") && styles.activeNav),
            }}
          >
            Singer
          </Link>

          <Link
            to="/contact"
            style={{
              ...styles.navItem,
              ...(isActive("/contact") && styles.activeNav),
            }}
          >
            Contact
          </Link>
        </div>
      )}

      {/* ================= RIGHT SIDE ================= */}
      <div style={styles.links}>
        {isAuthenticated ? (
          <div style={{ position: "relative" }}>
            <button
              ref={btnRef}
              onClick={() => setMenuOpen((s) => !s)}
              style={styles.avatarButton}
            >
              <span style={styles.halo} />
              <span style={styles.avatarCircle}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" style={styles.avatarImg} />
                ) : (
                  <span style={styles.avatarInitials}>
                    {initials(user.full_name)}
                  </span>
                )}
              </span>
              <span style={styles.statusDot} />
            </button>

            {menuOpen && (
              <div ref={menuRef} style={styles.menu}>
                <div style={styles.menuHeader}>
                  <strong>{user.full_name}</strong>
                  <span style={{ fontSize: 12 }}>{user.email}</span>
                </div>

                <div style={styles.menuDivider} />

                <Link
                  to="/profile"
                  style={styles.menuItem}
                  onClick={() => setMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faUser} /> Profile
                </Link>

                {!isAdmin && (
                  <Link
                    to="/settings"
                    style={styles.menuItem}
                    onClick={() => setMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faGear} /> Settings
                  </Link>
                )}

                <div style={styles.menuDivider} />

                <button
                  onClick={handleLogout}
                  style={{ ...styles.menuItem, ...styles.menuDanger }}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/register" style={styles.registerLink}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

/* ================= STYLES (UNCHANGED) ================= */
const styles = {
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    background:
      "linear-gradient(90deg, #0A2C56 0%, #FF6F3C 70%, #FFD23F 100%)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },

  logo: { display: "flex", alignItems: "center" },
  logoLink: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    color: "#fff",
  },
  logoImg: { height: 38, marginRight: 10 },
  logoText: { fontSize: "1.4em", fontWeight: 800 },

  centerLinks: {
    display: "flex",
    gap: 6,
    background: "rgba(255,255,255,0.15)",
    padding: 6,
    borderRadius: 999,
  },
  navItem: {
    padding: "6px 16px",
    borderRadius: 999,
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
  },
  activeNav: {
    background: "#EDE9FE",
    color: "#5B21B6",
  },

  links: { display: "flex", gap: 10, alignItems: "center" },

  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    padding: "6px 14px",
    borderRadius: 25,
    background: "linear-gradient(135deg,#0077b6,#00b4d8)",
  },
  registerLink: {
    color: "#0A2C56",
    padding: "6px 14px",
    borderRadius: 25,
    background: "linear-gradient(135deg,#FFD23F,#FFB703)",
    textDecoration: "none",
    fontWeight: 600,
  },

  avatarButton: {
    position: "relative",
    height: 42,
    width: 42,
    borderRadius: "50%",
    border: 0,
    background: "transparent",
  },
  halo: {
    position: "absolute",
    inset: -4,
    borderRadius: "50%",
    background:
      "conic-gradient(#ffd23f,#ff8a3c,#0a2c56,#ffd23f)",
  },
  avatarCircle: {
    height: "100%",
    width: "100%",
    borderRadius: "50%",
    overflow: "hidden",
    border: "2px solid #fff",
  },
  avatarImg: { height: "100%", width: "100%", objectFit: "cover" },
  avatarInitials: { color: "#fff", fontWeight: 800 },
  statusDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    height: 10,
    width: 10,
    borderRadius: "50%",
    background: "#2ecc71",
  },

  menu: {
    position: "absolute",
    right: 0,
    top: 50,
    background: "#fff",
    borderRadius: 14,
    padding: 10,
    minWidth: 220,
  },
  menuHeader: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 8,
  },
  menuItem: {
    display: "flex",
    gap: 10,
    padding: "8px 10px",
    textDecoration: "none",
    fontWeight: 700,
    color: "#0A2C56",
    background: "transparent",
    border: 0,
    cursor: "pointer",
  },
  menuDivider: { height: 1, background: "#ddd", margin: "6px 0" },
  menuDanger: { color: "#b42318" },
};

export default Navbar;
