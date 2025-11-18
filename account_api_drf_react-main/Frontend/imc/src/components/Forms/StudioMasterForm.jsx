// full component (same as last version with ensured fetchRows() after uploads)
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBuilding, FaPlus, FaEye, FaTrash } from "react-icons/fa";
import "./Forms.css";

const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const API_URL = `${BASE}/auth/studio-master/`;

const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

const initial = {
  name: "",
  location: "",
  area: "",
  city: "",
  state: "",
  google_map_link: "",
  capacity: 0,
  hourly_rate: "",
  is_active: true,
};

export default function StudioMasterForm({ defaultTab = "ADD", onSaved } = {}) {
  const [tab, setTab] = useState(defaultTab);
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [editingImages, setEditingImages] = useState([]);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const fetchRows = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await api.get(API_URL, { params: q ? { search: q } : {} });
      setRows(Array.isArray(resp.data) ? resp.data : resp.data?.results || []);
    } catch (e) {
      setError("Failed to load studios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "VIEW") fetchRows();
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else if (name === "capacity") {
      setForm((f) => ({ ...f, capacity: Math.max(0, parseInt(value || "0", 10)) }));
    } else if (name === "hourly_rate") {
      setForm((f) => ({ ...f, hourly_rate: value }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const reset = () => {
    setForm(initial);
    setError("");
    setMsg("");
    setEditingId(null);
    setEditingImages([]);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews([]);
    setSelectedFiles([]);
  };

  const onFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    previews.forEach((p) => URL.revokeObjectURL(p));
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setSelectedFiles(files);
    setPreviews(newPreviews);
  };

  const formatServerError = (err) => {
    if (!err?.response?.data) return "Failed to save. Check required fields.";
    const data = err.response.data;
    if (typeof data === "object") {
      try {
        return Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : String(v)}`)
          .join(" | ");
      } catch (e) {
        return JSON.stringify(data);
      }
    }
    return String(data);
  };

  const uploadImages = async (files, studioId) => {
    if (!files || files.length === 0) return null;
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    try {
      const uploadUrl = `${API_URL}${studioId}/images/`;
      const resp = await api.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // refresh rows so UI shows images immediately
      await fetchRows();
      return resp.data;
    } catch (err) {
      console.error("Image upload failed", err);
      throw err;
    }
  };

  const submit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setError("");
    setMsg("");

    if (!form.name || !form.name.trim()) {
      setError("Studio name is required.");
      setSaving(false);
      return;
    }
    if (form.capacity < 0) {
      setError("Capacity must be 0 or greater.");
      setSaving(false);
      return;
    }
    if (form.google_map_link && !(form.google_map_link.startsWith("http://") || form.google_map_link.startsWith("https://"))) {
      setError("Google Maps link must begin with http:// or https://");
      setSaving(false);
      return;
    }

    try {
      let locationStr = form.location?.trim() || "";
      const parts = [];
      if (form.area && form.area.trim()) parts.push(form.area.trim());
      if (form.city && form.city.trim()) parts.push(form.city.trim());
      if (form.state && form.state.trim()) parts.push(form.state.trim());
      if (parts.length) locationStr = parts.join(", ");

      const payload = {
        name: form.name?.trim(),
        location: locationStr,
        area: form.area?.trim() || "",
        city: form.city?.trim() || "",
        state: form.state?.trim() || "",
        google_map_link: form.google_map_link?.trim() || "",
        capacity: Number.isFinite(+form.capacity) ? +form.capacity : 0,
        hourly_rate: form.hourly_rate === "" ? "0" : String(form.hourly_rate),
        is_active: !!form.is_active,
      };

      let resp;
      if (editingId) {
        resp = await api.patch(`${API_URL}${editingId}/`, payload);
        setMsg(`Studio "${resp.data?.name || payload.name}" updated.`);
        if (selectedFiles.length) {
          const uploaded = await uploadImages(selectedFiles, editingId);
          if (uploaded && Array.isArray(uploaded)) {
            setEditingImages((prev) => [...uploaded, ...prev]);
          }
        } else {
          // ensure table refreshed even if no new images
          await fetchRows();
        }
        setRows((r) => r.map((x) => (x.id === resp.data.id ? resp.data : x)));
      } else {
        resp = await api.post(API_URL, payload);
        const createdId = resp.data?.id;
        setMsg(`Studio "${resp.data?.name || payload.name}" created.`);
        if (selectedFiles.length && createdId) {
          await uploadImages(selectedFiles, createdId);
        } else {
          await fetchRows();
        }
      }

      reset();
      if (typeof onSaved === "function") onSaved(resp.data);
    } catch (err) {
      setError(formatServerError(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (id) => {
    if (!confirm("Delete this studio?")) return;
    try {
      await api.delete(`${API_URL}${id}/`);
      setRows((r) => r.filter((x) => x.id !== id));
      setMsg("Deleted.");
    } catch (e) {
      alert("Delete failed.");
    }
  };

  const toggleActive = async (row) => {
    try {
      const resp = await api.patch(`${API_URL}${row.id}/`, { is_active: !row.is_active });
      setRows((r) => r.map((x) => (x.id === row.id ? resp.data : x)));
      setMsg("Updated.");
    } catch (e) {
      alert("Update failed.");
    }
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({
      name: r.name || "",
      location: r.location || "",
      area: r.area || "",
      city: r.city || "",
      state: r.state || "",
      google_map_link: r.google_map_link || "",
      capacity: r.capacity ?? 0,
      hourly_rate: r.hourly_rate ?? "",
      is_active: !!r.is_active,
    });
    setEditingImages(Array.isArray(r.images) ? r.images.slice() : []);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews([]);
    setSelectedFiles([]);
    setTab("ADD");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteImage = async (studioId, imageId) => {
    if (!confirm("Delete this image?")) return;
    try {
      await api.delete(`${API_URL}${studioId}/images/${imageId}/`);
      if (editingId && Number(editingId) === Number(studioId)) {
        setEditingImages((prev) => prev.filter((img) => Number(img.id) !== Number(imageId)));
      } else {
        await fetchRows();
      }
    } catch (err) {
      console.error(err);
      alert("Image delete failed.");
    }
  };

  return (
    <div className="sm-card">
      <div className="sm-head">
        <div className="sm-left">
          <div className="sm-icon"><FaBuilding /></div>
          <div>
            <div className="sm-title">Studio Master</div>
            <div className="sm-sub">Define studios, address & rates (with images)</div>
          </div>
        </div>

        <div className="sm-actions">
          <button className={`pill ${tab === "ADD" ? "active" : ""}`} onClick={() => { setTab("ADD"); reset(); }}>
            <FaPlus /> <span>{editingId ? "Add / Edit" : "Add"}</span>
          </button>
          <button className={`pill ${tab === "VIEW" ? "active" : ""}`} onClick={() => setTab("VIEW")}>
            <FaEye /> <span>View</span>
          </button>
        </div>
      </div>

      {tab === "ADD" && (
        <form className="sm-form" onSubmit={submit}>
          <div className="grid two">
            <div className="field">
              <label>Studio Name *</label>
              <input name="name" value={form.name} onChange={onChange} placeholder="e.g., IMC – Studio A" required />
            </div>

            <div className="field">
              <label>Area / Locality</label>
              <input name="area" value={form.area} onChange={onChange} placeholder="e.g., Andheri East" />
            </div>

            <div className="field">
              <label>City</label>
              <input name="city" value={form.city} onChange={onChange} placeholder="e.g., Mumbai" />
            </div>

            <div className="field">
              <label>State</label>
              <input name="state" value={form.state} onChange={onChange} placeholder="e.g., Maharashtra" />
            </div>

            <div className="field">
              <label>Full Location (fallback)</label>
              <input name="location" value={form.location} onChange={onChange} placeholder="Street, landmark" />
            </div>

            <div className="field">
              <label>Google Maps Link</label>
              <input name="google_map_link" value={form.google_map_link} onChange={onChange} placeholder="https://maps.google.com/..." />
            </div>

            <div className="field">
              <label>Capacity</label>
              <input type="number" min="0" name="capacity" value={form.capacity} onChange={onChange} />
            </div>

            <div className="field">
              <label>Hourly Rate (₹)</label>
              <input type="number" step="0.01" name="hourly_rate" value={form.hourly_rate} onChange={onChange} placeholder="0.00" />
            </div>

            <div className="field switch-row">
              <label>Active</label>
              <label className="switch">
                <input type="checkbox" id="is_active" name="is_active" checked={form.is_active} onChange={onChange} />
                <span className="slider" />
              </label>
            </div>

            {editingId && (
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Existing Images</label>
                {editingImages && editingImages.length > 0 ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {editingImages.map((img) => (
                      <div key={img.id} style={{ position: "relative", width: 120, height: 78, borderRadius: 6, overflow: "hidden", border: "1px solid #eee" }}>
                        <img src={img.url} alt={img.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button title="Delete image" onClick={() => deleteImage(editingId, img.id)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", width: 22, height: 22, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <FaTrash size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ marginTop: 8 }} className="muted">No images uploaded yet for this studio.</div>
                )}
              </div>
            )}

            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Studio Images (add new)</label>
              <input type="file" multiple accept="image/*" onChange={onFilesChange} />
              <div className="image-previews" style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ width: 100, height: 70, overflow: "hidden", borderRadius: 6, border: "1px solid #eee" }}>
                    <img src={src} alt={`preview-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, color: "#6b7280", fontSize: 12 }}>You can select multiple images; they will be uploaded after the studio is saved.</div>
            </div>
          </div>

          <div className="status-row">
            {error && <div className="banner error">{error}</div>}
            {msg && <div className="banner success">{msg}</div>}
          </div>

          <div className="sm-footer">
            <div className="note muted">Manage studios, their address and images here. Use View to edit/delete records and images.</div>

            <div className="cta">
              <button type="submit" className="btn primary" disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Save"}</button>
              <button type="button" className="btn outline" onClick={reset} disabled={saving}>Reset</button>
            </div>
          </div>
        </form>
      )}

      {tab === "VIEW" && (
        <div className="sm-view">
          <div className="view-top">
            <input className="search" placeholder="Search studios..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e)=> e.key === "Enter" && fetchRows()} />
            <button className="btn ghost" onClick={fetchRows}>Search</button>
          </div>

          <div className="table-wrap">
            {loading ? (
              <div className="muted">Loading studios…</div>
            ) : (
              <table className="nice-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Images</th>
                    <th>Capacity</th>
                    <th>₹/hr</th>
                    <th>Status</th>
                    <th style={{ width: 220 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="td-main">{r.name}</td>
                      <td style={{ maxWidth: 240 }}>
                        {r.area || r.city || r.state ? `${r.area ? r.area + ", " : ""}${r.city ? r.city + ", " : ""}${r.state ? r.state : ""}` : r.location || "—"}
                        {r.google_map_link ? (<div style={{ marginTop: 6 }}><a href={r.google_map_link} target="_blank" rel="noopener noreferrer">Open map</a></div>) : null}
                      </td>

                      <td>
                        {r.images && r.images.length > 0 ? (
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            {r.images.map((img) => (
                              <div key={img.id} style={{ position: "relative", width: 64, height: 48, borderRadius: 6, overflow: "hidden", border: "1px solid #eee" }}>
                                <img src={img.url} alt={img.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                <button title="Delete image" onClick={() => deleteImage(r.id, img.id)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", width: 22, height: 22, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                  <FaTrash size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>

                      <td>{r.capacity ?? 0}</td>
                      <td>{r.hourly_rate ?? "0.00"}</td>
                      <td><button className={`chip ${r.is_active ? "ok" : "muted"}`} onClick={() => toggleActive(r)}>{r.is_active ? "Active" : "Inactive"}</button></td>

                      <td>
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => startEdit(r)}>Edit</button>
                          <button className="delete-btn" onClick={() => deleteRow(r.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (<tr><td colSpan={7} className="muted center">No studios found.</td></tr>)}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
