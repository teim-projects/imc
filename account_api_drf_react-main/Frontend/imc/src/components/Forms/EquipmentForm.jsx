import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./Forms.css";

/**
 * EquipmentForm – Add/Edit + List (Studio-style)
 * API:
 *   GET/POST:   http://127.0.0.1:8000/api/auth/equipment/
 *   PUT/DELETE: http://127.0.0.1:8000/api/auth/equipment/:id/
 *   (If your API uses PATCH, change axios.put -> axios.patch)
 */

const BASE = import.meta?.env?.VITE_BASE_API_URL || "http://127.0.0.1:8000";
const API_URL = `${BASE}/auth/equipment/`;        // ✅ fixed `/api`
const PAGE_SIZE = 10;                                  // ✅ added

/* =========================
   Helpers: adapters for API
========================= */
// try several keys and also read nested {name|title|label}
const pick = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v == null) continue;
    if (typeof v === "object") {
      if (v.name != null) return String(v.name);
      if (v.title != null) return String(v.title);
      if (v.label != null) return String(v.label);
      try { return JSON.stringify(v); } catch { return String(v); }
    }
    const s = String(v);
    if (s.trim() !== "") return v;
  }
  return null;
};

// canonical aliases for each column we show
const COL = {
  name: ["equipment_name", "name", "title"],
  category: ["category", "category_name", "categoryLabel", "category_label"],
  brand: ["brand", "brand_name", "manufacturer"],
  pricePerDay: ["price_per_day", "price", "rate_per_day", "daily_price"],
  status: ["status", "state"],
  rentedBy: ["rented_by", "customer", "customer_name", "renter"],
  rentalDate: ["rental_date", "date", "start_date", "booking_date"],
  returnDate: ["return_date", "end_date", "due_date"],
};

/* =========================
   Master options
========================= */
const CATEGORIES = [
  "Microphones",
  "Mixers",
  "Speakers",
  "Amplifiers",
  "Headphones",
  "Audio Interfaces",
  "Recorders",
  "DJ & Controllers",
  "Instruments",
  "Lighting",
  "Cameras",
  "Lenses",
  "Stands & Accessories",
  "Cables",
];

const CATEGORY_BRANDS = {
  Microphones: ["Shure", "Sennheiser", "AKG", "RØDE", "Audio-Technica"],
  Mixers: ["Yamaha", "Behringer", "Allen & Heath", "Mackie", "Soundcraft"],
  Speakers: ["JBL", "QSC", "Bose", "Yamaha", "RCF"],
  Amplifiers: ["Crown", "Behringer", "Yamaha", "QSC"],
  Headphones: ["Audio-Technica", "Sony", "AKG", "Sennheiser", "Beyerdynamic"],
  "Audio Interfaces": ["Focusrite", "Behringer", "PreSonus", "MOTU", "Audient"],
  Recorders: ["Zoom", "Tascam"],
  "DJ & Controllers": ["Pioneer DJ", "Numark", "Denon DJ"],
  Instruments: ["Fender", "Gibson", "Roland", "Korg", "Yamaha"],
  Lighting: ["Godox", "Neewer", "Aputure", "Chauvet DJ"],
  Cameras: ["Canon", "Sony", "Nikon", "Fujifilm", "Panasonic"],
  Lenses: ["Canon", "Sony", "Nikon", "Sigma", "Tamron"],
  "Stands & Accessories": ["Manfrotto", "Hercules", "K&M", "AmazonBasics"],
  Cables: ["Hosa", "Mogami", "ProCo", "Yamaha"],
};

