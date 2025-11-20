// src/components/Forms/SingerFormPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Forms.css"; // make sure this file contains the CSS you want

const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const API_URL = `${BASE.replace(/\/$/, "")}/auth/singers/`;

// --------------------
// AXIOS INSTANCE (required)
// --------------------
const api = axios.create({
  baseURL: API_URL,
  // you can set defaults here e.g. timeout
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("access");
  if (token) cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` };
  return cfg;
});
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      alert("Session expired or not authenticated. Redirecting to login.");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// helpers
const fmtCurrency = (x) => {
  if (x === null || x === undefined || x === "") return "0.00";
  const n = Number(x);
  if (Number.isNaN(n)) return x;
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const safeImageUrl = (url) => {
  if (!url) return null;
  try {
    return new URL(url).href;
  } catch {
    return BASE.replace(/\/$/, "") + (url.startsWith("/") ? url : `/${url}`);
  }
};

export default function SingerFormPage({ initialMode = "list" }) {
  const emptyInitial = {
    name: "",
    birth_date: "",
    mobile: "",
    profession: "",
    education: "",
    achievement: "",
    favourite_singer: "",
    reference_by: "",
    genre: "",
    experience: "",
    area: "",
    city: "",
    state: "",
    rate: "",
    gender: "",
    active: true,
    photo: null,
  };

  const [form, setForm] = useState(emptyInitial);
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState(initialMode); // 'form' | 'list'
  const [editingId, setEditingId] = useState(null);

  const [singers, setSingers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  const accessToken = localStorage.getItem("access");

  useEffect(() => {
    if (!accessToken) {
      setError("You are not logged in. Please login to manage singers.");
      setMode("list");
      return;
    }
    fetchSingers();
    // cleanup preview when unmount
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const fetchSingers = async (query) => {
    setLoadingList(true);
    setError(null);
    try {
      // optional server-side search param 'search' - change to what your backend expects
      const params = {};
      if (query || searchText) params.search = query ?? searchText;
      const res = await api.get("", { params });
      setSingers(Array.isArray(res.data) ? res.data : res.data.results || []);
      setMode("list");
    } catch (err) {
      console.error("fetchSingers:", err);
      setError(err?.response?.status === 401 ? "Unauthorized. Please login." : "Failed to load singers.");
    } finally {
      setLoadingList(false);
    }
  };

  const loadSinger = async (id) => {
    setError(null);
    try {
      const res = await api.get(`${id}/`);
      const d = res.data;
      setForm({
        name: d.name || "",
        birth_date: d.birth_date || "",
        mobile: d.mobile || "",
        profession: d.profession || "",
        education: d.education || "",
        achievement: d.achievement || "",
        favourite_singer: d.favourite_singer || "",
        reference_by: d.reference_by || "",
        genre: d.genre || "",
        experience: d.experience ?? "",
        area: d.area || "",
        city: d.city || "",
        state: d.state || "",
        rate: d.rate ?? "",
        gender: d.gender || "",
        active: typeof d.active === "boolean" ? d.active : true,
        photo: d.photo || null,
      });
      setPreview(d.photo ? safeImageUrl(d.photo) : null);
      setEditingId(id);
      setMode("form");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("loadSinger:", err);
      setError("Failed to load singer.");
    }
  };

  const startAdd = () => {
    setForm(emptyInitial);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setEditingId(null);
    setMode("form");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") setForm((f) => ({ ...f, [name]: checked }));
    else setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => ({ ...f, photo: file }));
    if (file) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  const buildFormData = () => {
    const fd = new FormData();
    Object.keys(form).forEach((k) => {
      if (k === "photo") return;
      // convert booleans and numbers to strings for form data
      const val = form[k];
      fd.append(k, val === null || val === undefined ? "" : String(val));
    });
    if (form.photo instanceof File) fd.append("photo", form.photo);
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!accessToken) {
      setError("You must be logged in to create or update singers.");
      return;
    }
    if (!form.name.trim()) {
      setError("Singer name is required.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update
        if (form.photo instanceof File) {
          await api.put(`${editingId}/`, buildFormData(), {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          const payload = { ...form };
          // don't send photo if it's a string (existing URL) or null
          if (typeof payload.photo === "string" || payload.photo === null) delete payload.photo;
          await api.put(`${editingId}/`, payload);
        }
        alert("Singer updated.");
      } else {
        // Create
        if (form.photo instanceof File) {
          await api.post("", buildFormData(), { headers: { "Content-Type": "multipart/form-data" } });
        } else {
          await api.post("", form);
        }
        alert("Singer created.");
      }
      await fetchSingers();
      setForm(emptyInitial);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
      setEditingId(null);
      setMode("list");
    } catch (err) {
      console.error("handleSubmit:", err);
      if (err?.response) {
        const { status, data } = err.response;
        if (status === 401) setError("Unauthorized — please login.");
        else if (data) setError(typeof data === "string" ? data : JSON.stringify(data));
        else setError("Save failed. See console for details.");
      } else {
        setError("Save failed. See console for details.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this singer?")) return;
    try {
      await api.delete(`${id}/`);
      await fetchSingers();
    } catch (err) {
      console.error("handleDelete:", err);
      if (err?.response?.status === 401) setError("Unauthorized — please login.");
      else alert("Delete failed.");
    }
  };

  // UI when not logged in
  if (!accessToken) {
    return (
      <div className="page-container">
        <div className="master-card" style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
          <h2 className="page-title">Singer Manager — Sign in required</h2>
          <p className="muted">You must be logged in to create, update or delete singers.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn primary" onClick={() => (window.location.href = "/login")}>
              Go to Login
            </button>
            <button className="btn ghost" onClick={() => fetchSingers()}>
              Try to refresh
            </button>
          </div>
          {error && <div style={{ color: "#b91c1c", marginTop: 12 }}>{error}</div>}
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="page-container">
      <div className="master-card singer-master-card">
        <div className="master-head">
          <div>
            <h1 className="page-title">Singer Master</h1>
            <div className="page-sub">Define singers, address & rates (with images)</div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn add-button" onClick={startAdd}>
              <span className="plus">＋</span> Add
            </button>
            <button className={`btn view-button ${mode === "list" ? "active" : ""}`} onClick={() => fetchSingers()}>
              👁 View
            </button>
          </div>
        </div>

        <div className="content">
          {/* FORM */}
          <div className="form-pane" style={{ display: mode === "form" ? "block" : "none" }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Singer" : "Singer Registration"}</h3>
            <form className="inline-form-card form-grid" onSubmit={handleSubmit} encType="multipart/form-data">
              {/* left column of inputs */}
              <div>
                <label className="form-label">Singer Name *</label>
                <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="e.g., Arijit Singh" required />
              </div>

              <div>
                <label className="form-label">Birth Date</label>
                <input className="input" name="birth_date" type="date" value={form.birth_date} onChange={handleChange} />
              </div>

              <div>
                <label className="form-label">Mobile Number</label>
                <input className="input" name="mobile" value={form.mobile} onChange={handleChange} placeholder="+919876543210" />
              </div>

              <div>
                <label className="form-label">Profession</label>
                <input className="input" name="profession" value={form.profession} onChange={handleChange} placeholder="e.g., Playback Singer" />
              </div>

              <div>
                <label className="form-label">Education in Music</label>
                <input className="input" name="education" value={form.education} onChange={handleChange} placeholder="e.g., Trinity Grade 8" />
              </div>

              <div>
                <label className="form-label">Special Achievement</label>
                <input className="input" name="achievement" value={form.achievement} onChange={handleChange} placeholder="e.g., National award" />
              </div>

              <div>
                <label className="form-label">Favourite Singer</label>
                <input className="input" name="favourite_singer" value={form.favourite_singer} onChange={handleChange} placeholder="e.g., Lata Mangeshkar" />
              </div>

              <div>
                <label className="form-label">Reference By</label>
                <input className="input" name="reference_by" value={form.reference_by} onChange={handleChange} placeholder="Referrer name" />
              </div>

              <div>
                <label className="form-label">Genre</label>
                <input className="input" name="genre" value={form.genre} onChange={handleChange} placeholder="e.g., Pop" />
              </div>

              <div>
                <label className="form-label">Experience (years)</label>
                <input className="input" name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="5" />
              </div>

              <div>
                <label className="form-label">City</label>
                <input className="input" name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" />
              </div>

              <div>
                <label className="form-label">State</label>
                <input className="input" name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" />
              </div>

              <div>
                <label className="form-label">Yearly Rate (₹)</label>
                <input className="input" name="rate" type="number" step="0.01" value={form.rate} onChange={handleChange} placeholder="0.00" />
              </div>

              <div>
                <label className="form-label">Gender</label>
                <select className="input" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Address / Area</label>
                <input className="input" name="area" value={form.area} onChange={handleChange} placeholder="Area / Locality" />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div>
                  <label className="form-label">Status</label>
                  <div style={{ marginTop: 8 }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input type="checkbox" name="active" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                      <span style={{ fontWeight: 700, color: form.active ? "#0d7a42" : "#6b7280" }}>{form.active ? "Active" : "Inactive"}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Singer Photo</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <input id="photo-file-main" type="file" accept="image/*" onChange={handleFile} />
                  <div style={{ fontSize: 13 }}>{form.photo?.name || (typeof form.photo === "string" && form.photo ? "Existing photo" : "No file chosen")}</div>
                  {preview && <img src={preview} alt="preview" style={{ width: 84, height: 64, objectFit: "cover", borderRadius: 8 }} />}
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setForm(emptyInitial);
                    if (preview) {
                      URL.revokeObjectURL(preview);
                      setPreview(null);
                    }
                    setEditingId(null);
                    setMode("list");
                  }}
                >
                  Cancel
                </button>
                <button className="btn primary" type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Singer" : "Create Singer"}
                </button>
              </div>

              {error && (
                <div style={{ gridColumn: "1 / -1", color: "#b91c1c" }}>
                  {typeof error === "string" ? error : JSON.stringify(error)}
                </div>
              )}
            </form>
          </div>

          {/* LIST */}
          <div className="list-pane" style={{ display: mode === "list" ? "block" : "none" }}>
            <div className="list-top">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  className="search"
                  placeholder="Search singers..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchSingers(searchText);
                  }}
                />
                <button className="btn" onClick={() => fetchSingers(searchText)}>
                  Search
                </button>
              </div>
              <div style={{ color: "#6b7280", fontWeight: 700 }}>{loadingList ? "Loading..." : `${singers.length} singers`}</div>
            </div>

            <div className="table-wrap">
              <table className="nice-table responsive-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Image</th>
                    <th>Birth Date</th>
                    <th>Mobile</th>
                    <th>Profession</th>
                    <th>Education</th>
                    <th>Achievement</th>
                    <th>Fav Singer</th>
                    <th>Reference</th>
                    <th>Genre</th>
                    <th>City</th>
                    <th>₹/hr</th>
                    <th>Status</th>
                    <th style={{ width: 150 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {singers.map((s) => (
                    <tr key={s.id}>
                      <td className="td-name">
                        <div className="name-strong">{s.name}</div>
                        {s.area ? <div className="muted small">{s.area}</div> : null}
                      </td>
                      <td>{s.photo ? <img src={safeImageUrl(s.photo)} alt={s.name} className="thumb" /> : <span className="muted">—</span>}</td>
                      <td>{s.birth_date || "—"}</td>
                      <td>{s.mobile || "—"}</td>
                      <td>{s.profession || "—"}</td>
                      <td>{s.education || "—"}</td>
                      <td>{s.achievement || "—"}</td>
                      <td>{s.favourite_singer || "—"}</td>
                      <td>{s.reference_by || "—"}</td>
                      <td>{s.genre || "—"}</td>
                      <td>{s.city || "—"}</td>
                      <td>{fmtCurrency(s.rate)}</td>
                      <td>
                        <span className={`chip ${s.active ? "ok" : "muted"}`}>{s.active ? "Active" : "Inactive"}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn ghost small" onClick={() => loadSinger(s.id)}>
                            Edit
                          </button>
                          <button className="btn danger small" onClick={() => handleDelete(s.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {singers.length === 0 && (
                    <tr>
                      <td colSpan={14} style={{ padding: 28, textAlign: "center", color: "#6b7280" }}>
                        No singers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
