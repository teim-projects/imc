// src/components/Forms/VideographyForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Forms.css";
import Toast from "../Toast"; // <-- add this (from the toast component I shared)

const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const API_URL = `${BASE}/api/auth/videography/`;

// Axios client that injects JWT if present
const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

const VideographyForm = ({ onClose, viewOnly = false }) => {
  // ---------- UI State ----------
  const [tab, setTab] = useState(viewOnly ? "VIEW" : "ADD");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Toast
  const [toast, setToast] = useState({ open: false, type: "success", message: "" });
  const showToast = (message, type = "success") =>
    setToast({ open: true, type, message });

  // ---------- Data ----------
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // ---------- Filters / Paging ----------
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // ---------- Form ----------
  const emptyForm = {
    client_name: "",
    email: "",
    mobile_no: "",
    project: "",
    editor: "",
    shoot_date: "",
    start_time: "",
    duration_hours: "", // hours
    location: "",
    package_type: "Standard",
    payment_method: "Cash",
    notes: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  // ---------- Helpers ----------
  const humanizeErr = (err) => {
    const data = err?.response?.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const k = Object.keys(data)[0];
      const v = data[k];
      if (Array.isArray(v)) return `${k}: ${v[0]}`;
      if (typeof v === "string") return `${k}: ${v}`;
      try { return JSON.stringify(data, null, 2); } catch { return String(data); }
    }
    return err?.message || "Unknown error";
  };
  const clearStatus = () => { setError(null); };

  // ---------- Fetch ----------
  const fetchRows = async () => {
    setLoading(true); clearStatus();
    try {
      const { data } = await api.get(API_URL);
      const list = Array.isArray(data) ? data : data?.results ?? data ?? [];
      setRows(Array.isArray(list) ? list : []);
      const totalPagesAfter = Math.max(1, Math.ceil((list?.length || 0) / pageSize));
      if (page > totalPagesAfter) setPage(totalPagesAfter);
    } catch (e) {
      setError(humanizeErr(e));
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchRows(); /* eslint-disable-next-line */ }, []);

  // ---------- Derived (filtered + paginated) ----------
  const filtered = useMemo(() => {
    let list = [...rows];
    if (dateFilter) list = list.filter((r) => r.shoot_date === dateFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        (r.project || "").toLowerCase().includes(q) ||
        (r.editor || "").toLowerCase().includes(q) ||
        (r.client_name || "").toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q) ||
        (r.mobile_no || "").toLowerCase().includes(q) ||
        (r.location || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [rows, search, dateFilter]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => { setPage(1); }, [search, dateFilter]);

  // ---------- Form Handlers ----------
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleEdit = (row) => {
    setTab("ADD");
    setEditingId(row.id);
    setFormData({
      client_name: row.client_name || "",
      email: row.email || "",
      mobile_no: row.mobile_no || "",
      project: row.project || "",
      editor: row.editor || "",
      shoot_date: row.shoot_date || "",
      start_time: row.start_time || "",
      duration_hours: row.duration_hours ?? "",
      location: row.location || "",
      package_type: row.package_type || "Standard",
      payment_method: row.payment_method || "Cash",
      notes: row.notes || "",
    });
    clearStatus();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    clearStatus();
    try {
      await api.delete(`${API_URL}${id}/`);
      setRows((prev) => prev.filter((r) => r.id !== id));
      showToast("🗑️ Deleted");
      const after = rows.length - 1;
      const pages = Math.max(1, Math.ceil(after / pageSize));
      if (page > pages) setPage(pages);
    } catch (e) {
      setError(humanizeErr(e));
      showToast("Delete failed", "error");
    }
  };

  const resetForm = () => { setFormData(emptyForm); setEditingId(null); };

  const validate = () => {
    if (!formData.project?.trim()) return "Project is required.";
    if (!formData.editor?.trim()) return "Editor is required.";
    if (!formData.shoot_date?.trim()) return "Shoot date is required.";
    const d = Number(formData.duration_hours);
    if (Number.isNaN(d) || d <= 0) return "Duration (hours) must be greater than 0.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearStatus();

    const v = validate();
    if (v) { setError(v); return; }

    const isEdit = Boolean(editingId);
    const payload = {
      ...formData,
      duration_hours: Number(formData.duration_hours),
      start_time: formData.start_time ? formData.start_time : null, // DRF TimeField safe
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`${API_URL}${editingId}/`, payload);
        showToast("Booking updated.");
      } else {
        await api.post(API_URL, payload);
        showToast("Booking added.");
      }
      await fetchRows();
      resetForm();
      setTab("VIEW");
    } catch (e) {
      setError(humanizeErr(e));
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="form-container pro">
      <div className="form-header">
        <h3>🎬 Videography</h3>
        {onClose && (
          <button className="close-x" onClick={onClose} aria-label="Close">✖</button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 8 }}>
        <button
          className={`tab ${tab === "ADD" ? "active" : ""}`}
          onClick={() => setTab("ADD")}
          type="button"
        >
          ➕ Add
        </button>
        <button
          className={`tab ${tab === "VIEW" ? "active" : ""}`}
          onClick={() => setTab("VIEW")}
          type="button"
        >
          👁 View
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <pre className="banner error" style={{ whiteSpace: "pre-wrap" }}>
{error}
        </pre>
      )}

      {/* ADD / EDIT */}
      {tab === "ADD" && (
        <form onSubmit={handleSubmit} className="grid two-col">
          <div className="group">
            <label>Client Name</label>
            <input
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              placeholder="e.g., Rahul Verma"
            />
          </div>

          <div className="group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="client@email.com"
            />
          </div>

          <div className="group">
            <label>Mobile No</label>
            <input
              name="mobile_no"
              value={formData.mobile_no}
              onChange={handleChange}
              placeholder="+91XXXXXXXXXX"
            />
          </div>

          <div className="group">
            <label>Project *</label>
            <input
              name="project"
              value={formData.project}
              onChange={handleChange}
              placeholder="Project name"
              required
            />
          </div>

          <div className="group">
            <label>Editor *</label>
            <input
              name="editor"
              value={formData.editor}
              onChange={handleChange}
              placeholder="Editor name"
              required
            />
          </div>

          <div className="group">
            <label>Shoot Date *</label>
            <input
              type="date"
              name="shoot_date"
              value={formData.shoot_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="group">
            <label>Start Time</label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
            />
          </div>

          <div className="group">
            <label>Duration (hours) *</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              name="duration_hours"
              value={formData.duration_hours}
              onChange={handleChange}
              placeholder="e.g., 2"
              required
            />
          </div>

          <div className="group">
            <label>Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Studio / On-site"
            />
          </div>

          <div className="group">
            <label>Package Type</label>
            <select
              name="package_type"
              value={formData.package_type}
              onChange={handleChange}
            >
              <option>Standard</option>
              <option>Premium</option>
              <option>Custom</option>
            </select>
          </div>

          <div className="group">
            <label>Payment Method</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
            >
              <option>Cash</option>
              <option>Card</option>
              <option>UPI</option>
            </select>
          </div>

          <div className="group full">
            <label>Notes</label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special requirements..."
            />
          </div>

          <div className="actions full">
            <button type="submit" className="primary" disabled={saving}>
              {saving ? (editingId ? "Updating..." : "Saving...") : editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              className="ghost"
              onClick={resetForm}
              disabled={saving}
            >
              Reset
            </button>
          </div>

          {editingId && (
            <div className="hint full">
              Editing record <strong>#{editingId}</strong>
            </div>
          )}
        </form>
      )}

      {/* VIEW */}
      {tab === "VIEW" && (
        <div className="view-wrap">
          <div className="toolbar">
            <input
              className="search"
              placeholder="Search: project, editor, client, email, phone, location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              type="date"
              className="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <button className="ghost" onClick={fetchRows} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="loader">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="empty">No records found.</div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Editor</th>
                      <th>Client</th>
                      <th>Shoot Date</th>
                      <th>Start</th>
                      <th>Hours</th>
                      <th>Package</th>
                      <th>Payment</th>
                      <th className="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((r) => (
                      <tr key={r.id}>
                        <td>{r.project || "-"}</td>
                        <td>{r.editor || "-"}</td>
                        <td>
                          <div>{r.client_name || "-"}</div>
                          <div style={{ fontSize: 12, color: "#555" }}>
                            {r.email || ""}{r.email && r.mobile_no ? " · " : ""}{r.mobile_no || ""}
                          </div>
                        </td>
                        <td>{r.shoot_date || "-"}</td>
                        <td>{r.start_time || "-"}</td>
                        <td>{r.duration_hours ?? "-"}</td>
                        <td>{r.package_type || "-"}</td>
                        <td>{r.payment_method || "-"}</td>
                        <td className="right">
                          <button className="mini" onClick={() => handleEdit(r)} disabled={saving}>
                            ✏️ Edit
                          </button>
                          <button
                            className="mini danger"
                            onClick={() => handleDelete(r.id)}
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
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ‹ Prev
                </button>
                <span>
                  Page {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next ›
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toast */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        duration={2200}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
};

export default VideographyForm;
