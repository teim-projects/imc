import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Forms.css";

const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const API_URL = `${BASE}/auth/shows/`;

// axios client with optional JWT header
const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

const ShowsForm = ({ onClose }) => {
  const [tab, setTab] = useState("ADD");
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    date: "",
    ticket_price: "",
    description: "",
  });

  // ---------- helpers ----------
  const humanizeErr = (err) => {
    const data = err?.response?.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const key = Object.keys(data)[0];
      const val = data[key];
      if (Array.isArray(val)) return `${key}: ${val[0]}`;
      if (typeof val === "string") return `${key}: ${val}`;
      try {
        return JSON.stringify(data, null, 2);
      } catch {
        return String(data);
      }
    }
    return err?.message || "Unknown error";
  };

  const toast = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 1800);
  };

  const clearStatus = () => {
    setError(null);
    setSuccess("");
  };

  // ---------- fetch ----------
  const fetchShows = async () => {
    setLoading(true);
    clearStatus();
    try {
      const res = await api.get(API_URL);
      const rows = Array.isArray(res.data) ? res.data : res.data?.results ?? res.data ?? [];
      setShows(Array.isArray(rows) ? rows : []);
      const totalPagesAfter = Math.max(1, Math.ceil((rows?.length || 0) / pageSize));
      if (page > totalPagesAfter) setPage(totalPagesAfter);
    } catch (err) {
      setError(humanizeErr(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- form ----------
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      location: "",
      date: "",
      ticket_price: "",
      description: "",
    });
    setEditingId(null);
  };

  const validate = () => {
    if (!formData.title?.trim()) return "Title is required.";
    if (!formData.location?.trim()) return "Location is required.";
    if (!formData.date?.trim()) return "Date is required.";
    const price = Number(formData.ticket_price === "" ? 0 : formData.ticket_price);
    if (Number.isNaN(price) || price < 0) return "Ticket price must be 0 or more.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearStatus();
    setSaving(true);

    const v = validate();
    if (v) {
      setSaving(false);
      setError(v);
      return;
    }

    const payload = {
      ...formData,
      ticket_price:
        formData.ticket_price === "" ? "0" : String(Number(formData.ticket_price)),
    };

    try {
      if (editingId) {
        await api.put(`${API_URL}${editingId}/`, payload);
        toast("✅ Show updated successfully!");
      } else {
        await api.post(API_URL, payload);
        toast("✅ Show added successfully!");
      }
      await fetchShows();
      resetForm();
      setTab("VIEW");
    } catch (err) {
      setError(humanizeErr(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title || "",
      location: item.location || "",
      date: item.date || "",
      ticket_price: item.ticket_price ?? "",
      description: item.description || "",
    });
    setEditingId(item.id);
    setTab("ADD");
    clearStatus();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this show?")) return;
    try {
      await api.delete(`${API_URL}${id}/`);
      const after = shows.length - 1;
      const pages = Math.max(1, Math.ceil(after / pageSize));
      if (page > pages) setPage(pages);
      await fetchShows();
      toast("🗑️ Deleted");
    } catch (err) {
      setError(humanizeErr(err));
    }
  };

  // ---------- derived ----------
  const filtered = useMemo(() => {
    if (!search.trim()) return shows;
    const q = search.toLowerCase();
    return shows.filter(
      (e) =>
        (e.title || "").toLowerCase().includes(q) ||
        (e.location || "").toLowerCase().includes(q) ||
        (e.description || "").toLowerCase().includes(q)
    );
  }, [shows, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => { setPage(1); }, [search]);

  // ---------- UI ----------
  return (
    <div className="form-container pro">
      {/* ===== HEADER ===== */}
      <div className="form-header">
        <h3>🎭 Shows</h3>
        <div className="tabs">
          <button
            className={`tab ${tab === "ADD" ? "active" : ""}`}
            onClick={() => setTab("ADD")}
            type="button"
          >
            ➕ Add Show
          </button>
          <button
            className={`tab ${tab === "VIEW" ? "active" : ""}`}
            onClick={() => setTab("VIEW")}
            type="button"
          >
            👁 View Shows
          </button>
        </div>
        {onClose && (
          <button className="close-x" onClick={onClose} aria-label="Close">✖</button>
        )}
      </div>

      {/* ===== BANNERS ===== */}
      {success && <div className="banner success">{success}</div>}
      {error && (
        <pre className="banner error" style={{ whiteSpace: "pre-wrap" }}>
{error}
        </pre>
      )}

      {/* ===== ADD FORM ===== */}
      {tab === "ADD" && (
        <form onSubmit={handleSubmit} className="grid two-col">
          <div className="group">
            <label>Show Title *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Live Concert Night"
              required
            />
          </div>
          <div className="group">
            <label>Location *</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Pune / Nashik / Nagpur"
              required
            />
          </div>
          <div className="group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="group">
            <label>Ticket Price (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="ticket_price"
              value={formData.ticket_price}
              onChange={handleChange}
              placeholder="e.g. 599"
              required
            />
          </div>
          <div className="group full">
            <label>Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short show details..."
              style={{ padding: "10px", borderRadius: "10px", border: "1px solid #d9e2ef" }}
            />
          </div>

          <div className="actions full">
            <button type="submit" className="primary" disabled={saving}>
              {saving ? (editingId ? "Updating..." : "Saving...") : editingId ? "Update" : "Save"}
            </button>
            <button type="button" className="ghost" onClick={resetForm} disabled={saving}>
              Reset
            </button>
          </div>

          {editingId && (
            <div className="hint full">
              Editing Show <strong>#{editingId}</strong>
            </div>
          )}
        </form>
      )}

      {/* ===== VIEW TABLE ===== */}
      {tab === "VIEW" && (
        <div className="view-wrap">
          <div className="toolbar">
            <input
              className="search"
              placeholder="Search shows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="ghost" onClick={fetchShows} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="loader">Loading shows...</div>
          ) : filtered.length === 0 ? (
            <div className="empty">No shows found.</div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Date</th>
                      <th>Price</th>
                      <th>Description</th>
                      <th className="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((it) => (
                      <tr key={it.id}>
                        <td>{it.title}</td>
                        <td>{it.location}</td>
                        <td>{it.date}</td>
                        <td>{it.ticket_price}</td>
                        <td>{it.description || "-"}</td>
                        <td className="right">
                          <button className="mini" onClick={() => handleEdit(it)} disabled={saving}>
                            ✏️ Edit
                          </button>
                          <button
                            className="mini danger"
                            onClick={() => handleDelete(it.id)}
                            disabled={saving}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹ Prev</button>
                <span>Page {page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next ›</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ShowsForm;
