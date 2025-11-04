import React, { useEffect, useMemo, useState } from "react";
import { getAxios } from "../api/axiosInstance";
import "./Forms.css";

const API_PATH = "http://127.0.0.1:8000/api/auth/private-bookings/";

const PrivateBookingForm = ({ onClose, viewOnly = false }) => {
  // ---------- UI State ----------
  const [tab, setTab] = useState(viewOnly ? "VIEW" : "ADD");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // ---------- Data ----------
  const [rows, setRows] = useState([]);
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
    event_type: "",
    venue: "",
    date: "",
    time_slot: "",
    duration: "",
    guest_count: "",
    notes: "",
    payment_methods: [],
  };
  const [formData, setFormData] = useState(emptyForm);

  // ---------- Helpers ----------
  const axios = getAxios();

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
    setTimeout(() => setSuccessMsg(""), 1800);
  };

  // ---------- Fetch ----------
  const fetchRows = async () => {
    setLoading(true);
    clearStatus();
    try {
      const { data } = await axios.get(API_PATH);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(formatErr(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Derived ----------
  const filtered = useMemo(() => {
    let r = [...rows];
    if (dateFilter) r = r.filter((x) => x.date === dateFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (x) =>
          (x.customer || "").toLowerCase().includes(q) ||
          (x.event_type || "").toLowerCase().includes(q) ||
          (x.venue || "").toLowerCase().includes(q) ||
          (x.email || "").toLowerCase().includes(q) ||
          (x.contact_number || "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [rows, search, dateFilter]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => setPage(1), [search, dateFilter]);

  // ---------- Form handlers ----------
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
      event_type: row.event_type || "",
      venue: row.venue || "",
      date: row.date || "",
      time_slot: row.time_slot || "",
      duration: row.duration || "",
      guest_count:
        row.guest_count === 0 || row.guest_count ? Number(row.guest_count) : "",
      notes: row.notes || "",
      payment_methods: Array.isArray(row.payment_methods)
        ? row.payment_methods
        : [],
    });
    clearStatus();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    clearStatus();
    try {
      await axios.delete(`${API_PATH}${id}/`);
      setRows((prev) => prev.filter((x) => x.id !== id));
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
    if (!formData.event_type?.trim()) return "Event type is required.";
    if (!formData.venue?.trim()) return "Venue is required.";
    if (!formData.date?.trim()) return "Date is required.";
    const d = Number(formData.duration);
    if (Number.isNaN(d) || d <= 0) return "Duration must be greater than 0.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearStatus();

    const v = validate();
    if (v) return setError(v);

    const payload = {
      ...formData,
      duration: Number(formData.duration),
      guest_count:
        formData.guest_count === "" ? null : Number(formData.guest_count),
      payment_methods: Array.isArray(formData.payment_methods)
        ? formData.payment_methods
        : [],
    };

    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API_PATH}${editingId}/`, payload);
        toast("✅ Booking updated");
      } else {
        await axios.post(API_PATH, payload);
        toast("✅ Booking added");
      }
      await fetchRows();
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
        <h3>🕴️ Private Bookings</h3>
        <div className="tabs">
          <button
            className={tab === "ADD" ? "tab active" : "tab"}
            onClick={() => setTab("ADD")}
          >
            Add Booking
          </button>
          <button
            className={tab === "VIEW" ? "tab active" : "tab"}
            onClick={() => setTab("VIEW")}
          >
            View Bookings
          </button>
        </div>
        <button className="close-x" onClick={onClose} aria-label="Close">
          ✖
        </button>
      </div>

      {successMsg && <div className="banner success">{successMsg}</div>}
      {error && (
        <pre className="banner error" style={{ whiteSpace: "pre-wrap" }}>
{error}
        </pre>
      )}

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
            <label>Event Type *</label>
            <input
              name="event_type"
              value={formData.event_type}
              onChange={handleChange}
              placeholder="Birthday / Wedding / Corporate / Private Party"
              required
            />
          </div>

          <div className="group">
            <label>Venue *</label>
            <input
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="IMC Banquet Hall / Client Venue"
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
              placeholder="e.g., 3"
              required
            />
          </div>

          <div className="group">
            <label>Guest Count</label>
            <input
              type="number"
              min="1"
              name="guest_count"
              value={formData.guest_count}
              onChange={handleChange}
              placeholder="e.g., 120"
            />
          </div>

          <div className="group full">
            <label>Special Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special arrangements, artist requirements, A/V setup, etc."
              rows={3}
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
              {saving
                ? editingId
                  ? "Updating..."
                  : "Saving..."
                : editingId
                ? "Update"
                : "Save"}
            </button>
            <button type="button" className="ghost" onClick={resetForm} disabled={saving}>
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

      {tab === "VIEW" && (
        <div className="view-wrap">
          <div className="toolbar">
            <input
              className="search"
              placeholder="Search: customer, event, venue, email, phone"
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
                      <th>Event</th>
                      <th>Venue</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Duration</th>
                      <th>Guests</th>
                      <th>Payment</th>
                      <th className="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((b) => (
                      <tr key={b.id}>
                        <td>{b.customer || "-"}</td>
                        <td>{b.event_type || "-"}</td>
                        <td>{b.venue || "-"}</td>
                        <td>{b.date || "-"}</td>
                        <td>{b.time_slot || "-"}</td>
                        <td>{b.duration || "-"}</td>
                        <td>
                          {b.guest_count === 0 || b.guest_count ? b.guest_count : "-"}
                        </td>
                        <td>
                          {Array.isArray(b.payment_methods) && b.payment_methods.length
                            ? b.payment_methods.join(", ")
                            : "-"}
                        </td>
                        <td className="right">
                          <button className="mini" onClick={() => handleEdit(b)}>✏️ Edit</button>
                          <button className="mini danger" onClick={() => handleDelete(b.id)}>
                            🗑 Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  ‹ Prev
                </button>
                <span>Page {page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
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

export default PrivateBookingForm;
