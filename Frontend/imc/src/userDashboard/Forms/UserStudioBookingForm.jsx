// src/userDashbord/Forms/UserStudioBookingForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";


const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const USER_STUDIOS_URL = `${BASE}/user/studios/`;
const USER_BOOKINGS_URL = `${BASE}/user/studio-bookings/`;

// 1-hour slots between start & end (24h format)
const makeSlots = (start = "08:00", end = "22:00", stepMin = 60) => {
  const out = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  while (mins <= endMins) {
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    out.push(`${h}:${m}`);
    mins += stepMin;
  }
  return out;
};

const format12 = (time24) => {
  if (!time24) return "";
  const [hhRaw, mmRaw] = time24.split(":");
  const hh = Number(hhRaw);
  const mm = Number(mmRaw || 0);
  const period = hh >= 12 ? "PM" : "AM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
};

const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

const UserStudioBookingForm = () => {
  const [tab, setTab] = useState("BOOK"); // "BOOK" | "MY"
  const [studios, setStudios] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loadingStudios, setLoadingStudios] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const slots = useMemo(() => makeSlots("08:00", "22:00", 60), []);

  const emptyForm = {
    studio: "",
    customer_name: "",
    contact_number: "",
    email: "",
    address: "",
    date: "",
    time_slot: "",
    duration_hours: 1,
    agreed_price: "",
    payment_methods: [],
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const humanizeErr = (err) => {
    const data = err?.response?.data;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const k = Object.keys(data)[0];
      const v = data[k];
      if (Array.isArray(v)) return `${k}: ${v[0]}`;
      if (typeof v === "string") return `${k}: ${v}`;
      try {
        return JSON.stringify(data, null, 2);
      } catch {
        return String(data);
      }
    }
    return err?.message || "Something went wrong.";
  };

  const selectedStudio = useMemo(
    () => studios.find((s) => String(s.id) === String(form.studio)),
    [studios, form.studio]
  );

  const suggestedPrice = useMemo(() => {
    if (!selectedStudio || !selectedStudio.hourly_rate || !form.duration_hours) return "";
    const rate = Number(selectedStudio.hourly_rate);
    const dur = Number(form.duration_hours) || 0;
    if (Number.isNaN(rate) || Number.isNaN(dur)) return "";
    const total = rate * dur;
    return total.toFixed(2);
  }, [selectedStudio, form.duration_hours]);

  const finalPrice = useMemo(() => {
    if (form.agreed_price !== "" && form.agreed_price !== null && form.agreed_price !== undefined) {
      return String(form.agreed_price);
    }
    return suggestedPrice;
  }, [form.agreed_price, suggestedPrice]);

  const fetchStudios = async () => {
    setLoadingStudios(true);
    clearMessages();
    try {
      const resp = await api.get(USER_STUDIOS_URL);
      const rows = Array.isArray(resp.data) ? resp.data : resp.data?.results ?? [];
      setStudios(rows);
    } catch (err) {
      setError(`Failed to load studios: ${humanizeErr(err)}`);
    } finally {
      setLoadingStudios(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    clearMessages();
    try {
      const resp = await api.get(USER_BOOKINGS_URL);
      const rows = Array.isArray(resp.data) ? resp.data : resp.data?.results ?? [];
      setBookings(rows);
    } catch (err) {
      setError(
        `Could not load your bookings. You may need to log in. (${humanizeErr(err)})`
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchStudios();
  }, []);

  useEffect(() => {
    if (tab === "MY") {
      fetchBookings();
    }
  }, [tab]);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    clearMessages();

    if (name === "agreed_price") {
      setForm((f) => ({ ...f, agreed_price: value }));
      return;
    }
    if (name === "duration_hours") {
      const v = value === "" ? "" : Number(value);
      setForm((f) => ({ ...f, [name]: v }));
      return;
    }
    if (name === "studio") {
      setForm((f) => ({
        ...f,
        studio: value,
        time_slot: "",
      }));
      return;
    }

    setForm((f) => ({
      ...f,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const togglePayment = (method) => {
    clearMessages();
    setForm((f) => {
      const set = new Set(f.payment_methods);
      if (set.has(method)) set.delete(method);
      else set.add(method);
      return { ...f, payment_methods: Array.from(set) };
    });
  };

  const selectSlot = (time) => {
    clearMessages();
    setForm((f) => ({ ...f, time_slot: time }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    clearMessages();
  };

  const validate = () => {
    if (!form.studio) return "Please select a studio.";
    if (!form.customer_name.trim()) return "Customer name is required.";
    if (!form.date) return "Please choose a date.";
    if (!form.time_slot) return "Please pick a time slot.";
    const dur = Number(form.duration_hours);
    if (!dur || dur <= 0) return "Duration must be greater than 0.";
    const priceNum = Number(finalPrice);
    if (Number.isNaN(priceNum) || priceNum < 0)
      return "Price must be a valid number (0 or more).";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const payload = {
      studio: form.studio,
      customer_name: form.customer_name.trim(),
      contact_number: form.contact_number || "",
      email: form.email || "",
      address: form.address || "",
      date: form.date,
      time_slot: form.time_slot,
      duration_hours: Number(form.duration_hours) || 1,
      payment_methods: form.payment_methods || [],
      agreed_price: Number(finalPrice) || 0,
      notes: form.notes || "",
    };

    setSaving(true);
    try {
      const resp = await api.post(USER_BOOKINGS_URL, payload);
      setSuccess("✅ Booking submitted successfully!");
      setForm(emptyForm);
      if (tab === "MY") {
        setBookings((prev) => [resp.data, ...prev]);
      }
    } catch (err) {
      setError(humanizeErr(err));
    } finally {
      setSaving(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    clearMessages();
    try {
      const resp = await api.patch(`${USER_BOOKINGS_URL}${id}/`, {
        is_cancelled: true,
      });
      setBookings((prev) => prev.map((b) => (b.id === id ? resp.data : b)));
      setSuccess("Booking cancelled.");
    } catch (err) {
      setError(humanizeErr(err));
    }
  };

  return (
    <div className="form-container pro">
      <div className="form-header">
        <h3>🎧 Book a Studio</h3>
      </div>

      <div className="tabs" style={{ marginBottom: 12 }}>
        <button
          type="button"
          className={`tab ${tab === "BOOK" ? "active" : ""}`}
          onClick={() => {
            clearMessages();
            setTab("BOOK");
          }}
        >
          ➕ Book Studio
        </button>
        <button
          type="button"
          className={`tab ${tab === "MY" ? "active" : ""}`}
          onClick={() => {
            clearMessages();
            setTab("MY");
          }}
        >
          📋 My Bookings
        </button>
      </div>

      {error && (
        <pre className="banner error" style={{ whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}
      {success && <div className="banner success">{success}</div>}

      {tab === "BOOK" && (
        <form onSubmit={onSubmit} className="grid two-col">
          <div className="group">
            <label>Studio *</label>
            {loadingStudios ? (
              <div className="muted">Loading studios…</div>
            ) : (
              <select
                name="studio"
                value={form.studio}
                onChange={onChange}
                required
              >
                <option value="">— Select studio —</option>
                {studios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.hourly_rate ? `— ₹${s.hourly_rate}/hr` : ""}
                  </option>
                ))}
              </select>
            )}
            {selectedStudio && (
              <div className="muted" style={{ marginTop: 4, fontSize: 12 }}>
                {selectedStudio.full_location || "Location not set"}
                {selectedStudio.google_map_link && (
                  <>
                    {" • "}
                    <a
                      href={selectedStudio.google_map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open map
                    </a>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="group">
            <label>Customer Name *</label>
            <input
              name="customer_name"
              value={form.customer_name}
              onChange={onChange}
              placeholder="e.g., Rahul Verma"
              required
            />
          </div>

          <div className="group">
            <label>Contact Number</label>
            <input
              name="contact_number"
              value={form.contact_number}
              onChange={onChange}
              placeholder="+91XXXXXXXXXX"
            />
          </div>

          <div className="group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="your@email.com"
            />
          </div>

          <div className="group">
            <label>Address</label>
            <input
              name="address"
              value={form.address}
              onChange={onChange}
              placeholder="Street, City"
            />
          </div>

          <div className="group">
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              required
            />
          </div>

          <div className="group">
            <label>Duration (hours) *</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              name="duration_hours"
              value={form.duration_hours}
              onChange={onChange}
              placeholder="e.g. 2"
              required
            />
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              Slots are 1 hour each; duration is used for price suggestion.
            </div>
          </div>

          <div className="group">
            <label>Price (total) ₹</label>
            <input
              name="agreed_price"
              value={finalPrice ?? ""}
              onChange={(e) =>
                onChange({
                  target: { name: "agreed_price", value: e.target.value },
                })
              }
              placeholder={
                suggestedPrice ? `Suggested: ₹${suggestedPrice}` : "Enter amount"
              }
            />
            {suggestedPrice && (
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                Suggested from studio rate: <strong>₹{suggestedPrice}</strong>
              </div>
            )}
          </div>

          <div className="group full">
            <label>Time Slot *</label>
            {!form.date || !form.studio ? (
              <div className="muted">Select a studio and date first.</div>
            ) : (
              <div
                className="slot-list"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginTop: 6,
                }}
              >
                {slots.map((t) => {
                  const isSelected = form.time_slot === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`slot ${isSelected ? "selected" : ""}`}
                      onClick={() => selectSlot(t)}
                      style={{
                        minWidth: 90,
                        height: 44,
                        borderRadius: 10,
                        border: isSelected
                          ? "2px solid #2563eb"
                          : "1px solid #d1fae5",
                        background: isSelected ? "#2563eb" : "#ffffff",
                        color: isSelected ? "#ffffff" : "#041727",
                        fontWeight: 700,
                        boxShadow: isSelected
                          ? "0 8px 18px rgba(37,99,235,0.35)"
                          : "0 5px 12px rgba(15,23,42,0.06)",
                      }}
                    >
                      {format12(t)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="group full">
            <label>Payment Options</label>
            <div className="payment-options pill">
              {["Card", "UPI", "NetBanking", "Cash"].map((m) => (
                <label key={m} className="pill-item">
                  <input
                    type="checkbox"
                    checked={form.payment_methods.includes(m)}
                    onChange={() => togglePayment(m)}
                  />
                  <span>{m}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="group full">
            <label>Notes / Special Requests</label>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={onChange}
              placeholder="E.g. genre, extra mics, recording engineer, etc."
            />
          </div>

          <div className="actions full">
            <button type="submit" className="primary" disabled={saving}>
              {saving ? "Submitting..." : "Submit Booking"}
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
        </form>
      )}

      {tab === "MY" && (
        <div className="view-wrap">
          {loadingBookings ? (
            <div className="loader">Loading your bookings…</div>
          ) : bookings.length === 0 ? (
            <div className="empty">
              No bookings found. If you just created one anonymously, it may not
              be linked to your login.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="nice-table">
                <thead>
                  <tr>
                    <th>Studio</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th className="right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>{b.studio_name || "—"}</td>
                      <td>{b.date || "—"}</td>
                      <td>{b.time_slot ? format12(b.time_slot) : "—"}</td>
                      <td>{b.duration_hours} hr</td>
                      <td>{b.agreed_price ? `₹${b.agreed_price}` : "—"}</td>
                      <td>
                        {b.is_cancelled ? (
                          <span className="chip muted">Cancelled</span>
                        ) : (
                          <span className="chip ok">Active</span>
                        )}
                      </td>
                      <td className="right">
                        {!b.is_cancelled && (
                          <button
                            className="mini danger"
                            type="button"
                            onClick={() => cancelBooking(b.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserStudioBookingForm;
