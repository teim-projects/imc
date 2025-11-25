// src/components/Forms/EventsForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Forms.css";

const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const API_URL = `${BASE}/auth/events/`;

// Small axios client that injects JWT if present
const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

const EventsForm = ({ onClose }) => {
  const [tab, setTab] = useState("ADD");
  const [events, setEvents] = useState([]);
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
    event_type: "",
    ticket_price: "",
    basic_price: "",
    premium_price: "",
    vip_price: "",
    description: "",
  });

  // ---------------- Helpers ----------------
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

  // ---------------- Fetch ----------------
  const fetchEvents = async () => {
    setLoading(true);
    clearStatus();
    try {
      const res = await api.get(API_URL);
      const rows = Array.isArray(res.data)
        ? res.data
        : res.data?.results ?? res.data ?? [];
      setEvents(Array.isArray(rows) ? rows : []);
      const totalPagesAfter = Math.max(
        1,
        Math.ceil((rows?.length || 0) / pageSize)
      );
      if (page > totalPagesAfter) setPage(totalPagesAfter);
    } catch (err) {
      setError(humanizeErr(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- Form handlers ----------------
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const setEventType = (type) => {
    setFormData((prev) => ({
      ...prev,
      event_type: prev.event_type === type ? "" : type, // toggle
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      location: "",
      date: "",
      event_type: "",
      ticket_price: "",
      basic_price: "",
      premium_price: "",
      vip_price: "",
      description: "",
    });
    setEditingId(null);
  };

  const validatePrice = (val, fieldLabel) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    if (Number.isNaN(num) || num < 0) return `${fieldLabel} must be 0 or more.`;
    return null;
  };

  const validate = () => {
    if (!formData.title?.trim()) return "Title is required.";
    if (!formData.location?.trim()) return "Location is required.";
    if (!formData.date?.trim()) return "Date is required.";
    if (!formData.event_type) return "Event type is required (Live or Karaoke).";

    const basePriceErr = validatePrice(
      formData.ticket_price === "" ? 0 : formData.ticket_price,
      "Ticket price"
    );
    if (basePriceErr) return basePriceErr;

    const basicErr = validatePrice(formData.basic_price, "Basic price");
    if (basicErr) return basicErr;

    const premiumErr = validatePrice(formData.premium_price, "Premium price");
    if (premiumErr) return premiumErr;

    const vipErr = validatePrice(formData.vip_price, "VIP price");
    if (vipErr) return vipErr;

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
      basic_price:
        formData.basic_price === "" ? null : String(Number(formData.basic_price)),
      premium_price:
        formData.premium_price === "" ? null : String(Number(formData.premium_price)),
      vip_price:
        formData.vip_price === "" ? null : String(Number(formData.vip_price)),
    };

    try {
      if (editingId) {
        await api.put(`${API_URL}${editingId}/`, payload);
        toast("✅ Event updated successfully!");
      } else {
        await api.post(API_URL, payload);
        toast("✅ Event added successfully!");
      }
      await fetchEvents();
      resetForm();
      setTab("VIEW");
    } catch (err) {
      setError(humanizeErr(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ev) => {
    setFormData({
      title: ev.title || "",
      location: ev.location || "",
      date: ev.date || "",
      event_type: ev.event_type || "",
      ticket_price: ev.ticket_price ?? "",
      basic_price: ev.basic_price ?? "",
      premium_price: ev.premium_price ?? "",
      vip_price: ev.vip_price ?? "",
      description: ev.description || "",
    });
    setEditingId(ev.id);
    setTab("ADD");
    clearStatus();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await api.delete(`${API_URL}${id}/`);
      const after = events.length - 1;
      const pages = Math.max(1, Math.ceil(after / pageSize));
      if (page > pages) setPage(pages);
      await fetchEvents();
      toast("🗑️ Deleted");
    } catch (err) {
      setError(humanizeErr(err));
    }
  };

  // ---------------- Derived ----------------
  const filtered = useMemo(() => {
    if (!search.trim()) return events;
    const q = search.toLowerCase();
    return events.filter(
      (e) =>
        (e.title || "").toLowerCase().includes(q) ||
        (e.location || "").toLowerCase().includes(q) ||
        (e.description || "").toLowerCase().includes(q)
    );
  }, [events, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [search]);

  const renderEventTypeLabel = (type) => {
    if (type === "live") return "Live";
    if (type === "karaoke") return "Karaoke";
    return "-";
  };

  // ---------------- UI ----------------
  return (
    <div className="form-container pro">
      {/* ===== HEADER ===== */}
      <div className="form-header">
        <h3>📅 Events (Live & Karaoke)</h3>
        <div className="tabs">
          <button
            className={`tab ${tab === "ADD" ? "active" : ""}`}
            onClick={() => setTab("ADD")}
            type="button"
          >
            ➕ Add Event
          </button>
          <button
            className={`tab ${tab === "VIEW" ? "active" : ""}`}
            onClick={() => setTab("VIEW")}
            type="button"
          >
            👁 View Events
          </button>
        </div>
        {onClose && (
          <button className="close-x" onClick={onClose} aria-label="Close">
            ✖
          </button>
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
            <label>Event Title *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Music Fest 2025"
              required
            />
          </div>

          <div className="group">
            <label>Location *</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Mumbai / Delhi / Bangalore"
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

          {/* Event Type: Live / Karaoke */}
          <div className="group">
            <label>Event Type *</label>
            <div className="tier-grid event-type-chips">
              <button
                type="button"
                className={
                  "payment-chip" + (formData.event_type === "live" ? " active" : "")
                }
                onClick={() => setEventType("live")}
              >
                <span className="chip-checkbox">
                  {formData.event_type === "live" ? "✔" : ""}
                </span>
                <span className="chip-label">Live</span>
              </button>
              <button
                type="button"
                className={
                  "payment-chip" +
                  (formData.event_type === "karaoke" ? " active" : "")
                }
                onClick={() => setEventType("karaoke")}
              >
                <span className="chip-checkbox">
                  {formData.event_type === "karaoke" ? "✔" : ""}
                </span>
                <span className="chip-label">Karaoke</span>
              </button>
            </div>
          </div>


          {/* ==== BEAUTIFUL TICKET TIER CARDS ==== */}
          <div className="group full">
            <label>Ticket Price Options</label>
            <div className="tier-grid pretty-tiers">
              {/* BASIC */}
              <div className="tier-card tier-basic">
                <div className="tier-header">
                  <span className="tier-name">Basic</span>
                  <span className="tier-badge">Popular</span>
                </div>
                <div className="tier-sub">Good for single entry</div>
                <div className="tier-price-row">
                  <span className="tier-currency">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="basic_price"
                    value={formData.basic_price}
                    onChange={handleChange}
                    placeholder="799"
                    className="tier-input"
                  />
                  <span className="tier-suffix">/ person</span>
                </div>
              </div>

              {/* PREMIUM */}
              <div className="tier-card tier-premium">
                <div className="tier-header">
                  <span className="tier-name">Premium</span>
                  <span className="tier-badge highlight">Best value</span>
                </div>
                <div className="tier-sub">Better seats & perks</div>
                <div className="tier-price-row">
                  <span className="tier-currency">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="premium_price"
                    value={formData.premium_price}
                    onChange={handleChange}
                    placeholder="1499"
                    className="tier-input"
                  />
                  <span className="tier-suffix">/ person</span>
                </div>
              </div>

              {/* VIP */}
              <div className="tier-card tier-vip">
                <div className="tier-header">
                  <span className="tier-name">VIP</span>
                  <span className="tier-badge">Exclusive</span>
                </div>
                <div className="tier-sub">Front row + backstage</div>
                <div className="tier-price-row">
                  <span className="tier-currency">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="vip_price"
                    value={formData.vip_price}
                    onChange={handleChange}
                    placeholder="2499"
                    className="tier-input"
                  />
                  <span className="tier-suffix">/ person</span>
                </div>
              </div>
            </div>
            <p className="hint">
              Leave any tier blank if you don&apos;t offer that option.
            </p>
          </div>

          <div className="group full">
            <label>Description</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short event details..."
              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #d9e2ef",
              }}
            />
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
              Editing Event <strong>#{editingId}</strong>
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
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="ghost" onClick={fetchEvents} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="loader">Loading events...</div>
          ) : filtered.length === 0 ? (
            <div className="empty">No events found.</div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Date</th>
                      <th>Type / Ticket Prices</th>
                      <th>Description</th>
                      <th className="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((ev) => (
                      <tr key={ev.id}>
                        <td>{ev.title}</td>
                        <td>{ev.location}</td>
                        <td>{ev.date}</td>
                        <td>
                          <div>
                            <strong>{renderEventTypeLabel(ev.event_type)}</strong>
                          </div>
                          {ev.ticket_price !== undefined &&
                            ev.ticket_price !== null && (
                              <div>General: ₹ {ev.ticket_price}</div>
                            )}
                          {ev.basic_price && <div>Basic: ₹ {ev.basic_price}</div>}
                          {ev.premium_price && (
                            <div>Premium: ₹ {ev.premium_price}</div>
                          )}
                          {ev.vip_price && <div>VIP: ₹ {ev.vip_price}</div>}
                        </td>
                        <td>{ev.description || "-"}</td>
                        <td className="right">
                          <button
                            className="mini"
                            onClick={() => handleEdit(ev)}
                            disabled={saving}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="mini danger"
                            onClick={() => handleDelete(ev.id)}
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
    </div>
  );
};

export default EventsForm;
