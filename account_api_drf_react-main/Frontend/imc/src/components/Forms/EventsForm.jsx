import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Forms.css";

const API_URL = "http://127.0.0.1:8000/api/auth/events/";

const EventsForm = ({ onClose }) => {
  const [tab, setTab] = useState("ADD");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const pageSize = 8;

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    date: "",
    ticket_price: "",
    description: "",
  });

  const formatErr = (err) => {
    if (err?.response?.data) {
      try { return JSON.stringify(err.response.data, null, 2); }
      catch (_) { return String(err.response.data); }
    }
    return err?.message || "Unknown error";
  };

  const toast = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 1800);
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL);
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(formatErr(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      ...formData,
      ticket_price:
        formData.ticket_price === "" ? "0" : String(Number(formData.ticket_price)),
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}${editingId}/`, payload);
        toast("✅ Event updated successfully!");
      } else {
        await axios.post(API_URL, payload);
        toast("✅ Event added successfully!");
      }
      await fetchEvents();
      resetForm();
      setTab("VIEW");
    } catch (err) {
      setError(formatErr(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ev) => {
    setFormData({
      title: ev.title || "",
      location: ev.location || "",
      date: ev.date || "",
      ticket_price: ev.ticket_price ?? "",
      description: ev.description || "",
    });
    setEditingId(ev.id);
    setTab("ADD");
    setError(null);
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await axios.delete(`${API_URL}${id}/`);
      await fetchEvents();
      toast("🗑️ Deleted");
    } catch (err) {
      setError(formatErr(err));
    }
  };

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

  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="form-container pro">
      {/* ===== HEADER ===== */}
      <div className="form-header">
        <h3>📅 Events</h3>
        <div className="tabs">
          <button
            className={`tab ${tab === "ADD" ? "active" : ""}`}
            onClick={() => setTab("ADD")}
          >
            ➕ Add Event
          </button>
          <button
            className={`tab ${tab === "VIEW" ? "active" : ""}`}
            onClick={() => setTab("VIEW")}
          >
            👁 View Events
          </button>
        </div>
        <button className="close-x" onClick={onClose} aria-label="Close">✖</button>
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
          <div className="group">
            <label>Ticket Price (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="ticket_price"
              value={formData.ticket_price}
              onChange={handleChange}
              placeholder="e.g. 999"
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
              placeholder="Short event details..."
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
                      <th>Price</th>
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
                        <td>{ev.ticket_price}</td>
                        <td>{ev.description || "-"}</td>
                        <td className="right">
                          <button className="mini" onClick={() => handleEdit(ev)}>✏️ Edit</button>
                          <button className="mini danger" onClick={() => handleDelete(ev.id)}>🗑 Delete</button>
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

export default EventsForm;