const POPULAR_ITEMS = [
  { name: "Shure SM58", brand: "Shure", category: "Microphones" },
  { name: "Shure SM57", brand: "Shure", category: "Microphones" },
  { name: "RØDE NT1-A", brand: "RØDE", category: "Microphones" },
  { name: "Audio-Technica AT2020", brand: "Audio-Technica", category: "Microphones" },
  { name: "Sennheiser EW 112P G4", brand: "Sennheiser", category: "Microphones" },
  { name: "Yamaha MG12XU", brand: "Yamaha", category: "Mixers" },
  { name: "Behringer X32", brand: "Behringer", category: "Mixers" },
  { name: "Allen & Heath QU-16", brand: "Allen & Heath", category: "Mixers" },
  { name: "JBL EON615", brand: "JBL", category: "Speakers" },
  { name: "QSC K12.2", brand: "QSC", category: "Speakers" },
  { name: "Bose L1 Compact", brand: "Bose", category: "Speakers" },
  { name: "Focusrite Scarlett 2i2 (3rd Gen)", brand: "Focusrite", category: "Audio Interfaces" },
  { name: "Zoom H6 Recorder", brand: "Zoom", category: "Recorders" },
  { name: "AKG K240 Studio", brand: "AKG", category: "Headphones" },
  { name: "Pioneer DJ DDJ-400", brand: "Pioneer DJ", category: "DJ & Controllers" },
  { name: "Fender Stratocaster", brand: "Fender", category: "Instruments" },
  { name: "Roland FP-30X", brand: "Roland", category: "Instruments" },
  { name: "Korg Kronos 61", brand: "Korg", category: "Instruments" },
  { name: "Canon EOS R6", brand: "Canon", category: "Cameras" },
  { name: "Sony A7 IV", brand: "Sony", category: "Cameras" },
  { name: "Nikon Z6 II", brand: "Nikon", category: "Cameras" },
  { name: "Sigma 24-70mm f/2.8", brand: "Sigma", category: "Lenses" },
  { name: "Tamron 70-180mm f/2.8", brand: "Tamron", category: "Lenses" },
  { name: "Godox SL60W", brand: "Godox", category: "Lighting" },
  { name: "Manfrotto 055 Tripod", brand: "Manfrotto", category: "Stands & Accessories" },
  { name: "Neewer 18\" Ring Light", brand: "Neewer", category: "Lighting" },
];

const brandsForCategory = (category) =>
  CATEGORY_BRANDS[category] ||
  Array.from(new Set(POPULAR_ITEMS.filter(i => i.category === category).map(i => i.brand)));

const itemsForCategory = (category) =>
  POPULAR_ITEMS.filter(i => i.category === category).map(i => i.name);

