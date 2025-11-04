import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfileSection = () => {
  const navigate = useNavigate();
  const BASE = useMemo(() => import.meta.env.VITE_BASE_API_URL?.replace(/\/+$/, "") || "", []);

  // ------------ state ------------
  const [user, setUser] = useState({
    full_name: "",
    email: "",
    mobile_no: "",
    profile_photo: "", // URL or path from server
  });

  const [avatarFile, setAvatarFile] = useState(null);     // <File>
  const [avatarPreview, setAvatarPreview] = useState(""); // blob URL
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);           // {type, text}
  const [errors, setErrors] = useState({});               // field-level errors from client/server

  // ------------ helpers ------------
  const notify = (type, text) => setMessage({ type, text });
  const clearMessage = () => setMessage(null);

  const validate = () => {
    const e = {};
    if (!user.full_name.trim()) e.full_name = "Full name is required.";
    if (user.mobile_no && !/^\+?\d{7,15}$/.test(user.mobile_no.trim())) {
      e.mobile_no = "Enter a valid phone (7–15 digits, optional +).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const bearer = () => {
    const token = localStorage.getItem("access");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const toAbsolute = (maybeUrl) => {
    if (!maybeUrl) return "";
    const s = String(maybeUrl);
    if (/^https?:\/\//i.test(s)) return s;
    // handle "/media/..." or "media/..."
    if (s.startsWith("/")) return `${BASE}${s}`;
    return `${BASE}/${s}`;
  };

  // ------------ fetch user ------------
  const fetchUserData = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setLoading(true);
    clearMessage();
    setErrors({});

    try {
      const res = await fetch(`${BASE}/api/auth/dj-rest-auth/user/`, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...bearer() },
      });

      if (res.status === 401) {
        // expired/invalid token
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login", { replace: true });
        return;
      }
      if (!res.ok) throw new Error("Failed to load.");

      const data = await res.json();
      setUser({
        full_name: data.full_name || `${(data.first_name || "")} ${(data.last_name || "")}`.trim(),
        email: data.email || "",
        mobile_no: data.mobile_no || "",
        profile_photo: data.profile_photo || data.photo || "", // tolerate alternate field name
      });
    } catch (err) {
      console.error("Fetch user error:", err);
      notify("error", "Could not load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ------------ save ------------
  const handleSave = async (e) => {
    e.preventDefault();
    clearMessage();
    setErrors((e) => ({ ...e, api: null }));

    if (!validate()) {
      notify("error", "Please fix validation errors.");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setSaving(true);
    try {
      let res, data;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("full_name", user.full_name || "");
        formData.append("mobile_no", user.mobile_no || "");
        formData.append("profile_photo", avatarFile); // 🔁 rename if backend uses another name

        res = await fetch(`${BASE}/api/auth/dj-rest-auth/user/`, {
          method: "PATCH",
          headers: { ...bearer() }, // do NOT set Content-Type for FormData
          body: formData,
        });
      } else {
        res = await fetch(`${BASE}/api/auth/dj-rest-auth/user/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...bearer() },
          body: JSON.stringify({
            full_name: user.full_name,
            mobile_no: user.mobile_no,
          }),
        });
      }

      try { data = await res.json(); } catch { data = {}; }

      if (res.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        // Map DRF field errors: {mobile_no:["..."], profile_photo:["..."], detail:"..."}
        const fieldErrs = {};
        if (data && typeof data === "object") {
          for (const [k, v] of Object.entries(data)) {
            if (Array.isArray(v) && v.length) fieldErrs[k] = v[0];
            else if (typeof v === "string") fieldErrs[k] = v;
          }
        }
        setErrors((prev) => ({ ...prev, ...fieldErrs }));
        notify("error", fieldErrs.detail || fieldErrs.non_field_errors || "Failed to update profile.");
        return;
      }

      // success
      setUser((prev) => ({
        ...prev,
        full_name: data.full_name ?? prev.full_name,
        mobile_no: data.mobile_no ?? prev.mobile_no,
        profile_photo: data.profile_photo ?? data.photo ?? prev.profile_photo,
      }));
      // refresh preview to the just-uploaded one (cache-bust)
      if (data.profile_photo || data.photo) {
        setAvatarPreview(""); // drop blob
        setAvatarFile(null);
      }
      notify("success", "Profile updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      notify("error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ------------ avatar ------------
  const onAvatarChange = (file) => {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      setErrors((e) => ({ ...e, profile_photo: "Please choose an image file (png, jpg, webp)." }));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrors((e) => ({ ...e, profile_photo: "Max file size is 3MB." }));
      return;
    }
    setErrors((e) => ({ ...e, profile_photo: null }));
    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview("");
    // Note: this removes local selection only.
    // To delete on server, add a separate PATCH that sends {"profile_photo": null}
    // and support it in your serializer.
  };

  // ------------ logout ------------
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.dispatchEvent(new Event("authChange"));
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    fetchUserData();
    return () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------ UI ------------
  if (loading) {
    return (
      <div style={sx.shell}>
        <div style={sx.card}>
          <div style={sx.header}>
            <div style={sx.headerTitleSkeleton} />
          </div>
          <div style={{ padding: 20 }}>
            <div style={sx.skelRow} />
            <div style={sx.skelRow} />
            <div style={sx.skelRow} />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <div style={sx.skelBtn} />
              <div style={sx.skelBtn} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const avatarSrc =
    avatarPreview ||
    (user.profile_photo ? toAbsolute(user.profile_photo) : "");

  return (
    <div style={sx.shell}>
      <div style={sx.card}>
        {/* Header */}
        <div style={sx.header}>
          <div>
            <h2 style={sx.title}>👤 Profile</h2>
            <p style={sx.subtitle}>Manage your account details</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={handleLogout} style={sx.btnDanger} title="Logout">
              Logout
            </button>
          </div>
        </div>

        {/* Toast */}
        {message && (
          <div
            role="alert"
            style={{ ...sx.toast, ...(message.type === "success" ? sx.toastSuccess : sx.toastError) }}
          >
            {message.text}
            <button onClick={clearMessage} style={sx.toastClose} aria-label="Close">×</button>
          </div>
        )}

        {/* Body */}
        <form style={sx.body} onSubmit={handleSave} noValidate>
          {/* Avatar */}
          <div style={sx.avatarCol}>
            <div style={sx.avatarWrap}>
              {avatarSrc ? <img src={avatarSrc} alt="Avatar" style={sx.avatarImg} /> : <div style={sx.avatarPlaceholder}>IMC</div>}
            </div>

            <label htmlFor="avatar" style={sx.btnLight}>Upload Photo</label>
            <input
              id="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => onAvatarChange(e.target.files?.[0])}
              style={{ display: "none" }}
            />
            {avatarPreview && (
              <button type="button" onClick={removeAvatar} style={{ ...sx.btnGhost, marginTop: 8 }}>
                Remove
              </button>
            )}
            <p style={sx.hint}>PNG/JPG/WebP up to 3MB</p>
            {errors.profile_photo && <span style={sx.errorText}>{errors.profile_photo}</span>}
          </div>

          {/* Form fields */}
          <div style={sx.formCol}>
            <div style={sx.grid}>
              <div style={sx.field}>
                <label style={sx.label}>Full Name</label>
                <input
                  type="text"
                  value={user.full_name}
                  onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                  placeholder="Your full name"
                  style={{ ...sx.input, ...(errors.full_name ? sx.inputError : {}) }}
                />
                {errors.full_name && <span style={sx.errorText}>{errors.full_name}</span>}
              </div>

              <div style={sx.field}>
                <label style={sx.label}>Email</label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  style={{ ...sx.input, background: "#f3f6fb", cursor: "not-allowed" }}
                />
                <span style={sx.hint}>Email cannot be changed</span>
              </div>

              <div style={sx.field}>
                <label style={sx.label}>Mobile Number</label>
                <input
                  type="text"
                  value={user.mobile_no}
                  onChange={(e) => {
                    setUser({ ...user, mobile_no: e.target.value });
                    if (errors.mobile_no) setErrors((x) => ({ ...x, mobile_no: null }));
                  }}
                  placeholder="+91 9876543210"
                  style={{ ...sx.input, ...(errors.mobile_no ? sx.inputError : {}) }}
                />
                {errors.mobile_no && <span style={sx.errorText}>{errors.mobile_no}</span>}
              </div>
            </div>

            <div style={sx.actions}>
              <button type="submit" style={sx.btnPrimary} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button type="button" style={sx.btnGhost} onClick={fetchUserData} disabled={saving} title="Reset to server values">
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ===================== STYLES ===================== */
const sx = {
  shell: { padding: "24px 16px", display: "flex", justifyContent: "center" },
  card: {
    width: "min(950px, 96vw)",
    background: "linear-gradient(135deg, rgba(255,255,255,.94), rgba(255,255,255,.86))",
    border: "1px solid rgba(10,44,86,0.15)",
    borderRadius: 18,
    boxShadow: "0 14px 40px rgba(10,44,86,0.10)",
    overflow: "hidden",
    backdropFilter: "blur(8px)",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: 18,
    background: "linear-gradient(90deg, #0A2C56, #FF6F3C 70%, #FFD23F)",
    color: "#fff",
    borderBottom: "1px solid rgba(255,255,255,.25)",
  },
  title: { margin: 0, fontSize: 20, letterSpacing: 0.3 },
  subtitle: { margin: "4px 0 0", opacity: 0.9, fontSize: 13 },

  body: { display: "grid", gridTemplateColumns: "260px 1fr", gap: 18, padding: 20 },

  avatarCol: { display: "flex", flexDirection: "column", alignItems: "center", borderRight: "1px dashed rgba(10,44,86,.18)", paddingRight: 12 },
  avatarWrap: {
    height: 140, width: 140, borderRadius: "50%", overflow: "hidden",
    border: "3px solid #FFD23F", boxShadow: "0 10px 24px rgba(0,0,0,.12)",
    marginBottom: 12, background: "linear-gradient(135deg, #f7f9fc, #eef4ff)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatarImg: { height: "100%", width: "100%", objectFit: "cover", display: "block" },
  avatarPlaceholder: { fontWeight: 800, color: "#0A2C56", fontSize: 26 },

  formCol: { display: "flex", flexDirection: "column", gap: 14 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  field: { display: "flex", flexDirection: "column" },
  label: { fontWeight: 700, marginBottom: 6, color: "#0A2C56" },
  input: {
    background: "#fff", border: "1px solid #cfd9ea", outline: "none", borderRadius: 10,
    padding: "10px 12px", fontSize: 14, transition: "box-shadow .15s ease, border-color .15s ease",
    boxShadow: "0 2px 8px rgba(13,38,76,0.04) inset",
  },
  inputError: { borderColor: "#ff6b6b", boxShadow: "0 0 0 3px rgba(255,107,107,.18)" },
  hint: { fontSize: 12, color: "#6b7a90", marginTop: 6 },

  actions: { display: "flex", gap: 10, marginTop: 6 },
  btnPrimary: {
    background: "linear-gradient(135deg, #0077b6, #00b4d8)",
    color: "#fff", border: "1px solid rgba(0,0,0,.06)",
    padding: "10px 14px", borderRadius: 12, fontWeight: 800, cursor: "pointer",
    boxShadow: "0 10px 20px rgba(0,123,255,.18)",
  },
  btnGhost: {
    background: "transparent", color: "#0A2C56", border: "1px solid rgba(10,44,86,.25)",
    padding: "10px 14px", borderRadius: 12, fontWeight: 700, cursor: "pointer",
  },
  btnLight: {
    background: "linear-gradient(135deg, #FFD23F, #FFB703)",
    color: "#0A2C56", border: "1px solid rgba(0,0,0,.06)",
    padding: "8px 12px", borderRadius: 12, fontWeight: 800, cursor: "pointer", textAlign: "center",
  },
  btnDanger: {
    background: "linear-gradient(135deg, #FF4D4D, #FF6F6F)",
    color: "#fff", border: "1px solid rgba(0,0,0,.06)",
    padding: "8px 12px", borderRadius: 10, fontWeight: 800, cursor: "pointer",
    boxShadow: "0 8px 16px rgba(255,77,77,.25)",
  },

  toast: {
    margin: "14px 20px 0", padding: "10px 14px", borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 700,
  },
  toastSuccess: { background: "rgba(0, 184, 148, .12)", color: "#008f7a", border: "1px solid rgba(0, 184, 148, .3)" },
  toastError: { background: "rgba(255, 87, 87, .12)", color: "#e64b4b", border: "1px solid rgba(255, 87, 87, .3)" },
  toastClose: { background: "transparent", border: "none", color: "inherit", fontSize: 18, cursor: "pointer", marginLeft: 10 },

  skelRow: {
    height: 16, borderRadius: 6,
    background: "linear-gradient(90deg, #eef3fa, #f6f9ff, #eef3fa)",
    animation: "sk 1.2s infinite", marginBottom: 12, backgroundSize: "200px 100%",
  },
  skelBtn: {
    height: 36, width: 110, borderRadius: 10,
    background: "linear-gradient(90deg, #eef3fa, #f6f9ff, #eef3fa)",
    animation: "sk 1.2s infinite", backgroundSize: "200px 100%",
  },
  headerTitleSkeleton: {
    height: 20, width: 160, borderRadius: 6,
    background: "linear-gradient(90deg, rgba(255,255,255,.4), rgba(255,255,255,.75), rgba(255,255,255,.4))",
    animation: "sk 1.2s infinite", backgroundSize: "200px 100%",
  },
};

// skeleton keyframes
if (typeof document !== "undefined" && !document.getElementById("sk-anim")) {
  const style = document.createElement("style");
  style.id = "sk-anim";
  style.innerHTML = `@keyframes sk { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }`;
  document.head.appendChild(style);
}

export default ProfileSection;
