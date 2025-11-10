import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Forms.css";

const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const API_URL = `${BASE}/auth/sound/`;

const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  return config;
});

// util
const toInt = (v) => (v === "" || v == null ? 0 : parseInt(v, 10) || 0);
const toMoney = (v) => (v === "" || v == null ? "0" : String(Number(v) || 0));
const normPayment = (v) => {
  const s = String(v || "").trim().toLowerCase();
  if (s === "upi") return "UPI";
  if (s === "card") return "Card";
  return "Cash";
};

// options
const SYSTEM_OPTIONS = [
  "DJ Sound System",
  "PA Sound System",
  "Live Band Setup",
  "Conference Audio System",
  "Outdoor Concert Setup",
  "Indoor Event System",
  "Corporate Sound Setup",
  "Wedding Sound Package",
  "Stage Performance Setup",
  "Custom Hybrid Sound",
];

export default function SoundSystemService() {
  const [mode, setMode] = useState("VIEW");      // VIEW | EDIT
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // search + paging (client-side)
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    client_name: "",
    email: "",
    mobile_no: "",
    event_date: "",
    location: "",
    system_type: "",
    speakers_count: "",
    microphones_count: "",
    mixer_model: "",
    price: "",
    payment_method: "Cash",
    notes: "",
  });

  // ================= API =================
  const fetchAll = async () => {
    setLoading(true); setErr("");
    try {
      const res = await api.get(`${API_URL}?page_size=1000`);
      const list = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
      setRows(list); setPage(1);
    } catch (e) { setErr("Failed to fetch records"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const save = async () => {
    const payload = {
      client_name: (form.client_name || "").trim() || "Unnamed",
      email: (form.email || "").trim() || null,
      mobile_no: (form.mobile_no || "").trim() || null,
      event_date: (form.event_date || "").trim() || null,
      location: (form.location || "").trim() || null,
      system_type: (form.system_type || "").trim() || null,
      speakers_count: toInt(form.speakers_count),
      microphones_count: toInt(form.microphones_count),
      mixer_model: (form.mixer_model || "").trim() || null,
      price: toMoney(form.price),
      payment_method: normPayment(form.payment_method),
      notes: (form.notes || "").trim() || null,
    };
    try {
      if (editingId) {
        await api.put(`${API_URL}${editingId}/`, payload);
        setMsg("Updated successfully ✅");
      } else {
        await api.post(API_URL, payload);
        setMsg("Saved successfully ✅");
      }
      await fetchAll();
      reset();
      setMode("VIEW");
    } catch (e) {
      setErr("Save failed: " + JSON.stringify(e?.response?.data || e.message));
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this record?")) return;
    try { await api.delete(`${API_URL}${id}/`); await fetchAll(); }
    catch (e) { setErr("Delete failed: " + JSON.stringify(e?.response?.data || e.message)); }
  };

  // ================= UI helpers =================
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.client_name, r.email, r.mobile_no, r.system_type, r.location, r.mixer_model, r.notes]
        .filter(Boolean).map(String).map((x) => x.toLowerCase()).some((x) => x.includes(s))
    );
  }, [rows, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const reset = () => {
    setForm({
      client_name: "",
      email: "",
      mobile_no: "",
      event_date: "",
      location: "",
      system_type: "",
      speakers_count: "",
      microphones_count: "",
      mixer_model: "",
      price: "",
      payment_method: "Cash",
      notes: "",
    });
    setEditingId(null);
    setMsg(""); setErr("");
  };

  const startAdd = () => { reset(); setMode("EDIT"); };
  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({
      client_name: r.client_name || "",
      email: r.email || "",
      mobile_no: r.mobile_no || "",
      event_date: r.event_date || "",
      location: r.location || "",
      system_type: r.system_type || "",
      speakers_count: String(r.speakers_count ?? ""),
      microphones_count: String(r.microphones_count ?? ""),
      mixer_model: r.mixer_model || "",
      price: String(r.price ?? ""),
      payment_method: r.payment_method || "Cash",
      notes: r.notes || "",
    });
    setMode("EDIT");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="form-container pro">
      {/* Header bar (like Studio Rentals) */}
      <div className="form-header">
        <h3>🔊 Sound System Service</h3>
        <div className="tabs">
          <button className={`tab ${mode === "EDIT" ? "active" : ""}`} onClick={startAdd}>➕ Add</button>
          <button className={`tab ${mode === "VIEW" ? "active" : ""}`} onClick={() => setMode("VIEW")}>👁 View</button>
        </div>
        <button className="close-x" onClick={() => setMode("VIEW")}>✕</button>
      </div>

      {/* Search row */}
      <div className="toolbar" style={{ marginBottom: 8 }}>
        <input
          className="search" placeholder="Search services…"
          value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        <button className="ghost" onClick={fetchAll}>Refresh</button>
      </div>

      {/* =================== FORM (EDIT) =================== */}
      {mode === "EDIT" && (
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="view-wrap">
          {/* Client row */}
          <div className="grid two-col">
            <div className="group">
              <label htmlFor="client_name">Customer Name *</label>
              <input id="client_name" name="client_name" placeholder="e.g., Rahul Verma"
                     value={form.client_name} onChange={onChange} required />
            </div>
            <div className="group">
              <label htmlFor="mobile_no">Contact Number</label>
              <input id="mobile_no" name="mobile_no" placeholder="+91XXXXXXXXXX"
                     value={form.mobile_no} onChange={onChange} />
            </div>
          </div>

          <div className="grid two-col">
            <div className="group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" placeholder="customer@email.com"
                     value={form.email} onChange={onChange} />
            </div>
            <div className="group">
              <label htmlFor="location">Address</label>
              <input id="location" name="location" placeholder="Street, City"
                     value={form.location} onChange={onChange} />
            </div>
          </div>

          {/* Setup row */}
          <div className="grid two-col">
            <div className="group">
              <label htmlFor="system_type">System Type *</label>
              <select id="system_type" name="system_type" value={form.system_type} onChange={onChange} required>
                <option value="">— Select —</option>
                {SYSTEM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="group">
              <label htmlFor="event_date">Date *</label>
              <input id="event_date" type="date" name="event_date"
                     placeholder="dd-mm-yyyy" value={form.event_date} onChange={onChange} />
            </div>
          </div>

          <div className="grid two-col">
            <div className="group">
              <label htmlFor="mixer_model">Mixer Model</label>
              <input id="mixer_model" name="mixer_model" placeholder="e.g., X32 / DJM-900"
                     value={form.mixer_model} onChange={onChange} />
            </div>
            <div className="group">
              <label htmlFor="price">Price (₹)</label>
              <input id="price" name="price" placeholder="e.g., 15000" value={form.price} onChange={onChange} />
            </div>
          </div>

          <div className="grid two-col">
            <div className="group">
              <label htmlFor="speakers_count">Speakers Count</label>
              <input id="speakers_count" name="speakers_count" placeholder="e.g., 2"
                     value={form.speakers_count} onChange={onChange} />
            </div>
            <div className="group">
              <label htmlFor="microphones_count">Microphones Count</label>
              <input id="microphones_count" name="microphones_count" placeholder="e.g., 4"
                     value={form.microphones_count} onChange={onChange} />
            </div>
          </div>

          {/* Payment pills */}
          <div className="group full">
            <label>Payment Options</label>
            <div className="payment-options pill">
              {["Cash", "Card", "UPI"].map((opt) => (
                <label key={opt} className={`pill-item${form.payment_method === opt ? " active" : ""}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value={opt}
                    checked={form.payment_method === opt}
                    onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
                    style={{ display: "none" }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="group full">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" rows={3} placeholder="Any additional details…"
                      value={form.notes} onChange={onChange} />
          </div>

          <div className="actions">
            <button type="button" className="ghost" onClick={reset}>Reset</button>
            <button type="submit" className="primary">{editingId ? "Save Changes" : "Save"}</button>
          </div>

          {msg && <div className="banner success">{msg}</div>}
          {err && <div className="banner error">{err}</div>}
        </form>
      )}

      {/* =================== VIEW (TABLE) =================== */}
      {mode === "VIEW" && (
        <div className="table-wrap">
          {loading ? (
            <div className="loader">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="empty">No records found.</div>
          ) : (
            <>
              <table className="nice-table">
                <thead>
                  <tr>
                    <th>CLIENT</th>
                    <th>DATE</th>
                    <th>SYSTEM</th>
                    <th>PRICE</th>
                    <th>PAYMENT</th>
                    <th>LOCATION</th>
                    <th className="right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.client_name || "-"}</td>
                      <td>{r.event_date || "-"}</td>
                      <td>{r.system_type || "-"}</td>
                      <td>{Number(r.price || 0).toFixed(2)}</td>
                      <td>{r.payment_method || "-"}</td>
                      <td>{r.location || "-"}</td>
                      <td className="right">
                        <button className="mini" onClick={() => startEdit(r)}>✏️</button>
                        <button className="mini danger" onClick={() => del(r.id)}>🗑 Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹ Prev</button>
                <span>Page {page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next ›</button>
              </div>
            </>
          )}
        </div>
      )}

      {err && mode === "VIEW" && <div className="banner error" style={{ marginTop: 10 }}>{err}</div>}
    </div>
  );
}
