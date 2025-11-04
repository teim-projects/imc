import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Forms.css";

const API_URL = "http://127.0.0.1:8000/api/auth/studios/";

/**
 * StudioForm — advanced
 * - Tabs: Add Booking / View Bookings
 * - Table: search, filter by date, client-side pagination
 * - Row actions: Edit, Delete
 * - Inline validation, banners, loaders
 * - Payment methods as checkboxes (array <-> CSV handled by backend)
 *
 * Props:
 *   onClose?: () => void
 *   viewOnly?: boolean   // if true: start on "View Bookings" tab
 */
const StudioForm = ({ onClose, viewOnly = false }) => {
  // ---------- UI State ----------
  const [tab, setTab] = useState(viewOnly ? "VIEW" : "ADD");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // ---------- Data ----------
  const [studios, setStudios] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // ---------- Filters / Search / Pagination ----------
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // ---------- Form ----------
  const emptyForm = {
    customer: "",
    contact_number: "",
    email: "",
    address: "",
    studio_name: "",
    date: "",
    time_slot: "",
    duration: "",
    payment_methods: [],
  };
  const [formData, setFormData] = useState(emptyForm);

  // ---------- Helpers ----------
  const formatErr = (err) => {
    if (err?.response?.data) {
      try {
        return JSON.stringify(err.response.data, null, 2);
      } catch (_) {
        return String(err.response.data);
      }
    }
    return err?.message || "Unknown error";
  };

  const clearStatus = () => {
    setError(null);
    setSuccessMsg("");
  };

  const toast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  // ---------- Fetch ----------
  const fetchStudios = async () => {
    setLoading(true);
    clearStatus();
    try {
      const { data } = await axios.get(API_URL);
      setStudios(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(formatErr(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudios();
  }, []);

  // ---------- Derived (filtered + paginated) ----------
  const filtered = useMemo(() => {
    let rows = [...studios];
    if (dateFilter) rows = rows.filter((r) => r.date === dateFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.customer || "").toLowerCase().includes(q) ||
          (r.studio_name || "").toLowerCase().includes(q) ||
          (r.email || "").toLowerCase().includes(q) ||
          (r.contact_number || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [studios, search, dateFilter]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    // reset to first page when filters change
    setPage(1);
  }, [search, dateFilter]);

  // ---------- Form Handlers ----------
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handlePaymentChange = (method) => {
    setFormData((prev) => {
      const set = new Set(prev.payment_methods);
      if (set.has(method)) set.delete(method);
      else set.add(method);
      return { ...prev, payment_methods: Array.from(set) };
    });
  };

  const handleEdit = (row) => {
    setTab("ADD");
    setEditingId(row.id);
    setFormData({
      customer: row.customer || "",
      contact_number: row.contact_number || "",
      email: row.email || "",
      address: row.address || "",
      studio_name: row.studio_name || "",
      date: row.date || "",
      time_slot: row.time_slot || "",
      duration: row.duration || "",
      payment_methods: Array.isArray(row.payment_methods) ? row.payment_methods : [],
    });
    clearStatus();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    clearStatus();
    try {
      await axios.delete(`${API_URL}${id}/`);
      setStudios((prev) => prev.filter((r) => r.id !== id));
      toast("🗑️ Deleted");
    } catch (err) {
      setError(formatErr(err));
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const validate = () => {
    if (!formData.customer?.trim()) return "Customer is required.";
    if (!formData.studio_name?.trim()) return "Studio name is required.";
    if (!formData.date?.trim()) return "Date is required.";
    const d = Number(formData.duration);
    if (Number.isNaN(d) || d <= 0) return "Duration must be greater than 0.";
    return null;
    // time_slot can be empty; unique constraint is on (studio_name, date, time_slot)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearStatus();

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const isEdit = Boolean(editingId);
    const payload = {
      ...formData,
      duration: Number(formData.duration),
      payment_methods: Array.isArray(formData.payment_methods)
        ? formData.payment_methods
        : [],
    };

    setSaving(true);
    try {
      if (isEdit) {
        await axios.put(`${API_URL}${editingId}/`, payload);
        toast("✅ Booking updated");
      } else {
        await axios.post(API_URL, payload);
        toast("✅ Booking added");
      }
      await fetchStudios();
      resetForm();
      setTab("VIEW");
    } catch (err) {
      setError(formatErr(err));
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="form-container pro">
      <div className="form-header">
        <h3>🎙️ Studio Rentals</h3>
       
        <button className="close-x" onClick={onClose} aria-label="Close">
          ✖
        </button>
      </div>

      {/* Status banners */}
      {successMsg && <div className="banner success">{successMsg}</div>}
      {error && (
        <pre className="banner error" style={{ whiteSpace: "pre-wrap" }}>
{error}
        </pre>
      )}

      {/* ADD / EDIT */}
      {tab === "ADD" && (
        <form onSubmit={handleSubmit} className="grid two-col">
          <div className="group">
            <label>Customer Name *</label>
            <input
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              placeholder="e.g., Rahul Verma"
              required
            />
          </div>

          <div className="group">
            <label>Contact Number</label>
            <input
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="+91XXXXXXXXXX"
            />
          </div>

          <div className="group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="customer@email.com"
            />
          </div>

          <div className="group">
            <label>Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street, City"
            />
          </div>

          <div className="group">
            <label>Studio Name *</label>
            <input
              name="studio_name"
              value={formData.studio_name}
              onChange={handleChange}
              placeholder="IMC - Studio A"
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
            <label>Time Slot</label>
            <input
              type="time"
              name="time_slot"
              value={formData.time_slot}
              onChange={handleChange}
            />
          </div>

          <div className="group">
            <label>Duration (hours) *</label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 2"
              required
            />
          </div>

          <div className="group full">
            <label>Payment Options</label>
            <div className="payment-options pill">
              {["Card", "UPI", "NetBanking"].map((m) => (
                <label key={m} className="pill-item">
                  <input
                    type="checkbox"
                    checked={formData.payment_methods.includes(m)}
                    onChange={() => handlePaymentChange(m)}
                  />
                  <span>{m}</span>
                </label>
              ))}
            </div>
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
              Editing booking <strong>#{editingId}</strong>
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
              placeholder="Search: customer, studio, email, phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              type="date"
              className="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <button className="ghost" onClick={fetchStudios} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="loader">Loading bookings…</div>
          ) : filtered.length === 0 ? (
            <div className="empty">No bookings found.</div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Studio</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Duration</th>
                      <th>Payment</th>
                      <th className="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((s) => (
                      <tr key={s.id}>
                        <td>{s.customer || "-"}</td>
                        <td>{s.studio_name || "-"}</td>
                        <td>{s.date || "-"}</td>
                        <td>{s.time_slot || "-"}</td>
                        <td>{s.duration || "-"}</td>
                        <td>
                          {Array.isArray(s.payment_methods) && s.payment_methods.length
                            ? s.payment_methods.join(", ")
                            : "-"}
                        </td>
                        <td className="right">
                          <button className="mini" onClick={() => handleEdit(s)}>
                            ✏️ Edit
                          </button>
                          <button
                            className="mini danger"
                            onClick={() => handleDelete(s.id)}
                          >
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
    </div>
  );
};

export default StudioForm;
