import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faGear, faUser } from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ full_name: "", email: "", profile_photo: "" });
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const btnRef = useRef(null);

  const BASE = (import.meta.env.VITE_BASE_API_URL || "").replace(/\/+$/, "");

  const toAbsolute = (url) => {
    if (!url) return "";
    const s = String(url);
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("/")) return `${BASE}${s}`;
    return `${BASE}/${s}`;
  };

  const initials = (name) =>
    (name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "IM";

  // ----- Logout (ensure no profile shown after) -----
  const handleLogout = useCallback(() => {
    // 1) remove tokens
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    // 2) reset state
    setMenuOpen(false);
    setIsAuthenticated(false);
    setUser({ full_name: "", email: "", profile_photo: "" });
    // 3) notify app
    window.dispatchEvent(new Event("authChange"));
    // 4) go to login
    navigate("/login", { replace: true });
  }, [navigate]);

  // ----- Fetch current user -----
  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setIsAuthenticated(false);
      setUser({ full_name: "", email: "", profile_photo: "" });
      setMenuOpen(false);
      return;
    }
    try {
      const res = await fetch(`${BASE}/api/auth/dj-rest-auth/user/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setUser({
          full_name: data.full_name || `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          email: data.email || "",
          profile_photo: data.profile_photo || data.photo || "",
        });
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    }
  }, [BASE, handleLogout]);

  useEffect(() => {
    const publicPaths = ["/login", "/register"];
    const isPublicPage = publicPaths.includes(location.pathname);

    if (!isPublicPage) fetchMe();
    else {
      // never show avatar on public pages
      setIsAuthenticated(false);
      setUser({ full_name: "", email: "", profile_photo: "" });
      setMenuOpen(false);
    }

    const handleAuthChange = () => fetchMe();
    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, [location, fetchMe]);

  // close dropdown on outside click / ESC
  useEffect(() => {
    const onClick = (e) => {
      if (menuOpen) {
        const inMenu = menuRef.current?.contains(e.target);
        const inBtn = btnRef.current?.contains(e.target);
        if (!inMenu && !inBtn) setMenuOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const avatarSrc = user.profile_photo ? toAbsolute(user.profile_photo) : "";

  return (
    <nav style={styles.navbar}>
      {/* LOGO + TITLE */}
      <div style={styles.logo}>
        <Link
          to="/dashboard"
          style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "white" }}
        >
          <img src={logo} alt="IMC Logo" style={styles.logoImg} />
          <span style={styles.logoText}>IMC</span>
        </Link>
      </div>

      {/* LINKS / AVATAR */}
      <div style={styles.links}>
        {isAuthenticated ? (
          <div style={{ position: "relative" }}>
            {/* Avatar Button */}
            <button
              ref={btnRef}
              onClick={() => setMenuOpen((s) => !s)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title={user.full_name || "Profile"}
              style={styles.avatarButton}
            >
              <span style={styles.halo} />
              <span style={styles.avatarCircle}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" style={styles.avatarImg} />
                ) : (
                  <span style={styles.avatarInitials}>{initials(user.full_name)}</span>
                )}
              </span>
              <span style={styles.statusDot} />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div ref={menuRef} role="menu" style={styles.menu}>
                <div style={styles.menuHeader}>
                  <div style={styles.menuAvatarWrap}>
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Small avatar" style={styles.menuAvatarImg} />
                    ) : (
                      <div style={styles.menuAvatarFallback}>{initials(user.full_name)}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <strong style={{ fontSize: 14, color: "#0A2C56" }}>
                      {user.full_name || "User"}
                    </strong>
                    <span style={{ fontSize: 12, color: "#5c6b84" }}>{user.email}</span>
                  </div>
                </div>

                <div style={styles.menuDivider} />

                <Link to="/profile" style={styles.menuItem} onClick={() => setMenuOpen(false)}>
                  <FontAwesomeIcon icon={faUser} style={styles.menuIcon} />
                  Profile
                </Link>

                <Link to="/settings" style={styles.menuItem} onClick={() => setMenuOpen(false)}>
                  <FontAwesomeIcon icon={faGear} style={styles.menuIcon} />
                  Settings
                </Link>

                <div style={styles.menuDivider} />

                <button onClick={handleLogout} style={{ ...styles.menuItem, ...styles.menuDanger }}>
                  <FontAwesomeIcon icon={faRightFromBracket} style={styles.menuIcon} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          // Logged out: show ONLY Login/Register — no profile icon at all
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.registerLink}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

/* =================== Styles =================== */
const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    background: "linear-gradient(90deg, #0A2C56 0%, #FF6F3C 70%, #FFD23F 100%)",
    color: "white",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
    borderBottom: "2px solid rgba(255,255,255,0.15)",
    backdropFilter: "blur(6px)",
    minHeight: "60px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    fontSize: "1.5em",
    fontWeight: "700",
    letterSpacing: "1px",
    color: "#fff",
    textShadow: "0 1px 3px rgba(0,0,0,0.4)",
  },
  logoImg: {
    height: "38px",
    width: "38px",
    marginRight: "10px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "2px solid #FFD23F",
    boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
  },
  logoText: {
    fontSize: "1.4em",
    fontWeight: "800",
    color: "#fff",
    letterSpacing: "1.2px",
  },
  links: { display: "flex", gap: "10px", alignItems: "center" },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "600",
    padding: "6px 14px",
    borderRadius: "25px",
    background: "linear-gradient(135deg, #0077b6, #00b4d8)",
    transition: "transform .15s ease, box-shadow .15s ease",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    fontSize: "0.9rem",
  },
  registerLink: {
    color: "#0A2C56",
    textDecoration: "none",
    fontWeight: "600",
    padding: "6px 14px",
    borderRadius: "25px",
    background: "linear-gradient(135deg, #FFD23F, #FFB703)",
    transition: "transform .15s ease, box-shadow .15s ease",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    fontSize: "0.9rem",
  },

  /* Avatar button */
  avatarButton: {
    position: "relative",
    height: 42,
    width: 42,
    borderRadius: "50%",
    border: "0",
    padding: 0,
    background: "transparent",
    cursor: "pointer",
    outline: "none",
    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
  },
  halo: {
    position: "absolute",
    inset: -4,
    borderRadius: "50%",
    background: "conic-gradient(from 0deg, #ffd23f, #ff8a3c, #0a2c56, #ffd23f)",
    filter: "blur(4px)",
    opacity: 0.9,
  },
  avatarCircle: {
    position: "relative",
    height: "100%",
    width: "100%",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10151c, #1c2432)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    border: "2px solid rgba(255,255,255,0.65)",
  },
  avatarImg: { height: "100%", width: "100%", objectFit: "cover" },
  avatarInitials: { color: "#fff", fontWeight: 800, letterSpacing: 0.5, fontSize: 14 },
  statusDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    height: 12,
    width: 12,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2ecc71, #1abc9c)",
    border: "2px solid #0A2C56",
    boxShadow: "0 0 0 2px rgba(10,44,86,0.25)",
  },

  /* Dropdown */
  menu: {
    position: "absolute",
    right: 0,
    marginTop: 10,
    minWidth: 230,
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92))",
    border: "1px solid rgba(10,44,86,0.15)",
    borderRadius: 14,
    boxShadow: "0 18px 40px rgba(10,44,86,0.25)",
    backdropFilter: "blur(8px)",
    padding: 10,
    zIndex: 2000,
  },
  menuHeader: { display: "flex", alignItems: "center", gap: 10, padding: "4px 6px 10px" },
  menuAvatarWrap: {
    height: 36,
    width: 36,
    borderRadius: "50%",
    overflow: "hidden",
    border: "2px solid #FFD23F",
    background: "#eef4ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  menuAvatarImg: { height: "100%", width: "100%", objectFit: "cover" },
  menuAvatarFallback: { fontWeight: 800, color: "#0A2C56", fontSize: 12 },
  menuDivider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(10,44,86,.2), transparent)",
    margin: "6px 2px",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    color: "#0A2C56",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background .15s ease, transform .08s ease",
  },
  menuIcon: { width: 16 },
  menuDanger: { color: "#b42318" },
};

export default Navbar;
