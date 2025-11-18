// src/components/Forms/StudioForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Forms.css";

const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const BOOKINGS_URL = `${BASE}/auth/studios/`;
const MASTERS_URL = `${BASE}/auth/studio-master/`;

const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

// generate slots at given step (minutes). default 60min (1 hour)
const makeSlots = (start = "08:00", end = "22:00", stepMin = 60) => {
  stepMin = Number(stepMin) || 60;
  if (stepMin <= 0 || stepMin > 1440) stepMin = 60;

  const out = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (Number(sh) || 0) * 60 + (Number(sm) || 0);
  const endMins = (Number(eh) || 0) * 60 + (Number(em) || 0);

  while (mins <= endMins) {
    const h = String(Math.floor(mins / 60)).padStart(2, "0");
    const m = String(mins % 60).padStart(2, "0");
    out.push(`${h}:${m}`);
    mins += stepMin;
  }
  return out;
};

// does interval A (startA + durAhr) overlap B (startB + durBhr)?
const overlaps = (startA, durAhr, startB, durBhr) => {
  const toMin = (s) => {
    if (!s) return null;
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m;
  };
  const a0 = toMin(startA);
  const b0 = toMin(startB);
  if (a0 === null || b0 === null) return false;
  const a1 = a0 + Math.round((Number(durAhr) || 0) * 60);
  const b1 = b0 + Math.round((Number(durBhr) || 0) * 60);
  return a0 < b1 && b0 < a1;
};

const format12 = (time24) => {
  if (!time24) return "";
  const [hh, mm] = time24.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
};

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