/* =========================
   Component
========================= */
const EquipmentForm = ({ onClose, viewOnly = false }) => {
  // UI state
  const [tab, setTab] = useState(viewOnly ? "VIEW" : "ADD");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    id: null, // if set => edit mode
    equipment_name: "",
    category: "",
    brand: "",
    price_per_day: "",
    available_quantity: "",
    rented_by: "",
    rental_date: "",
    return_date: "",
    status: "Available",
    photo: null,
  });

  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Records
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // Auth headers (JWT)
  const authHeaders = () => {
    const token = localStorage.getItem("access");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const resetForm = () => {
    setFormData({
      id: null,
      equipment_name: "",
      category: "",
      brand: "",
      price_per_day: "",
      available_quantity: "",
      rented_by: "",
      rental_date: "",
      return_date: "",
      status: "Available",
      photo: null,
    });
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Smart handlers
  const handleCategoryChange = (value) => {
    setFormData((prev) => {
      const next = { ...prev, category: value };
      const allowedBrands = new Set(brandsForCategory(value));
      if (next.brand && allowedBrands.size && !allowedBrands.has(next.brand)) {
        next.brand = "";
      }
      return next;
    });
  };

  const handleNameChange = (value) => {
    const match = POPULAR_ITEMS.find((i) => i.name.toLowerCase() === value.toLowerCase());
    if (match) {
      setFormData((prev) => ({ ...prev, equipment_name: value, category: match.category, brand: match.brand }));
    } else {
      setFormData((prev) => ({ ...prev, equipment_name: value }));
    }
  };

  const handleFieldChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "category") return handleCategoryChange(value);
    if (name === "equipment_name") return handleNameChange(value);
    if (files && files[0]) {
      const f = files[0];
      setFormData((p) => ({ ...p, [name]: f }));
      setPreviewUrl(URL.createObjectURL(f));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const body = new FormData();
      // Some backends require `name`; keep your `equipment_name` UI
      body.append("name", formData.equipment_name || "");
      Object.entries(formData).forEach(([k, v]) => {
        if (k === "id") return;
        if (k === "photo" && !v) return;
        body.append(k, v == null ? "" : v);
      });

      if (formData.id) {
        await axios.put(`${API_URL}${formData.id}/`, body, {
          headers: { "Content-Type": "multipart/form-data", ...authHeaders() },
        });
        setSuccessMsg("✅ Equipment updated successfully!");
      } else {
        await axios.post(API_URL, body, {
          headers: { "Content-Type": "multipart/form-data", ...authHeaders() },
        });
        setSuccessMsg("✅ Equipment rental added successfully!");
      }

      resetForm();
      await fetchData();
      setTab("VIEW");
    } catch (err) {
      setError(
        err?.response?.data
          ? `❌ Failed to save: ${JSON.stringify(err.response.data)}`
          : "❌ Failed to save. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Fetch & normalize
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API_URL, { headers: authHeaders() });
      const raw = Array.isArray(res.data) ? res.data : res.data?.results || [];
      const normalized = raw.map((d) => ({
        ...d,
        // Ensure unified keys exist
        equipment_name: pick(d, COL.name) || "",
        _category_ui: pick(d, COL.category),
        _brand_ui: pick(d, COL.brand),
        _price_ui: pick(d, COL.pricePerDay),
        _status_ui: pick(d, COL.status),
        _rented_by_ui: pick(d, COL.rentedBy),
        _rent_date_ui: pick(d, COL.rentalDate),
        _return_date_ui: pick(d, COL.returnDate),
      }));
      setRecords(normalized);
    } catch (err) {
      setError("❌ Could not fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, []);

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`${API_URL}${id}/`, { headers: authHeaders() });
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Failed to delete record.");
    }
  };

  // Edit (prefill)
  const handleEdit = (item) => {
    setTab("ADD");
    setFormData({
      id: item.id ?? null,
      equipment_name: item.equipment_name || pick(item, COL.name) || "",
      category: item.category ?? item._category_ui ?? pick(item, COL.category) ?? "",
      brand: item.brand ?? item._brand_ui ?? pick(item, COL.brand) ?? "",
      price_per_day: item.price_per_day ?? item._price_ui ?? pick(item, COL.pricePerDay) ?? "",
      available_quantity: item.available_quantity ?? "",
      rented_by: item.rented_by ?? item._rented_by_ui ?? pick(item, COL.rentedBy) ?? "",
      rental_date: item.rental_date ?? item._rent_date_ui ?? pick(item, COL.rentalDate) ?? "",
      return_date: item.return_date ?? item._return_date_ui ?? pick(item, COL.returnDate) ?? "",
      status: item.status ?? item._status_ui ?? pick(item, COL.status) ?? "Available",
      photo: null,
    });
    setPreviewUrl(item.photo || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSuccessMsg("");
    setError("");
  };

  // Search + pagination
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) =>
      [
        r.equipment_name,
        r._category_ui,
        r._brand_ui,
        r._status_ui,
        r._rented_by_ui,
      ]
        .map((x) => (x || "").toString().toLowerCase())
        .some((s) => s.includes(q))
    );
  }, [records, searchTerm]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const currentRows = filtered.slice(start, start + PAGE_SIZE);
  const goto = (p) => setPage(Math.min(Math.max(1, p), pageCount));

  // Derived options
  const dynamicBrandOptions = brandsForCategory(formData.category);
  const dynamicItemOptions = itemsForCategory(formData.category);

  return (
    <div className="form-container pro">
      {/* Header */}
      <div className="form-header">
        <h3>🎛️ Equipment Rentals</h3>
        <div className="tabs">
          <button className={tab === "ADD" ? "active" : ""} onClick={() => setTab("ADD")}>
            {formData.id ? "✏️ Edit Equipment" : "➕ Add Rental"}
          </button>
          <button className={tab === "VIEW" ? "active" : ""} onClick={() => setTab("VIEW")}>
            📋 View Rentals
          </button>
        </div>
        {onClose && (
          <button className="close-x" onClick={onClose} aria-label="Close">✖</button>
        )}
      </div>

      {error && <div className="banner error">{error}</div>}
      {successMsg && <div className="banner success">{successMsg}</div>}

      {/* ADD/EDIT form */}
      {tab === "ADD" && (
        <form onSubmit={handleSubmit} className="grid two-col">
          {/* left col */}
          <div className="group">
            <label>Equipment Name *</label>
            <input
              type="text"
              list="equipmentList"
              name="equipment_name"
              value={formData.equipment_name}
              onChange={handleFieldChange}
              placeholder="e.g., Shure SM58"
              required
            />
            <datalist id="equipmentList">
              {(formData.category ? dynamicItemOptions : POPULAR_ITEMS.map(i => i.name))
                .map((n) => <option key={n} value={n} />)}
            </datalist>
          </div>

          <div className="group">
            <label>Category *</label>
            <input
              type="text"
              list="categoryList"
              name="category"
              value={formData.category}
              onChange={handleFieldChange}
              placeholder="e.g., Microphones"
              required
            />
            <datalist id="categoryList">
              {CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="group">
            <label>Brand *</label>
            <input
              type="text"
              list="brandList"
              name="brand"
              value={formData.brand}
              onChange={handleFieldChange}
              placeholder="e.g., Shure"
              required
            />
            <datalist id="brandList">
              {(formData.category ? dynamicBrandOptions : Array.from(new Set(POPULAR_ITEMS.map(i => i.brand))))
                .map((b) => <option key={b} value={b} />)}
            </datalist>
          </div>

          <div className="group">
            <label>Price per Day (₹)</label>
            <input
              type="number"
              name="price_per_day"
              value={formData.price_per_day}
              onChange={handleFieldChange}
              placeholder="e.g., 500"
              min="0"
              step="0.01"
            />
          </div>

          <div className="group">
            <label>Available Quantity</label>
            <input
              type="number"
              name="available_quantity"
              value={formData.available_quantity}
              onChange={handleFieldChange}
              placeholder="e.g., 3"
              min="0"
              step="1"
            />
          </div>

          <div className="group">
            <label>Rented By (Customer)</label>
            <input
              type="text"
              name="rented_by"
              value={formData.rented_by}
              onChange={handleFieldChange}
              placeholder="e.g., Rahul Verma"
            />
          </div>

          {/* right col */}
          <div className="group">
            <label>Rental Date</label>
            <input
              type="date"
              name="rental_date"
              value={formData.rental_date}
              onChange={handleFieldChange}
            />
          </div>

          <div className="group">
            <label>Return Date</label>
            <input
              type="date"
              name="return_date"
              value={formData.return_date}
              onChange={handleFieldChange}
            />
          </div>

          <div className="group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleFieldChange}>
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>

          <div className="group">
            <label>Photo</label>
            <input
              ref={fileInputRef}
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleFieldChange}
            />
            {previewUrl && (
              <div className="preview">
                <img
                  src={previewUrl}
                  alt="preview"
                  width="70"
                  height="70"
                  style={{ borderRadius: 8, objectFit: "cover" }}
                />
                <button
                  type="button"
                  className="small-btn"
                  onClick={() => {
                    setPreviewUrl(null);
                    setFormData((p) => ({ ...p, photo: null }));
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="group full actions" style={{ justifyContent: "center" }}>
            <button type="submit" className="primary" disabled={saving}>
              {formData.id ? (saving ? "Updating..." : "Update") : (saving ? "Saving..." : "Save")}
            </button>
            <button type="button" className="ghost" onClick={resetForm}>Reset</button>
          </div>
        </form>
      )}

      {/* LIST */}
      {tab === "VIEW" && (
        <div className="view-section">
          <div className="view-toolbar">
            <div className="search-bar" style={{ width: "100%" }}>
              <input
                type="text"
                placeholder="Search name, category, brand, status, customer…"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              />
              <button onClick={fetchData}>⟳ Refresh</button>
            </div>
          </div>

          {loading ? (
            <p className="loader">Loading data…</p>
          ) : (
            <>
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Price/Day</th>
                    <th>Status</th>
                    <th>Rented By</th>
                    <th>Rental Date</th>
                    <th>Return Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.photo ? (
                          <img
                            src={item.photo}
                            alt={item.equipment_name}
                            width="50"
                            height="50"
                            style={{ borderRadius: "8px", objectFit: "cover" }}
                          />
                        ) : "—"}
                      </td>
                      <td>{item.equipment_name || "—"}</td>
                      <td>{item._category_ui ?? "—"}</td>
                      <td>{item._brand_ui ?? "—"}</td>
                      <td>{item._price_ui != null ? `₹${item._price_ui}` : "—"}</td>
                      <td>{item._status_ui ?? "—"}</td>
                      <td>{item._rented_by_ui ?? "—"}</td>
                      <td>{item._rent_date_ui ?? "—"}</td>
                      <td>{item._return_date_ui ?? "—"}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(item)} title="Edit">✏️</button>
                        <button className="delete-btn" onClick={() => handleDelete(item.id)} title="Delete" style={{ marginLeft: 8 }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {currentRows.length === 0 && (
                    <tr>
                      <td colSpan="10" style={{ textAlign: "center" }}>No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {pageCount > 1 && (
                <div className="pagination">
                  <button onClick={() => goto(1)} disabled={currentPage === 1}>« First</button>
                  <button onClick={() => goto(currentPage - 1)} disabled={currentPage === 1}>‹ Prev</button>
                  <span>Page {currentPage} of {pageCount}</span>
                  <button onClick={() => goto(currentPage + 1)} disabled={currentPage === pageCount}>Next ›</button>
                  <button onClick={() => goto(pageCount)} disabled={currentPage === pageCount}>Last »</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EquipmentForm;
