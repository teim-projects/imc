// src/components/Forms/SingingClassForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Forms.css";

const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const API_URL = `${BASE.replace(/\/$/, "")}/auth/singing-classes/`;
const PAGE_SIZE = 10;

const api = axios.create();
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  return config;
});

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

export default function SingingClassForm({ onSuccess }) {
  const [mode, setMode] = useState("add"); // "add" or "view"

  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "", email: "",
    address1: "", address2: "", city: "", state: "", postal_code: "",
    preferred_batch: "", reference_by: "", agreed_terms: false,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [errorBanner, setErrorBanner] = useState("");
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const BATCH_OPTIONS = [
    "Morning (7:00 - 9:00)",
    "Afternoon (1:00 - 3:00)",
    "Evening (6:00 - 8:00)",
  ];

  // initial list load (so right card has data even in add mode)
  useEffect(() => { fetchList(1); }, []);

  // fetch list when switching to view
  useEffect(() => { if (mode === "view") fetchList(1); }, [mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors(s => ({ ...s, [name]: undefined }));
    setErrorBanner("");
  };

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim()) e.last_name = "Last name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.preferred_batch) e.preferred_batch = "Please choose a batch";
    if (!form.agreed_terms) e.agreed_terms = "You must accept terms";
    return e;
  };

  const resetForm = () => {
    setForm({
      first_name: "", last_name: "", phone: "", email: "",
      address1: "", address2: "", city: "", state: "", postal_code: "",
      preferred_batch: "", reference_by: "", agreed_terms: false,
    });
    setErrors({});
    setErrorBanner("");
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (mode !== "add") return;
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setSaving(true);
    setErrorBanner("");
    try {
      const resp = await api.post(API_URL, form);
      // refresh first page after add
      await fetchList(1);
      resetForm();
      onSuccess?.();
      // small non-blocking notification
      console.info("Saved admission id:", resp.data?.id);
      setMode("view"); // automatically switch to view so user sees record
    } catch (err) {
      if (err?.response?.data) {
        const mapped = {};
        Object.keys(err.response.data).forEach((k) => {
          mapped[k] = Array.isArray(err.response.data[k]) ? err.response.data[k].join(" ") : String(err.response.data[k]);
        });
        setErrors(mapped);
      } else {
        setErrorBanner("Network/server error — check console.");
        console.error(err);
      }
    } finally {
      setSaving(false);
    }
  };

  const fetchList = async (pageNo = 1) => {
    setListLoading(true);
    setErrorBanner("");
    try {
      const res = await api.get(API_URL, { params: { page: pageNo, page_size: PAGE_SIZE } });
      if (Array.isArray(res.data)) {
        setItems(res.data);
        setCount(res.data.length);
      } else {
        setItems(res.data.results || []);
        setCount(res.data.count || 0);
      }
      setPage(pageNo);
    } catch (err) {
      setErrorBanner(humanizeErr(err));
      setItems([]);
      setCount(0);
    } finally {
      setListLoading(false);
    }
  };

  // Delete with optimistic UI + rollback on error
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admission?")) return;
    setErrorBanner("");
    const before = items.slice();
    setItems(prev => prev.filter(x => String(x.id) !== String(id)));
    setCount(c => Math.max(0, c - 1));
    try {
      await api.delete(`${API_URL}${id}/`);
      // keep list fresh
      await fetchList(page);
    } catch (err) {
      setItems(before);
      setCount(before.length);
      setErrorBanner(humanizeErr(err));
      console.error(err);
    }
  };

  const handleEdit = (row) => {
    setForm({
      first_name: row.first_name || "", last_name: row.last_name || "",
      phone: row.phone || "", email: row.email || "",
      address1: row.address1 || "", address2: row.address2 || "",
      city: row.city || "", state: row.state || "", postal_code: row.postal_code || "",
      preferred_batch: row.preferred_batch || "", reference_by: row.reference_by || "",
      agreed_terms: !!row.agreed_terms,
    });
    setMode("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDetail = (row) => { setSelected(row); setDrawerOpen(true); };
  const closeDetail = () => { setDrawerOpen(false); setTimeout(() => setSelected(null), 220); };

  // fallback preview if backend empty
  const previewData = useMemo(() => ([
    { id: "p1", first_name: "Om", last_name: "Sharma", preferred_batch: "Morning (7:00 - 9:00)", phone: "+911234567890", email: "om@gmail.com", city: "Delhi", date: "2025-05-12" },
  ]), []);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const sidebarList = items.length > 0 ? items : previewData;

  return (
    <div className="sc-wrapper-large">
      <div className="sc-shell">
        {/* Header & pills */}
        <div className="sc-top header-with-pills">
          <div className="title-left">
            <div className="title-icon">🎤</div>
            <div><h2>Admissions</h2></div>
          </div>

          <div className="pills">
            <button className={`pill pill-add ${mode === "add" ? "active" : ""}`} onClick={() => setMode("add")} type="button" aria-pressed={mode === "add"}>
              <span className="pill-icon">＋</span>
              <span className="pill-text">Add Admission</span>
            </button>

            <button className={`pill pill-view ${mode === "view" ? "active" : ""}`} onClick={() => setMode("view")} type="button" aria-pressed={mode === "view"}>
              <span className="pill-text">View Admissions</span>
            </button>
          </div>
        </div>

        {errorBanner && <div className="banner error">{errorBanner}</div>}

        {/* ADD mode: form left, live admissions right (edit/delete) */}
        {mode === "add" && (
          <div className="sc-body">
            <div className="sc-left">
              <form className="sc-form-grid" onSubmit={submit} noValidate>
                <div className="sc-col">
                  <label>Customer Name *</label>
                  <input name="first_name" placeholder="First name" value={form.first_name} onChange={handleChange} />
                  {errors.first_name && <div className="sc-err">{errors.first_name}</div>}
                </div>

                <div className="sc-col">
                  <label>&nbsp;</label>
                  <input name="last_name" placeholder="Last name" value={form.last_name} onChange={handleChange} />
                  {errors.last_name && <div className="sc-err">{errors.last_name}</div>}
                </div>

                <div className="sc-col">
                  <label>Email</label>
                  <input name="email" placeholder="customer@email.com" value={form.email} onChange={handleChange} />
                  {errors.email && <div className="sc-err">{errors.email}</div>}
                </div>

                <div className="sc-col">
                  <label>Contact Number</label>
                  <input name="phone" placeholder="+91XXXXXXXXXX" value={form.phone} onChange={handleChange} />
                  {errors.phone && <div className="sc-err">{errors.phone}</div>}
                </div>

                <div className="sc-col">
                  <label>Street Address</label>
                  <input name="address1" placeholder="Street, City" value={form.address1} onChange={handleChange} />
                </div>

                <div className="sc-col">
                  <label>Address Line 2</label>
                  <input name="address2" placeholder="Apartment / Landmark" value={form.address2} onChange={handleChange} />
                </div>

                <div className="sc-col">
                  <label>City</label>
                  <input name="city" value={form.city} onChange={handleChange} />
                </div>

                <div className="sc-col">
                  <label>State / Province</label>
                  <input name="state" value={form.state} onChange={handleChange} />
                </div>

                <div className="sc-col">
                  <label>Postal / Zip Code</label>
                  <input name="postal_code" value={form.postal_code} onChange={handleChange} />
                </div>

                <div className="sc-col">
                  <label>Preferred Batch</label>
                  <select name="preferred_batch" value={form.preferred_batch} onChange={handleChange}>
                    <option value="">-- Select --</option>
                    {BATCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {errors.preferred_batch && <div className="sc-err">{errors.preferred_batch}</div>}
                </div>

                <div className="sc-col">
                  <label>Reference By</label>
                  <input name="reference_by" value={form.reference_by} onChange={handleChange} />
                </div>

                <div className="sc-col sc-terms">
                  <label className="sc-terms-label">
                    <input type="checkbox" name="agreed_terms" checked={form.agreed_terms} onChange={handleChange} />
                    <span>Term &amp; Condition</span>
                  </label>
                  {errors.agreed_terms && <div className="sc-err">{errors.agreed_terms}</div>}
                </div>

                <div className="sc-col sc-actions">
                  <div className="sc-action-left" />
                  <div className="sc-action-right">
                    <button type="submit" className="sc-btn save" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                    <button type="button" className="sc-btn reset" onClick={resetForm} disabled={saving}>Reset</button>
                  </div>
                </div>
              </form>
            </div>

           
          </div>
        )}

        {/* VIEW: full table with delete */}
        {mode === "view" && (
          <div className="sc-body full-width">
            <div className="table-wrap">
              <div className="table-card">
                <div className="table-toolbar">
                  <input className="search" placeholder="Search: name, phone, email, batch" onChange={() => {}} />
                  <div className="spacer" />
                  <button className="ghost" onClick={() => fetchList(1)} disabled={listLoading}>{listLoading ? "Refreshing..." : "Refresh"}</button>
                </div>

                {listLoading ? (
                  <div style={{ padding: 24 }}>Loading admissions…</div>
                ) : items.length === 0 ? (
                  <div style={{ padding: 24, color: "#6b7280" }}>No admissions yet.</div>
                ) : (
                  <>
                    <table className="nice-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Batch</th>
                          <th>Date</th>
                          <th>Phone</th>
                          <th>Email</th>
                          <th className="right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(r => (
                          <tr key={r.id}>
                            <td onClick={() => openDetail(r)} style={{ cursor: "pointer" }}>{r.first_name} {r.last_name}</td>
                            <td>{r.preferred_batch || "-"}</td>
                            <td>{r.date || "-"}</td>
                            <td>{r.phone || "-"}</td>
                            <td>{r.email || "-"}</td>
                            <td className="right">
                              <button className="mini" onClick={() => handleEdit(r)}>✏️</button>
                              <button className="mini danger" onClick={() => handleDelete(r.id)}>🗑 Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="table-footer">
                      <div className="pg-controls">
                        <button onClick={() => fetchList(Math.max(1, page - 1))} disabled={page === 1}>‹ Prev</button>
                        <span>Page {page} / {totalPages}</span>
                        <button onClick={() => fetchList(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next ›</button>
                      </div>
                      <div className="summary"><span>{count} records</span></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* detail drawer */}
        <div className={`sc-drawer ${drawerOpen ? "open" : ""}`}>
          <div className="sc-drawer-inner" role="dialog" aria-modal={drawerOpen}>
            <button className="drawer-close" onClick={closeDetail}>✕</button>
            {selected ? (
              <>
                <h3>{selected.first_name} {selected.last_name} <span className="muted small">#{selected.id}</span></h3>
                <p><strong>Batch:</strong> {selected.preferred_batch || "-"}</p>
                <p><strong>Phone:</strong> {selected.phone || "-"}</p>
                <p><strong>Email:</strong> {selected.email || "-"}</p>
                <p className="muted">{selected.address1}</p>
              </>
            ) : <div>No details</div>}
          </div>
          <div className="sc-drawer-backdrop" onClick={closeDetail} />
        </div>

      </div>
    </div>
  );
}