const StudioForm = ({ onClose, viewOnly = false }) => {
  const [tab, setTab] = useState(viewOnly ? "VIEW" : "ADD");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [bookings, setBookings] = useState([]);
  const [masters, setMasters] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const emptyForm = {
    customer: "",
    contact_number: "",
    email: "",
    address: "",
    studio_id: "",
    studio_name: "",
    date: "",
    time_slot: "",
    duration: 1, // default 1 hour
    payment_methods: [],
    custom_price: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  // selectedRange - array of slot strings that the current selection occupies
  const [selectedRange, setSelectedRange] = useState([]);

  // derived selected master and its price
  const selectedStudio = useMemo(
    () => masters.find((m) => String(m.id) === String(formData.studio_id)),
    [masters, formData.studio_id]
  );
  const masterPrice = selectedStudio?.hourly_rate ?? "";

  const finalPrice = useMemo(() => {
    if (formData.custom_price !== "" && formData.custom_price !== null && formData.custom_price !== undefined) {
      return String(formData.custom_price);
    }
    return masterPrice === null || masterPrice === undefined ? "" : String(masterPrice);
  }, [formData.custom_price, masterPrice]);

  const clearStatus = () => { setError(null); setSuccessMsg(""); };
  const toast = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 1800); };

  const fetchAll = async () => {
    setLoading(true);
    clearStatus();
    try {
      const [b, m] = await Promise.all([api.get(BOOKINGS_URL), api.get(MASTERS_URL)]);
      const bRows = Array.isArray(b.data) ? b.data : b.data?.results ?? b.data ?? [];
      const mRows = Array.isArray(m.data) ? m.data : m.data?.results ?? m.data ?? [];
      setBookings(Array.isArray(bRows) ? bRows : []);
      setMasters((mRows || []).filter((s) => s.is_active !== false));
      const pages = Math.max(1, Math.ceil(((bRows || []).length) / pageSize));
      if (page > pages) setPage(pages);
    } catch (e) {
      setError(humanizeErr(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    let rows = [...bookings];
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
  }, [bookings, search, dateFilter]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [search, dateFilter]);

  // === slots at 60-min spacing ===
  const SLOT_STEP_MIN = 60;
  const allSlots = useMemo(() => makeSlots("08:00", "22:00", SLOT_STEP_MIN), []);

  // compute slot availability for the selected date & studio
  const slotsInfo = useMemo(() => {
    // prepare baseline: all slots not booked
    const base = allSlots.map((s) => ({ time: s, booked: false, sources: [] }));

    if (!formData.date || !formData.studio_id) return base;

    // bookings that match the date and studio (match by studio_id or name)
    const master = masters.find((m) => String(m.id) === String(formData.studio_id));
    const taken = bookings.filter((b) =>
      b.date === formData.date && (
        (master && (b.studio_name || "").toLowerCase() === (master.name || "").toLowerCase()) ||
        (String(b.studio_id || "") === String(formData.studio_id))
      )
    );

    // mark booked slots by testing overlap between each slot start and existing bookings
    return base.map((slotObj) => {
      const overlappedBy = taken.filter((b) => {
        // If booking has no time_slot, ignore
        if (!b.time_slot) return false;
        return overlaps(slotObj.time, 1 /* slot step in hours */, b.time_slot, Number(b.duration) || 1);
      });
      return { ...slotObj, booked: overlappedBy.length > 0, sources: overlappedBy };
    });
  }, [allSlots, formData.date, formData.studio_id, bookings, masters]);

  // helper: get index of a slot and compute range array by duration
  const computeRangeForStart = (startTime, durationHours) => {
    const stepMin = SLOT_STEP_MIN;
    const perSlotHr = stepMin / 60;
    const count = Math.ceil((Number(durationHours) || 0) / perSlotHr) || 1; // number of slots needed
    const startIndex = allSlots.indexOf(startTime);
    if (startIndex === -1) return [];
    const arr = [];
    for (let i = 0; i < count; i++) {
      const idx = startIndex + i;
      if (idx >= allSlots.length) break;
      arr.push(allSlots[idx]);
    }
    return arr;
  };

  // When duration or date/studio changes, clear selection range and time if it no longer fits
  useEffect(() => {
    if (!formData.time_slot) {
      setSelectedRange([]);
      return;
    }
    const range = computeRangeForStart(formData.time_slot, formData.duration);
    // if range length is less than required (runs past end) or any covered slot booked, clear selection
    const perSlotHr = SLOT_STEP_MIN / 60;
    const neededCount = Math.ceil((Number(formData.duration) || 0) / perSlotHr) || 1;
    if (range.length < neededCount) {
      setFormData((p) => ({ ...p, time_slot: "" }));
      setSelectedRange([]);
      return;
    }
    const conflict = range.some((t) => slotsInfo.find((s) => s.time === t)?.booked);
    if (conflict) {
      setFormData((p) => ({ ...p, time_slot: "" }));
      setSelectedRange([]);
      return;
    }
    setSelectedRange(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.duration, formData.date, formData.studio_id, allSlots, bookings]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name === "custom_price") {
      setFormData((prev) => ({ ...prev, custom_price: value }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: type === "number" ? (value === "" ? "" : Number(value)) : value }));
  };

  const handleStudioChange = (e) => {
    const studio_id = e.target.value;
    const master = masters.find((m) => String(m.id) === String(studio_id));
    setFormData((prev) => ({
      ...prev,
      studio_id,
      studio_name: master?.name || "",
      time_slot: "",
    }));
    setSelectedRange([]);
  };

  const handlePaymentChange = (method) => {
    setFormData((prev) => {
      const set = new Set(prev.payment_methods);
      if (set.has(method)) set.delete(method); else set.add(method);
      return { ...prev, payment_methods: Array.from(set) };
    });
  };

  // user clicking a slot as start: only allow when the computed range has no booked slot and fits
  const onSlotClick = (time) => {
    // compute intended range
    const range = computeRangeForStart(time, formData.duration);
    const perSlotHr = SLOT_STEP_MIN / 60;
    const neededCount = Math.ceil((Number(formData.duration) || 0) / perSlotHr) || 1;
    if (range.length < neededCount) {
      // can't pick because it would run past end
      return;
    }
    const conflict = range.some((t) => slotsInfo.find((s) => s.time === t)?.booked);
    if (conflict) return; // do nothing if conflict
    // set start time and selectedRange
    setFormData((p) => ({ ...p, time_slot: time }));
    setSelectedRange(range);
  };

  const handleEdit = (row) => {
    setTab("ADD");
    setEditingId(row.id);
    const master = masters.find((m) => (m.name || "").toLowerCase() === (row.studio_name || "").toLowerCase());
    setFormData({
      customer: row.customer || "",
      contact_number: row.contact_number || "",
      email: row.email || "",
      address: row.address || "",
      studio_id: master?.id ? String(master.id) : "",
      studio_name: row.studio_name || master?.name || "",
      date: row.date || "",
      time_slot: row.time_slot || "",
      duration: row.duration ?? 1,
      payment_methods: Array.isArray(row.payment_methods) ? row.payment_methods : [],
      custom_price: row.price ?? (master?.hourly_rate ?? ""),
    });
    setSelectedRange([]);
    clearStatus();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    clearStatus();
    try {
      await api.delete(`${BOOKINGS_URL}${id}/`);
      setBookings((prev) => prev.filter((r) => r.id !== id));
      toast("🗑️ Deleted");
      const after = bookings.length - 1;
      const pages = Math.max(1, Math.ceil(after / pageSize));
      if (page > pages) setPage(pages);
    } catch (err) {
      setError(humanizeErr(err));
    }
  };

  const resetForm = () => { setFormData(emptyForm); setEditingId(null); setSelectedRange([]); };

  const validate = () => {
    if (!formData.customer?.trim()) return "Customer is required.";
    if (!formData.studio_name?.trim()) return "Studio name is required.";
    if (!formData.date?.trim()) return "Date is required.";
    const d = Number(formData.duration);
    if (Number.isNaN(d) || d <= 0) return "Duration must be greater than 0.";
    if (!formData.time_slot) return "Please choose an available time slot.";
    if (!finalPrice || String(finalPrice).trim() === "") return "Price is required.";
    const pnum = Number(finalPrice);
    if (Number.isNaN(pnum) || pnum < 0) return "Price must be a valid number >= 0.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearStatus();
    const v = validate();
    if (v) { setError(v); return; }

    const isEdit = Boolean(editingId);
    const priceToSend = Number(finalPrice) || 0;

    const payload = {
      ...formData,
      duration: Number(formData.duration),
      time_slot: formData.time_slot ? formData.time_slot : null,
      payment_methods: Array.isArray(formData.payment_methods) ? formData.payment_methods : [],
      price: priceToSend,
      studio_name: formData.studio_name,
    };

    setSaving(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticBooking = { id: tempId, ...payload };

    try {
      if (!isEdit) {
        setBookings((prev) => [optimisticBooking, ...prev]);
        const resp = await api.post(BOOKINGS_URL, payload);
        setBookings((prev) => prev.map((x) => (x.id === tempId ? resp.data : x)));
        toast("✅ Booking added");
      } else {
        const resp = await api.put(`${BOOKINGS_URL}${editingId}/`, payload);
        setBookings((prev) => prev.map((x) => (x.id === editingId ? resp.data : x)));
        toast("✅ Booking updated");
      }
      await fetchAll();
      resetForm();
      setTab("VIEW");
    } catch (err) {
      if (!isEdit) setBookings((prev) => prev.filter((x) => x.id !== tempId));
      setError(humanizeErr(err));
    } finally {
      setSaving(false);
    }
  };

  // helper to decide whether a given slot may be a valid start (fits and no conflicts)
  const canStartAt = (time) => {
    const range = computeRangeForStart(time, formData.duration);
    const perSlotHr = SLOT_STEP_MIN / 60;
    const neededCount = Math.ceil((Number(formData.duration) || 0) / perSlotHr) || 1;
    if (range.length < neededCount) return false;
    return !range.some((t) => slotsInfo.find((s) => s.time === t)?.booked);
  };

  return (
    <div className="form-container pro">
      <div className="form-header">
        <h3>🎙️ Studio Rentals</h3>
        {onClose && <button className="close-x" onClick={onClose} aria-label="Close">✖</button>}
      </div>

      <div className="tabs" style={{ marginBottom: 8 }}>
        <button className={`tab ${tab === "ADD" ? "active" : ""}`} onClick={() => setTab("ADD")} type="button">➕ Add</button>
        <button className={`tab ${tab === "VIEW" ? "active" : ""}`} onClick={() => setTab("VIEW")} type="button">👁 View</button>
      </div>

      {successMsg && <div className="banner success">{successMsg}</div>}
      {error && <pre className="banner error" style={{ whiteSpace: "pre-wrap" }}>{error}</pre>}

      {tab === "ADD" && (
        <form onSubmit={handleSubmit} className="grid two-col">
          <div className="group">
            <label>Customer Name *</label>
            <input name="customer" value={formData.customer} onChange={handleChange} placeholder="e.g., Rahul Verma" required />
          </div>

          <div className="group">
            <label>Contact Number</label>
            <input name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="+91XXXXXXXXXX" />
          </div>

          <div className="group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="customer@email.com" />
          </div>

          <div className="group">
            <label>Address</label>
            <input name="address" value={formData.address} onChange={handleChange} placeholder="Street, City" />
          </div>

          <div className="group">
            <label>Studio Name *</label>
            <select name="studio_id" value={formData.studio_id} onChange={handleStudioChange} required>
              <option value="">— Select studio —</option>
              {masters.map((m) => <option key={m.id} value={m.id}>{m.name} {m.hourly_rate ? `— ₹${m.hourly_rate}/hr` : ""}</option>)}
            </select>
            <input type="hidden" name="studio_name" value={formData.studio_name} readOnly />
          </div>

          <div className="group">
            <label>Price (₹/hr)</label>
            <input
              name="custom_price"
              value={finalPrice}
              onChange={(e) => handleChange({ target: { name: "custom_price", value: e.target.value } })}
              placeholder={masterPrice ? `Master: ₹${masterPrice}` : "Enter price"}
            />
          </div>

          <div className="group">
            <label>Date *</label>
            <input type="date" name="date" value={formData.date} onChange={(e) => { handleChange(e); setSelectedRange([]); setFormData((p)=>({...p, time_slot:""})); }} required />
          </div>

          <div className="group">
            <label>Time Slot *</label>
            <div className="slot-grid">
              {!formData.date || !formData.duration || !formData.studio_id ? (
                <div className="muted">Pick studio, date and duration first</div>
              ) : (
                <>
                  {slotsInfo.filter(s => !s.booked).length === 0 && slotsInfo.length > 0 ? (
                    <div className="empty">No free slots for the selected date/duration.</div>
                  ) : null}

                  <div className="slot-list" role="list" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {slotsInfo.map(({ time, booked }) => {
                      const isSelectedStart = formData.time_slot === time;
                      const inSelectedRange = selectedRange.includes(time);
                      const validStart = canStartAt(time);
                      // style classes: booked, disabled-start, selected-start, selected-range
                      const cls = [
                        "slot",
                        booked ? "booked" : "available",
                        !booked && !validStart ? "disabled-start" : "",
                        isSelectedStart ? "selected-start" : "",
                        inSelectedRange ? "selected-range" : "",
                      ].join(" ");

                      const title = booked ? "Already booked" : (inSelectedRange ? `Covers ${selectedRange.length} slot(s)` : `Start at ${format12(time)}`);
                      return (
                        <button
                          key={time}
                          type="button"
                          role="listitem"
                          className={cls}
                          onClick={() => {
                            if (booked) return;
                            if (!validStart) return;
                            onSlotClick(time);
                          }}
                          disabled={booked || !validStart}
                          title={title}
                        >
                          <div style={{ fontWeight: 800 }}>{format12(time)}</div>
                          {booked && <div style={{ fontSize: 11, color: "#9aa6b2" }}>booked</div>}
                          {!booked && !validStart && <div style={{ fontSize: 11, color: "#c07" }}>not enough free slots</div>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="group">
            <label>Duration (hours) *</label>
            <input type="number" step="0.5" min="0.5" name="duration" value={formData.duration} onChange={(e) => { handleChange(e); setSelectedRange([]); setFormData((p)=>({...p, time_slot:""})); }} placeholder="e.g., 2" required />
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>Selecting a start will highlight the full booked range based on duration.</div>
          </div>

          <div className="group full">
            <label>Payment Options</label>
            <div className="payment-options pill">
              {["Card", "UPI", "NetBanking"].map((m) => (
                <label key={m} className="pill-item">
                  <input type="checkbox" checked={formData.payment_methods.includes(m)} onChange={() => handlePaymentChange(m)} />
                  <span>{m}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="actions full">
            <button type="submit" className="primary" disabled={saving}>{saving ? (editingId ? "Updating..." : "Saving...") : editingId ? "Update" : "Save"}</button>
            <button type="button" className="ghost" onClick={resetForm} disabled={saving}>Reset</button>
          </div>

          {editingId && <div className="hint full">Editing booking <strong>#{editingId}</strong></div>}
        </form>
      )}

      {tab === "VIEW" && (
        <div className="view-wrap">
          <div className="toolbar">
            <input className="search" placeholder="Search: customer, studio, email, phone" value={search} onChange={(e) => setSearch(e.target.value)} />
            <input type="date" className="date-filter" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
            <button className="ghost" onClick={fetchAll} disabled={loading}>{loading ? "Refreshing..." : "Refresh"}</button>
          </div>

          {loading ? <div className="loader">Loading bookings…</div> : filtered.length === 0 ? <div className="empty">No bookings found.</div> : (
            <>
              <div className="table-wrap">
                <table className="nice-table">
                  <thead>
                    <tr><th>Customer</th><th>Studio</th><th>Date</th><th>Time</th><th>Duration</th><th>Price</th><th>Payment</th><th className="right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {paged.map((s) => (
                      <tr key={s.id}>
                        <td>{s.customer || "-"}</td>
                        <td>{s.studio_name || "-"}</td>
                        <td>{s.date || "-"}</td>
                        <td>{s.time_slot ? format12(s.time_slot) : "-"}</td>
                        <td>{s.duration || "-"}</td>
                        <td>{s.price !== undefined && s.price !== null ? `₹${s.price}` : "-"}</td>
                        <td>{Array.isArray(s.payment_methods) && s.payment_methods.length ? s.payment_methods.join(", ") : "-"}</td>
                        <td className="right">
                          <button className="mini" onClick={() => handleEdit(s)} disabled={saving}>✏️ Edit</button>
                          <button className="mini danger" onClick={() => handleDelete(s.id)} disabled={saving}>🗑 Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
                <span>Page {page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StudioForm;
