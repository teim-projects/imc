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
  if (token)
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  return config;
});

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
  return err?.message || "Unknown error";
};

// Day + Time Slot options
const DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_SLOT_OPTIONS = [
  "07:00 - 08:00",
  "08:00 - 09:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
];

const PAYMENT_OPTIONS = [
  { key: "card", label: "Card" },
  { key: "upi", label: "UPI" },
  { key: "netbanking", label: "NetBanking" },
];

export default function SingingClassForm({ onSuccess }) {
  const [tab, setTab] = useState("ADD"); // "ADD" or "VIEW"

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postal_code: "",
    day: "",
    time_slot: "",
    reference_by: "",
    fee: "",
    payment_method: "",
    agreed_terms: false,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [errorBanner, setErrorBanner] = useState("");
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // initial list load
  useEffect(() => {
    fetchList(1);
  }, []);

  useEffect(() => {
    if (tab === "VIEW") fetchList(1);
  }, [tab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((s) => ({ ...s, [name]: undefined }));
    setErrorBanner("");
  };

  const setPayment = (key) => {
    setForm((f) => ({
      ...f,
      payment_method: f.payment_method === key ? "" : key,
    }));
    setErrors((s) => ({ ...s, payment_method: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim()) e.last_name = "Last name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";

    if (!form.day) e.day = "Please choose a day";
    if (!form.time_slot) e.time_slot = "Please choose a time slot";

    if (!form.fee.toString().trim()) {
      e.fee = "Fee is required";
    } else if (isNaN(Number(form.fee)) || Number(form.fee) < 0) {
      e.fee = "Fee must be a valid amount";
    }

    if (!form.payment_method) e.payment_method = "Select a payment option";
    if (!form.agreed_terms) e.agreed_terms = "You must accept terms";

    return e;
  };

  const resetForm = () => {
    setForm({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postal_code: "",
      day: "",
      time_slot: "",
      reference_by: "",
      fee: "",
      payment_method: "",
      agreed_terms: false,
    });
    setErrors({});
    setErrorBanner("");
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (tab !== "ADD") return;

    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const preferred_batch =
      form.day && form.time_slot ? `${form.day} - ${form.time_slot}` : "";

    const payload = {
      ...form,
      preferred_batch,
    };

    setSaving(true);
    setErrorBanner("");
    try {
      const resp = await api.post(API_URL, payload);
      await fetchList(1);
      resetForm();
      onSuccess?.();
      console.info("Saved admission id:", resp.data?.id);
      setTab("VIEW");
    } catch (err) {
      if (err?.response?.data) {
        const mapped = {};
        Object.keys(err.response.data).forEach((k) => {
          mapped[k] = Array.isArray(err.response.data[k])
            ? err.response.data[k].join(" ")
            : String(err.response.data[k]);
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
      const res = await api.get(API_URL, {
        params: { page: pageNo, page_size: PAGE_SIZE },
      });
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admission?")) return;
    setErrorBanner("");
    const before = items.slice();
    setItems((prev) => prev.filter((x) => String(x.id) !== String(id)));
    setCount((c) => Math.max(0, c - 1));
    try {
      await api.delete(`${API_URL}${id}/`);
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
      first_name: row.first_name || "",
      last_name: row.last_name || "",
      phone: row.phone || "",
      email: row.email || "",
      address1: row.address1 || "",
      address2: row.address2 || "",
      city: row.city || "",
      state: row.state || "",
      postal_code: row.postal_code || "",
      day: row.day || "",
      time_slot: row.time_slot || "",
      reference_by: row.reference_by || "",
      fee: row.fee || "",
      payment_method: row.payment_method || "",
      agreed_terms: !!row.agreed_terms,
    });
    setTab("ADD");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDetail = (row) => {
    setSelected(row);
    setDrawerOpen(true);
  };
  const closeDetail = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelected(null), 220);
  };

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items;
    return items.filter((r) => {
      const hay = `${r.first_name || ""} ${r.last_name || ""} ${r.phone || ""} ${
        r.email || ""
      } ${r.day || ""} ${r.time_slot || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, search]);

  return (
    <div className="pf-wrap">
      {/* HEADER */}
      <div className="pf-header">
        <div>
          <h2>Singing Class Admissions</h2>
          <p className="pf-subtitle">
            Enroll students into fixed batches with day &amp; time slots.
          </p>
        </div>
        <div className="pf-tabs">
          <button
            className={tab === "ADD" ? "active" : ""}
            onClick={() => setTab("ADD")}
            type="button"
          >
            Add Admission
          </button>
          <button
            className={tab === "VIEW" ? "active" : ""}
            onClick={() => setTab("VIEW")}
            type="button"
          >
            View Admissions
          </button>
        </div>
      </div>

      {/* BANNERS */}
      {errorBanner && (
        <div className="pf-banner pf-error" style={{ whiteSpace: "pre-wrap" }}>
          {errorBanner}
        </div>
      )}

      {/* ADD MODE (pf style) */}
      {tab === "ADD" && (
        <form className="pf-form" onSubmit={submit} noValidate>
          {/* 1) STUDENT DETAILS */}
          <section className="pf-card">
            <h3>Student Details</h3>
            <div className="pf-grid">
              <label>
                First Name*
                <input
                  name="first_name"
                  placeholder="First name"
                  value={form.first_name}
                  onChange={handleChange}
                />
                {errors.first_name && (
                  <div className="field-error">{errors.first_name}</div>
                )}
              </label>

              <label>
                Last Name*
                <input
                  name="last_name"
                  placeholder="Last name"
                  value={form.last_name}
                  onChange={handleChange}
                />
                {errors.last_name && (
                  <div className="field-error">{errors.last_name}</div>
                )}
              </label>

              <label>
                Contact Number*
                <input
                  name="phone"
                  placeholder="+91XXXXXXXXXX"
                  value={form.phone}
                  onChange={handleChange}
                />
                {errors.phone && (
                  <div className="field-error">{errors.phone}</div>
                )}
              </label>

              <label>
                Email (optional)
                <input
                  name="email"
                  placeholder="customer@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="field-error">{errors.email}</div>
                )}
              </label>

              <label>
                Street Address
                <input
                  name="address1"
                  placeholder="Street, City"
                  value={form.address1}
                  onChange={handleChange}
                />
              </label>

              <label>
                Address Line 2
                <input
                  name="address2"
                  placeholder="Apartment / Landmark"
                  value={form.address2}
                  onChange={handleChange}
                />
              </label>

              <label>
                City
                <input name="city" value={form.city} onChange={handleChange} />
              </label>

              <label>
                State / Province
                <input name="state" value={form.state} onChange={handleChange} />
              </label>

              <label>
                Postal / Zip Code
                <input
                  name="postal_code"
                  value={form.postal_code}
                  onChange={handleChange}
                />
              </label>
            </div>
          </section>

          {/* 2) BATCH & SCHEDULE */}
          <section className="pf-card">
            <h3>Batch & Schedule</h3>
            <div className="pf-grid">
              <label>
                Day*
                <select name="day" value={form.day} onChange={handleChange}>
                  <option value="">-- Select Day --</option>
                  {DAY_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.day && <div className="field-error">{errors.day}</div>}
              </label>

              <label>
                Time Slot*
                <select
                  name="time_slot"
                  value={form.time_slot}
                  onChange={handleChange}
                >
                  <option value="">-- Select Time Slot --</option>
                  {TIME_SLOT_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.time_slot && (
                  <div className="field-error">{errors.time_slot}</div>
                )}
              </label>

              <label>
                Reference By
                <input
                  name="reference_by"
                  value={form.reference_by}
                  onChange={handleChange}
                />
              </label>
            </div>
          </section>

          {/* 3) FEE & PAYMENT */}
          <section className="pf-card">
            <h3>Fee & Payment</h3>
            <div className="pf-grid">
              <label>
                Fee (₹)*
                <input
                  name="fee"
                  type="number"
                  min="0"
                  placeholder="Eg. 1500"
                  value={form.fee}
                  onChange={handleChange}
                />
                {errors.fee && <div className="field-error">{errors.fee}</div>}
              </label>

              <label>
                Payment Options*
                <div className="pf-methods">
                  <div className="pf-tags">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        className={
                          form.payment_method === opt.key ? "tag active" : "tag"
                        }
                        onClick={() => setPayment(opt.key)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {errors.payment_method && (
                  <div className="field-error">{errors.payment_method}</div>
                )}
              </label>

              <label className="pf-checkbox-row">
                <input
                  type="checkbox"
                  name="agreed_terms"
                  checked={form.agreed_terms}
                  onChange={handleChange}
                />
                <span>Term &amp; Condition</span>
                {errors.agreed_terms && (
                  <div className="field-error">{errors.agreed_terms}</div>
                )}
              </label>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="pf-actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving..." : "Save Admission"}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={resetForm}
              disabled={saving}
            >
              Reset
            </button>
          </div>
        </form>
      )}

      {/* VIEW MODE (pf table style) */}
      {tab === "VIEW" && (
        <div className="pf-table-card">
          <div className="pf-table-top">
            <input
              className="pf-search"
              placeholder="Search: name, phone, email, batch"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="btn"
              onClick={() => fetchList(1)}
              disabled={listLoading}
            >
              {listLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="pf-table-wrap">
            {listLoading ? (
              <div style={{ padding: 24 }}>Loading admissions…</div>
            ) : filteredItems.length === 0 ? (
              <div style={{ padding: 24, color: "#6b7280" }}>
                No admissions yet.
              </div>
            ) : (
              <table className="pf-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Day</th>
                    <th>Time Slot</th>
                    <th>Date</th>
                    <th>Fee</th>
                    <th>Payment</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th className="c">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((r) => (
                    <tr key={r.id}>
                      <td
                        onClick={() => openDetail(r)}
                        style={{ cursor: "pointer" }}
                      >
                        {r.first_name} {r.last_name}
                      </td>
                      <td>{r.day || "-"}</td>
                      <td>{r.time_slot || "-"}</td>
                      <td>{r.date || "-"}</td>
                      <td>{r.fee ? `₹ ${r.fee}` : "-"}</td>
                      <td>
                        {r.payment_method
                          ? r.payment_method === "card"
                            ? "Card"
                            : r.payment_method === "upi"
                            ? "UPI"
                            : "NetBanking"
                          : "-"}
                      </td>
                      <td>{r.phone || "-"}</td>
                      <td>{r.email || "-"}</td>
                      <td className="c">
                        <button
                          className="mini"
                          onClick={() => handleEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="mini danger"
                          onClick={() => handleDelete(r.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="pf-pager">
            <button
              className="mini"
              onClick={() => fetchList(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              className="mini"
              onClick={() => fetchList(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail drawer (kept, but can be restyled later) */}
      <div className={`sc-drawer ${drawerOpen ? "open" : ""}`}>
        <div
          className="sc-drawer-inner"
          role="dialog"
          aria-modal={drawerOpen}
        >
          <button className="drawer-close" onClick={closeDetail}>
            ✕
          </button>
          {selected ? (
            <>
              <h3>
                {selected.first_name} {selected.last_name}{" "}
                <span className="muted small">#{selected.id}</span>
              </h3>
              <p>
                <strong>Day:</strong> {selected.day || "-"}
              </p>
              <p>
                <strong>Time Slot:</strong> {selected.time_slot || "-"}
              </p>
              <p>
                <strong>Fee:</strong>{" "}
                {selected.fee ? `₹ ${selected.fee}` : "-"}
              </p>
              <p>
                <strong>Payment:</strong>{" "}
                {selected.payment_method
                  ? selected.payment_method === "card"
                    ? "Card"
                    : selected.payment_method === "upi"
                    ? "UPI"
                    : "NetBanking"
                  : "-"}
              </p>
              <p>
                <strong>Phone:</strong> {selected.phone || "-"}
              </p>
              <p>
                <strong>Email:</strong> {selected.email || "-"}</p>
              <p className="muted">{selected.address1}</p>
            </>
          ) : (
            <div>No details</div>
          )}
        </div>
        <div className="sc-drawer-backdrop" onClick={closeDetail} />
      </div>
    </div>
  );
}
